---
status: draft
---

# Prune

- [ ] 1 Propose
- [ ] 2 Confirm
- [ ] 3 Dry run
- [ ] 4 Prune
- [ ] 5 Close

## Modules

Reason cites a Beat `t` or an `R<n>`. `pitch` is always `keep`.

| Module | Decision | Reason |
|---|---|---|
| <module> | keep / prune | <Beat 00:00 or R<n>> |

## Features

| Feature | Module | State | Reason |
|---|---|---|---|
| <feature> | <module> | on / off | <Beat 00:00 or R<n>> |

## Pre-Prune SHA

<sha>

## Check result

`make check`: <green / what was fixed>

## Changes

- Keep <Module>: remove it from the prune list before the run.
- Turn on <Feature>: set it to `true` in `features.json`.
- Restore <Module>: `python3 scripts/prune.py --restore <module> --sha <pre-Prune SHA>`
