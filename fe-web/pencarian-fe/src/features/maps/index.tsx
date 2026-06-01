"use client";

import AppLayout from "@/components/AppLayout";
import { useParams } from "next/navigation";
import Maps from "@/components/Maps";
import geoData from "@/data/data_geo.json";

const ROUTES: { label: string; value: string; slug: string }[] = geoData
  .filter((geo) => geo.node_type === "hotspot")
  .map((geo) => ({
    label: geo.node_name,
    value: geo.node_id,
    slug: geo.node_name.toLowerCase(),
  }));

function MapsPage() {
  const params = useParams();
  const slug = params.slug as string;
  // const [mapSelected, setMapSelected] = useAtom(AtomMapSeleceted);

  const selectedRoute = ROUTES.find((route) => route.value === slug);

  return (
    <AppLayout>
      {selectedRoute ? (
        <Maps sourceNodeId={selectedRoute.value} />
      ) : (
        <p>Rute tidak ditemukan</p>
      )}
    </AppLayout>
  );
}

export default MapsPage;