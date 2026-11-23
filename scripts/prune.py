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
The code lives in `scripts/_prune/`, one module per responsibility.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _prune.plan import prune  # noqa: E402
from _prune.restore import restore  # noqa: E402


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
