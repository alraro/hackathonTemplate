---
module: mobile
lane: mobile
requires: []
profile: null
keep_when:
  - a Gate or Rubric asks for an app
  - a Beat needs a device capability a PWA does badly
  - the idea is mobile-first
features:
  - id: auth
    gives: sign-in screens and session storage
    entry: mobile/src/screens/auth
    keep_when: the app has user accounts
  - id: crud
    gives: list, detail and edit screens for an entity
    entry: mobile/src/screens/crud
    keep_when: the idea manages records
  - id: settings
    gives: settings tab
    entry: mobile/src/screens/settings
    keep_when: the app has user preferences
  - id: showcase
    gives: demo tab of UI components
    entry: mobile/src/screens/showcase
    keep_when: a demo of the design system helps the pitch
  - id: upload
    gives: image and file picker with upload (mobile part)
    entry: mobile/src/components/common/ImagePick.tsx
    keep_when: users add photos or files
  - id: realtime
    gives: live updates on screen (mobile part)
    entry: mobile/src/lib/realtime
    keep_when: the idea shows live data
  - id: notifications
    gives: push and in-app notifications (mobile part)
    entry: mobile/src/components/common/NotificationBell.tsx
    keep_when: the app alerts users
  - id: map
    gives: map tab (mobile part)
    entry: mobile/src/screens/map
    keep_when: the idea is location-based
  - id: qr
    gives: QR scanning (mobile part)
    entry: mobile/src/components/common/QrScanner.tsx
    keep_when: the flow scans or shows QR codes
---

# Mobile Module

Expo Go app (Expo Router, TanStack Query, openapi-fetch). Read this before touching `mobile/`; Terms are in `GLOSSARY.md`. SDK is pinned: bumping it is a maintainer step in `docs/maintaining/`.

## Commands

Run `make help` for the full list. Mobile uses:

| Command | Run when |
| --- | --- |
| `make mobile` | testing on a phone on the same wifi; prints the QR for Expo Go |
| `make mobile-tunnel` | the phone is on another network |
| `make api-client` | after `make openapi`: rewrites `src/lib/api/schema.d.ts` and each screen's `fixtures.json` |
| `make theme` | after editing `theme.json`: rewrites `mobile/theme.ts` |
| `make check` | before every commit; runs `tsc` and `expo-doctor` (warnings only) |

Network: on event wifi or an `unknown` network, start with `make mobile-tunnel` (client isolation blocks LAN). The Demo runs in fixtures mode or over a team hotspot.

Data mode: fixtures is the default (`EXPO_PUBLIC_API_MODE` unset): `api` answers from `src/screens/<x>/fixtures.json`, no backend needed. Set `EXPO_PUBLIC_API_MODE=live` to reach the API at `EXPO_PUBLIC_API_URL`, which `make mobile` fills with the host LAN IP. Done when the screen shows rows from the intended mode.

## Layout

- `app/`: Expo Router routes. Each file is one line re-exporting a screen.
- `src/screens/<x>/`: screens, `api.ts` (queries and mutations), `fixtures.json`. Present: `auth`, `crud`, `home`, `map`, `settings`, `showcase`.
- `src/app/tabs.ts`: the single registry of bottom tabs. A Feature switched off in `features.json` loses its tab and its route redirects home.
- `src/components/ui/`: theme primitives (`Screen`, `Text`, `Button`, `Card`, `Input`, `ListItem`, `useTheme`). `src/components/common/`: `QueryState`, `EmptyState`, `MapView`, `ImagePick`, `QrScanner`, `NotificationBell`.
- `src/lib/api/`: typed `api` client and `fixturesFetch`. `src/lib/realtime/useChannel.ts`: live topic subscription (a fake message every ~20 s in fixtures mode). `src/lib/session.tsx`: session (token persisted in SecureStore).

`crud` is the reference screen: `src/screens/crud/api.ts` is the data layer to copy.

## Add a screen

1. Create `src/screens/<x>/screens/<X>Screen.tsx` on the `ui` primitives. Done when it renders in Expo Go.
2. Create the thin route `app/(tabs)/<x>.tsx`: `export { default } from "../../src/screens/<x>/screens/<X>Screen";`. Done when the route resolves.
3. Add the entry to `ALL_TABS` in `src/app/tabs.ts`, with its Feature id in `features.json` (or `null` = always on). This is the only edit to that file; hand it to the Router intake if the Lane does not own it. Done when the tab shows.
4. Write `src/screens/<x>/api.ts` after `crud/api.ts` and call `registerFixtures("/api/<x>", require("./fixtures.json"))` when `API_MODE === "fixtures"`. Run `make api-client` once the backend route exists. Done when the screen works in both modes.
5. Wrap every query render in `QueryState`. Done when loading, error with retry, and empty each show.

## Recipes

### Installable APK

Only for a Gate that demands an installable app. Run `eas build -p android --profile preview` (free tier; profile in `mobile/eas.json`). iOS builds are out (paid account). Done when the APK URL installs on a phone.

### Voice on mobile

`expo-audio` is not installed yet: `npx expo install expo-audio` in `mobile/`. Record, then `POST /api/llm/transcribe` (multipart `file`, optional `language`) through `api` after `make api-client`. Done when spoken text comes back in the screen.

### Showing on stage

Android: `scrcpy` over cable. iOS: QuickTime over cable (New Movie Recording, pick the phone). Keep the phone in hand as the fallback. Done when the projector shows the live app.

## Known gaps

- `src/screens/home/` is a placeholder (a `TODO(#92)` card). Replace it when the idea needs a home screen.
- `NotificationBell` is mounted only in the map header; mount it in other headers yourself.
