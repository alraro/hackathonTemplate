#!/usr/bin/env python3
"""Readiness check: one line per check, exit 1 on any failure. Host-side, stdlib only."""
import os
import re
import secrets
import shutil
import socket
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
failed = False


def report(ok, label, fix="", warn=False):
    global failed
    if ok:
        print(f"✅ {label}")
    elif warn:
        print(f"⚠️  {label} — {fix}")
    else:
        failed = True
        print(f"❌ {label} — {fix}")


def run(cmd):
    try:
        return subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    except (OSError, subprocess.TimeoutExpired):
        return None


def read_env():
    env = {}
    for line in (ROOT / ".env").read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip()
    return env


def check_docker():
    r = run(["docker", "info"]) if shutil.which("docker") else None
    report(bool(r and r.returncode == 0), "docker daemon is running",
           "install/start Docker Desktop (or `sudo systemctl start docker`)")


def check_location():
    report(not str(ROOT).startswith("/mnt/"), "repo is not under /mnt/ (WSL)",
           "move the clone into the WSL filesystem (~/projects); bind mounts under /mnt are slow")


def check_tools():
    for tool in ("make", "git", "gh"):
        report(shutil.which(tool) is not None, f"{tool} is installed", f"install {tool}")
    if (ROOT / "mobile").exists() or (ROOT / "pitch").exists():
        node = shutil.which("node")
        major = 0
        if node:
            r = run([node, "--version"])
            m = re.match(r"v(\d+)", r.stdout if r else "")
            major = int(m.group(1)) if m else 0
        report(major >= 22, "node >= 22 is installed", "install Node 22+ (https://nodejs.org)")


def check_env():
    env_file, example = ROOT / ".env", ROOT / ".env.example"
    if not env_file.exists():
        if not example.exists():
            report(False, ".env exists", "restore .env.example from git")
            return
        env_file.write_text(example.read_text(encoding="utf-8"), encoding="utf-8")
        print("✅ .env created from .env.example")
    else:
        report(True, ".env exists")
    text = env_file.read_text(encoding="utf-8")
    if re.search(r"^SECRET_KEY=\s*$", text, re.M):
        env_file.write_text(
            re.sub(r"^SECRET_KEY=\s*$", f"SECRET_KEY={secrets.token_hex(32)}", text, count=1, flags=re.M),
            encoding="utf-8")
        print("✅ SECRET_KEY generated")


def port_free(port):
    with socket.socket() as s:
        return s.connect_ex(("127.0.0.1", port)) != 0


def check_ports():
    if not (ROOT / ".env").exists():
        return
    env = read_env()
    for name, default in (("WEB_PORT", "5173"), ("API_PORT", "8000"), ("DB_PORT", "5433")):
        port = int(env.get(name) or default)
        report(port_free(port), f"port {port} ({name}) is free",
               f"stop whatever uses it, or change {name} in .env")


def check_ram():
    try:
        if sys.platform == "darwin":
            total = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"]))
        else:
            total = os.sysconf("SC_PAGE_SIZE") * os.sysconf("SC_PHYS_PAGES")
    except (OSError, ValueError, subprocess.SubprocessError):
        return
    gb = total / 2**30
    report(gb >= 7.5, f"RAM {gb:.0f} GB (>= 8 GB)", "close other apps; the stack may be slow", warn=True)


def main():
    check_docker()
    check_location()
    check_tools()
    check_env()
    check_ports()
    check_ram()
    sys.exit(1 if failed else 0)


main()
