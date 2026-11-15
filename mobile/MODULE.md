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
    entry: mobile/src/features/auth
    keep_when: the app has user accounts
  - id: crud
    gives: list, detail and edit screens for an entity
    entry: mobile/src/app/(tabs)/crud
    keep_when: the idea manages records
  - id: settings
    gives: settings tab
    entry: mobile/src/app/(tabs)/settings
    keep_when: the app has user preferences
  - id: showcase
    gives: demo tab of UI components
    entry: mobile/src/app/(tabs)/showcase
    keep_when: a demo of the design system helps the pitch
  - id: upload
    gives: image and file picker with upload (mobile part)
    entry: mobile/src/features/upload
    keep_when: users add photos or files
  - id: realtime
    gives: live updates on screen (mobile part)
    entry: mobile/src/features/realtime
    keep_when: the idea shows live data
  - id: notifications
    gives: push and in-app notifications (mobile part)
    entry: mobile/src/features/notifications
    keep_when: the app alerts users
  - id: map
    gives: map tab (mobile part)
    entry: mobile/src/app/(tabs)/map
    keep_when: the idea is location-based
  - id: qr
    gives: QR scanning (mobile part)
    entry: mobile/src/features/qr
    keep_when: the flow scans or shows QR codes
---
