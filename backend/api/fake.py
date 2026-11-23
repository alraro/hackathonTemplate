"""Fake data: `make fake resource=<id> n=<n>` rewrites resources/<id>/seed.json.

Rows are shaped by the resource's Read schema (see core/seed.py); field names hint
the generator (email, city, price, lat/lng...), enums pick a member, the rest falls
back to the annotation. Language follows OUTPUT_LANGUAGE. Extend `HINTS` for a new
field name. `make api-client` then refreshes fixtures from the new seed.json.
"""
import argparse
import json
import os
import random
import types
import typing
from datetime import UTC, date, datetime, timedelta
from enum import Enum
from typing import Any

from faker import Faker
from pydantic.fields import FieldInfo

from backend.api.core.seed import RESOURCES_DIR, import_resource_module, read_schema, table_model

LOCALES = {
    "en": "en_US", "english": "en_US", "fr": "fr_FR", "french": "fr_FR", "francais": "fr_FR",
    "es": "es_ES", "spanish": "es_ES", "de": "de_DE", "german": "de_DE", "it": "it_IT",
    "italian": "it_IT", "pt": "pt_PT", "portuguese": "pt_PT", "nl": "nl_NL", "dutch": "nl_NL",
    "pl": "pl_PL", "polish": "pl_PL", "sv": "sv_SE", "swedish": "sv_SE", "ja": "ja_JP",
    "japanese": "ja_JP", "zh": "zh_CN", "chinese": "zh_CN", "ar": "ar_AA", "arabic": "ar_AA",
    "ru": "ru_RU", "russian": "ru_RU", "tr": "tr_TR", "turkish": "tr_TR", "he": "he_IL",
    "hebrew": "he_IL", "hi": "hi_IN", "hindi": "hi_IN", "ko": "ko_KR", "korean": "ko_KR",
}


def make_faker(language: str | None = None) -> Faker:
    key = (language if language is not None else os.getenv("OUTPUT_LANGUAGE", "")).strip().lower()
    if key not in LOCALES:
        key = key.replace("_", "-").split("-")[0]
    return Faker(LOCALES.get(key, "en_US"))


# Fake coordinates cluster around one city so the map shows a useful view (not the whole planet).
# Override with FAKE_CENTER="lat,lng" in .env; the default matches the items seed (Málaga).
_CENTER = tuple(float(v) for v in (os.environ.get("FAKE_CENTER") or "36.7213,-4.4214").split(","))


def _near(axis: int) -> float:
    return round(_CENTER[axis] + random.uniform(-0.04, 0.04), 6)


# field name (lowercase) -> generator(faker). Checked before the type fallback.
HINTS: dict[str, Any] = {
    "name": lambda f: f.name(),
    "full_name": lambda f: f.name(),
    "first_name": lambda f: f.first_name(),
    "last_name": lambda f: f.last_name(),
    "email": lambda f: f.email(),
    "phone": lambda f: f.phone_number(),
    "city": lambda f: f.city(),
    "country": lambda f: f.country(),
    "address": lambda f: f.address().replace("\n", ", "),
    "lat": lambda f: _near(0),
    "latitude": lambda f: _near(0),
    "lng": lambda f: _near(1),
    "lon": lambda f: _near(1),
    "longitude": lambda f: _near(1),
    "price": lambda f: round(random.uniform(1, 500), 2),
    "amount": lambda f: round(random.uniform(1, 500), 2),
    "title": lambda f: f.sentence(nb_words=4).rstrip("."),
    "description": lambda f: f.paragraph(nb_sentences=2),
    "category": lambda f: f.word(),
    "company": lambda f: f.company(),
    "url": lambda f: f.url(),
    "image_url": lambda f: f.image_url(),
    "username": lambda f: f.user_name(),
}


def _unwrap(annotation: Any) -> Any:
    if typing.get_origin(annotation) in (typing.Union, types.UnionType):
        args = [a for a in typing.get_args(annotation) if a is not type(None)]
        return args[0] if args else str
    return annotation


def value_for(name: str, info: FieldInfo, f: Faker) -> Any:
    ann = _unwrap(info.annotation)
    if isinstance(ann, type) and issubclass(ann, Enum):
        return random.choice(list(ann)).value
    if name.lower() in HINTS:
        return HINTS[name.lower()](f)
    if name.endswith("_id"):
        return None
    if ann is datetime:
        when = datetime.now(UTC) - timedelta(seconds=random.randint(0, 60 * 24 * 3600))
        return when.replace(microsecond=0).isoformat().replace("+00:00", "Z")
    if ann is date:
        return f.date_between("-60d", "today").isoformat()
    if ann is bool:
        return f.boolean()
    if ann is int:
        return f.random_int(0, 1000)
    if ann is float:
        return round(random.uniform(0, 1000), 2)
    if ann is str:
        return f.sentence(nb_words=3).rstrip(".")
    return None


def make_row(read: type, f: Faker, overrides: dict[str, Any] | None = None) -> dict[str, Any]:
    row = {name: value_for(name, info, f) for name, info in read.model_fields.items()}
    row.update(overrides or {})
    return read.model_validate(row).model_dump(mode="json")  # fail loudly on an invalid row


def resolve(resource: str) -> tuple[type, type]:
    """(table model, Read schema) of a resource."""
    models = import_resource_module(resource, "models")
    model = table_model(models) if models is not None else None
    if model is None:
        raise SystemExit(f"fake: resource '{resource}' has no table model")
    return model, read_schema(resource, models, model)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--resource", required=True)
    parser.add_argument("--n", type=int, default=20)
    args = parser.parse_args()
    _, read = resolve(args.resource)
    f = make_faker()
    rows = [make_row(read, f) for _ in range(args.n)]
    path = RESOURCES_DIR / args.resource / "seed.json"
    path.write_text(json.dumps(rows, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"wrote {len(rows)} rows to {path}")
    print("next: `make api-client` refreshes fixtures")


if __name__ == "__main__":
    main()
