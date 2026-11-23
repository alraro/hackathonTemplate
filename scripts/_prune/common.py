"""Shared helpers: git, repo files, manifest accessors, deletion, catalog."""
from __future__ import annotations

import shutil
import subprocess
from pathlib import Path

from _manifest import ROOT
from sync import generate_catalog

# The prune code itself: never scanned for markers.
SELF = ["scripts/prune.py", "scripts/_prune"]
ENV_FILES = [".env", ".env.example"]


def module_paths(m: dict) -> list[str]:
    return list(m.get("paths") or [m["_path"]])


def module_profiles(m: dict) -> list[str]:
    p = m.get("profile", m.get("docker_compose_profile", m["module"]))
    if p is None:
        return []
    return [p] if isinstance(p, str) else list(p)


def module_extras(m: dict) -> list[str]:
    """pyproject extras a Module owns: `extras` (list), `extra` (str), else its own name."""
    e = m.get("extras", m.get("extra", m.get("pyproject_extra", m["module"])))
    return [e] if isinstance(e, str) else list(e or [])


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


def write_catalog(dry: bool) -> None:
    if dry:
        print("  would regenerate CATALOG.md")
        return
    (ROOT / "CATALOG.md").write_text(generate_catalog(ROOT), encoding="utf-8")
    print("  regenerated CATALOG.md")
