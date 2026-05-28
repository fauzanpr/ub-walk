// "use client";

// import { useDijkstraMutation } from "@/features/maps/hooks";
// import { destionationData } from "@/utils/generate-data";
// import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material";
// import { useState } from "react";

// type TDestination = {
//   source_node_id: string;
// }

// function Destination({ source_node_id }: TDestination) {
//   const [destinationSelected, setDestinationSelected] = useState<{ label: string; value: string } | null>(null);

//   const { mutate, isPending } = useDijkstraMutation({
//     onSuccess: (res) => {
//       alert("Success");
//       console.log(JSON.stringify(res, null, 2));
//     },
//     onError: () => {
//       alert("ERROR");
//     }
//   });

//   return (
//     <div className="p-6 bg-white rounded-lg shadow-2xl fixed left-[350px] top-6 w-1/3 z-[999999] flex flex-col gap-2">
//       <p className="text-xl text-blue-500 font-semibold">
//         Mau ke mana kamu?
//       </p>

//       <Autocomplete
//         options={destionationData.map(destination => ({
//           label: destination.node_name,
//           value: destination.node_id
//         }))}
//         value={destinationSelected}
//         onChange={(_, value) => {
//           setDestinationSelected(value);
//         }}
//         getOptionLabel={(option) => option.label}
//         sx={{
//           width: "100%",
//           "& .MuiPopper-root": {
//             zIndex: 999999999,
//           },
//         }}
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             size="small"
//             placeholder="Cari tujuan..."
//           />
//         )}
//       />

//       <Button fullWidth variant="contained"
//         onClick={() => {
//           if (!destinationSelected) {
//             alert("Tujuan Wajib dipilih");

//             return;
//           }

//           mutate({
//             method: "POST",
//             data: {
//               source_id: source_node_id,
//               destination_id: destinationSelected?.value,
//             }
//           });
//         }}
//       >
//         { isPending ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Telusuri" }
//       </Button>
//     </div>
//   );
// }

// export default Destination;

"use client";

import { AlgorithmsAtom } from "@/atom/algorithm";
import { useDijkstraMutation } from "@/features/maps/hooks";
import { geoData } from "@/utils/generate-data";
import { Autocomplete, Button, CircularProgress, TextField } from "@mui/material";
import { useAtomValue } from "jotai";
import { useState } from "react";
import toast from "react-hot-toast";

type TDijkstraRoute = {
  source_id: string;
  destination_id: string;
  distance: number;
};

type TDestination = {
  source_node_id: string;
  onRouteFound: (routes: TDijkstraRoute[]) => void;
};

function Destination({ source_node_id, onRouteFound }: TDestination) {
  const [destinationSelected, setDestinationSelected] = useState<{
    label: string;
    value: string;
  } | null>(null);

  const algorithm = useAtomValue(AlgorithmsAtom);

  const { mutate, isPending } = useDijkstraMutation({
    onSuccess: (res) => {
      console.log("HASIL DIJKSTRA:", JSON.stringify(res, null, 2));
      toast.success("Rute berhasil ditemukan!");

      onRouteFound(res.data);
    },
    onError: () => {
      toast.error("Gagal menemukan rute. Silakan coba lagi.");
    },
  });

  return (
    <div className="p-4 bg-white max-w-80 rounded-lg shadow-2xl fixed left-[350px] top-6 w-1/3 z-[999999] flex flex-col gap-2 border border-gray-500">
      <p className="text-lg text-black font-semibold font-poppins">
        Mau ke mana kamu?
      </p>

      <Autocomplete
        options={geoData.filter(geo => geo.node_type === "hotspot").map((destination) => ({
          label: destination.node_name,
          value: destination.node_id,
        }))}
        value={destinationSelected}
        onChange={(_, value) => {
          setDestinationSelected(value);
        }}
        isOptionEqualToValue={(opt, val) => opt.value === val.value}
        getOptionLabel={(option) => option.label}
        sx={{
          width: "100%",
          "& .MuiPopper-root": {
            zIndex: 999999999,
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Cari tujuan..."
          />
        )}
      />

      <Button
        fullWidth
        variant="contained"
        disabled={isPending}
        onClick={() => {
          if (!destinationSelected) {
            toast.error("Tujuan wajib dipilih");
            return;
          }

          mutate({
            method: "POST",
            data: {
              source_id: source_node_id,
              destination_id: destinationSelected.value,
              algorithm: (algorithm === "bellman-ford") ? "bf" : "dijkstra",
            },
          });
        }}
      >
        {isPending ? (
          <CircularProgress size={18} sx={{ color: "white" }} />
        ) : (
          "Telusuri"
        )}
      </Button>
    </div>
  );
}

export default Destination;