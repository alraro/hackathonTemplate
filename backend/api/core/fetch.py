"""HTTP JSON fetch with a disk cache that survives flaky venue wifi.

Set HTTP_OFFLINE=1 to serve cached responses only (a miss raises OfflineCacheMiss).
"""

import hashlib
import json
import os
import time
import urllib.parse
import urllib.request
from pathlib import Path

CACHE_DIR = Path(__file__).resolve().parents[2] / ".cache" / "http"
USER_AGENT = "hackathon-app/1.0"


class OfflineCacheMiss(RuntimeError):
    pass


def _offline() -> bool:
    return os.environ.get("HTTP_OFFLINE", "").lower() in ("1", "true", "yes")


def _full_url(url: str, params: dict | None) -> str:
    if not params:
        return url
    sep = "&" if urllib.parse.urlparse(url).query else "?"
    return url + sep + urllib.parse.urlencode(sorted(params.items()))


def fetch_json(
    url: str,
    *,
    params: dict | None = None,
    ttl: int = 3600,
    headers: dict | None = None,
) -> dict | list:
    """GET `url` and return parsed JSON, cached on disk for `ttl` seconds.

    Offline mode (HTTP_OFFLINE=1) serves any cached entry regardless of age
    and raises OfflineCacheMiss when there is none. If the network fails while
    online, a stale cached entry is served instead of failing.
    """
    full = _full_url(url, params)
    path = CACHE_DIR / (hashlib.sha256(full.encode()).hexdigest() + ".json")

    if _offline():
        if path.exists():
            return json.loads(path.read_text())
        raise OfflineCacheMiss(f"HTTP_OFFLINE=1 and no cached response for {full}")

    if path.exists() and time.time() - path.stat().st_mtime < ttl:
        return json.loads(path.read_text())

    req = urllib.request.Request(full, headers={"User-Agent": USER_AGENT, **(headers or {})})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode()
        data = json.loads(body)
    except OSError:
        if path.exists():
            return json.loads(path.read_text())
        raise
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(body)
    return data
