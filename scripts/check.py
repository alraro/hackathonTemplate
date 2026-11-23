#!/usr/bin/env python3
"""Run the checks of every Module present and print a summary table.

Blocking failures exit 1. Warn-only checks and not-yet-built entry points never do.
"""
from __future__ import annotations

import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DC = ["docker", "compose"]
MISSING_MARKERS = ("No module named", "Missing script", "missing script", "ModuleNotFoundError")


@dataclass
class Check:
    module: str
    name: str
    cmd: list[str]
    blocking: bool = True
    # Path (relative to ROOT) that must exist, else the entry point is "not implemented yet".
    needs: str | None = None


def in_service(service: str, *args: str) -> list[str]:
    return [*DC, "run", "--rm", "-T", service, *args]


def build_checks() -> list[Check]:
    checks: list[Check] = []
    if (ROOT / "web").is_dir():
        checks.append(Check("web", "npm run check", in_service("web", "npm", "run", "check"), needs="web/package.json"))
        checks.append(Check("web", "design-lint", in_service("web", "npm", "run", "design-lint"), blocking=False, needs="web/package.json"))
    if (ROOT / "backend" / "api").is_dir():
        checks.append(Check("api", "backend.api.check", in_service("backend", "python", "-m", "backend.api.check"), needs="backend/api/check.py"))
        checks.append(Check("api", "ruff", in_service("backend", "ruff", "check", "."), blocking=False, needs="backend/pyproject.toml"))
        if (ROOT / "backend" / "llm").is_dir():
            checks.append(Check("llm", "import backend.llm", in_service("backend", "python", "-c", "import backend.llm"), needs="backend/llm/__init__.py"))
        if (ROOT / "backend" / "data").is_dir():
            checks.append(Check("data", "import backend.data", in_service("backend", "python", "-c", "import backend.data"), needs="backend/data/__init__.py"))
            checks.append(Check("data", "data validate", in_service("backend", "python", "-m", "backend.data", "validate"), needs="backend/data/__main__.py"))
    if (ROOT / "mobile").is_dir() and shutil.which("npm"):
        checks.append(Check("mobile", "tsc (npm run check)", ["npm", "--prefix", "mobile", "run", "check"], needs="mobile/node_modules/.bin/tsc"))
        checks.append(Check("mobile", "expo-doctor", ["sh", "-c", "cd mobile && npx expo-doctor"], blocking=False, needs="mobile/node_modules/.bin/tsc"))
    if (ROOT / "scripts" / "sync.py").exists():
        checks.append(Check("skills", "sync --check", [sys.executable, "scripts/sync.py", "--check"]))
    if (ROOT / "scripts" / "lint_docs.py").exists():
        checks.append(Check("docs", "lint-docs", [sys.executable, "scripts/lint_docs.py"], blocking=False))
    return checks


def run(cmd: list[str]) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    except FileNotFoundError as e:
        return 127, str(e)
    return p.returncode, p.stdout + p.stderr


def run_check(c: Check) -> tuple[str, str]:
    """Return (status, detail). Status: ok | FAIL | warn."""
    if c.needs and not (ROOT / c.needs).exists():
        return "warn", "not implemented yet"
    code, out = run(c.cmd)
    if code == 0:
        return "ok", ""
    if any(m in out for m in MISSING_MARKERS):
        return "warn", "not implemented yet"
    tail = "\n".join(out.strip().splitlines()[-15:])
    return ("FAIL" if c.blocking else "warn"), tail


def stale_checks() -> list[tuple[str, str, str, str]]:
    """Regenerate each generated file, compare with the committed copy, then restore it."""
    targets: list[tuple[str, list[str]]] = []
    if (ROOT / "backend" / "openapi.json").exists():
        targets.append(("backend/openapi.json", ["make", "openapi"]))
    for schema in sorted(ROOT.glob("*/src/lib/api/schema.d.ts")):
        targets.append((str(schema.relative_to(ROOT)), ["make", "api-client"]))
    rows = []
    for rel, cmd in targets:
        path = ROOT / rel
        with tempfile.TemporaryDirectory() as tmp:
            backup = Path(tmp) / "orig"
            shutil.copy2(path, backup)
            before = backup.read_bytes()
            code, _ = run(cmd)
            after = path.read_bytes() if path.exists() else b""
            shutil.copy2(backup, path)  # leave the tree untouched
        if code != 0:
            rows.append(("stale", rel, "warn", "generator not implemented yet"))
        elif after != before:
            rows.append(("stale", rel, "FAIL", "stale: run the generator and commit"))
        else:
            rows.append(("stale", rel, "ok", ""))
    return rows


def main() -> int:
    results: list[tuple[str, str, str, str]] = []
    for c in build_checks():
        status, detail = run_check(c)
        results.append((c.module, c.name + ("" if c.blocking else " (warn-only)"), status, detail))
    if (ROOT / "pitch").is_dir():
        results.append(("pitch", "-", "skip", "no checks"))
    results.extend(stale_checks())

    if not results:
        results.append(("-", "no Module folder present", "warn", "nothing to check"))
    failed = any(r[2] == "FAIL" for r in results)
    w1 = max(len(r[0]) for r in results)
    w2 = max(len(r[1]) for r in results)
    marks = {"ok": "ok", "FAIL": "FAIL", "warn": "⚠ warn", "skip": "skipped"}
    print(f"{'module':<{w1}}  {'check':<{w2}}  status")
    for m, n, s, d in results:
        note = f" - {d.splitlines()[0]}" if d and s != "FAIL" else ""
        print(f"{m:<{w1}}  {n:<{w2}}  {marks[s]}{note}")
    for m, n, s, d in results:
        if s == "FAIL" and d:
            print(f"\n--- {m}: {n} ---\n{d}")
    print("\nFAILED" if failed else "\nOK (warnings are non-blocking)")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
