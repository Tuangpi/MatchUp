import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    game: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    gameParticipant: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn((queries: any[]) => Promise.all(queries)),
}));

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

import userService from "../../services/userService";

describe("userService", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe("findAll", () => {
        it("should return all users", async () => {
            const users = [{ id: "u1", name: "John", email: "j@e.com", rating: 1200, phone: null, avatar: null, positions: [], createdAt: new Date() }];
            mockPrisma.user.findMany.mockResolvedValue(users);
            const result = await userService.findAll();
            expect(result).toHaveLength(1);
            expect(result[0].email).toBe("j@e.com");
        });
    });

    describe("findById", () => {
        it("should return user when found", async () => {
            const user = { id: "u1", name: "John", email: "j@e.com", rating: 1200, hostedGames: [], gameParticipations: [] };
            mockPrisma.user.findUnique.mockResolvedValue(user);
            expect(await userService.findById("u1")).toEqual(user);
        });

        it("should return null when not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            expect(await userService.findById("none")).toBeNull();
        });
    });

    describe("findByEmail", () => {
        it("should find user by email", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "u1", email: "j@e.com" });
            const result = await userService.findByEmail("j@e.com");
            expect(result?.email).toBe("j@e.com");
        });
    });

    describe("create", () => {
        it("should create user when email not taken", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({ id: "u1", name: "John", email: "j@e.com", rating: 1200 });
            const result = await userService.create({ name: "John", email: "j@e.com" });
            expect(result.email).toBe("j@e.com");
        });

        it("should throw 409 when email taken", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "existing", email: "j@e.com" });
            await expect(userService.create({ name: "John", email: "j@e.com" }))
                .rejects.toMatchObject({ message: "Email already in use", statusCode: 409 });
        });
    });

    describe("update", () => {
        it("should update user fields", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
            mockPrisma.user.update.mockResolvedValue({ id: "u1", name: "New", rating: 1300 });
            const result = await userService.update("u1", { name: "New", rating: 1300 });
            expect(result.name).toBe("New");
        });

        it("should throw 404 when user not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(userService.update("none", { name: "New" }))
                .rejects.toMatchObject({ message: "User not found", statusCode: 404 });
        });
    });

    describe("delete", () => {
        it("should delete user when found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({ id: "u1" });
            mockPrisma.user.delete.mockResolvedValue({} as any);
            await userService.delete("u1");
            expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: "u1" } });
        });

        it("should throw 404 when not found", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await expect(userService.delete("none")).rejects.toMatchObject({ message: "User not found", statusCode: 404 });
        });
    });
});
