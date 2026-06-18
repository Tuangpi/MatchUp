import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
    message: { findMany: vi.fn(), create: vi.fn() },
    gameParticipant: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    game: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn((queries: any[]) => Promise.all(queries)),
}));

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

import messageService from "../../services/messageService";

describe("messageService", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe("findByGame", () => {
        it("should return messages for a game", async () => {
            const messages = [{ id: "m1", content: "Hello!", user: { id: "u1", name: "John" } }];
            mockPrisma.message.findMany.mockResolvedValue(messages);
            const result = await messageService.findByGame("g1");
            expect(result).toEqual(messages);
            expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
                where: { gameId: "g1" },
                include: { user: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: "asc" },
            });
        });
    });

    describe("create", () => {
        it("should create a message when user is a participant", async () => {
            mockPrisma.gameParticipant.findUnique.mockResolvedValue({ id: "p1", gameId: "g1", userId: "u1" });
            const msg = { id: "m1", content: "Hello!", gameId: "g1", userId: "u1", user: { id: "u1", name: "John" } };
            mockPrisma.message.create.mockResolvedValue(msg);
            const result = await messageService.create("g1", "u1", "Hello!");
            expect(result.content).toBe("Hello!");
        });

        it("should throw 403 when user is not a participant", async () => {
            mockPrisma.gameParticipant.findUnique.mockResolvedValue(null);
            await expect(messageService.create("g1", "non-participant", "Hi"))
                .rejects.toMatchObject({ message: "Only joined players can send messages", statusCode: 403 });
        });
    });
});
