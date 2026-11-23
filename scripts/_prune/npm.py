"""npm dependencies a Module owns (`npm_deps` in its manifest) inside a package.json that stays."""
from __future__ import annotations

import json

from _manifest import ROOT
from _prune.common import git, under


def drop_deps(gone: list[dict], paths: list[str], edits: dict[str, str], notes: list[str]) -> None:
    """Add to `edits` each kept package.json without the pruned Modules' deps."""
    for m in gone:
        for pkg, deps in (m.get("npm_deps") or {}).items():
            if under(pkg, paths) or not (ROOT / pkg).is_file():
                continue
            data = json.loads(edits.get(pkg) or (ROOT / pkg).read_text(encoding="utf-8"))
            removed = []
            for sect in ("dependencies", "devDependencies"):
                for d in deps:
                    if d in data.get(sect, {}):
                        del data[sect][d]
                        removed.append(d)
            if removed:
                edits[pkg] = json.dumps(data, indent=2) + "\n"
                notes.append(f"{pkg}: npm deps {', '.join(removed)}")


def restore_deps(m: dict, paths: list[str], sha: str, dry: bool) -> None:
    """Put back the deps the Module had at `sha`, with their old versions."""
    tag = "would " if dry else ""
    for pkg, deps in (m.get("npm_deps") or {}).items():
        if under(pkg, paths) or not (ROOT / pkg).is_file():
            continue
        old = json.loads(git("show", f"{sha}:{pkg}").stdout)
        cur = json.loads((ROOT / pkg).read_text(encoding="utf-8"))
        for sect in ("dependencies", "devDependencies"):
            for d in deps:
                if d in old.get(sect, {}) and d not in cur.setdefault(sect, {}):
                    cur[sect][d] = old[sect][d]
                    print(f"  {tag}edit {pkg}: restore npm dep {d}")
        if not dry:
            (ROOT / pkg).write_text(json.dumps(cur, indent=2) + "\n", encoding="utf-8")
