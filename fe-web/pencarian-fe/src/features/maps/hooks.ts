import { MutateFunctionType, MutationFunctionType } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { postShortestPathService } from "./services";
import { TShortestPathResponse } from "@/types/dijkstra";

export const useShortestPathMutation = ({ onSuccess, onError }: MutationFunctionType<TShortestPathResponse>) => {
    return useMutation({
        mutationFn: ({ data }: MutateFunctionType) => postShortestPathService(data || {}),
        onSuccess: onSuccess,
        onError: onError
    });
}