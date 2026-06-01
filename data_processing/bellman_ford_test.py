import argparse
import os

import algorithms.bellman_ford_json as bellman_ford_json
import algorithms.dijkstra_json as dijkstra_json

from benchmark_runner import run_benchmark


def parse_args() -> argparse.Namespace:
    base_dir = os.path.dirname(__file__)
    parser = argparse.ArgumentParser(description='Run Bellman-Ford benchmark for FILKOM UB hotspots.')
    parser.add_argument('--nodes-json', default=os.path.join(base_dir, 'data', 'nodes.json'))
    parser.add_argument('--edges-json', default=os.path.join(base_dir, 'data', 'edges.json'))
    parser.add_argument('--report-dir', default=os.path.join(base_dir, 'reports'))
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_benchmark(
        algorithm_label='bellman_ford',
        solver=bellman_ford_json.bellman_ford,
        nodes_loader=bellman_ford_json.load_nodes,
        edges_loader=bellman_ford_json.load_edges,
        nodes_json=args.nodes_json,
        edges_json=args.edges_json,
        report_dir=args.report_dir,
        reference_solver=dijkstra_json.dijkstra,
        reference_label='dijkstra',
    )


if __name__ == '__main__':
    main()
