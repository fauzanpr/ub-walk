/* eslint-disable @typescript-eslint/no-explicit-any */
import { TShortestPathResponse } from "@/types/dijkstra";
import { apiRequest } from "@/utils/api"

export const postShortestPathService = (data: Record<any,any>): Promise<TShortestPathResponse> => {
    return apiRequest({
        method: "POST",
        urlKey: "/api/route",
        data: data
    });
}