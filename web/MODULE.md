---
module: web
lane: web
requires: []
keep_when: the product has a browser UI (works in fixtures mode without the api)
paths: [web/]
docker_compose_profile: web
pyproject_extra: null
npm_deps:
  web/package.json: [react, react-dom, react-router, "@tanstack/react-query", "@tanstack/react-table", openapi-fetch, openapi-typescript, msw, react-hook-form, zod, "@hookform/resolvers", recharts, sonner, lucide-react, motion, vite-plugin-pwa, culori, tailwindcss, "@tailwindcss/vite", radix-ui, cmdk, class-variance-authority, clsx, tailwind-merge, tw-animate-css, next-themes, maplibre-gl, qrcode.react, "@yudiel/react-qr-scanner", react-markdown, remark-gfm, write-excel-file]
env: [VITE_API_MODE, WEB_PORT, DEV_POLLING]
features:
  - id: landing
    gives: public landing page with hero, value props and call to action
    entry: web/src/screens/landing/
    keep_when: the product needs a public front door
  - id: auth
    gives: login, signup and protected routes
    entry: web/src/screens/auth/
    keep_when: users have accounts or roles
  - id: dashboard
    gives: KPI tiles and charts overview page
    entry: web/src/screens/dashboard/
    keep_when: the pitch shows metrics or an overview
  - id: crud
    gives: list, detail and form pages over a resource with table, filters and dialogs
    entry: web/src/screens/crud/
    keep_when: the product manages records
  - id: settings
    gives: profile, preferences and theme settings page
    entry: web/src/screens/settings/
    keep_when: users configure their account or preferences
  - id: showcase
    gives: component gallery of the design system
    entry: web/src/screens/showcase/
    keep_when: during design phase; drop before demo if unused
  - id: chat
    gives: chat UI with streaming messages (web part of the chat Feature)
    entry: web/src/screens/chat/
    keep_when: the product has a conversational assistant
  - id: upload
    gives: file upload with drag and drop, progress and previews
    entry: web/src/components/common/FileDrop.tsx
    keep_when: users submit files or images
  - id: realtime
    gives: live updates over websocket in the UI
    entry: web/src/lib/realtime/
    keep_when: the demo shows data changing live
  - id: notifications
    gives: toast and in-app notification center
    entry: web/src/components/common/NotificationBell.tsx
    keep_when: the product alerts users to events
  - id: map
    gives: interactive map with markers
    entry: web/src/screens/map/
    keep_when: data has a location
  - id: qr
    gives: QR code generation and scanning
    entry: web/src/components/common/QrCode.tsx
    keep_when: the demo hands off to a phone or scans codes
  - id: voice
    gives: voice input and spoken output controls
    entry: web/src/components/common/VoiceButton.tsx
    keep_when: the product is used hands-free or by speech
---

# Web Module

React 19 + Vite + Tailwind v4 + shadcn/ui + TanStack Query + `openapi-fetch`. You own `web/`; the Contract is `backend/openapi.json`, consumed through the generated client. Terms are in `GLOSSARY.md`; the building-block catalogue is in `CATALOG.md`.

## Commands

Run `make help` for the rest.

| Command | Run when |
| --- | --- |
| `make up only=web` | you start work; Vite serves on `WEB_PORT` |
| `make api-client` | after `make openapi`: rewrites `src/lib/api/schema.d.ts` and each `src/screens/<x>/fixtures.json` |
| `make theme` | after editing the root `design/theme.json`: rewrites `src/design/generated/` and `public/icon.svg` |
| `make design-lint` | after a theme or style change; warn-only (tokens, contrast, emoji) |
| `make add-web pkg=<name>` | you need an npm package; check `CATALOG.md` first |
| `make logs svc=web` | the page is blank or Vite errors |
| `make demo` | before presenting: seeded data |
| `make share` | a phone must open the app (ngrok) |
| `make check` | before every commit: `tsc`, contrast, `vite build` |

Data mode: `VITE_API_MODE=fixtures` (default) starts MSW in the browser and answers `/api/*` from `src/screens/<x>/fixtures.json`, so no backend is needed. `live` sends requests to the API. Done when the screen shows rows from the intended mode.

## Layout

- `src/app/routes.tsx`: `screenRoutes`, the one registry of pages. A Feature off in `features.json` drops its routes and nav entry.
- `src/screens/<x>/`: `pages/`, `api.ts` (queries), `fixtures.json`, optional `mocks.ts` (MSW handlers, auto-loaded by `src/mocks/handlers.ts`). `crud/api.ts` is the full data-layer reference; `_example/` is the copy-me skeleton.
- `src/components/ui/`: shadcn primitives. `common/`: building blocks. `effects/`: decorative motion.
- `src/lib/`: `api/client.ts` (typed `api`, token), `session.tsx`, `realtime/`, `speak.ts`.
- `src/design/generated/`: tokens generated from the root `design/` folder (`theme.json`, `presets/`, `identity.json`); import those as `@design/...`.

## Add a page

1. Copy `src/screens/_example/` to `src/screens/<x>/` and rename `pages/ExamplePage.tsx` to `pages/<X>Page.tsx`. Done when it renders the example rows.
2. Add one entry to `screenRoutes` in `src/app/routes.tsx`, with `nav` if it belongs in the menu. During a hackathon this file is ownerless: file a Router intake. Done when the route and nav entry show.
3. Write `src/screens/<x>/api.ts` after `crud/api.ts` and put rows in `fixtures.json` (or run `make api-client` once the backend route exists). Done when the page works in both modes.
4. Wrap every data view in `QueryState` with an `empty` call to action. Done when loading, error with retry, and empty each show.
5. Check the Never and Always lists in `hackathon/07-design.md`. Done when the page breaks none.

## Conventions

- Style with tokens only (`bg-primary`, `text-muted-foreground`); `make design-lint` flags the misses.
- Design mobile-first at 375px, then widen.
- Keep one `useEffect` per screen at most; fetch with query hooks.
- Extend `src/components/ui/` by adding variants, not by forking a primitive.
- Keep shared widgets in `components/common/`, screen-only parts in `screens/<x>/components/`.

## Building blocks

| Block | Use for | Needs |
| --- | --- | --- |
| `FileDrop` | upload with progress and preview | `POST /api/files`; fixtures via `mocks/files.ts` |
| `MapView` | markers on a map, `getLatLng` per item | network for the openfreemap tile style |
| `QrCode`, `QrScanner` | show or scan a code | camera permission to scan |
| `VoiceButton`, `speak()` | speech in, speech out | `/api/llm/transcribe`; fixtures via `mocks/voice.ts` |
| `ExportMenu` | CSV, XLSX, print-to-PDF of rows (`DataTable` `exportAll` exports every page) | nothing |
| `ReportView`, `ReportChart` | render a report model | a report payload |
| `useChannel(topic)` | live topic over `/api/ws`; invalidates queries `[topic]` | `realtime` Feature |
| `NotificationBell`, `PresenceBadge` | in-app alerts, who is online | `notifications` / `realtime` |
| `CameraCapture`, `CommandPalette`, `DataTable`, `KpiTile`, `EmptyState`, `PageHeader` | as named | nothing |

Chat streams over `/api/llm/chat/ws` (`screens/chat/useChat.ts`); `mocks/chat.ts` fakes it. Done when a block works in fixtures mode without the backend.

## Discarded, ready to add

Starting points, not Catalog pieces: nothing here is installed or tested. Each is done when the flow works in the UI.

| Idea | Use when | Recipe |
| --- | --- | --- |
| Language switcher | a Gate or Rubric asks for i18n | `make add-web pkg=react-i18next`; one JSON per language; switcher in the `AppLayout` header |
| Onboarding tour | first-run guidance is a Beat | stepped dialog over `EmptyState`; remember "seen" in `localStorage` |
| Zustand | a Beat needs state shared across screens | `make add-web pkg=zustand`; one store file under `src/lib/` |
| Calendar | the idea picks dates | `npx shadcn add calendar` in `web/` |

## Known gaps

- The `api-client` script in `web/package.json` is a stub; use `make api-client`.
- The `reports` Feature has blocks (`ReportView`, `ReportChart`) but no screen or frontmatter entry.
- `ReportChart` shows an empty state per card, but `QueryState` wraps only the whole report: the report is one payload, not one query per chart.
- `DataTable` export of all rows needs a loader (`exportAll`) per list; only `crud` has one (`fetchAllItems`).
