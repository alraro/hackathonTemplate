"""Seed the database: `python -m backend.api.seed_cli [--reset]`."""
import argparse

from sqlmodel import Session, SQLModel

from backend.api.core.db import create_db_and_tables, engine
from backend.api.core.seed import import_models, seed_all


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reset", action="store_true", help="drop all tables, recreate, then seed")
    args = parser.parse_args()
    import_models()
    if args.reset:
        SQLModel.metadata.drop_all(engine)
    create_db_and_tables()
    with Session(engine) as session:
        for name, n in seed_all(session).items():
            if n:
                print(f"seeded {name}: {n} rows")
    print("done")


if __name__ == "__main__":
    main()
