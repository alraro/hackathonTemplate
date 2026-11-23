"""cluster pipeline: segmentation with automatic k chosen by silhouette."""

from types import SimpleNamespace

import numpy as np
from sklearn.cluster import HDBSCAN, KMeans
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
from sklearn.mixture import GaussianMixture
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from skrub import TableVectorizer

from backend.data.config import RunConfig
from backend.data.report import Chart, Report, Series
from backend.data.tables import read_table

SEED = 0
K_RANGE = range(2, 9)

# short name -> factory taking k (ignored by models that find k themselves)
MODELS = {
    "kmeans": lambda k, **p: KMeans(n_clusters=k, n_init=10, random_state=SEED, **p),
    "gmm": lambda k, **p: GaussianMixture(n_components=k, random_state=SEED, **p),
    "hdbscan": lambda k, **p: HDBSCAN(**p),
}


def load(cfg: RunConfig):
    return read_table(cfg)


def prepare(df, cfg: RunConfig):
    if cfg.target and cfg.target in df.columns:
        df = df.drop(columns=cfg.target)
    Z = make_pipeline(TableVectorizer(), StandardScaler()).fit_transform(df)
    return np.asarray(Z, dtype=float)


def _score(Z, labels) -> float:
    mask = labels != -1  # hdbscan noise
    if len(set(labels[mask])) < 2:
        return -1.0
    return float(silhouette_score(Z[mask], labels[mask]))


def fit(X, cfg: RunConfig):
    params = dict(cfg.params)
    make = MODELS[cfg.model]
    if cfg.model == "hdbscan":
        labels = np.asarray(make(None, **params).fit_predict(X))
        return SimpleNamespace(labels=labels, k=len(set(labels) - {-1}))
    fixed = params.pop("k", None)
    best = None
    for k in [fixed] if fixed else K_RANGE:
        labels = np.asarray(make(k, **params).fit_predict(X))
        score = _score(X, labels)
        if best is None or score > best[0]:
            best = (score, k, labels)
    return SimpleNamespace(labels=best[2], k=best[1])


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    return {"k": float(model.k), "silhouette": _score(X, model.labels)}


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    xy = PCA(n_components=2, random_state=SEED).fit_transform(X)
    names = [("noise" if c == -1 else f"cluster {c}", c) for c in sorted(set(model.labels))]
    scatter = Chart(
        id="pca",
        kind="scatter",
        title="PCA 2D projection by cluster",
        x="pc1",
        series=[Series(key=f"c{c}", label=n) for n, c in names],
        data=[
            {"pc1": round(float(p[0]), 4), f"c{lab}": round(float(p[1]), 4)}
            for p, lab in zip(xy, model.labels)
        ],
    )
    sizes = Chart(
        id="sizes",
        kind="bar",
        title="Cluster sizes",
        x="cluster",
        series=[Series(key="size", label="Records")],
        data=[{"cluster": n, "size": int((model.labels == c).sum())} for n, c in names],
    )
    return Report(
        run=cfg.name,
        pipeline=cfg.pipeline,
        model=cfg.model,
        metrics=metrics,
        charts=[scatter, sizes],
        summary=f"{cfg.model} found {model.k} clusters, silhouette={metrics['silhouette']:.3f}",
    )
