import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User } from "@/types";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}

function getTokens() {
    return {
        accessToken: localStorage.getItem(ACCESS_KEY),
        refreshToken: localStorage.getItem(REFRESH_KEY),
    };
}

function setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(ACCESS_KEY, accessToken);
    localStorage.setItem(REFRESH_KEY, refreshToken);
}

function clearTokens() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

export function useAuth() {
    const queryClient = useQueryClient();
    const { accessToken, refreshToken } = getTokens();

    const { data: user, isLoading } = useQuery({
        queryKey: ["me"],
        queryFn: async () => {
            if (!accessToken) return null;
            const { data } = await api.get<{ data: User }>("/auth/me");
            return data.data;
        },
        enabled: !!accessToken,
        retry: false,
    });

    const registerMutation = useMutation({
        mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
            const { data } = await api.post<{ data: AuthResponse }>("/auth/register", { name, email, password });
            return data.data;
        },
        onSuccess: (result) => {
            setTokens(result.accessToken, result.refreshToken);
            queryClient.setQueryData(["me"], result.user);
        },
    });

    const loginMutation = useMutation({
        mutationFn: async ({ email, password }: { email: string; password: string }) => {
            const { data } = await api.post<{ data: AuthResponse }>("/auth/login", { email, password });
            return data.data;
        },
        onSuccess: (result) => {
            setTokens(result.accessToken, result.refreshToken);
            queryClient.setQueryData(["me"], result.user);
        },
    });

    const logout = async () => {
        const { refreshToken: rt } = getTokens();
        try {
            await api.post("/auth/logout", { refreshToken: rt });
        } catch {
            // silently fail server-side logout
        }
        clearTokens();
        queryClient.clear();
        window.location.href = "/";
    };

    return {
        user: user ?? null,
        isAuthenticated: !!accessToken && !!user,
        isLoading,
        register: registerMutation.mutateAsync,
        isRegistering: registerMutation.isPending,
        login: loginMutation.mutateAsync,
        isLoggingIn: loginMutation.isPending,
        logout,
    };
}
