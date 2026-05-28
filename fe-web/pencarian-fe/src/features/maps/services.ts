/* eslint-disable @typescript-eslint/no-explicit-any */
import { TDijkstraPostResponse } from "@/types/dijkstra";
import { apiRequest } from "@/utils/api"

export const postDijkstraService = (data: Record<any,any>): Promise<TDijkstraPostResponse> => {
    return apiRequest({
        method: "POST",
        urlKey: "/api/dijkstra",
        data: data
    });
}