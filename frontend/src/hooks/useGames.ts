import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Game } from "@/types";

export function useGames(status?: string) {
    return useQuery({
        queryKey: ["games", status],
        queryFn: async () => {
            const params = status ? { status } : {};
            const { data } = await api.get<{ data: Game[] }>("/games", { params });
            return data.data;
        },
    });
}

export function useGame(id: string) {
    return useQuery({
        queryKey: ["game", id],
        queryFn: async () => {
            const { data } = await api.get<{ data: Game }>(`/games/${id}`);
            return data.data;
        },
        enabled: !!id,
    });
}

export function useCreateGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (input: Partial<Game>) => {
            const { data } = await api.post<{ data: Game }>("/games", input);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}

export function useDeleteGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/games/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}

export function useJoinGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ gameId, team }: { gameId: string; team: string }) => {
            const { data } = await api.post(`/games/${gameId}/join`, { team });
            return data.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
            queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}

export function useLeaveGame() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (gameId: string) => {
            await api.post(`/games/${gameId}/leave`);
        },
        onSuccess: (_data, gameId) => {
            queryClient.invalidateQueries({ queryKey: ["game", gameId] });
            queryClient.invalidateQueries({ queryKey: ["games"] });
        },
    });
}
