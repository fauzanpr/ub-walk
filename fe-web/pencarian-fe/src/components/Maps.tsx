"use client";

import Destination from "@/components/Destination";
import MapLayerControl, { TMapViewMode } from "@/components/MapLayerControl";

import "leaflet/dist/leaflet.css";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import { useMemo, useState } from "react";

import { geoData } from "@/utils/generate-data";
import distDataJson from "@/data/data_dist.json";

type TDijkstraRoute = {
    source_id: string;
    destination_id: string;
    distance: number;
};

type TGeoNode = {
    node_id: string;
    node_name: string;
    latitude: number;
    longitude: number;
    node_type: string;
};

type TDist = {
    dist_id: string;
    dist_name: string;
    lower_node: string;
    upper_node: string;
    distance: number;
    dist_type: "pvb" | "trotoar";
};

type TRouteSegment = {
    source_id: string;
    destination_id: string;
    distance: number;
    dist_type: "pvb" | "trotoar";
    positions: [L.LatLngExpression, L.LatLngExpression];
};

const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

type TMaps = {
    sourceNodeId: string;
}

export default function Maps({ sourceNodeId }: TMaps) {
    const [routeData, setRouteData] = useState<TDijkstraRoute[]>([]);
    const [mapViewMode, setMapViewMode] = useState<TMapViewMode>("route-only");

    const distData = distDataJson as TDist[];

    const geoMap = useMemo(() => {
        const map = new Map<string, TGeoNode>();

        (geoData as TGeoNode[]).forEach((node) => {
            map.set(node.node_id, node);
        });

        return map;
    }, []);

    const allEdgeSegments = useMemo(() => {
        return distData
            .map((edge) => {
                const sourceNode = geoMap.get(edge.upper_node);
                const destinationNode = geoMap.get(edge.lower_node);

                if (!sourceNode || !destinationNode) {
                    return null;
                }

                return {
                    ...edge,
                    positions: [
                        [sourceNode.latitude, sourceNode.longitude],
                        [destinationNode.latitude, destinationNode.longitude],
                    ] as [L.LatLngExpression, L.LatLngExpression],
                };
            })
            .filter((edge): edge is TDist & {
                positions: [L.LatLngExpression, L.LatLngExpression];
            } => edge !== null);
    }, [distData, geoMap]);

    const destinationNodeId =
        routeData.length > 0
            ? routeData[routeData.length - 1].destination_id
            : null;

    const sourceNode = geoMap.get(sourceNodeId);

    const destinationNode = destinationNodeId
        ? geoMap.get(destinationNodeId)
        : null;

    const routeNodeIds = useMemo(() => {
        const ids = new Set<string>();

        routeData.forEach((route) => {
            ids.add(route.source_id);
            ids.add(route.destination_id);
        });

        return Array.from(ids);
    }, [routeData]);

    const routeNodes = useMemo(() => {
        return routeNodeIds
            .map((nodeId) => geoMap.get(nodeId))
            .filter((node): node is TGeoNode => node !== undefined);
    }, [routeNodeIds, geoMap]);

    function findEdgeType(sourceId: string, destinationId: string): "pvb" | "trotoar" {
        const edge = distData.find((item) => {
            const forward =
                item.upper_node === sourceId &&
                item.lower_node === destinationId;

            const backward =
                item.upper_node === destinationId &&
                item.lower_node === sourceId;

            return forward || backward;
        });

        return edge?.dist_type ?? "trotoar";
    }

    function getEdgeColor(distType: "pvb" | "trotoar") {
        if (distType === "pvb") {
            return "blue";
        }

        return "#FFC000";
    }

    const routeSegments: TRouteSegment[] = useMemo(() => {
        return routeData
            .map((route) => {
                const sourceNode = geoMap.get(route.source_id);
                const destinationNode = geoMap.get(route.destination_id);

                if (!sourceNode || !destinationNode) {
                    return null;
                }

                const distType = findEdgeType(
                    route.source_id,
                    route.destination_id
                );

                return {
                    source_id: route.source_id,
                    destination_id: route.destination_id,
                    distance: route.distance,
                    dist_type: distType,
                    positions: [
                        [sourceNode.latitude, sourceNode.longitude],
                        [destinationNode.latitude, destinationNode.longitude],
                    ] as [L.LatLngExpression, L.LatLngExpression],
                };
            })
            .filter((segment): segment is TRouteSegment => segment !== null);
    }, [routeData, geoMap]);

    const mapCenter: L.LatLngExpression = sourceNode
        ? [sourceNode.latitude, sourceNode.longitude]
        : [-7.955999, 112.613476];

    return (
        <>
            <MapContainer
                center={mapCenter}
                zoom={18}
                maxZoom={24}
                style={{ height: "100vh", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={24}
                    maxNativeZoom={19}
                />

                {mapViewMode === "all-node-edge" &&
                    allEdgeSegments.map((edge) => (
                        <Polyline
                            key={edge.dist_id}
                            positions={edge.positions}
                            pathOptions={{
                                color: getEdgeColor(edge.dist_type),
                                weight: 4,
                                opacity: 0.45,
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>{edge.dist_name}</strong>
                                    <br />
                                    Distance: {edge.distance} m
                                    <br />
                                    Type: {edge.dist_type}
                                </div>
                            </Popup>
                        </Polyline>
                    ))}

                {routeSegments.map((segment, index) => {
                    const source = geoMap.get(segment.source_id);
                    const destination = geoMap.get(segment.destination_id);

                    return (
                        <Polyline
                            key={`${segment.source_id}-${segment.destination_id}-${index}`}
                            positions={segment.positions}
                            pathOptions={{
                                color: getEdgeColor(segment.dist_type),
                                weight: 6,
                                opacity: 0.85,
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>
                                        {source?.node_name} → {destination?.node_name}
                                    </strong>
                                    <br />
                                    Distance: {segment.distance} m
                                    <br />
                                    Type: {segment.dist_type}
                                </div>
                            </Popup>
                        </Polyline>
                    );
                })}

                {(mapViewMode === "route-only" ? routeNodes : (geoData as TGeoNode[])).map((node) => {
                    const isSource = node.node_id === sourceNodeId;
                    const isDestination = node.node_id === destinationNodeId;

                    const position: L.LatLngExpression = [
                        node.latitude,
                        node.longitude,
                    ];

                    if (isSource || isDestination) {
                        return (
                            <Marker key={node.node_id} position={position} icon={customIcon}>
                                <Popup>
                                    <div>
                                        <strong>
                                            {isSource ? "Start" : "Destination"}: {node.node_name}
                                        </strong>
                                        <br />
                                        Node ID: {node.node_id}
                                        <br />
                                        Type: {node.node_type}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    }

                    return (
                        <CircleMarker
                            key={node.node_id}
                            center={position}
                            radius={7}
                            pathOptions={{
                                color: "red",
                                fillColor: "red",
                                fillOpacity: 1,
                                weight: 2,
                            }}
                        >
                            <Popup>
                                <div>
                                    <strong>{node.node_name}</strong>
                                    <br />
                                    Node ID: {node.node_id}
                                    <br />
                                    Type: {node.node_type}
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            <Destination
                source_node_id={sourceNodeId}
                onRouteFound={(routes) => {
                    setRouteData(routes);
                }}
            />

            <MapLayerControl
                value={mapViewMode}
                onChange={setMapViewMode}
            />
        </>
    );
}