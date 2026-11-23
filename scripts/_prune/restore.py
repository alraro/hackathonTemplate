"""Restore: bring a pruned Module back from the pre-Prune SHA, keeping later work in shared files."""
from __future__ import annotations

import difflib
import subprocess
import sys

from _manifest import FRONTMATTER, MODULE_PATHS, ROOT, _yaml
from _prune.common import ENV_FILES, SELF, git, module_extras, module_paths, module_profiles, read_text, under, write_catalog
from _prune.markers import flags_for_file
from _prune.npm import restore_deps
from _prune.profiles import profile_line_order, rewrite_profiles


def manifest_at(sha: str, name: str) -> dict:
    for rel in MODULE_PATHS:
        r = git("show", f"{sha}:{rel}/MODULE.md", check=False)
        if r.returncode != 0:
            continue
        fm = FRONTMATTER.match(r.stdout)
        data = _yaml().safe_load(fm.group(1)) if fm else None
        if not isinstance(data, dict):
            continue
        if data.get("module") == name:
            data["_path"] = rel
            return data
    raise ValueError(f"module `{name}` has no MODULE.md at {sha}")


def merge_back(old: list[str], cur: list[str], owner: list[str | None]) -> list[str]:
    """Insert the old lines flagged in `owner` into `cur`, keeping everything else of `cur`."""
    out: list[str] = []
    sm = difflib.SequenceMatcher(None, old, cur, autojunk=False)
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == "equal":
            out += cur[b0:b1]
        else:
            out += [old[i] for i in range(a0, a1) if owner[i]]
            out += cur[b0:b1]
    return out


def reinsert_marked(name: str, m: dict, paths: list[str], sha: str, dry: bool) -> None:
    """Put the Module's marked lines back into every shared file that had them at `sha`."""
    tag = "would " if dry else ""
    for rel in git("ls-tree", "-r", "--name-only", sha).stdout.splitlines():
        if under(rel, SELF) or under(rel, paths) or not (ROOT / rel).is_file():
            continue
        cur_text = read_text(ROOT / rel)
        if cur_text is None:  # binary or unreadable: never carries markers
            continue
        shown = subprocess.run(["git", "show", f"{sha}:{rel}"], cwd=ROOT, capture_output=True)
        try:
            old = shown.stdout.decode("utf-8").splitlines(keepends=True)
        except UnicodeDecodeError:
            continue
        if shown.returncode != 0:
            continue
        owner, notes = flags_for_file(rel, old, [name], module_extras(m))
        if not any(owner):
            continue
        new = "".join(merge_back(old, cur_text.splitlines(keepends=True), owner))
        if new != cur_text:
            for n in notes:
                print(f"  {tag}reinsert {n}")
            if not dry:
                (ROOT / rel).write_text(new, encoding="utf-8")


def restore_profiles(m: dict, sha: str, dry: bool) -> None:
    tag = "would " if dry else ""
    order = profile_line_order(git("show", f"{sha}:.env.example", check=False).stdout)
    make_order = profile_line_order(git("show", f"{sha}:Makefile", check=False).stdout)
    for rel in [*ENV_FILES, "Makefile"]:
        f = ROOT / rel
        text = read_text(f) if f.is_file() else None
        if text is None:
            continue
        new = rewrite_profiles(text, add=module_profiles(m), order=make_order if rel == "Makefile" else order)
        if new != text:
            print(f"  {tag}edit {rel}: COMPOSE_PROFILES adds {', '.join(module_profiles(m))}")
            if not dry:
                f.write_text(new, encoding="utf-8")


def restore(name: str, sha: str, dry: bool) -> int:
    try:
        if git("cat-file", "-e", f"{sha}^{{commit}}", check=False).returncode != 0:
            raise ValueError(f"unknown commit {sha}")
        m = manifest_at(sha, name)
    except ValueError as e:
        print(f"error: {e}", file=sys.stderr)
        return 1
    paths = module_paths(m)
    tag = "would " if dry else ""
    print(f"{'Dry run: ' if dry else ''}restore {name} from {sha}")
    for p in paths:
        print(f"  {tag}checkout {p}")
    if not dry:
        r = git("checkout", sha, "--", *paths, check=False)
        if r.returncode != 0:
            print(f"error: {r.stderr.strip()}", file=sys.stderr)
            return 1
    reinsert_marked(name, m, paths, sha, dry)
    restore_profiles(m, sha, dry)
    restore_deps(m, paths, sha, dry)
    write_catalog(dry)
    return 0
