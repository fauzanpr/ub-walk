import json
import heapq
import os
from typing import Dict, List, Tuple, Optional


def load_nodes(json_path: str) -> Dict[str, Dict]:
    nodes: Dict[str, Dict] = {}
    with open(json_path, 'r') as f:
        data = json.load(f)
        for row in data:
            nid = row['node_id'].strip()
            name = row.get('node_name', '').strip()
            lat = row.get('latitude')
            lon = row.get('longitude')
            nodes[nid] = {'name': name, 'lat': lat, 'lon': lon}
    return nodes


def load_edges(json_path: str) -> Dict[str, List[Tuple[str, float, str]]]:
    adj: Dict[str, List[Tuple[str, float, str]]] = {}
    with open(json_path, 'r') as f:
        data = json.load(f)
        for row in data:
            dist_id = row.get('dist_id', '').strip()
            lower = row.get('lower_node', '').strip()
            upper = row.get('upper_node', '').strip()
            dist_raw = row.get('distance')
            if lower == '' or upper == '' or dist_raw is None:
                continue
            try:
                d = float(dist_raw)
            except (ValueError, TypeError):
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


def shortest_path_from_jsons(nodes_json: str, edges_json: str, start: str, goal: str):
    nodes = load_nodes(nodes_json)
    edges = load_edges(edges_json)
    return nodes, dijkstra(start, goal, edges)


if __name__ == '__main__':
    # simple smoke test when run directly
    base = os.path.dirname(__file__)
    nodes_json = os.path.join(base, 'dummy_data_geo.json')
    edges_json = os.path.join(base, 'dummy_data_dist.json')
    nodes, result = shortest_path_from_jsons(nodes_json, edges_json, '1', '10')
    path, per_edge, total = result
    print('Path:', path)
    print('Per-edge:', per_edge)
    print('Total:', total)
