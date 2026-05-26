"use client";

import { Button } from "@mui/material";

export type TMapViewMode = "route-only" | "all-node" | "all-node-edge";

type TMapLayerControl = {
  value: TMapViewMode;
  onChange: (value: TMapViewMode) => void;
};

function MapLayerControl({ value, onChange }: TMapLayerControl) {
  return (
    <div className="p-4 bg-white rounded-lg shadow-2xl fixed right-6 top-6 z-[999999] flex flex-col gap-2">
      <p className="font-semibold text-blue-500">Map Layer</p>

      <Button
        variant={value === "route-only" ? "contained" : "outlined"}
        onClick={() => onChange("route-only")}
      >
        Route Only
      </Button>

      <Button
        variant={value === "all-node" ? "contained" : "outlined"}
        onClick={() => onChange("all-node")}
      >
        All Node
      </Button>

      <Button
        variant={value === "all-node-edge" ? "contained" : "outlined"}
        onClick={() => onChange("all-node-edge")}
      >
        All Node + All Edge
      </Button>
    </div>
  );
}

export default MapLayerControl;