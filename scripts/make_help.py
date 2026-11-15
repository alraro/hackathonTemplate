#!/usr/bin/env python3
"""Print `make help`: a two-column table of `target: ## what — when` comments, grouped by Module."""
import re
import sys
from pathlib import Path

TARGET = re.compile(r"^([a-zA-Z0-9_-]+):.*?## (.*)$")
OPEN = re.compile(r"^# >>> module:(\S+)")
CLOSE = re.compile(r"^# <<< module:")


def parse(text):
    groups = {"core": []}
    current = "core"
    for line in text.splitlines():
        if m := OPEN.match(line):
            current = m.group(1)
            groups.setdefault(current, [])
        elif CLOSE.match(line):
            current = "core"
        elif m := TARGET.match(line):
            groups[current].append((m.group(1), m.group(2).strip()))
    return groups


def main(argv):
    path = Path(argv[1] if len(argv) > 1 else "Makefile")
    color = sys.stdout.isatty()
    cyan, bold, reset = ("\033[36m", "\033[1m", "\033[0m") if color else ("", "", "")
    for name, rows in parse(path.read_text(encoding="utf-8")).items():
        if not rows:
            continue
        print(f"{bold}{name}{reset}")
        width = max(len(t) for t, _ in rows)
        for target, desc in rows:
            print(f"  {cyan}{target:<{width}}{reset}  {desc}")
        print()


if __name__ == "__main__":
    main(sys.argv)
