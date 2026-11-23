# scripts

One line per script. Makefile targets already call the final command lines.

- `doctor.py` (`make doctor`): check Docker, ports, `.env`.
- `setup.py` (`make setup`): create `.env`, generate `SECRET_KEY`.
- `prune.py` (`make prune`): remove unused Modules via prune markers.
- `check.py` (`make check`): repo-wide checks.
- `sync.py` (`make sync`): regenerate catalog and derived files.
- `lint_docs.py` (`make lint-docs`): lint MODULE.md and docs.
- `share.py` (`make share`): expose the stack through a Cloudflare quick tunnel (`via=ngrok` for ngrok).
- `demo.py` (`make demo`): demo mode.
- `mobile.py` (`make mobile`, `make mobile-tunnel`): Expo launcher.
- `setup.py invite` (`make invite users=a,b`): invite helper.
- `api_client.py` (`make api-client`): generate `schema.d.ts` and `fixtures.json` from the Contract.
- `make theme`: no script; runs `web/scripts/gen-theme.mjs` in the web container (design tokens for web, mobile, pitch).
