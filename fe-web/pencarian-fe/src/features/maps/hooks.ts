import { MutateFunctionType, MutationFunctionType } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { postDijkstraService } from "./services";
import { TDijkstraPostResponse } from "@/types/dijkstra";

export const useDijkstraMutation = ({ onSuccess, onError }: MutationFunctionType<TDijkstraPostResponse>) => {
    return useMutation({
        mutationFn: ({ data }: MutateFunctionType) => postDijkstraService(data || {}),
        onSuccess: onSuccess,
        onError: onError
    });
}