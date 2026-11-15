"""Chain a pipeline's five functions and write outputs/<run>/."""

from backend.data.config import OUTPUTS_DIR, RunConfig
from backend.data.registry import get_pipeline
from backend.data.report import Report


def run(cfg: RunConfig) -> Report:
    pipe = get_pipeline(cfg.pipeline)
    df = pipe.load(cfg)
    X = pipe.prepare(df, cfg)
    model = pipe.fit(X, cfg)
    metrics = pipe.evaluate(model, X, cfg)
    report = pipe.report(cfg, model, X, metrics)
    out = OUTPUTS_DIR / cfg.name
    out.mkdir(parents=True, exist_ok=True)
    (out / "report.json").write_text(report.model_dump_json(indent=2))
    # TODO(#61): persist model.joblib and predictions.csv (gitignored) once pipelines return them.
    return report
