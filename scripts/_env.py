"""Shared host-side helpers: `.env` and `features.json` readers. Stdlib only."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def read_env() -> dict:
    """KEY=VALUE pairs of .env ({} if missing)."""
    env = {}
    path = ROOT / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def vision() -> str:
    """'true' or 'false' from features.json, for the VISION compose variable."""
    try:
        return str(json.loads((ROOT / "features.json").read_text()).get("vision", False)).lower()
    except (OSError, ValueError):
        return "false"
