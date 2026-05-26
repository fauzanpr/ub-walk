import { MutateFunctionType, MutationFunctionType } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { postDijsktraService } from "./services";
import { TDijkstraPostResponse } from "@/types/dijkstra";

export const useDijsktraMutation = ({ onSuccess, onError }: MutationFunctionType<TDijkstraPostResponse>) => {
    return useMutation({
        mutationFn: ({ data }: MutateFunctionType) => postDijsktraService(data || {}),
        onSuccess: onSuccess,
        onError: onError
    });
}