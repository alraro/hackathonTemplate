# Hackathon Template

Versión 0.1.0 · Plantilla para pasar de la idea a un demo en un hackathon, guiada paso a paso por tu agente de código con `/hackathon`.
Web, API, móvil y pitch ya conectados: el equipo elige qué conservar y el agente construye el resto.

![Presets estéticos en /showcase](docs/images/showcase.png) <!-- placeholder hasta #116 -->

## Antes del evento

Cada integrante, en su casa. Terminado cuando **`make doctor` sale en verde** y has hecho `make up` una vez (cachea las imágenes).

1. Instala tu agente (ver tabla de abajo) e inicia sesión. Listo cuando el agente responde a un "hola".
2. Clona el repo y pega en el agente: `Lee la sección «Antes del evento» del README y prepara mi equipo`. Listo cuando `make doctor` está verde.

El agente hace todo lo que pueda; a ti solo te pide lo interactivo (logins, `sudo`, instalar WSL/Docker y reiniciar). Todos: `gh auth login`. Node en el host solo para mobile/pitch.

- **Linux**: Docker Engine + plugin compose, tu usuario en el grupo `docker`, `make`, `git`, `gh`.
- **macOS**: Docker Desktop u OrbStack, Xcode CLT (`xcode-select --install`), `brew install gh`.
- **Windows (WSL primero)**: el código vive en WSL, en `~/`.
  <details><summary>Detalles de Windows</summary>

  - Docker Desktop con motor WSL2 e integración activada para tu distro.
  - `sudo apt install make git`.
  - `.wslconfig` con `networkingMode=mirrored` para que Expo sea alcanzable desde el móvil.
  - Comprueba con `pwd`: si empieza por `/mnt/`, estás en el sitio equivocado; clona de nuevo en `~/`.
  </details>

## Al empezar

| Driver (quien lleva las primeras fases) | Todos los demás |
|---|---|
| 1. *Use this template* en tu cuenta personal, privado, **sin** marcar "Include all branches". | 1. Reúne los datos del evento (reglas, jurado, plazos) para dictárselos al Driver. |
| 2. Clona (en `~/` si usas WSL). | 2. Acepta la invitación al repo y clona. |
| 3. Abre tu agente y ejecuta `/hackathon`. | 3. `make doctor && make up` (listo con ambos en verde). |

Nadie más ejecuta `/hackathon` hasta el Handoff de Task split (la frase final que lo indica). Si te cierras a medias, `/hackathon` retoma donde quedó lo registrado.

## Arranca con tu agente

| Agente | Cómo iniciar y ejecutar `/hackathon` |
|---|---|
| Claude Code | `claude` en la raíz del repo, luego `/hackathon` |
| Codex | `codex` en la raíz; pide `/hackathon` (o el fallback) |
| Cursor | Abre la carpeta, Agent chat: `/hackathon` |
| Copilot | Modo Agent en el chat: `/hackathon`; activa auto-approve de herramientas |
| Gemini CLI | `gemini` en la raíz, luego `/hackathon` |
| Windsurf | Cascade en modo Write: `/hackathon`; activa auto-execute |

Fallback para cualquiera: "lee AGENTS.md y ejecuta /hackathon". ChatGPT web sin acceso al repo: esa persona es `no-repo`.

## Dónde está cada cosa

- `make help`: todos los comandos y cuándo usarlos.
- `CATALOG.md`: Modules y Features disponibles y cuándo conservarlos.
- `MODULE.md` en cada Module (`backend/`, `web/`, `mobile/`, `pitch/`): qué hace y cómo se toca.
- `GLOSSARY.md`: el vocabulario (Phase, Handoff, Lane...); `AGENTS.md`: reglas para agentes.
