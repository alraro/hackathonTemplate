"""Prune: build the plan (deletes + edits), print it, apply it."""
from __future__ import annotations

import sys
from pathlib import Path

from _manifest import ROOT, load_modules
from _prune.common import ENV_FILES, SELF, module_extras, module_paths, module_profiles, read_text, remove, repo_files, under, write_catalog
from _prune.labels import delete_labels, labels_for
from _prune.markers import flags_for_file
from _prune.npm import drop_deps
from _prune.profiles import rewrite_profiles

NEVER = {"pitch"}


def check_names(names: list[str], all_mods: list[dict]) -> None:
    by_name = {m["module"]: m for m in all_mods}
    errors = []
    for n in names:
        if n in NEVER:
            errors.append(f"`{n}` is never pruned")
        elif n not in by_name:
            errors.append(f"unknown module `{n}` (present: {', '.join(by_name) or 'none'})")
    if errors:
        raise ValueError("\n".join(errors))
    for k in all_mods:
        if k["module"] in names:
            continue
        for r in k.get("requires") or []:
            if r in names:
                errors.append(f"cannot prune `{r}`: kept module `{k['module']}` requires it")
    if errors:
        raise ValueError("\n".join(errors))


def build_prune_plan(names: list[str]) -> dict:
    all_mods = load_modules()
    check_names(names, all_mods)
    gone = [m for n in names for m in all_mods if m["module"] == n]

    paths = [p for m in gone for p in module_paths(m)]
    for p in paths:
        if ".." in Path(p).parts or Path(p).is_absolute():
            raise ValueError(f"unsafe path in manifest: {p}")
    deletes = [p for p in paths if (ROOT / p).exists()]

    edits: dict[str, str] = {}
    notes: list[str] = []
    for rel in repo_files():
        if under(rel, SELF) or under(rel, paths):
            continue
        text = read_text(ROOT / rel)
        if text is None:
            continue
        lines = text.splitlines(keepends=True)
        owner, found = flags_for_file(rel, lines, names, [e for m in gone for e in module_extras(m)])
        if not any(owner):
            continue
        edits[rel] = "".join(l for l, o in zip(lines, owner) if not o)
        notes += found

    drop_deps(gone, paths, edits, notes)

    remove_profiles = [p for m in gone for p in module_profiles(m)]
    for rel in [*ENV_FILES, "Makefile"]:
        f = ROOT / rel
        text = edits.get(rel) if rel in edits else read_text(f) if f.is_file() else None
        if text is None:
            continue
        new = rewrite_profiles(text, remove=remove_profiles)
        if new != text:
            edits[rel] = new
            notes.append(f"{rel}: COMPOSE_PROFILES drops {', '.join(remove_profiles)}")

    return {"modules": gone, "deletes": deletes, "edits": edits, "notes": notes, "labels": labels_for(gone)}


def prune(names: list[str], dry: bool) -> int:
    try:
        plan = build_prune_plan(names)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    tag = "would " if dry else ""
    print(f"{'Dry run: ' if dry else ''}prune {', '.join(names)}")
    for p in plan["deletes"]:
        n = sum(1 for x in (ROOT / p).rglob("*") if x.is_file()) if (ROOT / p).is_dir() else 1
        print(f"  {tag}delete {p} ({n} file{'s' if n != 1 else ''})")
    for note in plan["notes"]:
        print(f"  {tag}edit {note}")
    for rel in plan["edits"]:
        print(f"  {tag}rewrite {rel}")
    if dry:
        delete_labels(plan["labels"], True)
        write_catalog(True)
        return 0
    for p in plan["deletes"]:
        remove(ROOT / p)
    for rel, text in plan["edits"].items():
        (ROOT / rel).write_text(text, encoding="utf-8")
    delete_labels(plan["labels"], False)
    write_catalog(False)
    if (ROOT / "backend" / "api").is_dir():
        print("done. Run `make openapi api-client` (pruned routes change the Contract), then `make check`.")
    else:
        print("done. Run `make check`.")
    return 0
