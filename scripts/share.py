#!/usr/bin/env python3
"""One-command public URL: built web + /api behind a Cloudflare quick tunnel (or ngrok).

Usage: make share [via=ngrok]   (ngrok needs NGROK_AUTHTOKEN in .env)
Exposes only `edge` (built web, /api proxied to the backend). Ctrl+C closes the tunnel.
Quick tunnels do not support SSE: the template streams only over WebSocket.
Host-side, stdlib only. Tunnel containers come from the official cloudflared/ngrok images.
"""
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
URL_RE = {
    "cloudflared": re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com"),
    "ngrok": re.compile(r"url=(https://\S+)"),
}
PUBLIC_SERVICES = ["cloudflared", "ngrok", "edge", "preview"]  # never stop the backend: the stack stays up


def read_env():
    env = {}
    path = ROOT / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def vision():
    try:
        return str(json.loads((ROOT / "features.json").read_text()).get("vision", False)).lower()
    except (OSError, ValueError):
        return "false"


def print_qr(url):
    qr = None
    if shutil.which("qrencode"):
        qr = subprocess.run(["qrencode", "-t", "ANSIUTF8", url], capture_output=True, text=True)
    if not qr or qr.returncode:
        qr = subprocess.run(["docker", "run", "--rm", "alpine", "sh", "-c",
                             f"apk add -q --no-cache libqrencode-tools >/dev/null && qrencode -t ANSIUTF8 '{url}'"],
                            capture_output=True, text=True)
    print(qr.stdout if qr.returncode == 0 else "(QR code unavailable: install qrencode)")


def main(argv):
    sys.stdout.reconfigure(line_buffering=True)
    via = os.environ.get("via") or "cloudflare"
    for a in argv:
        if a.startswith("via="):
            via = a.split("=", 1)[1]
    if via not in ("cloudflare", "cloudflared", "ngrok"):
        print(f"via must be cloudflare or ngrok, got {via!r}", file=sys.stderr)
        return 2
    via = "ngrok" if via == "ngrok" else "cloudflared"
    env = {**read_env(), **os.environ}
    if via == "ngrok" and not env.get("NGROK_AUTHTOKEN"):
        print("via=ngrok needs NGROK_AUTHTOKEN in .env (https://dashboard.ngrok.com/get-started/your-authtoken)", file=sys.stderr)
        return 1
    profiles = "api," + ("share-ngrok" if via == "ngrok" else "share")
    cenv = {**os.environ, "COMPOSE_PROFILES": profiles, "VITE_API_MODE": "live", "VISION": vision(),
            "NGROK_AUTHTOKEN": env.get("NGROK_AUTHTOKEN", "")}
    dc = ["docker", "compose"]
    # The dev server and the preview both want WEB_PORT: stop the dev one first.
    subprocess.run(dc + ["stop", "web"], cwd=ROOT, env={**cenv, "COMPOSE_PROFILES": "web"}, capture_output=True)
    print("share: building the web and starting the stack, the first run takes a minute...", flush=True)
    r = subprocess.run(dc + ["up", "-d", "--wait", "--force-recreate", "backend", "preview", "edge"], cwd=ROOT, env=cenv)
    if r.returncode:
        print("share: docker compose failed, run `make doctor`", file=sys.stderr)
        return r.returncode
    proc = None
    try:
        proc = subprocess.Popen(dc + ["up", "--no-log-prefix", via], cwd=ROOT, env=cenv,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
        for line in proc.stdout:
            m = URL_RE[via].search(line)
            if m:
                url = m.group(1) if m.groups() else m.group(0)
                print(f"\nPublic URL: {url}\nAPI health: {url}/api/health\n")
                print_qr(url)
                print("Warning: anyone with this URL spends your LLM quota. Ctrl+C closes the tunnel; the URL changes each run.")
                break
        else:
            print(f"share: the tunnel exited without printing a URL, see `make logs svc={via}`", file=sys.stderr)
            return 1
        proc.wait()
    except KeyboardInterrupt:
        pass
    finally:
        if proc and proc.poll() is None:
            proc.terminate()
        print("\nshare: closing the tunnel...", flush=True)
        subprocess.run(dc + ["stop"] + PUBLIC_SERVICES, cwd=ROOT, env=cenv, capture_output=True)
        subprocess.run(dc + ["rm", "-f"] + PUBLIC_SERVICES, cwd=ROOT, env=cenv, capture_output=True)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
