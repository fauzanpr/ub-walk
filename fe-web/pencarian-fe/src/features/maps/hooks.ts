import { MutateFunctionType, MutationFunctionType } from "@/types/api";
import { useMutation } from "@tanstack/react-query";
import { postDijsktraService } from "./services";

export const useDijsktraMutation = ({ onSuccess, onError }: MutationFunctionType<unknown>) => {
    return useMutation({
        mutationFn: ({ data }: MutateFunctionType) => postDijsktraService(data || {}),
        onSuccess: onSuccess,
        onError: onError
    });
}