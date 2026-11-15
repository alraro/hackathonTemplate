---
module: web
lane: web
requires: []
keep_when: the product has a browser UI (works in fixtures mode without the api)
paths: [web/]
docker_compose_profile: web
pyproject_extra: null
npm_deps: [react, react-dom, react-router, "@tanstack/react-query", "@tanstack/react-table", openapi-fetch, openapi-typescript, msw, react-hook-form, zod, "@hookform/resolvers", recharts, sonner, lucide-react, motion, vite-plugin-pwa, culori, tailwindcss, radix-ui, cmdk]
env: [VITE_API_MODE, WEB_PORT, DEV_POLLING]
features:
  - id: landing
    gives: public landing page with hero, value props and call to action
    entry: web/src/features/landing/
    keep_when: the product needs a public front door
  - id: auth
    gives: login, signup and protected routes
    entry: web/src/features/auth/
    keep_when: users have accounts or roles
  - id: dashboard
    gives: KPI tiles and charts overview page
    entry: web/src/features/dashboard/
    keep_when: the pitch shows metrics or an overview
  - id: crud
    gives: list, detail and form pages over a resource with table, filters and dialogs
    entry: web/src/features/crud/
    keep_when: the product manages records
  - id: settings
    gives: profile, preferences and theme settings page
    entry: web/src/features/settings/
    keep_when: users configure their account or preferences
  - id: showcase
    gives: component gallery of the design system
    entry: web/src/features/showcase/
    keep_when: during design phase; drop before demo if unused
  - id: chat
    gives: chat UI with streaming messages (web part of the chat Feature)
    entry: web/src/features/chat/
    keep_when: the product has a conversational assistant
  - id: upload
    gives: file upload with drag and drop, progress and previews
    entry: web/src/features/upload/
    keep_when: users submit files or images
  - id: realtime
    gives: live updates over websocket in the UI
    entry: web/src/features/realtime/
    keep_when: the demo shows data changing live
  - id: notifications
    gives: toast and in-app notification center
    entry: web/src/features/notifications/
    keep_when: the product alerts users to events
  - id: map
    gives: interactive map with markers
    entry: web/src/features/map/
    keep_when: data has a location
  - id: qr
    gives: QR code generation and scanning
    entry: web/src/features/qr/
    keep_when: the demo hands off to a phone or scans codes
  - id: voice
    gives: voice input and spoken output controls
    entry: web/src/features/voice/
    keep_when: the product is used hands-free or by speech
---
