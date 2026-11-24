"""CLI: python -m backend.data run <name> | eda <csv> | validate."""

import argparse
import sys
from pathlib import Path


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m backend.data")
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("run", help="run a pipeline").add_argument("name")
    sub.add_parser("eda", help="skrub TableReport for a CSV").add_argument("csv", type=Path)
    sub.add_parser("validate", help="check every runs/*.yaml; no fitting")
    args = ap.parse_args(argv)

    from backend.data import config, runner
    from backend.data import eda as eda_mod

    try:
        if args.cmd == "validate":
            errors = config.validate_all()
            for e in errors:
                print(e, file=sys.stderr)
            print(f"{len(config.run_names())} run(s), {len(errors)} error(s)")
            return 1 if errors else 0
        if args.cmd == "run":
            report = runner.run(config.load_config(args.name))
            print(report.summary)
            return 0
        out = eda_mod.eda(args.csv)
        # The container mounts the repo at /app: print the path the user can open on the host.
        print(f"{str(out).removeprefix('/app/')}  (also in the web dashboard)")
        return 0
    except ValueError as e:
        print(e, file=sys.stderr)
        return 2
