"use client";

import { Button } from "@mui/material";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col gap-4 items-center justify-center">
      <p className="text-3xl">Selamat Datang di platform pencarian jalur</p>
      <Link href={"/maps"}>
        <Button variant="contained">Klik disini untuk memulai</Button>
      </Link>
    </main>
  );
}
