import os
from typing import List

import dijsktra_csv

def format_distance(v: float) -> str:
    if abs(v - int(v)) < 1e-9:
        return f"{int(v)} m"
    return f"{v:.2f} m"


def main():
    base = os.path.dirname(__file__)
    nodes_csv = os.path.join(base, 'dummy_data_geo.csv')
    edges_csv = os.path.join(base, 'dummy_data_dist.csv')

    # load nodes first so we can resolve user-provided labels to node IDs
    nodes = dijsktra_csv.load_nodes(nodes_csv)

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

    _, result = dijsktra_csv.shortest_path_from_csvs(nodes_csv, edges_csv, start, goal)
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


if __name__ == '__main__':
    main()
