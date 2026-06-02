# UB Walk — Shortest Path Study Case

Authors: Edy Rahman, Fauzan Pradana, Muhammad Zakki Islami

Overview
--------
UB Walk is a study project that implements shortest-path algorithms (Dijkstra and Bellman-Ford) over a campus map and exposes tools for benchmarking and a Next.js frontend for interactive route lookup.

This repository contains two main parts:
- `data_processing`: Python algorithm engine, CLI, and benchmarking tools.
- `fe-web/pencarian-fe`: Next.js frontend (maps UI) that calls a local API route which runs the Python processors.

Quick start
-----------
1. Backend (algorithms & benchmarks)

```bash
cd data_processing
python dijkstra_test.py
python bellman_ford_test.py
```

2. Frontend (development)

```bash
cd fe-web/pencarian-fe
pnpm install
pnpm dev
```

3. Integration

- The frontend API route (`/api/route`) spawns the Python script in `../data_processing` to compute routes and reads `output.json`. Run the frontend from `fe-web/pencarian-fe` so the relative path to `data_processing` is valid.

Project docs
------------
- Backend (algorithms & benchmarks): [data_processing/README.md](data_processing/README.md)
- Frontend (Next.js): [fe-web/pencarian-fe/README.md](fe-web/pencarian-fe/README.md)

Architecture (simple)
----------------------
Client (browser) -> Next.js frontend UI -> POST /api/route -> Python scripts (data_processing) -> output.json / reports -> API response

Notes
-----
- This README is a project index. See the module READMEs for details about run commands, configuration, and architecture.