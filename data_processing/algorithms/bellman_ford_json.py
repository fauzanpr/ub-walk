import json
import os
from typing import Dict, List, Optional, Tuple


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


def bellman_ford(
    start: str,
    goal: str,
    adj: Dict[str, List[Tuple[str, float, str]]],
) -> Tuple[Optional[List[str]], Optional[List[float]], float]:
    if start == goal:
        return [start], [], 0.0

    nodes = set(adj.keys())
    nodes.add(start)
    nodes.add(goal)

    dist: Dict[str, float] = {node: float('inf') for node in nodes}
    prev: Dict[str, str] = {}
    dist[start] = 0.0

    edges: List[Tuple[str, str, float]] = []
    for u, neighbors in adj.items():
        for v, w, _ in neighbors:
            edges.append((u, v, w))

    for _ in range(max(len(nodes) - 1, 0)):
        updated = False
        for u, v, w in edges:
            if dist.get(u, float('inf')) == float('inf'):
                continue
            alt = dist[u] + w
            if alt < dist.get(v, float('inf')):
                dist[v] = alt
                prev[v] = u
                updated = True
        if not updated:
            break

    if dist.get(goal, float('inf')) == float('inf'):
        return None, None, float('inf')

    path: List[str] = []
    cur = goal
    while True:
        path.append(cur)
        if cur == start:
            break
        cur = prev[cur]
    path.reverse()

    per_edge: List[float] = []
    for i in range(len(path) - 1):
        u = path[i]
        v = path[i + 1]
        candidates = [w for nbr, w, _ in adj.get(u, []) if nbr == v]
        weight = min(candidates) if candidates else 0.0
        per_edge.append(weight)

    total = sum(per_edge)
    return path, per_edge, total


def shortest_path_from_jsons(nodes_json: str, edges_json: str, start: str, goal: str):
    nodes = load_nodes(nodes_json)
    edges = load_edges(edges_json)
    return nodes, bellman_ford(start, goal, edges)


if __name__ == '__main__':
    # dummy data lives in the parent `dummy_data` directory
    base = os.path.dirname(os.path.dirname(__file__))
    nodes_json = os.path.join(base, 'dummy_data', 'dummy_nodes.json')
    edges_json = os.path.join(base, 'dummy_data', 'dummy_edges.json')
    nodes, result = shortest_path_from_jsons(nodes_json, edges_json, '1', '10')
    path, per_edge, total = result
    print('Path:', path)
    print('Per-edge:', per_edge)
    print('Total:', total)