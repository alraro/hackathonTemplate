#!/bin/sh
# Run `npm ci` only when package-lock.json changed since the last install.
# node_modules is a named volume, so the hash is stored inside it.
set -e
cd /app
HASH_FILE=node_modules/.lockhash
CURRENT=$(sha256sum package-lock.json | cut -d' ' -f1)
if [ ! -f "$HASH_FILE" ] || [ "$(cat "$HASH_FILE")" != "$CURRENT" ]; then
  npm ci
  echo "$CURRENT" > "$HASH_FILE"
fi
exec "$@"
