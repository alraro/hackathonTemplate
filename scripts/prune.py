#!/usr/bin/env python3
"""Remove whole Modules from the repo, driven by their MODULE.md manifests.

    python scripts/prune.py <module>...               prune (make prune m="mobile data")
    python scripts/prune.py --dry-run <module>...     print the plan, change nothing
    python scripts/prune.py --restore <module> --sha <sha>
                                                      bring a Module back from the pre-Prune SHA

Manifest keys used: `module`, `lane`, `requires`, `profile`/`docker_compose_profile` (str, list or null; defaults to the
module name), optional `paths` (defaults to the Module directory), optional `extras`/`extra`/`pyproject_extra` (pyproject
extras, default the module name) and optional
`npm_deps` ({package.json path: [names]}). `pitch` is never pruned. Features are never pruned.
"""
from __future__ import annotations

import argparse
import difflib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _manifest import FRONTMATTER, MODULE_PATHS, ROOT, _yaml, load_modules  # noqa: E402
from sync import generate_catalog  # noqa: E402

SELF = "scripts/prune.py"
NEVER = {"pitch"}
ENV_FILES = [".env", ".env.example"]
PROFILE_LINE = re.compile(r"^(COMPOSE_PROFILES\s*\??=\s*)(.*?)(\s*)$")


# --- manifest helpers --------------------------------------------------------------------------


def module_paths(m: dict) -> list[str]:
    return list(m.get("paths") or [m["_path"]])


def module_profiles(m: dict) -> list[str]:
    p = m.get("profile", m.get("docker_compose_profile", m["module"]))
    if p is None:
        return []
    return [p] if isinstance(p, str) else list(p)


def git(*args: str, check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=check)


def repo_files() -> list[str]:
    r = git("ls-files", "-co", "--exclude-standard", check=False)
    if r.returncode == 0:
        return sorted(set(r.stdout.splitlines()))
    skip = {".git", "node_modules", ".venv", "__pycache__"}
    return sorted(
        str(p.relative_to(ROOT))
        for p in ROOT.rglob("*")
        if p.is_file() and not skip & set(p.relative_to(ROOT).parts)
    )


def read_text(path: Path) -> str | None:
    try:
        return path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return None


def under(rel: str, paths: list[str]) -> bool:
    return any(rel == p.rstrip("/") or rel.startswith(p.rstrip("/") + "/") for p in paths)


# --- marked-line detection ---------------------------------------------------------------------


def marker_regexes(names: list[str]):
    alt = "|".join(re.escape(n) for n in names)
    opn = re.compile(rf"^\s*(?:#|//)\s*>>>\s*module:({alt})\s*$")
    cls = re.compile(rf"^\s*(?:#|//)\s*<<<\s*module:({alt})\s*$")
    one = re.compile(rf"(?:#|//)\s*module:({alt})\s*$")
    return opn, cls, one


def mine_flags(lines: list[str], names: list[str], path: str = "") -> tuple[list[str | None], list[str]]:
    """Per line: the owning module name when it must go, else None. Plus descriptions."""
    opn, cls, one = marker_regexes(names)
    owner: list[str | None] = [None] * len(lines)
    notes: list[str] = []
    cur, start = None, 0
    for i, line in enumerate(lines):
        text = line.rstrip("\n")
        if cur is None:
            if m := opn.match(text):
                cur, start = m.group(1), i
                owner[i] = cur
            elif m := one.search(text):
                owner[i] = m.group(1)
                notes.append(f"{path}:{i + 1}: line marked module:{m.group(1)}")
        else:
            owner[i] = cur
            if (m := cls.match(text)) and m.group(1) == cur:
                notes.append(f"{path}:{start + 1}-{i + 1}: block module:{cur}")
                cur = None
    if cur is not None:
        raise ValueError(f"{path}:{start + 1}: unclosed `>>> module:{cur}` block")
    return owner, notes


def extra_span(lines: list[str], name: str) -> tuple[int, int] | None:
    """Line range [start, end) of `name = [...]` inside [project.optional-dependencies]."""
    section = False
    for i, line in enumerate(lines):
        s = line.strip()
        if s.startswith("["):
            section = s == "[project.optional-dependencies]"
            continue
        if section and re.match(rf"^{re.escape(name)}\s*=\s*\[", line):
            depth, in_str = 0, None
            for j in range(i, len(lines)):
                for ch in lines[j]:
                    if in_str:
                        in_str = None if ch == in_str else in_str
                    elif ch in "\"'":
                        in_str = ch
                    elif ch == "#":
                        break
                    elif ch == "[":
                        depth += 1
                    elif ch == "]":
                        depth -= 1
                if depth == 0:
                    return i, j + 1
    return None


def module_extras(m: dict) -> list[str]:
    """pyproject extras a Module owns: `extras` (list), `extra` (str), else its own name."""
    e = m.get("extras", m.get("extra", m.get("pyproject_extra", m["module"])))
    return [e] if isinstance(e, str) else list(e or [])


def flags_for_file(
    rel: str, lines: list[str], names: list[str], extras: list[str] | None = None
) -> tuple[list[str | None], list[str]]:
    owner, notes = mine_flags(lines, names, rel)
    if rel == "backend/pyproject.toml":
        for n in extras if extras is not None else names:
            if span := extra_span(lines, n):
                for k in range(*span):
                    owner[k] = n
                notes.append(f"{rel}:{span[0] + 1}-{span[1]}: pyproject extra `{n}`")
    return owner, notes


# --- profiles ----------------------------------------------------------------------------------


def rewrite_profiles(text: str, remove: list[str] = (), add: list[str] = (), order: list[str] = ()) -> str:
    out = []
    for line in text.split("\n"):
        m = PROFILE_LINE.match(line)
        if m:
            cur = [p for p in m.group(2).split(",") if p]
            cur = [p for p in cur if p not in remove]
            seen: list[str] = []
            for p in cur + list(add):
                if p not in seen:
                    seen.append(p)
            if order:
                seen = [p for p in order if p in seen] + [p for p in seen if p not in order]
            line = f"{m.group(1)}{','.join(seen)}{m.group(3)}"
        out.append(line)
    return "\n".join(out)


def profile_line_order(text: str | None) -> list[str]:
    for line in (text or "").split("\n"):
        if m := PROFILE_LINE.match(line):
            return [p for p in m.group(2).split(",") if p]
    return []


# --- plan / apply ------------------------------------------------------------------------------


def labels_for(mods: list[dict]) -> list[str]:
    return sorted({f"lane:{m['lane']}" for m in mods})


def build_prune_plan(names: list[str]) -> dict:
    all_mods = load_modules()
    by_name = {m["module"]: m for m in all_mods}
    errors = []
    for n in names:
        if n in NEVER:
            errors.append(f"`{n}` is never pruned")
        elif n not in by_name:
            errors.append(f"unknown module `{n}` (present: {', '.join(by_name) or 'none'})")
    if errors:
        raise ValueError("\n".join(errors))
    gone = [by_name[n] for n in names]
    for k in all_mods:
        if k["module"] in names:
            continue
        for r in k.get("requires") or []:
            if r in names:
                errors.append(f"cannot prune `{r}`: kept module `{k['module']}` requires it")
    if errors:
        raise ValueError("\n".join(errors))

    paths = [p for m in gone for p in module_paths(m)]
    for p in paths:
        if ".." in Path(p).parts or Path(p).is_absolute():
            raise ValueError(f"unsafe path in manifest: {p}")
    deletes = [p for p in paths if (ROOT / p).exists()]

    edits: dict[str, str] = {}
    notes: list[str] = []
    for rel in repo_files():
        if rel == SELF or under(rel, paths):
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

    # npm deps
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

    # COMPOSE_PROFILES
    remove = [p for m in gone for p in module_profiles(m)]
    for rel in [*ENV_FILES, "Makefile"]:
        f = ROOT / rel
        text = edits.get(rel) if rel in edits else read_text(f) if f.is_file() else None
        if text is None:
            continue
        new = rewrite_profiles(text, remove=remove)
        if new != text:
            edits[rel] = new
            notes.append(f"{rel}: COMPOSE_PROFILES drops {', '.join(remove)}")

    return {"modules": gone, "deletes": deletes, "edits": edits, "notes": notes, "labels": labels_for(gone)}


def delete_labels(labels: list[str], dry: bool) -> None:
    if not labels:
        return
    if dry:
        for l in labels:
            print(f"  would delete label {l}")
        return
    remote = git("remote", check=False).stdout.strip()
    if not shutil.which("gh") or not remote:
        print("  skipped label deletion (no gh or no git remote)")
        return
    for l in labels:
        r = subprocess.run(["gh", "label", "delete", l, "--yes"], cwd=ROOT, capture_output=True, text=True)
        print(f"  label {l}: " + ("deleted" if r.returncode == 0 else f"not deleted ({r.stderr.strip()})"))


def write_catalog(dry: bool) -> None:
    if dry:
        print("  would regenerate CATALOG.md")
        return
    (ROOT / "CATALOG.md").write_text(generate_catalog(ROOT), encoding="utf-8")
    print("  regenerated CATALOG.md")


def remove(t: Path) -> None:
    """Delete a file or tree. Containers leave root-owned files (__pycache__, dist/): retry in Docker."""
    try:
        shutil.rmtree(t) if t.is_dir() else t.unlink()
    except PermissionError:
        if not shutil.which("docker"):
            raise
        subprocess.run(
            ["docker", "run", "--rm", "-v", f"{t.parent}:/w", "alpine", "rm", "-rf", f"/w/{t.name}"],
            check=True,
        )


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


# --- restore -----------------------------------------------------------------------------------


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
    ls = git("ls-tree", "-r", "--name-only", sha).stdout.splitlines()
    for rel in ls:
        if rel == SELF or under(rel, paths) or not (ROOT / rel).is_file():
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
    # COMPOSE_PROFILES
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
    # npm deps
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
    write_catalog(dry)
    return 0


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modules", nargs="*", help="Module names to prune")
    ap.add_argument("--dry-run", action="store_true", help="print the plan, change nothing")
    ap.add_argument("--restore", metavar="MODULE", help="restore a pruned Module")
    ap.add_argument("--sha", help="pre-Prune commit (from hackathon/06-prune.md), with --restore")
    a = ap.parse_args(argv)
    if a.restore:
        if not a.sha:
            ap.error("--restore needs --sha <sha>")
        if a.modules:
            ap.error("--restore takes one module via --restore only")
        return restore(a.restore, a.sha, a.dry_run)
    if not a.modules:
        ap.error("name at least one module, e.g. `make prune m=\"mobile data\"`")
    return prune(a.modules, a.dry_run)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
