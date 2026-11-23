---
status: draft
---

# Contracts

- [ ] 1 Ask
- [ ] 2 Walk the Beats
- [ ] 3 Confirm the Seams
- [ ] 4 Stub
- [ ] 5 Close

## Seams

Kind: HTTP, Python function, Data/file, Event, New piece.

| Seam | Kind | Producer Lane | Consumer Lane(s) | Interface (path) | Stub | Beats |
|---|---|---|---|---|---|---|
| <seam> | <kind> | <lane> | <lane, lane> | <path> | <what the stub returns> | <Beat 00:00> |

## No Seam

- <Beat 00:00>: <why it crosses no Lane>

## Contract paths

- <path>

## Change protocol

- Additive change, by the producer Lane: run `make openapi api-client`, then add a line to the Change log.
- Breaking change: stop and ask the Driver.
- Other Lanes: comment on the issue, or open an issue labelled `blocked` + `lane:<producer>`.

## Change log

<!-- One line per change: date, Seam, what changed, by whom. -->
