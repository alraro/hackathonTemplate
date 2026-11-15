from collections.abc import Iterator

from sqlmodel import Session, SQLModel, create_engine

from backend.api.core.settings import settings

engine = create_engine(settings.database_url, pool_pre_ping=True)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def get_session() -> Iterator[Session]:
    with Session(engine) as session:
        yield session
