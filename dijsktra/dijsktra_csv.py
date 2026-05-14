import csv
import heapq
import os
from typing import Dict, List, Tuple, Optional


def load_nodes(csv_path: str) -> Dict[str, Dict]:
    nodes: Dict[str, Dict] = {}
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            nid = row['node_id'].strip()
            name = row.get('node_name', '').strip()
            lat = row.get('latitude', '').strip()
            lon = row.get('longitude', '').strip()
            try:
                latf = float(lat) if lat != '' else None
            except ValueError:
                latf = None
            try:
                lonf = float(lon) if lon != '' else None
            except ValueError:
                lonf = None
            nodes[nid] = {'name': name, 'lat': latf, 'lon': lonf}
    return nodes


def load_edges(csv_path: str) -> Dict[str, List[Tuple[str, float, str]]]:
    adj: Dict[str, List[Tuple[str, float, str]]] = {}
    with open(csv_path, newline='') as f:
        reader = csv.DictReader(f, delimiter=';')
        for row in reader:
            dist_id = row.get('dist_id', '').strip()
            lower = row.get('lower_node', '').strip()
            upper = row.get('upper_node', '').strip()
            dist_raw = row.get('distance', '').strip()
            if lower == '' or upper == '' or dist_raw == '':
                continue
            try:
                d = float(dist_raw)
            except ValueError:
                continue
            if d < 0:
                raise ValueError('Negative distance not allowed')
            adj.setdefault(lower, []).append((upper, d, dist_id))
            adj.setdefault(upper, []).append((lower, d, dist_id))
    return adj


def dijkstra(start: str, goal: str, adj: Dict[str, List[Tuple[str, float, str]]]) -> Tuple[Optional[List[str]], Optional[List[float]], float]:
    if start == goal:
        return [start], [], 0.0

    dist: Dict[str, float] = {start: 0.0}
    prev: Dict[str, str] = {}
    heap: List[Tuple[float, str]] = [(0.0, start)]

    visited = set()

    while heap:
        d_u, u = heapq.heappop(heap)
        if u in visited:
            continue
        visited.add(u)
        if u == goal:
            break
        for v, w, _ in adj.get(u, []):
            alt = d_u + w
            if alt < dist.get(v, float('inf')):
                dist[v] = alt
                prev[v] = u
                heapq.heappush(heap, (alt, v))

    if goal not in dist:
        return None, None, float('inf')

    # reconstruct path
    path: List[str] = []
    cur = goal
    while True:
        path.append(cur)
        if cur == start:
            break
        cur = prev[cur]
    path.reverse()

    # compute per-edge distances
    per_edge: List[float] = []
    for i in range(len(path) - 1):
        u = path[i]
        v = path[i + 1]
        # find edge weight
        candidates = [w for nbr, w, _ in adj.get(u, []) if nbr == v]
        weight = min(candidates) if candidates else 0.0
        per_edge.append(weight)

    total = sum(per_edge)
    return path, per_edge, total


def shortest_path_from_csvs(nodes_csv: str, edges_csv: str, start: str, goal: str):
    nodes = load_nodes(nodes_csv)
    edges = load_edges(edges_csv)
    return nodes, dijkstra(start, goal, edges)


if __name__ == '__main__':
    # simple smoke test when run directly
    base = os.path.dirname(__file__)
    nodes_csv = os.path.join(base, 'dummy_data_geo.csv')
    edges_csv = os.path.join(base, 'dummy_data_dist.csv')
    nodes, result = shortest_path_from_csvs(nodes_csv, edges_csv, '1', '10')
    path, per_edge, total = result
    print('Path:', path)
    print('Per-edge:', per_edge)
    print('Total:', total)
