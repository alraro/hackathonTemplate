# Scenario: hackathon-kickoff

## Starting state

- A fresh repo created from the template (not `alraro/hackathonTemplate` itself), `gh` authenticated, no `hackathon/` folder.
- The current time is Saturday 10:30 CET.
- The Driver runs `/hackathon`.

## User answers

1. Event language: "English". Driver chat language: "Spanish".
2. Roster: "Ana, @ana-dev, Spanish, Claude Max, works in repo, 20h, backend and data, Linux, RTX 3060 12GB, 32GB RAM, Android. Ben, @ben-codes, English, Copilot free, agent does not work in repo, 12h, frontend, macOS, no GPU, 8GB RAM, iOS. Cy, @cy-x, English, ChatGPT Plus, works in repo, unknown hours, design and pitch, Windows, GPU unknown, 16GB RAM, no phone."
3. "Ana is the Driver" and "no corrections".
4. Logistics: "Starts Saturday 10:00 CET, submissions close Sunday 18:00 CET. Demo Sunday 18:30, 5 minutes, live. Submit a GitHub link and a video. Judges are three sponsor engineers. No checkpoints. Prize track: best use of the sponsor API. We get 50 USD OpenAI credits, key in `OPENAI_API_KEY`. No datasets, no mentors. Event wifi, devices can't see each other."
5. "ok" (save).
6. "No, we don't have the Brief yet."

## Checks

- [ ] The first line is `Phase 1/13 · Kickoff`.
- [ ] `make setup` ran before any question; `git branch --show-current` prints `hackathon/setup`; `.env` has a non-empty `SECRET_KEY`; `docs/maintaining/` is gone.
- [ ] `hackathon/00-kickoff.md` exists with frontmatter `status: done` and every checklist item ticked.
- [ ] Both languages were asked, not inferred; `## Languages` holds English and Spanish.
- [ ] `## Team roster` has three rows; Ana is Tier `strong` and Role `driver`, Ben `weak`, Cy `mid`; Cy's Hours is `unknown` and GPU is `unknown`; exactly one `driver` row.
- [ ] `make invite users=ben-codes,cy-x` ran and the invitations link was printed; Ana was not invited.
- [ ] `## Event logistics` has `Submission deadline: Sunday 18:00 CET`, `Hours left` between 31 and 32, `Demo length: 5 minutes`, `Demo mode: live`, `Event start` filled, `Devices see each other: no`; no field is blank; `Datasets` and `Mentors` are `n/a` or `unknown`.
- [ ] `API keys` records `OPENAI_API_KEY` and its provider, and no key value appears in the artifact.
- [ ] The line telling teammates to clone and run `make doctor && make up` was printed before the Brief question.
- [ ] The final output is the exact Handoff line: `✅ Kickoff saved to hackathon/00-kickoff.md. When you have the Brief, run /hackathon.`
- [ ] One commit per step exists (`git log --oneline`).
