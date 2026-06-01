import csv
import math
import json
import os
import statistics
import time
from typing import Any, Callable, Dict, List, Optional, Sequence, Tuple


CANONICAL_HOTSPOT_NAMES = (
    'Gedung A FILKOM UB',
    'Gedung F FILKOM UB',
    'Gedung G FILKOM UB',
    'Junction FILKOM UB',
    'GKM FILKOM UB',
)

Adjacency = Dict[str, List[Tuple[str, float, str]]]
Nodes = Dict[str, Dict[str, Any]]
Solver = Callable[[str, str, Adjacency], Tuple[Optional[List[str]], Optional[List[float]], float]]


def format_distance(value: float) -> str:
    if abs(value - int(value)) < 1e-9:
        return f'{int(value)} m'
    return f'{value:.2f} m'


def normalize_number(value: Optional[float]):
    if value is None:
        return None
    if not math.isfinite(value):
        return None
    if abs(value - int(value)) < 1e-9:
        return int(value)
    return round(value, 6)


def resolve_canonical_hotspots(nodes: Nodes) -> List[Tuple[str, str]]:
    name_to_id: Dict[str, str] = {}
    for node_id, info in nodes.items():
        node_name = (info.get('name') or '').strip()
        if node_name:
            name_to_id[node_name.lower()] = node_id

    resolved: List[Tuple[str, str]] = []
    missing: List[str] = []
    for canonical_name in CANONICAL_HOTSPOT_NAMES:
        node_id = name_to_id.get(canonical_name.lower())
        if node_id is None:
            missing.append(canonical_name)
            continue
        resolved.append((node_id, canonical_name))

    if missing:
        raise ValueError('Missing canonical hotspot nodes: ' + ', '.join(missing))

    return resolved

def load_hotspot_sources(nodes_json: str) -> List[Tuple[str, str]]:
    with open(nodes_json, 'r', encoding='utf-8') as handle:
        data = json.load(handle)

    sources: List[Tuple[str, str]] = []
    for row in data:
        if str(row.get('node_type', '')).strip().lower() != 'hotspot':
            continue
        node_id = str(row.get('node_id', '')).strip()
        node_name = str(row.get('node_name', '')).strip()
        if node_id and node_name:
            sources.append((node_id, node_name))

    return sources


def remap_edges_to_node_ids(edges: Adjacency, nodes: Nodes) -> Adjacency:
    name_to_id: Dict[str, str] = {}
    for node_id, info in nodes.items():
        node_name = (info.get('name') or '').strip()
        if node_name:
            name_to_id[node_name.lower()] = node_id

    remapped: Adjacency = {}
    for source_name, neighbors in edges.items():
        source_id = name_to_id.get(source_name.lower(), source_name)
        remapped.setdefault(source_id, [])
        for destination_name, weight, dist_id in neighbors:
            destination_id = name_to_id.get(destination_name.lower(), destination_name)
            remapped[source_id].append((destination_id, weight, dist_id))

    return remapped


def build_path_names(path: Sequence[str], nodes: Nodes) -> List[str]:
    return [((nodes.get(node_id, {}) or {}).get('name') or node_id) for node_id in path]


def build_segments(path: Sequence[str], per_edge: Sequence[float], nodes: Nodes) -> List[Dict[str, Any]]:
    segments: List[Dict[str, Any]] = []
    for index in range(len(path) - 1):
        source_id = path[index]
        destination_id = path[index + 1]
        segments.append(
            {
                'from_id': source_id,
                'from_name': ((nodes.get(source_id, {}) or {}).get('name') or source_id),
                'to_id': destination_id,
                'to_name': ((nodes.get(destination_id, {}) or {}).get('name') or destination_id),
                'distance_m': normalize_number(per_edge[index]),
            }
        )
    return segments


def _run_solver(solver: Solver, source_id: str, destination_id: str, edges: Adjacency) -> Dict[str, Any]:
    started_at = time.perf_counter()
    error_message: Optional[str] = None
    path: Optional[List[str]] = None
    per_edge: Optional[List[float]] = None
    total_distance: Optional[float] = None

    try:
        path, per_edge, total_distance = solver(source_id, destination_id, edges)
    except Exception as exc:  # noqa: BLE001
        error_message = f'{type(exc).__name__}: {exc}'

    runtime_ms = (time.perf_counter() - started_at) * 1000.0
    status = 'ok'
    if error_message is not None:
        status = 'error'
    elif path is None:
        status = 'unreachable'

    return {
        'status': status,
        'runtime_ms': round(runtime_ms, 6),
        'path': path,
        'per_edge': per_edge,
        'total_distance_m': normalize_number(total_distance),
        'error': error_message,
    }


def _compare_results(primary: Dict[str, Any], reference: Dict[str, Any], tolerance: float = 1e-6) -> Dict[str, Any]:
    if primary['status'] != 'ok' or reference['status'] != 'ok':
        return {
            'status': 'incomplete',
            'distance_match': False,
            'path_match': False,
            'distance_delta_m': None,
        }

    primary_total = primary.get('total_distance_m')
    reference_total = reference.get('total_distance_m')
    distance_delta = None
    distance_match = False
    if primary_total is not None and reference_total is not None:
        distance_delta = round(float(primary_total) - float(reference_total), 6)
        distance_match = abs(distance_delta) <= tolerance

    path_match = primary.get('path') == reference.get('path')
    if distance_match and path_match:
        status = 'match'
    elif distance_match:
        status = 'tie-path-diff'
    else:
        status = 'mismatch'

    return {
        'status': status,
        'distance_match': distance_match,
        'path_match': path_match,
        'distance_delta_m': distance_delta,
    }


def _format_route_line(path: Optional[Sequence[str]], nodes: Nodes) -> str:
    if not path:
        return '(no path)'
    return ' -> '.join(f"{node_id} ({((nodes.get(node_id, {}) or {}).get('name') or node_id)})" for node_id in path)


def _format_segment_line(segments: Sequence[Dict[str, Any]]) -> str:
    if not segments:
        return '(no segments)'
    return ' | '.join(
        f"{segment['from_id']}->{segment['to_id']}: {format_distance(float(segment['distance_m']))}"
        for segment in segments
    )


def _print_pair_record(record: Dict[str, Any], nodes: Nodes, reference_label: Optional[str]) -> None:
    print(
        f"[{record['algorithm']}] {record['source_id']} ({record['source_name']}) -> "
        f"{record['destination_id']} ({record['destination_name']})"
    )

    if record['status'] == 'ok':
        print(f"  route : {_format_route_line(record.get('path'), nodes)}")
        print(f"  edges : {_format_segment_line(record.get('segments') or [])}")
        print(
            f"  total : {format_distance(float(record['total_distance_m']))} | "
            f"hops: {record['hops']} | time: {record['runtime_ms']} ms"
        )
    else:
        print(f"  status: {record['status']}")
        if record.get('error'):
            print(f"  error : {record['error']}")

    reference = record.get('reference')
    if reference is not None:
        if reference['status'] == 'ok':
            print(f"  ref[{reference_label}] route : {_format_route_line(reference.get('path'), nodes)}")
            print(
                f"  ref[{reference_label}] total : {format_distance(float(reference['total_distance_m']))} | "
                f"time: {reference['runtime_ms']} ms"
            )
        else:
            print(f"  ref[{reference_label}] status: {reference['status']}")
            if reference.get('error'):
                print(f"  ref[{reference_label}] error : {reference['error']}")

        comparison = reference.get('comparison') or {}
        print(
            '  compare: '
            f"{comparison.get('status')} | distance_match={comparison.get('distance_match')} | "
            f"path_match={comparison.get('path_match')}"
        )


def _build_pair_record(
    algorithm_label: str,
    nodes: Nodes,
    source_id: str,
    destination_id: str,
    primary: Dict[str, Any],
    reference: Optional[Dict[str, Any]],
    reference_label: Optional[str],
) -> Dict[str, Any]:
    source_name = ((nodes.get(source_id, {}) or {}).get('name') or source_id)
    destination_name = ((nodes.get(destination_id, {}) or {}).get('name') or destination_id)

    path = primary.get('path')
    per_edge = primary.get('per_edge') or []
    segments: List[Dict[str, Any]] = []
    path_names: Optional[List[str]] = None
    hops = 0
    if path:
        path_names = build_path_names(path, nodes)
        segments = build_segments(path, per_edge, nodes)
        hops = max(len(path) - 1, 0)

    record: Dict[str, Any] = {
        'algorithm': algorithm_label,
        'source_id': source_id,
        'source_name': source_name,
        'destination_id': destination_id,
        'destination_name': destination_name,
        'status': primary['status'],
        'runtime_ms': primary['runtime_ms'],
        'hops': hops,
        'path': path,
        'path_names': path_names,
        'segments': segments,
        'total_distance_m': primary.get('total_distance_m'),
        'error': primary.get('error'),
    }

    if reference is not None:
        comparison = _compare_results(primary, reference)
        reference_record = {
            'algorithm': reference_label,
            'status': reference['status'],
            'runtime_ms': reference['runtime_ms'],
            'path': reference.get('path'),
            'path_names': build_path_names(reference['path'], nodes) if reference.get('path') else None,
            'segments': build_segments(reference['path'], reference.get('per_edge') or [], nodes)
            if reference.get('path')
            else [],
            'total_distance_m': reference.get('total_distance_m'),
            'error': reference.get('error'),
            'comparison': comparison,
        }
        record['reference'] = reference_record

    return record


def _build_summary(records: Sequence[Dict[str, Any]]) -> Dict[str, Any]:
    runtimes = [float(record['runtime_ms']) for record in records]
    successful_records = [record for record in records if record['status'] == 'ok']
    distances = [float(record['total_distance_m']) for record in successful_records if record.get('total_distance_m') is not None]
    hops = [int(record['hops']) for record in successful_records]

    comparison_match_count = 0
    comparison_tie_path_diff_count = 0
    comparison_mismatch_count = 0
    for record in records:
        reference = record.get('reference')
        if not reference:
            continue
        comparison = reference.get('comparison') or {}
        if comparison.get('status') == 'match':
            comparison_match_count += 1
        elif comparison.get('status') == 'tie-path-diff':
            comparison_tie_path_diff_count += 1
        elif comparison.get('status') == 'mismatch':
            comparison_mismatch_count += 1

    return {
        'pair_count': len(records),
        'success_count': len(successful_records),
        'failure_count': len(records) - len(successful_records),
        'total_runtime_ms': round(sum(runtimes), 6) if runtimes else 0.0,
        'average_runtime_ms': round(statistics.mean(runtimes), 6) if runtimes else None,
        'median_runtime_ms': round(statistics.median(runtimes), 6) if runtimes else None,
        'min_runtime_ms': round(min(runtimes), 6) if runtimes else None,
        'max_runtime_ms': round(max(runtimes), 6) if runtimes else None,
        'total_hops': sum(hops),
        'average_hops': round(statistics.mean(hops), 6) if hops else None,
        'average_distance_m': round(statistics.mean(distances), 6) if distances else None,
        'min_distance_m': round(min(distances), 6) if distances else None,
        'max_distance_m': round(max(distances), 6) if distances else None,
        'comparison_match_count': comparison_match_count,
        'comparison_tie_path_diff_count': comparison_tie_path_diff_count,
        'comparison_mismatch_count': comparison_mismatch_count,
    }


def _write_json_report(report_path: str, report: Dict[str, Any]) -> None:
    with open(report_path, 'w', encoding='utf-8') as handle:
        json.dump(report, handle, indent=2, ensure_ascii=False)


def _write_csv_report(report_path: str, records: Sequence[Dict[str, Any]]) -> None:
    fieldnames = [
        'algorithm',
        'source_id',
        'source_name',
        'destination_id',
        'destination_name',
        'status',
        'runtime_ms',
        'hops',
        'total_distance_m',
        'path',
        'path_names',
        'segments',
        'reference_status',
        'reference_runtime_ms',
        'reference_total_distance_m',
        'reference_path',
        'reference_path_names',
        'reference_comparison_status',
        'reference_distance_match',
        'reference_path_match',
        'reference_distance_delta_m',
        'error',
    ]

    with open(report_path, 'w', newline='', encoding='utf-8') as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for record in records:
            reference = record.get('reference') or {}
            comparison = reference.get('comparison') or {}
            writer.writerow(
                {
                    'algorithm': record.get('algorithm'),
                    'source_id': record.get('source_id'),
                    'source_name': record.get('source_name'),
                    'destination_id': record.get('destination_id'),
                    'destination_name': record.get('destination_name'),
                    'status': record.get('status'),
                    'runtime_ms': record.get('runtime_ms'),
                    'hops': record.get('hops'),
                    'total_distance_m': record.get('total_distance_m'),
                    'path': ' -> '.join(record.get('path') or []),
                    'path_names': ' -> '.join(record.get('path_names') or []),
                    'segments': ' | '.join(
                        f"{segment['from_id']}->{segment['to_id']}:{segment['distance_m']}"
                        for segment in record.get('segments') or []
                    ),
                    'reference_status': reference.get('status'),
                    'reference_runtime_ms': reference.get('runtime_ms'),
                    'reference_total_distance_m': reference.get('total_distance_m'),
                    'reference_path': ' -> '.join(reference.get('path') or []),
                    'reference_path_names': ' -> '.join(reference.get('path_names') or []),
                    'reference_comparison_status': comparison.get('status'),
                    'reference_distance_match': comparison.get('distance_match'),
                    'reference_path_match': comparison.get('path_match'),
                    'reference_distance_delta_m': comparison.get('distance_delta_m'),
                    'error': record.get('error'),
                }
            )


def run_benchmark(
    algorithm_label: str,
    solver: Solver,
    nodes_loader: Callable[[str], Nodes],
    edges_loader: Callable[[str], Adjacency],
    nodes_json: str,
    edges_json: str,
    report_dir: str,
    reference_solver: Optional[Solver] = None,
    reference_label: Optional[str] = None,
) -> Dict[str, Any]:
    nodes = nodes_loader(nodes_json)
    edges = remap_edges_to_node_ids(edges_loader(edges_json), nodes)
    source_hotspots = load_hotspot_sources(nodes_json)
    destination_hotspots = resolve_canonical_hotspots(nodes)
    pair_results: List[Dict[str, Any]] = []

    os.makedirs(report_dir, exist_ok=True)

    print(f'=== {algorithm_label} benchmark ===')
    print('Sources      : ' + ', '.join(f'{node_id} ({node_name})' for node_id, node_name in source_hotspots))
    print('Destinations : ' + ', '.join(f'{node_id} ({node_name})' for node_id, node_name in destination_hotspots))

    for source_id, _ in source_hotspots:
        for destination_id, _ in destination_hotspots:
            if source_id == destination_id:
                continue

            primary_result = _run_solver(solver, source_id, destination_id, edges)
            reference_result = None
            if reference_solver is not None:
                reference_result = _run_solver(reference_solver, source_id, destination_id, edges)

            record = _build_pair_record(
                algorithm_label,
                nodes,
                source_id,
                destination_id,
                primary_result,
                reference_result,
                reference_label,
            )
            pair_results.append(record)
            _print_pair_record(record, nodes, reference_label)

    summary = _build_summary(pair_results)
    report = {
        'algorithm': algorithm_label,
        'reference_algorithm': reference_label,
        'generated_at': time.strftime('%Y-%m-%dT%H:%M:%S'),
        'nodes_json': nodes_json,
        'edges_json': edges_json,
        'source_hotspots': [
            {
                'node_id': node_id,
                'node_name': node_name,
            }
            for node_id, node_name in source_hotspots
        ],
        'destination_hotspots': [
            {
                'node_id': node_id,
                'node_name': node_name,
            }
            for node_id, node_name in destination_hotspots
        ],
        'summary': summary,
        'pairs': pair_results,
    }

    json_report_path = os.path.join(report_dir, f'{algorithm_label}_test_report.json')
    csv_report_path = os.path.join(report_dir, f'{algorithm_label}_test_report.csv')
    _write_json_report(json_report_path, report)
    _write_csv_report(csv_report_path, pair_results)

    print(f'--- {algorithm_label} summary ---')
    print(f"pairs: {summary['pair_count']} | success: {summary['success_count']} | failure: {summary['failure_count']}")
    print(
        'runtime (ms): '
        f"total={summary['total_runtime_ms']} | avg={summary['average_runtime_ms']} | median={summary['median_runtime_ms']} | "
        f"min={summary['min_runtime_ms']} | max={summary['max_runtime_ms']}"
    )
    print(
        'path stats: '
        f"total_hops={summary['total_hops']} | avg_hops={summary['average_hops']} | "
        f"avg_distance_m={summary['average_distance_m']}"
    )
    if reference_solver is not None:
        print(
            'comparison: '
            f"match={summary['comparison_match_count']} | "
            f"tie-path-diff={summary['comparison_tie_path_diff_count']} | "
            f"mismatch={summary['comparison_mismatch_count']}"
        )
    print(f'report json: {json_report_path}')
    print(f'report csv : {csv_report_path}')

    return report
