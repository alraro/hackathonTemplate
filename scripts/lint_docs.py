#!/usr/bin/env python3
"""Warn-only doc size lint. Always exits 0.

Soft references: SKILL.md ~3K tokens, MODULE.md ~2K tokens, AGENTS.md ~120 lines,
issue bodies ~1.5K tokens (--issue <file>). Tokens ~= chars / 4.
CHANGES.md, README.md and docs/**/*.md are scanned but have no reference size.
"""
import argparse
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SKIP_PARTS = {".claude", ".github", "node_modules", ".git", ".venv"}
SKILL_REF, MODULE_REF, ISSUE_REF, AGENTS_LINES = 3000, 2000, 1500, 120


def tokens(text: str) -> int:
    return len(text) // 4


def scan() -> list[pathlib.Path]:
    found = set(ROOT.glob(".agents/skills/**/SKILL.md"))
    found |= {p for p in ROOT.rglob("MODULE.md") if not SKIP_PARTS & set(p.relative_to(ROOT).parts)}
    for name in ("AGENTS.md", "CHANGES.md", "README.md"):
        if (ROOT / name).is_file():
            found.add(ROOT / name)
    found |= set(ROOT.glob("docs/**/*.md"))
    return sorted(found)


def check(path: pathlib.Path, label: str, warnings: list[str]) -> None:
    text = path.read_text(encoding="utf-8", errors="replace")
    if path.name == "AGENTS.md" and path.parent == ROOT:
        n = len(text.splitlines())
        if n > AGENTS_LINES:
            warnings.append(f"⚠ {label}: ~{n} lines (reference ~{AGENTS_LINES}) — justify or trim")
        return
    ref = {"SKILL.md": SKILL_REF, "MODULE.md": MODULE_REF}.get(path.name)
    if ref is None:
        return
    n = tokens(text)
    if n > ref:
        warnings.append(f"⚠ {label}: ~{n} tokens (reference ~{ref}) — justify or trim")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--issue", action="append", default=[], help="issue body file to check (~1.5K tokens)")
    args = ap.parse_args()
    warnings: list[str] = []
    for p in scan():
        check(p, str(p.relative_to(ROOT)), warnings)
    for f in args.issue:
        p = pathlib.Path(f)
        if p.is_file():
            n = tokens(p.read_text(encoding="utf-8", errors="replace"))
            if n > ISSUE_REF:
                warnings.append(f"⚠ {f}: ~{n} tokens (reference ~{ISSUE_REF}) — justify or trim")
    if warnings:
        print("\n".join(warnings))
    print(f"{len(warnings)} files over reference (warn only)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
