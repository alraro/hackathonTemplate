"""COMPOSE_PROFILES lines in .env, .env.example and the Makefile."""
from __future__ import annotations

import re

PROFILE_LINE = re.compile(r"^(COMPOSE_PROFILES\s*\??=\s*)(.*?)(\s*)$")


def rewrite_profiles(text: str, remove: list[str] = (), add: list[str] = (), order: list[str] = ()) -> str:
    out = []
    for line in text.split("\n"):
        m = PROFILE_LINE.match(line)
        if m:
            cur = [p for p in m.group(2).split(",") if p]
            cur = [p for p in cur if p not in remove]
            seen: list[str] = []
            for p in cur + list(add):
                if p not in seen:
                    seen.append(p)
            if order:
                seen = [p for p in order if p in seen] + [p for p in seen if p not in order]
            line = f"{m.group(1)}{','.join(seen)}{m.group(3)}"
        out.append(line)
    return "\n".join(out)


def profile_line_order(text: str | None) -> list[str]:
    for line in (text or "").split("\n"):
        if m := PROFILE_LINE.match(line):
            return [p for p in m.group(2).split(",") if p]
    return []
