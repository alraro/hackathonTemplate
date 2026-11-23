---
module: pitch
lane: pitch
requires: []
profile: null
keep_when: always
features: []
---
# pitch

The demo deck, written in markdown with [Slidev](https://sli.dev) and styled by `pitch/theme.css`. Runs on the host, not in Docker: Node >= 22.22 (`node -v`).

## Commands

| Command | Does | Run when |
| --- | --- | --- |
| `make slides` | serve the deck at http://localhost:3030 | editing slides |
| `make slides-pdf` | export `pitch/slides-export.pdf` | before submitting |
| `make theme` | regenerate `pitch/theme.css` from `web/src/design/theme.json` | after editing `theme.json` |

First run: `cd pitch && npm install`. PDF export needs Chromium: `cd pitch && npx playwright-chromium install chromium`. PPTX when a native file is required: `cd pitch && npx slidev export --format pptx` (images only; for an editable `.pptx` use the Anthropic `pptx` skill).

## Edit the slides

1. Open `pitch/slides.md`. Slides are separated by `---`; the comment under each slide names the `hackathon/05-pitch.md` section it comes from.
2. Replace each `[placeholder]` with the Pitch content. Done when `grep -E '\[[A-Z]' pitch/slides.md` finds no placeholder.
3. Slidev syntax (layouts, clicks, code, diagrams): `.agents/skills/slidev/SKILL.md`.

## Extend

- Never edit `pitch/theme.css`: it is generated. Change the look in `theme.json`, then `make theme`. `pitch/style.css` imports it and maps the tokens onto Slidev.
- Fonts: `fonts.provider: none` keeps the deck offline. Self-host files in `pitch/public/fonts/` and declare them with `@font-face` in `pitch/style.css`.
- Videos: add `poster="/poster.png"` (file in `pitch/public/`) so the PDF shows a frame.
- The live demo is the running SPA; keep the demo slide as a pointer, not a recording.
