// "use client";

// import Destination from "@/components/Destination";
// import "leaflet/dist/leaflet.css";

// import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// import L from "leaflet";

// const customIcon = new L.Icon({
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });

// export default function MapsBNI() {
//     // Kita pisahkan variabel koordinatnya agar lebih mudah dibaca
//     const nodeBNI : L.LatLngExpression = [-7.955999, 112.613476];
//     const nodeA: L.LatLngExpression = [-7.955500, 112.613600];
//     const nodeB: L.LatLngExpression = [-7.955000, 112.613900];
//     const nodeC: L.LatLngExpression = [-7.954500, 112.614100];
//     const nodeD: L.LatLngExpression = [-7.954000, 112.614300];
//     const nodeFilkom: L.LatLngExpression = [-7.953500, 112.614500];

//     // 1. Buat Array of Objects yang berisi pasangan titik (segmen) dan warnanya
//     const routeSegments = [
//         { positions: [nodeBNI, nodeA], color: 'green' },     // Sisanya (Hijau)
//         { positions: [nodeA, nodeB], color: 'red' },         // Node A ke B (Merah)
//         { positions: [nodeB, nodeC], color: 'blue' },        // Node B ke C (Biru)
//         { positions: [nodeC, nodeD], color: 'green' },       // Sisanya (Hijau)
//         { positions: [nodeD, nodeFilkom], color: 'green' }   // Sisanya (Hijau)
//     ];

//     return (
//         <>
//             <MapContainer
//                 center={nodeBNI as L.LatLngExpression | undefined}
//                 zoom={18}
//                 maxZoom={24}
//                 style={{ height: '100vh', width: '100%' }}
//             >
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     maxZoom={24}
//                     maxNativeZoom={19}
//                 />

//                 <Marker position={nodeBNI} icon={customIcon}>
//                     <Popup>Start: BNI Universitas Brawijaya</Popup>
//                 </Marker>

//                 <Marker position={nodeFilkom} icon={customIcon}>
//                     <Popup>End: FILKOM UB</Popup>
//                 </Marker>

//                 {/* 2. Lakukan mapping untuk me-render Polyline berkali-kali */}
//                 {routeSegments.map((segment, index) => (
//                     <Polyline
//                         key={index}
//                         positions={segment.positions}
//                         pathOptions={{ color: segment.color, weight: 5, opacity: 0.8 }}
//                     />
//                 ))}

//             </MapContainer>

//             <Destination source_node_id="1" />
//         </>
//     );
// }

// V2
// "use client";

// import Destination from "@/components/Destination";
// import "leaflet/dist/leaflet.css";

// import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
// import L from "leaflet";
// import { useMemo, useState } from "react";
// import { geoData } from "@/utils/generate-data";

// type TDijkstraRoute = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
// };

// type TGeoNode = {
//     node_id: string;
//     node_name: string;
//     latitude: number;
//     longitude: number;
//     node_type: string;
// };

// type TRouteSegment = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
//     positions: [L.LatLngExpression, L.LatLngExpression];
// };

// const customIcon = new L.Icon({
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41]
// });

// export default function MapsBNI() {
//     const sourceNodeId = "1";

//     const [routeData, setRouteData] = useState<TDijkstraRoute[]>([]);

//     const geoMap = useMemo(() => {
//         const map = new Map<string, TGeoNode>();

//         (geoData as TGeoNode[]).forEach((node) => {
//             map.set(node.node_id, node);
//         });

//         return map;
//     }, []);

//     const sourceNode = geoMap.get(sourceNodeId);

//     const routeSegments: TRouteSegment[] = useMemo(() => {
//         return routeData
//             .map((route) => {
//                 const sourceNode = geoMap.get(route.source_id);
//                 const destinationNode = geoMap.get(route.destination_id);

//                 if (!sourceNode || !destinationNode) {
//                     return null;
//                 }

//                 return {
//                     source_id: route.source_id,
//                     destination_id: route.destination_id,
//                     distance: route.distance,
//                     positions: [
//                         [sourceNode.latitude, sourceNode.longitude],
//                         [destinationNode.latitude, destinationNode.longitude],
//                     ] as [L.LatLngExpression, L.LatLngExpression],
//                 };
//             })
//             .filter((segment): segment is TRouteSegment => segment !== null);
//     }, [routeData, geoMap]);

//     const destinationNodeId =
//         routeData.length > 0
//             ? routeData[routeData.length - 1].destination_id
//             : null;

//     const destinationNode = destinationNodeId
//         ? geoMap.get(destinationNodeId)
//         : null;

//     const mapCenter: L.LatLngExpression = sourceNode
//         ? [sourceNode.latitude, sourceNode.longitude]
//         : [-7.955999, 112.613476];

//     return (
//         <>
//             <MapContainer
//                 center={mapCenter}
//                 zoom={18}
//                 maxZoom={24}
//                 style={{ height: "100vh", width: "100%" }}
//             >
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     maxZoom={24}
//                     maxNativeZoom={19}
//                 />

//                 {sourceNode && (
//                     <Marker
//                         position={[sourceNode.latitude, sourceNode.longitude]}
//                         icon={customIcon}
//                     >
//                         <Popup>Start: {sourceNode.node_name}</Popup>
//                     </Marker>
//                 )}

//                 {destinationNode && (
//                     <Marker
//                         position={[destinationNode.latitude, destinationNode.longitude]}
//                         icon={customIcon}
//                     >
//                         <Popup>End: {destinationNode.node_name}</Popup>
//                     </Marker>
//                 )}

//                 {routeSegments.map((segment, index) => {
//                     const source = geoMap.get(segment.source_id);
//                     const destination = geoMap.get(segment.destination_id);

//                     return (
//                         <Polyline
//                             key={`${segment.source_id}-${segment.destination_id}-${index}`}
//                             positions={segment.positions}
//                             pathOptions={{
//                                 color: "red",
//                                 weight: 6,
//                                 opacity: 0.85,
//                             }}
//                         >
//                             <Popup>
//                                 <div>
//                                     <strong>
//                                         {source?.node_name} → {destination?.node_name}
//                                     </strong>
//                                     <br />
//                                     Distance: {segment.distance} m
//                                 </div>
//                             </Popup>
//                         </Polyline>
//                     );
//                 })}
//             </MapContainer>

//             <Destination
//                 source_node_id={sourceNodeId}
//                 onRouteFound={(routes) => {
//                     setRouteData(routes);
//                 }}
//             />
//         </>
//     );
// }

// V3
// "use client";

// import Destination from "@/components/Destination";
// import "leaflet/dist/leaflet.css";

// import {
//     MapContainer,
//     TileLayer,
//     Popup,
//     Polyline,
//     CircleMarker,
// } from "react-leaflet";
// import L from "leaflet";
// import { useMemo, useState } from "react";

// import { geoData } from "@/utils/generate-data";
// import distDataJson from "@/data/data_dist.json";

// type TDijkstraRoute = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
// };

// type TGeoNode = {
//     node_id: string;
//     node_name: string;
//     latitude: number;
//     longitude: number;
//     node_type: string;
// };

// type TDist = {
//     dist_id: string;
//     dist_name: string;
//     lower_node: string;
//     upper_node: string;
//     distance: number;
//     dist_type: "pvb" | "trotoar";
// };

// type TRouteSegment = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
//     dist_type: "pvb" | "trotoar";
//     positions: [L.LatLngExpression, L.LatLngExpression];
// };

// export default function MapsBNI() {
//     const sourceNodeId = "1";

//     const [routeData, setRouteData] = useState<TDijkstraRoute[]>([]);

//     const geoMap = useMemo(() => {
//         const map = new Map<string, TGeoNode>();

//         (geoData as TGeoNode[]).forEach((node) => {
//             map.set(node.node_id, node);
//         });

//         return map;
//     }, []);

//     const distData = distDataJson as TDist[];

//     const sourceNode = geoMap.get(sourceNodeId);

//     const destinationNodeId =
//         routeData.length > 0
//             ? routeData[routeData.length - 1].destination_id
//             : null;

//     const destinationNode = destinationNodeId
//         ? geoMap.get(destinationNodeId)
//         : null;

//     function findEdgeType(sourceId: string, destinationId: string): "pvb" | "trotoar" {
//         const edge = distData.find((item) => {
//             const forward =
//                 item.upper_node === sourceId &&
//                 item.lower_node === destinationId;

//             const backward =
//                 item.upper_node === destinationId &&
//                 item.lower_node === sourceId;

//             return forward || backward;
//         });

//         return edge?.dist_type ?? "trotoar";
//     }

//     function getEdgeColor(distType: "pvb" | "trotoar") {
//         if (distType === "pvb") {
//             return "blue";
//         }

//         return "yellow";
//     }

//     function getNodeColor(nodeId: string) {
//         const isSource = nodeId === sourceNodeId;
//         const isDestination = nodeId === destinationNodeId;

//         if (isSource || isDestination) {
//             return "blue";
//         }

//         return "red";
//     }

//     const routeSegments: TRouteSegment[] = useMemo(() => {
//         return routeData
//             .map((route) => {
//                 const sourceNode = geoMap.get(route.source_id);
//                 const destinationNode = geoMap.get(route.destination_id);

//                 if (!sourceNode || !destinationNode) {
//                     return null;
//                 }

//                 const distType = findEdgeType(
//                     route.source_id,
//                     route.destination_id
//                 );

//                 return {
//                     source_id: route.source_id,
//                     destination_id: route.destination_id,
//                     distance: route.distance,
//                     dist_type: distType,
//                     positions: [
//                         [sourceNode.latitude, sourceNode.longitude],
//                         [destinationNode.latitude, destinationNode.longitude],
//                     ] as [L.LatLngExpression, L.LatLngExpression],
//                 };
//             })
//             .filter((segment): segment is TRouteSegment => segment !== null);
//     }, [routeData, geoMap]);

//     const mapCenter: L.LatLngExpression = sourceNode
//         ? [sourceNode.latitude, sourceNode.longitude]
//         : [-7.955999, 112.613476];

//     return (
//         <>
//             <MapContainer
//                 center={mapCenter}
//                 zoom={18}
//                 maxZoom={24}
//                 style={{ height: "100vh", width: "100%" }}
//             >
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     maxZoom={24}
//                     maxNativeZoom={19}
//                 />

//                 {(geoData as TGeoNode[]).map((node) => (
//                     <CircleMarker
//                         key={node.node_id}
//                         center={[node.latitude, node.longitude]}
//                         radius={8}
//                         pathOptions={{
//                             color: getNodeColor(node.node_id),
//                             fillColor: getNodeColor(node.node_id),
//                             fillOpacity: 1,
//                             weight: 2,
//                         }}
//                     >
//                         <Popup>
//                             <div>
//                                 <strong>{node.node_name}</strong>
//                                 <br />
//                                 Node ID: {node.node_id}
//                                 <br />
//                                 Type: {node.node_type}
//                                 <br />
//                                 {node.node_id === sourceNodeId && "Source Node"}
//                                 {node.node_id === destinationNodeId && "Destination Node"}
//                             </div>
//                         </Popup>
//                     </CircleMarker>
//                 ))}

//                 {routeSegments.map((segment, index) => {
//                     const source = geoMap.get(segment.source_id);
//                     const destination = geoMap.get(segment.destination_id);

//                     return (
//                         <Polyline
//                             key={`${segment.source_id}-${segment.destination_id}-${index}`}
//                             positions={segment.positions}
//                             pathOptions={{
//                                 color: getEdgeColor(segment.dist_type),
//                                 weight: 6,
//                                 opacity: 0.85,
//                             }}
//                         >
//                             <Popup>
//                                 <div>
//                                     <strong>
//                                         {source?.node_name} → {destination?.node_name}
//                                     </strong>
//                                     <br />
//                                     Distance: {segment.distance} m
//                                     <br />
//                                     Type: {segment.dist_type}
//                                 </div>
//                             </Popup>
//                         </Polyline>
//                     );
//                 })}
//             </MapContainer>

//             <Destination
//                 source_node_id={sourceNodeId}
//                 onRouteFound={(routes) => {
//                     setRouteData(routes);
//                 }}
//             />
//         </>
//     );
// }

// V4
// "use client";

// import Destination from "@/components/Destination";
// import "leaflet/dist/leaflet.css";

// import {
//     MapContainer,
//     TileLayer,
//     Marker,
//     Popup,
//     Polyline,
//     CircleMarker,
// } from "react-leaflet";
// import L from "leaflet";
// import { useMemo, useState } from "react";

// import { geoData } from "@/utils/generate-data";
// import distDataJson from "@/data/data_dist.json";

// type TDijkstraRoute = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
// };

// type TGeoNode = {
//     node_id: string;
//     node_name: string;
//     latitude: number;
//     longitude: number;
//     node_type: string;
// };

// type TDist = {
//     dist_id: string;
//     dist_name: string;
//     lower_node: string;
//     upper_node: string;
//     distance: number;
//     dist_type: "pvb" | "trotoar";
// };

// type TRouteSegment = {
//     source_id: string;
//     destination_id: string;
//     distance: number;
//     dist_type: "pvb" | "trotoar";
//     positions: [L.LatLngExpression, L.LatLngExpression];
// };

// const customIcon = new L.Icon({
//     iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
//     iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
//     shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//     shadowSize: [41, 41],
// });

// export default function MapsBNI() {
//     const sourceNodeId = "1";

//     const [routeData, setRouteData] = useState<TDijkstraRoute[]>([]);

//     const distData = distDataJson as TDist[];

//     const geoMap = useMemo(() => {
//         const map = new Map<string, TGeoNode>();

//         (geoData as TGeoNode[]).forEach((node) => {
//             map.set(node.node_id, node);
//         });

//         return map;
//     }, []);

//     const destinationNodeId =
//         routeData.length > 0
//             ? routeData[routeData.length - 1].destination_id
//             : null;

//     const sourceNode = geoMap.get(sourceNodeId);

//     const destinationNode = destinationNodeId
//         ? geoMap.get(destinationNodeId)
//         : null;

//     const routeNodeIds = useMemo(() => {
//         const ids = new Set<string>();

//         routeData.forEach((route) => {
//             ids.add(route.source_id);
//             ids.add(route.destination_id);
//         });

//         return Array.from(ids);
//     }, [routeData]);

//     const routeNodes = useMemo(() => {
//         return routeNodeIds
//             .map((nodeId) => geoMap.get(nodeId))
//             .filter((node): node is TGeoNode => node !== undefined);
//     }, [routeNodeIds, geoMap]);

//     function findEdgeType(sourceId: string, destinationId: string): "pvb" | "trotoar" {
//         const edge = distData.find((item) => {
//             const forward =
//                 item.upper_node === sourceId &&
//                 item.lower_node === destinationId;

//             const backward =
//                 item.upper_node === destinationId &&
//                 item.lower_node === sourceId;

//             return forward || backward;
//         });

//         return edge?.dist_type ?? "trotoar";
//     }

//     function getEdgeColor(distType: "pvb" | "trotoar") {
//         if (distType === "pvb") {
//             return "blue";
//         }

//         return "#FFC000";
//     }

//     const routeSegments: TRouteSegment[] = useMemo(() => {
//         return routeData
//             .map((route) => {
//                 const sourceNode = geoMap.get(route.source_id);
//                 const destinationNode = geoMap.get(route.destination_id);

//                 if (!sourceNode || !destinationNode) {
//                     return null;
//                 }

//                 const distType = findEdgeType(
//                     route.source_id,
//                     route.destination_id
//                 );

//                 return {
//                     source_id: route.source_id,
//                     destination_id: route.destination_id,
//                     distance: route.distance,
//                     dist_type: distType,
//                     positions: [
//                         [sourceNode.latitude, sourceNode.longitude],
//                         [destinationNode.latitude, destinationNode.longitude],
//                     ] as [L.LatLngExpression, L.LatLngExpression],
//                 };
//             })
//             .filter((segment): segment is TRouteSegment => segment !== null);
//     }, [routeData, geoMap]);

//     const mapCenter: L.LatLngExpression = sourceNode
//         ? [sourceNode.latitude, sourceNode.longitude]
//         : [-7.955999, 112.613476];

//     return (
//         <>
//             <MapContainer
//                 center={mapCenter}
//                 zoom={18}
//                 maxZoom={24}
//                 style={{ height: "100vh", width: "100%" }}
//             >
//                 <TileLayer
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                     maxZoom={24}
//                     maxNativeZoom={19}
//                 />

//                 {routeSegments.map((segment, index) => {
//                     const source = geoMap.get(segment.source_id);
//                     const destination = geoMap.get(segment.destination_id);

//                     return (
//                         <Polyline
//                             key={`${segment.source_id}-${segment.destination_id}-${index}`}
//                             positions={segment.positions}
//                             pathOptions={{
//                                 color: getEdgeColor(segment.dist_type),
//                                 weight: 6,
//                                 opacity: 0.85,
//                             }}
//                         >
//                             <Popup>
//                                 <div>
//                                     <strong>
//                                         {source?.node_name} → {destination?.node_name}
//                                     </strong>
//                                     <br />
//                                     Distance: {segment.distance} m
//                                     <br />
//                                     Type: {segment.dist_type}
//                                 </div>
//                             </Popup>
//                         </Polyline>
//                     );
//                 })}

//                 {routeNodes.map((node) => {
//                     const isSource = node.node_id === sourceNodeId;
//                     const isDestination = node.node_id === destinationNodeId;
//                     const position: L.LatLngExpression = [
//                         node.latitude,
//                         node.longitude,
//                     ];

//                     if (isSource || isDestination) {
//                         return (
//                             <Marker
//                                 key={node.node_id}
//                                 position={position}
//                                 icon={customIcon}
//                             >
//                                 <Popup>
//                                     <div>
//                                         <strong>
//                                             {isSource ? "Start" : "Destination"}:{" "}
//                                             {node.node_name}
//                                         </strong>
//                                         <br />
//                                         Node ID: {node.node_id}
//                                         <br />
//                                         Type: {node.node_type}
//                                     </div>
//                                 </Popup>
//                             </Marker>
//                         );
//                     }

//                     return (
//                         <CircleMarker
//                             key={node.node_id}
//                             center={position}
//                             radius={7}
//                             pathOptions={{
//                                 color: "red",
//                                 fillColor: "red",
//                                 fillOpacity: 1,
//                                 weight: 2,
//                             }}
//                         >
//                             <Popup>
//                                 <div>
//                                     <strong>{node.node_name}</strong>
//                                     <br />
//                                     Node ID: {node.node_id}
//                                     <br />
//                                     Type: {node.node_type}
//                                 </div>
//                             </Popup>
//                         </CircleMarker>
//                     );
//                 })}
//             </MapContainer>

//             <Destination
//                 source_node_id={sourceNodeId}
//                 onRouteFound={(routes) => {
//                     setRouteData(routes);
//                 }}
//             />
//         </>
//     );
// }

// V5
"use client"

import Maps from "@/components/Maps";

function MapsBNI() {
  return (
    <Maps
        sourceNodeId="4"
    />
  )
}

export default MapsBNI;