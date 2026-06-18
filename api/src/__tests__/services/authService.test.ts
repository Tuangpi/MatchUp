import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const mockPrisma = vi.hoisted(() => ({
    user: { findUnique: vi.fn(), create: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    game: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    gameParticipant: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn() },
    $transaction: vi.fn((queries: any[]) => Promise.all(queries)),
}));

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));
vi.mock("bcryptjs");
vi.mock("jsonwebtoken");

import { authService } from "../../services/authService";

describe("authService", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe("register", () => {
        it("should register a new user successfully", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: "user-1", name: "John", email: "j@e.com", rating: 1200, createdAt: new Date() });
            (bcrypt.hash as any).mockResolvedValue("hashed");
            (jwt.sign as any).mockReturnValue("access-token");
            mockPrisma.refreshToken.create.mockResolvedValue({});

            const result = await authService.register("John", "j@e.com", "pass");
            expect(result.accessToken).toBe("access-token");
            expect(result.user.email).toBe("j@e.com");
        });

        it("should throw 409 on duplicate email", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "existing", email: "j@e.com" });
            await expect(authService.register("John", "j@e.com", "pass"))
                .rejects.toMatchObject({ message: "Email already in use", statusCode: 409 });
        });
    });

    describe("login", () => {
        const mockUser = {
            id: "u1", name: "John", email: "j@e.com", password: "hashed",
            rating: 1200, phone: null, avatar: null, positions: [],
            createdAt: new Date(), updatedAt: new Date(),
        };

        it("should login successfully", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(true);
            (jwt.sign as any).mockReturnValue("token");
            mockPrisma.refreshToken.create.mockResolvedValue({});
            const result = await authService.login("j@e.com", "pass");
            expect(result.accessToken).toBe("token");
        });

        it("should throw 401 on invalid email", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(authService.login("x@y.com", "pass"))
                .rejects.toMatchObject({ message: "Invalid email or password", statusCode: 401 });
        });

        it("should throw 401 on wrong password", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as any).mockResolvedValue(false);
            await expect(authService.login("j@e.com", "wrong"))
                .rejects.toMatchObject({ message: "Invalid email or password", statusCode: 401 });
        });
    });

    describe("me", () => {
        it("should return user when found", async () => {
            const data = { id: "u1", name: "John", email: "j@e.com", hostedGames: [], gameParticipations: [] };
            mockPrisma.user.findUnique.mockResolvedValue(data);
            expect(await authService.me("u1")).toEqual(data);
        });

        it("should throw 404 when not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(authService.me("x")).rejects.toMatchObject({ message: "User not found", statusCode: 404 });
        });
    });

    describe("refresh", () => {
        it("should generate new tokens for valid token", async () => {
            const stored = {
                id: "t1", token: "valid", userId: "u1", user: { id: "u1", email: "j@e.com" },
                expiresAt: new Date(Date.now() + 86400000),
            };
            mockPrisma.refreshToken.findUnique.mockResolvedValue(stored);
            mockPrisma.refreshToken.delete.mockResolvedValue({});
            mockPrisma.refreshToken.create.mockResolvedValue({});
            (jwt.sign as any).mockReturnValue("new-token");
            const result = await authService.refresh("valid");
            expect(result.accessToken).toBe("new-token");
        });

        it("should throw 401 on expired token", async () => {
            const stored = {
                id: "t1", token: "exp", userId: "u1", user: { id: "u1", email: "j@e.com" },
                expiresAt: new Date(Date.now() - 1000),
            };
            mockPrisma.refreshToken.findUnique.mockResolvedValue(stored);
            await expect(authService.refresh("exp")).rejects.toMatchObject({
                message: "Invalid or expired refresh token", statusCode: 401,
            });
        });

        it("should throw 401 when token not found", async () => {
            mockPrisma.refreshToken.findUnique.mockResolvedValue(null);
            await expect(authService.refresh("none")).rejects.toMatchObject({
                message: "Invalid or expired refresh token", statusCode: 401,
            });
        });
    });

    describe("logout", () => {
        it("should delete the refresh token", async () => {
            mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });
            await authService.logout("some-token");
            expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: "some-token" } });
        });
    });
});
