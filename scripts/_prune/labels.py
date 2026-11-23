"""The pruned Modules' `lane:<x>` GitHub labels."""
from __future__ import annotations

import shutil
import subprocess

from _manifest import ROOT
from _prune.common import git


def labels_for(mods: list[dict]) -> list[str]:
    return sorted({f"lane:{m['lane']}" for m in mods})


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
