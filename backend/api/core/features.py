"""Feature flags from features.json (repo root; /app in Docker)."""
import json
from pathlib import Path

FEATURES: dict[str, bool] = json.loads((Path(__file__).resolve().parents[3] / "features.json").read_text())


def enabled(name: str) -> bool:
    return bool(FEATURES.get(name))
