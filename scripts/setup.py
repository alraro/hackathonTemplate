#!/usr/bin/env python3
"""Repo setup and teammate invitations.

  python scripts/setup.py [--force] [--dry-run]                  make setup
  python scripts/setup.py invite [users] [--force] [--dry-run]   make invite users=a,b

Idempotent: re-running changes nothing. Refuses to run on the template
repository itself (maintenance mode) unless --force.
"""
from __future__ import annotations

import argparse
import json
import os
import re
import secrets
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE_SLUG = "alraro/hackathonTemplate"
BRANCH = "hackathon/setup"
LABELS_FILE = ROOT / ".github" / "labels.json"
MAINTAINING = ROOT / "docs" / "maintaining"
EVALS = ROOT / "evals"

DRY = False


def run(cmd: list[str]) -> None:
    print("+ " + " ".join(cmd))
    if not DRY:
        subprocess.run(cmd, cwd=ROOT, check=True, text=True)


def out(cmd: list[str]) -> str:
    return subprocess.run(cmd, cwd=ROOT, check=True, text=True, capture_output=True).stdout.strip()


def die(msg: str) -> None:
    print(f"error: {msg}", file=sys.stderr)
    sys.exit(1)


def repo_slug() -> str:
    """owner/repo parsed from the origin remote."""
    try:
        url = out(["git", "remote", "get-url", "origin"])
    except subprocess.CalledProcessError:
        die("no 'origin' remote; push this repo to GitHub first")
    m = re.search(r"github\.com[:/]([^/]+)/(.+?)(?:\.git)?/?$", url)
    if not m:
        die(f"origin is not a GitHub remote: {url}")
    return f"{m.group(1)}/{m.group(2)}"


def guard(slug: str, force: bool) -> None:
    if slug.lower() == TEMPLATE_SLUG.lower() and not force:
        die(f"remote is {TEMPLATE_SLUG} (maintenance mode); refusing. Pass --force to override.")


def check_gh() -> None:
    if not shutil.which("gh"):
        die("gh CLI not found; install it from https://cli.github.com")
    if not DRY and subprocess.run(["gh", "auth", "status"], capture_output=True).returncode != 0:
        die("gh is not authenticated; run `gh auth login`")


def setup_branch() -> None:
    if out(["git", "branch", "--show-current"]) == BRANCH:
        return
    exists = subprocess.run(
        ["git", "rev-parse", "--verify", "--quiet", f"refs/heads/{BRANCH}"], cwd=ROOT, capture_output=True
    ).returncode == 0
    run(["git", "switch", BRANCH] if exists else ["git", "switch", "-c", BRANCH])


def setup_env() -> None:
    env, example = ROOT / ".env", ROOT / ".env.example"
    if not env.exists():
        print("create .env from .env.example")
        if DRY:
            return
        shutil.copyfile(example, env)
    text = env.read_text()
    if re.search(r"^SECRET_KEY=\s*$", text, re.M):
        print("generate SECRET_KEY")
        if not DRY:
            env.write_text(re.sub(r"^SECRET_KEY=\s*$", f"SECRET_KEY={secrets.token_hex(32)}", text, flags=re.M))


def setup_labels() -> None:
    for label in json.loads(LABELS_FILE.read_text()):
        run(["gh", "label", "create", label["name"], "--color", label["color"],
             "--description", label["description"], "--force"])


def setup_repo_settings() -> None:
    run(["gh", "repo", "edit", "--enable-squash-merge", "--enable-merge-commit=false",
         "--enable-rebase-merge=false", "--delete-branch-on-merge"])


def remove_maintaining() -> None:
    """Delete maintainer-only paths (docs/maintaining/, evals/) in the first commit of the setup branch."""
    paths = [p for p in (MAINTAINING, EVALS) if p.exists()]
    if not paths:
        return
    run(["git", "rm", "-rq", *(str(p.relative_to(ROOT)) for p in paths)])
    for p in paths:
        if not DRY and p.exists():
            shutil.rmtree(p)
    run(["git", "commit", "-q", "-m", "chore: remove maintainer docs"])


def cmd_setup(force: bool) -> None:
    slug = repo_slug()
    guard(slug, force)
    check_gh()
    setup_branch()
    remove_maintaining()
    setup_env()
    setup_labels()
    setup_repo_settings()
    print("setup done")


def cmd_invite(users_arg: str, force: bool) -> None:
    users = [u.strip().lstrip("@") for u in users_arg.split(",") if u.strip()]
    if not users:
        die("no users; run `make invite users=alice,bob`")
    slug = repo_slug()
    guard(slug, force)
    check_gh()
    for user in users:
        run(["gh", "api", "-X", "PUT", f"repos/{slug}/collaborators/{user}", "-f", "permission=push", "--silent"])
    print(f"\nPaste in the team chat:\ngithub.com/{slug}/invitations")


def main() -> None:
    global DRY
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("command", nargs="?", choices=["setup", "invite"], default="setup")
    p.add_argument("users", nargs="?", default=None, help="comma-separated GitHub users (invite)")
    p.add_argument("--force", action="store_true", help="run on the template repo itself")
    p.add_argument("--dry-run", action="store_true", help="print mutating commands, run none")
    a = p.parse_args()
    DRY = a.dry_run
    if a.command == "invite":
        cmd_invite(a.users or os.environ.get("users", ""), a.force)
    else:
        cmd_setup(a.force)


if __name__ == "__main__":
    main()
