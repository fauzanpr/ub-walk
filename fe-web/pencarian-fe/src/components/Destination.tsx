"use client";

import { Autocomplete, Button, TextField } from "@mui/material";

function Destination() {
  return (
    <div className="p-6 bg-white rounded-lg shadow-2xl fixed left-[350px] top-6 w-1/3 z-[999999] flex flex-col gap-2">
      <p className="text-xl text-blue-500 font-semibold">
        Mau ke mana kamu?
      </p>

      <Autocomplete
        options={[
          { label: "GKM", value: "gkm" },
          { label: "Filkom Gedung F", value: "gedung-f" },
        ]}
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

      <Button fullWidth variant="contained">Telusuri</Button>
    </div>
  );
}

export default Destination;