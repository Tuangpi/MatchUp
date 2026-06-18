import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { Message } from "@/types";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000";

export function useMessages(gameId: string) {
    return useQuery({
        queryKey: ["messages", gameId],
        queryFn: async () => {
            const { data } = await api.get<{ data: Message[] }>(`/games/${gameId}/messages`);
            return data.data;
        },
        enabled: !!gameId,
    });
}

export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ gameId, content }: { gameId: string; content: string }) => {
            const { data } = await api.post<{ data: Message }>(`/games/${gameId}/messages`, { content });
            return data.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["messages", variables.gameId] });
        },
    });
}

export function useMarkAttendance() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({
            gameId,
            attendees,
        }: {
            gameId: string;
            attendees: { participantId: string; attendanceStatus: "PRESENT" | "ABSENT" }[];
        }) => {
            const { data } = await api.post(`/games/${gameId}/attendance`, { attendees });
            return data.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
        },
    });
}

interface UseSocketChatOptions {
    gameId: string;
    onNewMessage?: (message: Message) => void;
    onTyping?: (data: { userId: string; isTyping: boolean }) => void;
}

export function useSocketChat({ gameId, onNewMessage, onTyping }: UseSocketChatOptions) {
    const socketRef = useRef<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

    useEffect(() => {
        const token = localStorage.getItem("accessToken");
        if (!token || !gameId) return;

        const socket = io(SOCKET_URL, {
            auth: { token },
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setConnected(true);
            socket.emit("join:game", gameId);
        });

        socket.on("disconnect", () => {
            setConnected(false);
        });

        socket.on("message:new", (message: Message) => {
            onNewMessage?.(message);
        });

        socket.on("message:typing", (data: { userId: string; isTyping: boolean }) => {
            setTypingUsers((prev) => {
                const next = new Set(prev);
                if (data.isTyping) {
                    next.add(data.userId);
                } else {
                    next.delete(data.userId);
                }
                return next;
            });
            onTyping?.(data);
        });

        socket.on("error", (error: { message: string }) => {
            console.error("Socket error:", error.message);
        });

        return () => {
            socket.emit("leave:game", gameId);
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [gameId, onNewMessage, onTyping]);

    const sendMessage = useCallback(
        (content: string) => {
            if (socketRef.current?.connected) {
                socketRef.current.emit("message:send", { gameId, content });
            }
        },
        [gameId]
    );

    const emitTyping = useCallback(
        (isTyping: boolean) => {
            if (socketRef.current?.connected) {
                socketRef.current.emit("message:typing", { gameId, isTyping });
            }
        },
        [gameId]
    );

    return { connected, typingUsers, sendMessage, emitTyping };
}
