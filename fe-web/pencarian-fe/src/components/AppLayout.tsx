"use client";

import { Divider } from "@mui/material";
import classNames from "classnames";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

import { MdLocationOn } from "react-icons/md";

type TAppLayout = {
    children: ReactNode;
}

const ROUTES: { label: string; value: string }[] = [
    { label: "Gerbang Veteran", value: "veteran" },
    { label: "Gerbang BNI", value: "bni" },
]

function AppLayout({ children }: TAppLayout) {
    const params = useParams();
    const slug = params.slug as string;

    return (
        <div className="min-h-screen w-full bg-gray-50">
            <aside className="fixed w-[300px] bg-white h-screen overflow-y-scroll border-r-1 p-6 flex flex-col gap-2">
                <p className="text-lg font-semibold">UB Walk</p>
                <Divider sx={{ my: 2 }} />

                <div className="mb-2 flex items-center gap-1">
                    <MdLocationOn />
                    <p className="text-gray-700">Kamu Dimana?</p>
                </div>
                {ROUTES.map(route => (
                    <Link
                        key={route.value}
                        href={`/maps/${route.value}`}
                        className={classNames("py-2 rounded-lg px-4 cursor-pointer text-gray-400 hover:bg-gray-50", {
                            "border-l-4 border-blue-700 !text-blue-600 !font-semibold !bg-blue-50": slug === route.value
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