# Hackathon template

A GitHub template repo that a team of 4–6 people turns into a polished, demo-ready prototype during a hackathon, guided by agent skills from Brief to Demo.

## Event and team

**Brief**:
The challenge statement the organisers publish, kept verbatim together with its Rubric.
_Avoid_: Challenge, prompt, spec

**Rubric**:
The judging criteria and their weights, as stated in the Brief or heard from the organisers.
_Avoid_: Scoring, criteria list

**Requirement**:
Something the result must satisfy, sourced from the Brief, heard aloud (organisers, judges, mentors) or inferred by the agent; identified by a stable `R<n>`.
_Avoid_: Spec item, user story

**Gate**:
A Requirement whose failure disqualifies the team, as opposed to one that only earns Rubric points.
_Avoid_: Disqualifier, hard requirement

**Open axis**:
A dimension the Brief leaves free (domain, target user, platform, product type, data…) that Brainstorm varies and Pick & Pitch fixes.
_Avoid_: Degree of freedom, option

**Team roster**:
The people on the team: GitHub user, chat language, agent and plan tier, hours available, strengths, role, and their devices.
_Avoid_: Team list, members

**Event logistics**:
Facts about the event, not the people: deadlines, demo format and length, submission format, judges, venue network, and the resources the event provides (credits, APIs, hardware, data, mentors).
_Avoid_: Event info, constraints

**Driver**:
The one teammate who runs the early Phases (Kickoff through Task split) on their machine while the team watches; just another teammate afterwards.
_Avoid_: Lead, captain, admin

**Presenter**:
The teammate who presents the demo; owns the `pitch` Lane and the Demo Phase.
_Avoid_: Speaker, pitcher

**Integrator**:
The teammate who claims Integrate & Polish at the Polish checkpoint: audits the live product and dispatches polish issues. Chosen by availability, never assumed to be the Driver.
_Avoid_: Merger, release manager

## Flow

**Phase**:
One step of the hackathon flow (Kickoff, Brief, Requirements, Research, Brainstorm, Pick & Pitch, Prune, Design, Contracts, Task split, Build, Integrate & Polish, Demo), each run by its own skill and recorded in an artifact.
_Avoid_: Stage, step

**Router**:
The single entry skill, `/hackathon`, that reads the recorded state and runs the next Phase or handles a free-form change.
_Avoid_: Orchestrator, main skill

**Handoff**:
The fixed closing line of a Phase that tells the user whether to continue in this session or open a fresh one and run `/hackathon`.
_Avoid_: Next steps, wrap-up

**Change**:
A free-form message, at any point of the event, that alters something already recorded (the event, a Requirement, the team, the idea, a Module or Feature, an issue, the design, a Contract), handled by the Router rather than by running the next Phase.
_Avoid_: Change request, update, edit

**Patch**:
A Change that adjusts earlier decisions and the later artifacts that cite them in place, without redoing any Phase.
_Avoid_: Hotfix, amendment

**Pivot**:
A Change that redoes a Phase's decision from scratch: that Phase reopens and every later artifact is marked stale and redone in order.
_Avoid_: Restart, rollback

**Research question**:
One concrete investigation (lens × topic) assigned to a teammate as an issue during Research.
_Avoid_: Research task, topic

**Wow moment**:
The single moment of the demo meant to impress the judges most.
_Avoid_: Hook, highlight

**Beat**:
One timed row of the Demo script: what is on screen, what is said, which Requirement it proves, and whether it is Real or Faked.
_Avoid_: Step, scene

**Polish checkpoint**:
The moment Integrate & Polish opens: all Spine pass issues closed or 25% of build time left, whichever comes first.
_Avoid_: Integration time, feature complete

**Demo checkpoint**:
The moment the Demo Phase opens and the code freeze begins: 10% of build time left, at least 45 minutes before the submission deadline.
_Avoid_: Final hour, demo time

**Code freeze**:
The period after the Demo checkpoint when only fixes for failures seen in rehearsal are merged.
_Avoid_: Lockdown, feature freeze

## Template structure

**Module**:
A top-level, prunable part of the template (web, mobile, api, llm, data, pitch) with its own `MODULE.md`.
_Avoid_: Package, component, app

**Feature**:
An optional ready-made capability inside a Module, switched on or off and never pruned.
_Avoid_: Plugin, add-on, flag

**Catalog**:
The generated list of everything the template already provides, read before Brainstorm and Prune so nothing is reinvented.
_Avoid_: Inventory, feature list

**Prune**:
Deleting whole Modules the chosen idea doesn't need.
_Avoid_: Cleanup, strip

**Aesthetic preset**:
One of several very different ready-made visual directions the team picks and then tunes.
_Avoid_: Theme, skin, template

## Parallel build

**Lane**:
A folder-based stream of work (web, mobile, api, llm, data, pitch) that a teammate builds without touching other Lanes.
_Avoid_: Track, workstream, team

**Seam**:
A point where one Lane consumes what another Lane produces.
_Avoid_: Integration point, boundary, dependency

**Contract**:
The frozen interface at a Seam, together with a stub that returns believable data so the consumer never waits.
_Avoid_: API spec, interface, mock

**Files owned**:
The list of paths an issue may edit; no two open issues share a file.
_Avoid_: Scope, ownership

**Weight**:
An issue's size from 1 to 3, judged from observable traits, never hours.
_Avoid_: Points, estimate, size

**Tier**:
The model capability an agent has or an issue needs: `strong`, `mid` or `weak`, named after Claude reference models and matched to their equivalents from other vendors; an issue may also be `any`.
_Avoid_: Level, model class, plan

**Spine pass**:
The first round of issues, which gets every Beat showing something believable on screen as early as possible, Wow moment first.
_Avoid_: MVP, skeleton pass

**Depth pass**:
The second round of issues, which makes each Beat real and polished.
_Avoid_: Polish pass, v2
