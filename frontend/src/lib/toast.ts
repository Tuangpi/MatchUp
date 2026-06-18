import toast from "react-hot-toast";
import type { AxiosError } from "axios";

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

export function showError(error: unknown) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message =
        axiosError?.response?.data?.message ||
        axiosError?.response?.data?.error ||
        axiosError?.message ||
        "Something went wrong";

    toast.error(message, {
        duration: 4000,
        position: "top-right",
    });
}

export function showSuccess(message: string) {
    toast.success(message, {
        duration: 3000,
        position: "top-right",
    });
}
