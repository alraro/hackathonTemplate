"""Simulate live traffic: `make simulate scenario=<x>` reads scenarios/<x>.yaml.

Scenario keys: `resource`, `rate` (rows/second), `fields` (overrides), `duration`
(seconds, optional). Each tick inserts a fake row and publishes it on realtime
topic `<resource>` through the running API (`POST /api/ws/publish`), because the
WebSocket hub lives in the server process. Ctrl+C stops.
"""
import argparse
import json
import os
import time
import urllib.request
from pathlib import Path

import yaml
from sqlmodel import Session

from backend.api.core.db import create_db_and_tables, engine
from backend.api.core.seed import import_models
from backend.api.fake import make_faker, make_row, resolve

SCENARIOS = Path(__file__).resolve().parent / "scenarios"
API = os.getenv("SIMULATE_API", "http://localhost:8000")


def _headers() -> dict[str, str]:
    headers = {"Content-Type": "application/json"}
    from backend.api.core.app import FEATURES  # lazy: imports every router

    if FEATURES.get("auth"):  # the publish endpoint needs a user; mint a token for user 1
        from backend.api.resources.auth.security import create_token

        headers["Authorization"] = f"Bearer {create_token(1)}"
    return headers


def _publish(topic: str, data: dict, headers: dict[str, str]) -> None:
    body = json.dumps({"topic": topic, "data": data}).encode()
    req = urllib.request.Request(f"{API}/api/ws/publish", body, headers, method="POST")
    urllib.request.urlopen(req, timeout=5).read()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scenario", required=True)
    args = parser.parse_args()
    path = SCENARIOS / f"{args.scenario}.yaml"
    if not path.is_file():
        raise SystemExit(f"simulate: no scenario {path}")
    sc = yaml.safe_load(path.read_text(encoding="utf-8")) or {}
    resource = sc["resource"]
    rate = float(sc.get("rate", 1))
    duration = sc.get("duration")
    import_models()
    create_db_and_tables()
    model, read = resolve(resource)
    f = make_faker()
    headers = _headers()
    start, sent = time.monotonic(), 0
    print(f"simulating {resource} at {rate}/s" + (f" for {duration}s" if duration else "") + " (Ctrl+C stops)")
    try:
        while duration is None or time.monotonic() - start < float(duration):
            row = make_row(read, f, dict(sc.get("fields") or {}))
            with Session(engine) as session:
                obj = model.model_validate(read.model_validate(row).model_dump())
                session.add(obj)
                session.commit()
                session.refresh(obj)
                out = {"id": getattr(obj, "id", None), **row}
            _publish(resource, out, headers)
            sent += 1
            print(f"#{sent} {resource} {out['id']}")
            time.sleep(1 / rate)
    except KeyboardInterrupt:
        pass
    print(f"stopped after {sent} rows")


if __name__ == "__main__":
    main()
