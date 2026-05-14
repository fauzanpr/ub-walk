"use client";

import Destination from "@/components/Destination";
import "leaflet/dist/leaflet.css";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet"; 

const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41], 
    popupAnchor: [1, -34], 
    shadowSize: [41, 41]
});

export default function MapsBNI() {
    // Kita pisahkan variabel koordinatnya agar lebih mudah dibaca
    const nodeBNI = [-7.955999, 112.613476]; 
    const nodeA   = [-7.955500, 112.613600];
    const nodeB   = [-7.955000, 112.613900]; 
    const nodeC   = [-7.954500, 112.614100];
    const nodeD   = [-7.954000, 112.614300];
    const nodeFilkom = [-7.953500, 112.614500]; 

    // 1. Buat Array of Objects yang berisi pasangan titik (segmen) dan warnanya
    const routeSegments = [
        { positions: [nodeBNI, nodeA], color: 'green' },     // Sisanya (Hijau)
        { positions: [nodeA, nodeB], color: 'red' },         // Node A ke B (Merah)
        { positions: [nodeB, nodeC], color: 'blue' },        // Node B ke C (Biru)
        { positions: [nodeC, nodeD], color: 'green' },       // Sisanya (Hijau)
        { positions: [nodeD, nodeFilkom], color: 'green' }   // Sisanya (Hijau)
    ];

    return (
        <>
            <MapContainer
                center={nodeBNI}
                zoom={18} 
                maxZoom={24}
                style={{ height: '100vh', width: '100%' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={24}
                    maxNativeZoom={19}
                />

                <Marker position={nodeBNI} icon={customIcon}>
                    <Popup>Start: BNI Universitas Brawijaya</Popup>
                </Marker>

                <Marker position={nodeFilkom} icon={customIcon}>
                    <Popup>End: FILKOM UB</Popup>
                </Marker>

                {/* 2. Lakukan mapping untuk me-render Polyline berkali-kali */}
                {routeSegments.map((segment, index) => (
                    <Polyline 
                        key={index} 
                        positions={segment.positions} 
                        pathOptions={{ color: segment.color, weight: 5, opacity: 0.8 }} 
                    />
                ))}

            </MapContainer>

            <Destination />
        </>
    );
}