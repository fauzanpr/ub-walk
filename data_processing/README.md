# data_processing — UB Walk

Overview
--------
This module contains the shortest-path algorithm implementations (Dijkstra and Bellman-Ford), CLI entrypoints, benchmark runners, and data conversion helpers used by the UB Walk project.

Contents
--------
- `algorithms/` — algorithm implementations (`dijkstra_json.py`, `bellman_ford_json.py`).
- `data/` — input data files (`nodes.json`, `edges.json`, KML/CSV samples).
- `reports/` — benchmark output (JSON & CSV).
- `scripts/` — conversion utilities (KML ↔ JSON, CSV ↔ KML).
- `*_forweb.py` — small wrappers used by the frontend API route to run an algorithm and write `output.json`.

Prerequisites
-------------
- Python 3.8+ (the code uses only standard library modules).
- No external Python packages are required by default.

Quick start
-----------
Run the benchmarking suites (this runs a set of canonical hotspot pairs and writes reports):

```bash
cd data_processing
python dijkstra_test.py
python bellman_ford_test.py
```

Interactive usage
-----------------
Run a simple interactive CLI to compute a single route using Dijkstra:

```bash
cd data_processing
python main_dijkstra_json.py
# follow prompts: enter source node id (or name) and destination
```

Web wrapper (used by frontend API)
---------------------------------
The frontend API route expects to run the `*_forweb.py` wrappers which accept two positional arguments: `source_id` and `destination_id` and write `output.json` in the `data_processing` directory. Example:

```bash
python main_dijkstra_json_forweb.py <source_id> <destination_id>
```

Outputs
-------
- `output.json` — list of per-edge segments for the computed route (used by the frontend API).
- `reports/*.json` and `reports/*.csv` — benchmark bundles with runtime, path, and comparison metadata.

Architecture (ASCII)
-------------------
nodes.json, edges.json
    ↓
algorithms/dijkstra_json.py  algorithms/bellman_ford_json.py
    ↓
main_*.py / main_*_forweb.py  (CLI / wrappers)
    ↓
output.json  (single-route)   reports/ (benchmarks)

Data model (brief)
------------------
- Nodes: `{ node_id: {"name": ..., "lat": ..., "lon": ...} }`.
- Edges: list/dict of `{ "dist_id": ..., "upper_node": ..., "lower_node": ..., "distance": ... }`.

Troubleshooting
---------------
- If `python` points to Python 2 on your system, use `python3`.
- Ensure you run the frontend from `fe-web/pencarian-fe` if you want the API to find `../data_processing` by relative path.

Further notes
-------------
If you plan to modify or extend datasets, update `data/nodes.json` and `data/edges.json` and validate with the scripts in `scripts/`.
