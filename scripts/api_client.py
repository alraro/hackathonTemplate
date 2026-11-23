#!/usr/bin/env python3
"""Generate the typed API client inputs from the Contract (`make api-client`).

Reads backend/openapi.json and writes:
  - web/src/lib/api/schema.d.ts (and mobile/src/lib/api/schema.d.ts if mobile/ exists)
  - web/src/screens/<id>/fixtures.json (and the mobile equivalent if that screen exists),
    one per backend/api/resources/<id>/seed.json, with secret-like fields (password_hash, ...) stripped

Generated files are never hand-edited. Safe to run repeatedly: same input, same output.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SPEC = ROOT / "backend" / "openapi.json"
RESOURCES = ROOT / "backend" / "api" / "resources"


SECRET_KEY_RE = re.compile(r"password|passwd|hash|secret|token|api_?key|private_?key", re.I)


def strip_secrets(v):
    """Drop secret-like fields: fixtures ship to the browser and git."""
    if isinstance(v, dict):
        return {k: strip_secrets(x) for k, x in v.items() if not SECRET_KEY_RE.search(k)}
    if isinstance(v, list):
        return [strip_secrets(x) for x in v]
    return v


def typescript(out: Path) -> None:
    out.parent.mkdir(parents=True, exist_ok=True)
    local = ROOT / "web" / "node_modules" / ".bin" / "openapi-typescript"
    cmd = [str(local)] if local.exists() else ["npx", "--yes", "openapi-typescript@7"]
    subprocess.run([*cmd, str(SPEC), "-o", str(out)], check=True, cwd=ROOT / "web", stdout=subprocess.DEVNULL)


def main() -> int:
    if not SPEC.exists():
        print("backend/openapi.json missing: run `make openapi` first", file=sys.stderr)
        return 1
    apps = [ROOT / "web"] + ([ROOT / "mobile"] if (ROOT / "mobile").is_dir() else [])
    first: Path | None = None
    for app in apps:
        out = app / "src" / "lib" / "api" / "schema.d.ts"
        if first is None:
            typescript(out)
            first = out
        else:
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(first, out)
        print(f"wrote {out.relative_to(ROOT)}")
    seeds = sorted(RESOURCES.glob("*/seed.json")) if RESOURCES.is_dir() else []
    for seed in seeds:
        rid = seed.parent.name
        for app in apps:
            dest = app / "src" / "screens" / rid
            if app.name == "mobile" and not dest.is_dir():
                continue
            dest.mkdir(parents=True, exist_ok=True)
            raw = json.loads(seed.read_text(encoding="utf-8"))
            clean = strip_secrets(raw)
            if clean == raw:
                shutil.copyfile(seed, dest / "fixtures.json")  # byte-identical when nothing to strip
            else:
                (dest / "fixtures.json").write_text(json.dumps(clean, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"wrote {(dest / 'fixtures.json').relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
