/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppConfig } from "@/configs/AppConfig";
import type { CustomParamsSerializer, ParamsSerializerOptions, ResponseType } from "axios";
import axios from "axios";

type TApiRequest = {
    urlKey: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    additionalHeaders?: Record<any, any>;
    data?: any;
    queryParams?: Record<string, string | number | undefined | null>;
    responseType?: ResponseType,
    paramsSerializer?: ParamsSerializerOptions | CustomParamsSerializer | undefined;
};

export const apiRequest = async <T>({
    urlKey,
    method,
    data,
    additionalHeaders,
    queryParams,
    responseType = "json",
    paramsSerializer,
}: TApiRequest): Promise<T> => {
    // const token = getToken();

    // const forceLogout = () => {
    //     window.location.href = APP_URL.LOGIN;
    //     resetPermission();
    // }

    const getDefaultHeader = () => ({
        // ...(isWithAuthorization && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
        ...additionalHeaders
    });

    const instance = axios.create({
        baseURL: AppConfig.BASE_API,
        method,
        headers: getDefaultHeader(),
        withCredentials: true,
        responseType,
        paramsSerializer
    });

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            return Promise.reject(error);
        }
    );

    const response = await instance.request({
        url: urlKey,
        method,
        data,
        params: queryParams // ✅ let axios handle query string!
    });

    return response.data;
};

