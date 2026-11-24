#!/usr/bin/env python3
"""Start Expo for a phone (`make mobile`, `make mobile-tunnel` adds --tunnel).

Detects the host LAN IP, exports EXPO_PUBLIC_API_URL=http://<ip>:<API_PORT> and EXPO_PUBLIC_API_MODE
(= VITE_API_MODE from .env) inline (no mobile/.env),
warns if the API doesn't answer there, then runs `npx expo start` (prints the QR).
"""
from __future__ import annotations

import os
import re
import socket
import subprocess
import sys
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def env_value(name: str, default: str) -> str:
    if os.environ.get(name):
        return os.environ[name]
    env = ROOT / ".env"
    if env.exists():
        m = re.search(rf"^{name}=(\S+)", env.read_text(), re.M)
        if m:
            return m.group(1).strip("'\"")
    return default


def lan_ip() -> str | None:
    """IP of the interface used for outbound traffic (works on Linux, mac, WSL mirrored mode)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        ip = s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()
    return None if ip.startswith("127.") else ip


def answers(url: str) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=3):
            return True
    except Exception:
        return False


def main() -> int:
    tunnel = "--tunnel" in sys.argv[1:]
    port = env_value("API_PORT", "8000")
    ip = lan_ip()
    if ip is None:
        print("Could not detect a LAN IP; falling back to localhost (phone will not reach the API).", file=sys.stderr)
        ip = "localhost"
    api_url = f"http://{ip}:{port}"
    override = os.environ.get("EXPO_PUBLIC_API_URL")
    if tunnel and not override:
        print(
            f"warning: --tunnel does not tunnel the API; the phone will call {api_url}, which is not reachable from another network. "
            "In live mode set EXPO_PUBLIC_API_URL to a public API URL (e.g. `make share`); fixtures mode works as is.",
            file=sys.stderr,
        )
    if override:
        api_url = override
    if not answers(f"{api_url}/api/health"):
        hint = "" if tunnel else " If the phone is on another network or the IP is wrong, use `make mobile-tunnel`."
        print(f"warning: {api_url}/api/health does not answer (is `make up` running? firewall?).{hint}", file=sys.stderr)
    else:
        print(f"API reachable at {api_url}", flush=True)
    # Same data mode as the web (VITE_API_MODE in .env) unless EXPO_PUBLIC_API_MODE is set explicitly.
    mode = os.environ.get("EXPO_PUBLIC_API_MODE") or env_value("VITE_API_MODE", "fixtures")
    print(f"mobile data mode: {mode}", flush=True)
    env = {**os.environ, "EXPO_PUBLIC_API_URL": api_url, "EXPO_PUBLIC_API_MODE": mode}
    cmd = ["npx", "expo", "start", *(["--tunnel"] if tunnel else [])]
    if not (ROOT / "mobile" / "node_modules").is_dir():
        subprocess.run(["npm", "install", "--no-audit", "--no-fund"], cwd=ROOT / "mobile", check=True)
    return subprocess.call(cmd, cwd=ROOT / "mobile", env=env)


if __name__ == "__main__":
    sys.exit(main())
