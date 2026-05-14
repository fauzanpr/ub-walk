/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "@/utils/api"

export const postDijsktraService = (data: Record<any,any>) => {
    return apiRequest({
        method: "POST",
        urlKey: "/api/dijkstra",
        data: data
    });
}