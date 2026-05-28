"use client";

import { AlgorithmsAtom } from "@/atom/algorithm";
import classNames from "classnames";
import { useAtom } from "jotai";

function Utilities() {
    const [algorithm, setAlgoritm] = useAtom(AlgorithmsAtom);

    return (
        <section className="p-4 bg-gray-50 rounded-lg shadow-xs flex flex-col gap-2 mb-4 border">
            <h2 className="font-poppins uppercase font-semibold text-black">ALGORITHMS</h2>
            <p className="text-sm text-gray-400">Algoritma yang digunakan dalam pencarian jalur terpendek</p>

            {/* bg-white rounded-lg border border-gray-300 */}
            <main className="flex flex-col gap-2">
                <div className={classNames("px-4 py-2 rounded-lg cursor-pointer", {
                    "bg-white rounded-lg border border-gray-300": algorithm === "dijkstra"
                })} onClick={() => setAlgoritm("dijkstra")}>
                    Dijkstra
                </div>

                <div className={classNames("px-4 py-2 rounded-lg cursor-pointer", {
                    "bg-white rounded-lg border border-gray-300": algorithm === "bellman-ford"
                })} onClick={() => setAlgoritm("bellman-ford")}>
                    Bellman Ford
                </div>
            </main>
        </section>
    )
}

export default Utilities