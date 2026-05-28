import { atom } from "jotai";

export const AlgorithmsAtom = atom<"dijkstra" | "bellman-ford">("dijkstra");