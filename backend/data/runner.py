"""Chain a pipeline's five functions and write outputs/<run>/."""

from backend.data.config import OUTPUTS_DIR, RunConfig
from backend.data.registry import get_pipeline
from backend.data.report import Report
from backend.data.summary import build_summary


def run(cfg: RunConfig) -> Report:
    pipe = get_pipeline(cfg.pipeline)
    df = pipe.load(cfg)
    X = pipe.prepare(df, cfg)
    model = pipe.fit(X, cfg)
    metrics = pipe.evaluate(model, X, cfg)
    report = pipe.report(cfg, model, X, metrics)
    report.summary = build_summary(report, cfg.explain)
    out = OUTPUTS_DIR / cfg.name
    out.mkdir(parents=True, exist_ok=True)
    (out / "report.json").write_text(report.model_dump_json(indent=2))
    _persist(out, pipe, model, X)
    return report


def _persist(out, pipe, model, X) -> None:
    """Write the gitignored model.joblib (and predictions.csv if the pipeline offers it)."""
    import joblib

    try:
        joblib.dump(model, out / "model.joblib")
    except Exception as e:  # noqa: BLE001 - e.g. a model holding a torch module
        print(f"note: model not saved ({type(e).__name__}: {e}); predict() unavailable for this run")
    make_predictions = getattr(pipe, "predictions", None)
    if make_predictions is not None:
        make_predictions(model, X).to_csv(out / "predictions.csv", index=False)
