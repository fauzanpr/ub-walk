import type { AxiosError } from "axios";

export type ErrorType = AxiosError<{
    detail: string;
    non_field_errors: string[];
    email: string[];
    pin: string[];
    name: string[];
    password: string[];
    old_password: string[];
    new_pin: string[];
    banner: string[];
}>

export type MutationFunctionType<T> = {
    onSuccess?: (data: T) => void | Promise<void>;
    onError?: (error: ErrorType) => void;
}

export type MutateFunctionType = { method: | "POST" | "PUT" | "PATCH" | "DELETE"; id?: string; data?: Record<any, any> };