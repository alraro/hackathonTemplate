"""Pipeline registry. Pipelines are plain modules, not classes."""

import importlib
from types import ModuleType

PIPELINES: tuple[str, ...] = ("tabular", "cluster", "forecast", "anomaly", "vision", "_example")


def check_pipeline(name: str) -> None:
    if name not in PIPELINES:
        raise ValueError(f"pipeline '{name}' unknown; options: {', '.join(PIPELINES)}")


def models(pipeline: str) -> tuple[str, ...]:
    """Model names a pipeline accepts: the keys of its own `MODELS` dict, the single source of truth."""
    try:
        return tuple(get_pipeline(pipeline).MODELS)
    except ImportError as e:
        raise ValueError(
            f"pipeline '{pipeline}' needs an optional extra that is not installed ({e.name or e}); "
            f"install the [{'vision' if pipeline == 'vision' else 'data'}] extra"
        ) from e


def check_model(pipeline: str, model: str) -> None:
    check_pipeline(pipeline)
    options = models(pipeline)
    if model not in options:
        raise ValueError(f"model '{model}' unknown; options: {', '.join(options) or 'none yet'}")


def get_pipeline(name: str) -> ModuleType:
    check_pipeline(name)
    return importlib.import_module(f"backend.data.pipelines.{name}")
