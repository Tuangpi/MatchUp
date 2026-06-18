import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

// Mock axios
const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock("../../lib/axios", () => ({
    default: {
        get: (...args: any[]) => mockGet(...args),
        post: (...args: any[]) => mockPost(...args),
    },
}));

import { useAuth } from "../../hooks/useAuth";

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children);
    };
}

beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
});

describe("useAuth", () => {
    it("should return not authenticated when no token", () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it("should return loading state when token exists", () => {
        localStorage.setItem("accessToken", "fake-token");
        mockGet.mockReturnValue(new Promise(() => { }));

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
        expect(result.current.isLoading).toBe(true);
    });

    it("should return user data when token is valid", async () => {
        localStorage.setItem("accessToken", "valid-token");
        const mockUser = { id: "u1", name: "John", email: "john@example.com", rating: 1200 };
        mockGet.mockResolvedValue({ data: { data: mockUser } });

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

        await waitFor(() => expect(result.current.isLoading).toBe(false));
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.user?.name).toBe("John");
    });

    it("should register a user", async () => {
        const mockResponse = {
            data: {
                data: {
                    user: { id: "u1", name: "John", email: "john@example.com" },
                    accessToken: "new-access",
                    refreshToken: "new-refresh",
                },
            },
        };
        mockPost.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
        await result.current.register({ name: "John", email: "john@example.com", password: "pass" });

        expect(localStorage.getItem("accessToken")).toBe("new-access");
        expect(localStorage.getItem("refreshToken")).toBe("new-refresh");
        expect(mockPost).toHaveBeenCalledWith("/auth/register", {
            name: "John", email: "john@example.com", password: "pass",
        });
    });

    it("should login a user", async () => {
        const mockResponse = {
            data: {
                data: {
                    user: { id: "u1", name: "John", email: "john@example.com" },
                    accessToken: "login-access",
                    refreshToken: "login-refresh",
                },
            },
        };
        mockPost.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
        await result.current.login({ email: "john@example.com", password: "pass" });

        expect(localStorage.getItem("accessToken")).toBe("login-access");
    });

    it("should log out a user", async () => {
        localStorage.setItem("accessToken", "token");
        localStorage.setItem("refreshToken", "refresh");
        mockPost.mockResolvedValue({});

        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });
        await result.current.logout();

        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });
});
