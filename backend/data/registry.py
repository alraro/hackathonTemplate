"""Pipeline and model registry. Pipelines are plain modules, not classes."""

import importlib
from types import ModuleType

PIPELINES: tuple[str, ...] = ("tabular", "cluster", "forecast", "anomaly", "vision", "_example")

# Model names accepted per pipeline. Each pipeline issue fills its own entry.
MODELS: dict[str, tuple[str, ...]] = {
    "tabular": ("hgb", "random_forest", "logistic", "knn"),
    "cluster": (),  # TODO(#62)
    "forecast": (),  # TODO(#63)
    "anomaly": (),  # TODO(#64)
    "vision": (),  # TODO(#65)
    "_example": ("example",),
}


def check_pipeline(name: str) -> None:
    if name not in PIPELINES:
        raise ValueError(f"pipeline '{name}' unknown; options: {', '.join(PIPELINES)}")


def check_model(pipeline: str, model: str) -> None:
    check_pipeline(pipeline)
    options = MODELS[pipeline]
    if model not in options:
        raise ValueError(f"model '{model}' unknown; options: {', '.join(options) or 'none yet'}")


def get_pipeline(name: str) -> ModuleType:
    check_pipeline(name)
    return importlib.import_module(f"backend.data.pipelines.{name}")
