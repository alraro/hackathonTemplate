"""`python -m backend.llm.rag ingest [path] [--force]`: embed documents into pgvector."""

from __future__ import annotations

import argparse
import sys

from backend.llm import rag


def main(argv: list[str] | None = None) -> None:
    p = argparse.ArgumentParser(prog="rag", description="RAG corpus tools")
    sub = p.add_subparsers(dest="cmd", required=True)
    ing = sub.add_parser("ingest", help="chunk, embed and store documents")
    ing.add_argument("path", nargs="?", default=str(rag.CORPUS_DIR))
    ing.add_argument("--force", action="store_true", help="re-embed even if unchanged")
    args = p.parse_args(argv if argv is not None else sys.argv[1:])
    n = rag.ingest_path(args.path, force=args.force)
    print(f"ingested {n} chunks" if n else "nothing to ingest (all documents unchanged)")


if __name__ == "__main__":
    main()
