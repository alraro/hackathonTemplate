#!/usr/bin/env python3
"""Presenting mode: backend detached + built web via `vite build && vite preview` (no HMR overlay).

Usage: make demo [mode=live|fixtures]   (mode defaults to live; read from the environment or argv)
Host-side, stdlib only. Docker does all the work.
"""
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from _env import ROOT, read_env, vision  # noqa: E402


def main(argv):
    sys.stdout.reconfigure(line_buffering=True)
    mode = os.environ.get("mode") or "live"
    for a in argv:
        if a.startswith("mode="):
            mode = a.split("=", 1)[1]
    if mode not in ("live", "fixtures"):
        print(f"mode must be live or fixtures, got {mode!r}", file=sys.stderr)
        return 2
    env = {**read_env(), **os.environ}
    port = env.get("WEB_PORT", "5173")
    profiles = ["preview"] + ([] if mode == "fixtures" else ["api"])
    cenv = {**os.environ, "COMPOSE_PROFILES": ",".join(profiles), "VITE_API_MODE": mode, "VISION": vision()}
    # The dev server and the preview both want WEB_PORT: stop the dev one first.
    subprocess.run(["docker", "compose", "stop", "web"], cwd=ROOT, env={**cenv, "COMPOSE_PROFILES": "web"}, capture_output=True)
    print(f"demo: starting {', '.join(profiles)} (VITE_API_MODE={mode}), the first build takes a minute...", flush=True)
    # Recreate preview so it rebuilds with the requested VITE_API_MODE.
    services = ["preview", "edge"] + ([] if mode == "fixtures" else ["backend"])
    r = subprocess.run(["docker", "compose", "up", "-d", "--wait", "--force-recreate"] + services, cwd=ROOT, env=cenv)
    if r.returncode:
        print("demo: docker compose failed, run `make doctor` and `make logs svc=preview`", file=sys.stderr)
        return r.returncode
    print(f"\ndemo ({mode}): http://localhost:{port}")
    if mode == "live":
        print(f"api: http://localhost:{port}/api/health")
    print("stop with: make down (then `make up` brings the dev server back)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
