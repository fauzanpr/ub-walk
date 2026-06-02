pencarian-fe — UB Walk frontend
================================

This folder contains the frontend application for UB Walk: a Next.js + React TypeScript app that renders maps and lets users request shortest-path computations.

Prerequisites
-------------
- Node.js 18+ (or compatible LTS)
- pnpm (recommended) or npm/yarn
- Python 3.8+ available in PATH if you want the frontend API route to spawn the local Python scripts in `../data_processing`.

Install and run (development)
-----------------------------
From the `fe-web/pencarian-fe` directory:

```bash
pnpm install
pnpm dev
```

Build and run (production)
--------------------------

```bash
pnpm build
pnpm start
```

Environment
-----------
- `NEXT_PUBLIC_APP_URL` — base API URL used inside the app (see `src/configs/AppConfig.ts`). When running locally with Next.js API routes, this can be left empty.

Frontend API route
------------------
The app exposes a server-side API at `POST /api/route` which accepts:

```json
{ "source_id": "<node id>", "destination_id": "<node id>", "algorithm": "dijkstra" | "bf" }
```

The API route spawns the Python wrapper scripts in `../data_processing` (using `python3`) and returns the computed route by reading `output.json`.

Architecture (ASCII)
-------------------
Browser UI (React) -> Next.js API /api/route -> spawn Python (data_processing/main_*_forweb.py) -> data_processing/output.json -> API response

Important notes
---------------
- When running locally, start the frontend from `fe-web/pencarian-fe` so the API route can find `../data_processing` by relative path.
- Ensure `python3` is available in your PATH and that `data_processing` contains the `nodes.json` and `edges.json` files.

Project structure highlights
--------------------------
- `src/app/` — Next.js app routes and pages.
- `src/app/api/route/route.ts` — API route that executes the Python scripts.
- `src/features/maps/` — hooks and services for shortest-path requests.
- `src/components/` — UI components used across pages.

See the project root README for a short quick start: [README.md](../../README.md)

