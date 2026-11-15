"""anomaly pipeline."""

from backend.data.config import RunConfig
from backend.data.report import Report


def load(cfg: RunConfig):
    raise NotImplementedError("TODO(#64): read cfg.source / cfg.sql into a DataFrame")


def prepare(df, cfg: RunConfig):
    raise NotImplementedError("TODO(#64): split, encode")


def fit(X, cfg: RunConfig):
    raise NotImplementedError("TODO(#64): train cfg.model")


def evaluate(model, X, cfg: RunConfig) -> dict[str, float]:
    raise NotImplementedError("TODO(#64): metrics")


def report(cfg: RunConfig, model, X, metrics: dict[str, float]) -> Report:
    raise NotImplementedError("TODO(#64): build Report with charts")
