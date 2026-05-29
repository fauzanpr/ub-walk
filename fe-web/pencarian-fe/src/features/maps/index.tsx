"use client";

import AppLayout from "@/components/AppLayout";
import { useParams } from "next/navigation";
import MapsVeteran from "../maps-veteran";
import { ReactNode } from "react";
import dynamic from "next/dynamic";
import Maps from "@/components/Maps";

const MapsBNI = dynamic(() => import("./../maps-bni"), {
    ssr: false,
});

const CONTENT: Record<string, ReactNode> = {
  bni: <MapsBNI />,
  veteran: <MapsVeteran />,
  perpus: <Maps sourceNodeId="3" />,
  cl: <Maps sourceNodeId="4" />,
  mrp: <Maps sourceNodeId="5" />,
}

function MapsPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <AppLayout>
      {CONTENT[slug]}
    </AppLayout>
  )
}

export default MapsPage;