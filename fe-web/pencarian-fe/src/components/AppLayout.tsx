"use client";

import { Divider } from "@mui/material";
import classNames from "classnames";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

import { MdLocationOn } from "react-icons/md";

import UbLogo from "@/assets/ub.webp";
import UbWalk from "@/assets/walk.jpeg";

import Image from "next/image";
import Utilities from "./Utilities";

type TAppLayout = {
    children: ReactNode;
}

const ROUTES: { label: string; value: string }[] = [
    { label: "Gerbang Veteran", value: "veteran" },
    { label: "Gerbang BNI", value: "bni" },
    { label: "Perpustakaan UB", value: "perpus" },
    { label: "CL", value: "cl" },
    { label: "Masjid Raden Patah UB", value: "mrp" },
]

function AppLayout({ children }: TAppLayout) {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <aside className="fixed w-[300px] bg-white h-screen overflow-y-scroll border-r-1 p-4 flex flex-col gap-2 border-r border-gray-500">
                <div className="flex items-center gap-2">
                    <Image src={UbLogo.src} width={17} height={17} alt="UB Logo" className="w-12" />
                    <Image src={UbWalk.src} width={18} height={18} alt="UB Logo" className="w-12" />
                </div>
                <p className="text-lg font-semibold font-poppins">UB WALK</p>
                <Divider sx={{ my: 2 }} />

                <Utilities />

                <div className="mb-2 flex items-center gap-1">
                    <MdLocationOn />
                    <p className="text-gray-700 font-poppins font-semibold">KAMU DIMANA?</p>
                </div>
                {ROUTES.map(route => (
                    <Link
                        key={route.value}
                        href={`/maps/${route.value}`}
                        className={classNames("py-2 px-4 cursor-pointer text-gray-500 hover:bg-gray-50", {
                            "border-l-2 border-blue-700 !text-blue-600 !font-semibold !bg-blue-50": slug === route.value
                        })}
                    >
                        {route.label}
                    </Link>
                ))}
            </aside>
            <main className="ml-[300px]">
                {children}
            </main>
        </div>
    )
}

export default AppLayout