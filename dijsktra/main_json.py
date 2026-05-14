import json
import os
from typing import List

import dijsktra_json

def format_distance(v: float) -> str:
    if abs(v - int(v)) < 1e-9:
        return f"{int(v)} m"
    return f"{v:.2f} m"


def normalize_distance(v: float):
    if abs(v - int(v)) < 1e-9:
        return int(v)
    return v


def save_output_json(base_dir: str, path: List[str], per_edge: List[float]):
    output_path = os.path.join(base_dir, 'output.json')
    output_data = []
    for i in range(len(path) - 1):
        output_data.append(
            {
                'source_id': path[i],
                'destination_id': path[i + 1],
                'distance': normalize_distance(per_edge[i]),
            }
        )

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)


def main():
    base = os.path.dirname(__file__)
    nodes_json = os.path.join(base, 'dummy_data_geo.json')
    edges_json = os.path.join(base, 'dummy_data_dist.json')

    # load nodes first so we can resolve user-provided labels to node IDs
    nodes = dijsktra_json.load_nodes(nodes_json)

    start_raw = input('Enter source node id: ').strip()
    goal_raw = input('Enter destination node id: ').strip()

    def resolve_node(q: str):
        if q in nodes:
            return q
        ql = q.lower()
        for nid, info in nodes.items():
            name = (info.get('name') or '').lower()
            # Check exact match or if input matches a word in the name
            if name == ql:
                return nid
            words = name.split()
            if ql in words:
                return nid
        return None

    start = resolve_node(start_raw)
    goal = resolve_node(goal_raw)

    if start is None or goal is None:
        print(f'Unknown source or destination: {start_raw} -> {goal_raw}')
        return

    _, result = dijsktra_json.shortest_path_from_jsons(nodes_json, edges_json, start, goal)
    path, per_edge, total = result

    if path is None:
        print(f'No route found from {start} to {goal}')
        return

    print(f'find shortest djikstra: {start}->{goal}')
    for i in range(len(path) - 1):
        u = path[i]
        v = path[i + 1]
        dist = per_edge[i]
        print(f' {u}->{v}: {format_distance(dist)}')
    print(f' total distance: {format_distance(total)}')
    save_output_json(base, path, per_edge)


if __name__ == '__main__':
    main()
