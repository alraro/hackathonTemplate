"""Run config: runs/<name>.yaml validated with pydantic."""

from pathlib import Path
from typing import Any

import yaml
from pydantic import BaseModel, Field, model_validator

from backend.data import registry

DATA_DIR = Path(__file__).resolve().parent
RUNS_DIR = DATA_DIR / "runs"
OUTPUTS_DIR = DATA_DIR / "outputs"


class RunConfig(BaseModel):
    name: str = ""  # filled from the file name
    pipeline: str
    source: str | None = None  # csv / parquet / xlsx path
    sql: str | None = None
    target: str | None = None
    model: str
    params: dict[str, Any] = Field(default_factory=dict)
    explain: bool = False

    @model_validator(mode="after")
    def _check(self) -> "RunConfig":
        registry.check_model(self.pipeline, self.model)
        if bool(self.source) == bool(self.sql):
            raise ValueError("set exactly one of 'source' or 'sql'")
        return self


def run_names() -> list[str]:
    return sorted(p.stem for p in RUNS_DIR.glob("*.yaml"))


def load_config(name: str) -> RunConfig:
    path = RUNS_DIR / f"{name}.yaml"
    if not path.is_file():
        raise ValueError(f"run '{name}' unknown; options: {', '.join(run_names()) or 'none yet'}")
    cfg = RunConfig.model_validate(yaml.safe_load(path.read_text()) or {})
    cfg.name = name
    return cfg


def source_path(cfg: RunConfig) -> Path | None:
    if not cfg.source:
        return None
    p = Path(cfg.source)
    return p if p.is_absolute() else DATA_DIR / p


def validate_all() -> list[str]:
    """Return error strings for every runs/*.yaml. No fitting, no downloads."""
    errors = []
    for name in run_names():
        try:
            cfg = load_config(name)
            p = source_path(cfg)
            if p is not None and not p.exists():
                errors.append(f"{name}: source '{cfg.source}' not found")
        except Exception as e:  # pydantic, yaml, registry errors
            errors.append(f"{name}: {e}")
    return errors
