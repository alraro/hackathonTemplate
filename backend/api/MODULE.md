---
module: api
lane: api
requires: []
profile: api
keep_when:
  - the product needs persistence, accounts or server-side logic
  - a Gate or Rubric asks for a real backend
features:
  - id: auth
    gives: users, JWT login, demo users
    entry: backend/api/resources/auth
    keep_when: the product has accounts or roles
  - id: crud
    gives: example resource and items CRUD template
    entry: backend/api/resources/items
    keep_when: the product stores user-visible records
  - id: upload
    gives: local file uploads with static URLs
    entry: backend/api/resources/files
    keep_when: users add files or images
  - id: realtime
    gives: WebSocket pub/sub, presence, notify()
    entry: backend/api/resources/ws
    keep_when: a Beat needs live updates
---
