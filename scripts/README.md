# scripts

One line per script. Makefile targets already call the final command lines; a missing script is expected until the backlog issue that creates it merges (find it in the sub-issues of #30).

- `doctor.py` (`make doctor`): check Docker, ports, `.env`.
- `setup.py` (`make setup`): create `.env`, generate `SECRET_KEY`.
- `prune.py` (`make prune`): remove unused Modules via prune markers.
- `check.py` (`make check`): repo-wide checks.
- `sync.py` (`make sync`): regenerate catalog and derived files.
- `lint_docs.py` (`make lint-docs`): lint MODULE.md and docs.
- `share.py` (`make share`): expose the stack through ngrok.
- `demo.py` (`make demo`): demo mode.
- `mobile.py` (`make mobile`, `make mobile-tunnel`): Expo launcher.
- `invite.py` (`make invite`): invite helper.
- `theme.py` (`make theme`): generate design tokens for web, mobile, pitch.
