"""Fail when the committed openapi.json is stale: `python -m backend.api.check`."""
import sys

from backend.api.openapi import OUT, render

if __name__ == "__main__":
    if not OUT.is_file() or OUT.read_text(encoding="utf-8") != render():
        sys.exit("backend/openapi.json is stale: run `make openapi` and commit it")
    print("openapi.json is up to date")
