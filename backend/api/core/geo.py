"""Geocoding helper for Screens that need coordinates (the `map` Feature)."""

import threading
import time

from api.core.fetch import fetch_json

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "hackathon-app/1.0 (geocoding)"

_lock = threading.Lock()
_last_call = 0.0


def geocode(query: str) -> dict | None:
    """Return {lat, lng, display_name} for `query`, or None if nothing matches.

    WARNING: uses the public Nominatim service. Its usage policy allows at most
    1 request/second (enforced here), requires an identifying User-Agent, and
    forbids bulk geocoding. Results are cached on disk via fetch_json, so
    repeated queries cost nothing; pre-geocode static data instead of looping.
    """
    global _last_call
    params = {"q": query, "format": "json", "limit": 1}
    with _lock:
        wait = 1.0 - (time.monotonic() - _last_call)
        if wait > 0:
            time.sleep(wait)
        _last_call = time.monotonic()
        results = fetch_json(
            NOMINATIM_URL, params=params, ttl=30 * 24 * 3600, headers={"User-Agent": USER_AGENT}
        )
    if not results:
        return None
    top = results[0]
    return {"lat": float(top["lat"]), "lng": float(top["lon"]), "display_name": top["display_name"]}
