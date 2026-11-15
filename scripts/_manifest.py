"""Read and validate MODULE.md frontmatters. Shared by sync.py and prune.py."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# Order is the order of rows in CATALOG.md.
MODULE_PATHS = ["web", "mobile", "pitch", "backend/api", "backend/llm", "backend/data"]

REQUIRED_KEYS = ["module", "lane", "keep_when", "features"]
FEATURE_KEYS = ["id", "gives", "entry", "keep_when"]
FRONTMATTER = re.compile(r"\A---\n(.*?)\n---\n", re.S)


def _yaml():
    try:
        import yaml
    except ImportError:
        sys.exit("PyYAML is required: pip install pyyaml")
    return yaml


def read_frontmatter(path: Path) -> dict:
    m = FRONTMATTER.match(path.read_text(encoding="utf-8"))
    if not m:
        raise ValueError(f"{path}: missing YAML frontmatter")
    data = _yaml().safe_load(m.group(1))
    if not isinstance(data, dict):
        raise ValueError(f"{path}: frontmatter is not a mapping")
    return data


def validate(data: dict, path: Path) -> list[str]:
    errors = [f"{path}: missing key `{k}`" for k in REQUIRED_KEYS if k not in data]
    for i, f in enumerate(data.get("features") or []):
        errors += [f"{path}: features[{i}] missing `{k}`" for k in FEATURE_KEYS if not isinstance(f, dict) or k not in f]
    return errors


def load_modules(root: Path = ROOT) -> list[dict]:
    """Return validated frontmatters of the Modules that exist; pruned ones are skipped."""
    modules, errors = [], []
    for rel in MODULE_PATHS:
        path = root / rel / "MODULE.md"
        if not path.is_file():
            continue
        data = read_frontmatter(path)
        errors += validate(data, path)
        data["_path"] = rel
        modules.append(data)
    if errors:
        raise ValueError("\n".join(errors))
    return modules


def load_features(root: Path = ROOT) -> dict[str, bool]:
    return json.loads((root / "features.json").read_text(encoding="utf-8"))
