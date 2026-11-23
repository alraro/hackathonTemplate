"""vision pipeline: CLIP embeddings + logistic regression (or zero-shot), RT-DETR detection.

Needs the `[vision]` extra (torch, open_clip, transformers). Heavy imports are lazy so
`make check` and the other pipelines never load them or download a model.
Pick the task with `params.task`: `classify` (default, model clip-vit-b32) or `detect` (model rt-detr).
"""

from collections import Counter
from pathlib import Path
from types import SimpleNamespace

import numpy as np

from backend.data.config import RunConfig, source_path
from backend.data.report import Chart, Report, Series

SEED = 0
# model name -> task it serves (add a model here and in registry.MODELS)
MODELS = {"clip-vit-b32": "classify", "rt-detr": "detect"}
IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
CLIP_ARCH, CLIP_WEIGHTS = "ViT-B-32", "laion2b_s34b_b79k"
DETR_CHECKPOINT = "PekingU/rtdetr_r18vd"  # override with params.checkpoint
TEST_SHARE = 0.3
DETECT_THRESHOLD = 0.5  # override with params.threshold
SAMPLES = 12


def _task(cfg: RunConfig) -> str:
    task = cfg.params.get("task", MODELS[cfg.model])
    if task not in ("classify", "detect"):
        raise ValueError(f"task '{task}' unknown; options: classify, detect")
    if task != MODELS[cfg.model]:
        raise ValueError(f"model '{cfg.model}' does not do task '{task}'; use task '{MODELS[cfg.model]}'")
    return task


def _require_vision():
    try:
        import torch  # noqa: F401
    except ImportError as e:
        raise RuntimeError("the vision pipeline needs the [vision] extra: set VISION=true in .env and restart the backend") from e


def load(cfg: RunConfig):
    """Return {'paths': [Path], 'labels': [str] | None}. Class = sub-folder name, if there are any."""
    root = source_path(cfg)
    if root is None or not root.is_dir():
        raise ValueError("vision reads 'source' as a folder of images (one sub-folder per class)")
    paths, labels = [], []
    for p in sorted(root.rglob("*")):
        if p.suffix.lower() in IMAGE_EXTS:
            paths.append(p)
            labels.append(p.parent.name if p.parent != root else None)
    if not paths:
        raise ValueError(f"no images found in {root}")
    return {"paths": paths, "labels": None if all(l is None for l in labels) else labels}


def _embed(paths: list[Path]) -> np.ndarray:
    import open_clip
    import torch
    from PIL import Image

    model, _, preprocess = open_clip.create_model_and_transforms(CLIP_ARCH, pretrained=CLIP_WEIGHTS)
    model.eval()
    out = []
    with torch.no_grad():
        for i in range(0, len(paths), 32):
            batch = torch.stack([preprocess(Image.open(p).convert("RGB")) for p in paths[i : i + 32]])
            f = model.encode_image(batch)
            out.append((f / f.norm(dim=-1, keepdim=True)).numpy())
    return np.concatenate(out)


def _embed_text(texts: list[str]) -> np.ndarray:
    import open_clip
    import torch

    model, _, _ = open_clip.create_model_and_transforms(CLIP_ARCH, pretrained=CLIP_WEIGHTS)
    model.eval()
    with torch.no_grad():
        f = model.encode_text(open_clip.get_tokenizer(CLIP_ARCH)(texts))
    return (f / f.norm(dim=-1, keepdim=True)).numpy()


def prepare(df, cfg: RunConfig):
    """Classify: embed images and split train/test. Detect: keep the paths."""
    _require_vision()
    if _task(cfg) == "detect":
        return SimpleNamespace(paths=df["paths"])
    from sklearn.model_selection import train_test_split

    paths, labels = df["paths"], df["labels"]
    emb = _embed(paths)
    idx = np.arange(len(paths))
    if labels is None:  # zero-shot: nothing to train, score everything
        return SimpleNamespace(paths=paths, emb=emb, y=None, train=idx[:0], test=idx)
    y = np.array(labels)
    classes, counts = np.unique(y, return_counts=True)
    if len(classes) < 2 or counts.min() < 2:
        raise ValueError(
            "each class sub-folder needs at least 2 images and there must be 2+ classes; got "
            + ", ".join(f"{c}: {n}" for c, n in zip(classes, counts))
        )
    train, test = train_test_split(idx, test_size=TEST_SHARE, random_state=SEED, stratify=y)
    return SimpleNamespace(paths=paths, emb=emb, y=y, train=train, test=test)


def fit(X, cfg: RunConfig):
    if _task(cfg) == "detect":
        import torch
        from transformers import AutoImageProcessor, RTDetrForObjectDetection

        ckpt = cfg.params.get("checkpoint", DETR_CHECKPOINT)
        return SimpleNamespace(
            kind="detect",
            processor=AutoImageProcessor.from_pretrained(ckpt),
            net=RTDetrForObjectDetection.from_pretrained(ckpt).eval(),
            torch=torch,
        )
    labels = cfg.params.get("labels")
    if X.y is None or len(X.train) == 0:
        if not labels:
            raise ValueError("no class sub-folders: set params.labels for zero-shot classification")
        return SimpleNamespace(kind="zero_shot", classes=np.array(labels), text=_embed_text(list(labels)))
    from sklearn.linear_model import LogisticRegression

    clf = LogisticRegression(max_iter=1000, random_state=SEED).fit(X.emb[X.train], X.y[X.train])
    return SimpleNamespace(kind="logistic", clf=clf, classes=clf.classes_)


def _predict(model, X, idx):
    """Return (predicted class, confidence) for the images at idx."""
    if model.kind == "logistic":
        proba = model.clf.predict_proba(X.emb[idx])
    else:
        logits = 100.0 * X.emb[idx] @ model.text.T
        e = np.exp(logits - logits.max(axis=1, keepdims=True))
        proba = e / e.sum(axis=1, keepdims=True)
    k = proba.argmax(axis=1)
    return model.classes[k], proba.max(axis=1)


def _detect(model, X, cfg: RunConfig) -> list[list[tuple[str, float]]]:
    from PIL import Image

    threshold = float(cfg.params.get("threshold", DETECT_THRESHOLD))
    found = []
    for p in X.paths:
        img = Image.open(p).convert("RGB")
        inputs = model.processor(images=img, return_tensors="pt")
        with model.torch.no_grad():
            outputs = model.net(**inputs)
        res = model.processor.post_process_object_detection(
            outputs, target_sizes=model.torch.tensor([img.size[::-1]]), threshold=threshold
        )[0]
        found.append(
            [(model.net.config.id2label[int(l)], float(s)) for l, s in zip(res["labels"], res["scores"])]
        )
    return found


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    if model.kind == "detect":
        found = _detect(model, X, cfg)
        model.found = found
        n = sum(len(f) for f in found)
        return {"images": float(len(found)), "detections": float(n)}
    pred, conf = _predict(model, X, X.test)
    model.pred, model.conf = pred, conf
    metrics = {"images": float(len(X.paths)), "test_images": float(len(X.test))}
    if X.y is not None:
        truth = X.y[X.test]
        metrics["accuracy"] = float((pred == truth).mean())
        for c in np.unique(truth):
            metrics[f"accuracy_{c}"] = float((pred[truth == c] == c).mean())
    return metrics


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    if model.kind == "detect":
        counts = Counter(label for f in model.found for label, _ in f)
        chart = Chart(
            id="detections",
            kind="bar",
            title="Detections per object class",
            x="label",
            series=[Series(key="count", label="Detections")],
            data=[{"label": k, "count": v} for k, v in counts.most_common()],
        )
        return Report(
            run=cfg.name, pipeline=cfg.pipeline, model=cfg.model, metrics=metrics, charts=[chart],
            summary=f"rt-detr found {int(metrics['detections'])} objects in {int(metrics['images'])} images",
        )
    charts = []
    truth = X.y[X.test] if X.y is not None else None
    if truth is not None:
        charts.append(
            Chart(
                id="class_accuracy",
                kind="bar",
                title="Accuracy per class (held-out images)",
                x="class",
                series=[Series(key="accuracy", label="Accuracy")],
                data=[
                    {"class": str(c), "accuracy": round(metrics[f"accuracy_{c}"], 4)} for c in np.unique(truth)
                ],
            )
        )
    shown = list(range(min(SAMPLES, len(X.test))))
    charts.append(
        Chart(
            id="sample_predictions",
            kind="bar",
            title="Sample predictions (confidence; label = predicted class)",
            x="image",
            series=[Series(key="confidence", label="Confidence")],
            data=[
                {
                    "image": f"{X.paths[X.test[i]].name} -> {model.pred[i]}",
                    "confidence": round(float(model.conf[i]), 4),
                }
                for i in shown
            ],
        )
    )
    how = "zero-shot CLIP" if model.kind == "zero_shot" else "CLIP + logistic regression"
    summary = f"{how} on {int(metrics['test_images'])} images"
    if "accuracy" in metrics:
        summary += f": accuracy {metrics['accuracy']:.1%}"
    return Report(
        run=cfg.name, pipeline=cfg.pipeline, model=cfg.model, metrics=metrics, charts=charts, summary=summary
    )
