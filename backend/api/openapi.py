"""Export the OpenAPI Contract: `python -m backend.api.openapi` (no server, no DB)."""
import json
from pathlib import Path

from backend.api.core.app import app

OUT = Path(__file__).resolve().parent.parent / "openapi.json"


def render() -> str:
    return json.dumps(app.openapi(), indent=2, sort_keys=True) + "\n"


if __name__ == "__main__":
    OUT.write_text(render(), encoding="utf-8")
    print(f"wrote {OUT}")
