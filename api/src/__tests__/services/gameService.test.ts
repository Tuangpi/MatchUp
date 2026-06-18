import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPrisma = vi.hoisted(() => ({
    game: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
    gameParticipant: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn(), update: vi.fn() },
    user: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    message: { findMany: vi.fn(), create: vi.fn() },
    refreshToken: { findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn((queries: any[]) => Promise.all(queries)),
}));

vi.mock("../../lib/prisma", () => ({ default: mockPrisma }));

import gameService from "../../services/gameService";

describe("gameService", () => {
    beforeEach(() => { vi.clearAllMocks(); });

    describe("findAll", () => {
        it("should return all games with no status filter", async () => {
            const games = [{ id: "g1", title: "Game 1", status: "OPEN", host: {}, participants: [], _count: { messages: 0 } }];
            mockPrisma.game.findMany.mockResolvedValue(games);
            expect(await gameService.findAll()).toEqual(games);
        });

        it("should filter games by status", async () => {
            mockPrisma.game.findMany.mockResolvedValue([]);
            await gameService.findAll("OPEN");
            expect(mockPrisma.game.findMany).toHaveBeenCalledWith(
                expect.objectContaining({ where: { status: "OPEN" } })
            );
        });
    });

    describe("findById", () => {
        it("should return a game when it exists", async () => {
            const game = { id: "g1", title: "Game 1", host: {}, participants: [] };
            mockPrisma.game.findUnique.mockResolvedValue(game);
            expect(await gameService.findById("g1")).toEqual(game);
        });

        it("should throw 404 when game is not found", async () => {
            mockPrisma.game.findUnique.mockResolvedValue(null);
            await expect(gameService.findById("none")).rejects.toMatchObject({ message: "Game not found", statusCode: 404 });
        });
    });

    describe("create", () => {
        it("should create a game successfully", async () => {
            const game = { id: "g1", hostId: "u1", title: "Test", location: "Here", dateTime: new Date(), maxPlayers: 10, teamAPlayers: 5, teamBPlayers: 5, pricePerHead: 0, notes: null, host: {} };
            mockPrisma.game.create.mockResolvedValue(game);
            const result = await gameService.create("u1", { title: "Test", location: "Here", dateTime: "2026-07-01T18:00:00Z" });
            expect(result.id).toBe("g1");
        });

        it("should create a game with custom options", async () => {
            mockPrisma.game.create.mockResolvedValue({} as any);
            await gameService.create("u1", { title: "Pro", location: "Stadium", dateTime: "2026-08-01T18:00:00Z", maxPlayers: 14, teamAPlayers: 7, teamBPlayers: 7, pricePerHead: 50000, notes: "Bring water" });
            expect(mockPrisma.game.create).toHaveBeenCalled();
        });
    });

    describe("join", () => {
        const baseGame = { id: "g1", hostId: "u1", maxPlayers: 10, status: "OPEN", participants: [] };

        it("should allow a user to join an open game", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ ...baseGame, participants: [] });
            mockPrisma.gameParticipant.create.mockResolvedValue({ id: "p1", gameId: "g1", userId: "u2", team: "TEAM_A", user: { id: "u2", name: "Player 2" } });
            const result = await gameService.join("g1", "u2", { team: "TEAM_A" });
            expect(result.team).toBe("TEAM_A");
        });

        it("should throw 404 when game not found", async () => {
            mockPrisma.game.findUnique.mockResolvedValue(null);
            await expect(gameService.join("none", "u2", { team: "TEAM_A" })).rejects.toMatchObject({ message: "Game not found", statusCode: 404 });
        });

        it("should throw 400 when game is not open", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ ...baseGame, status: "FULL", participants: [] });
            await expect(gameService.join("g1", "u2", { team: "TEAM_A" })).rejects.toMatchObject({ message: "Game is not open for joining", statusCode: 400 });
        });

        it("should throw 409 when already joined", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ ...baseGame, participants: [{ userId: "u2" }] });
            await expect(gameService.join("g1", "u2", { team: "TEAM_A" })).rejects.toMatchObject({ message: "Already joined this game", statusCode: 409 });
        });

        it("should throw 400 when game is full", async () => {
            const participants = Array(10).fill(null).map((_, i) => ({ userId: `u${i}` }));
            mockPrisma.game.findUnique.mockResolvedValue({ ...baseGame, participants });
            await expect(gameService.join("g1", "new", { team: "TEAM_B" })).rejects.toMatchObject({ message: "Game is full", statusCode: 400 });
        });

        it("should auto-set status to FULL at max players", async () => {
            const participants = Array(9).fill(null).map((_, i) => ({ userId: `u${i}` }));
            mockPrisma.game.findUnique.mockResolvedValue({ ...baseGame, participants });
            mockPrisma.gameParticipant.create.mockResolvedValue({} as any);
            await gameService.join("g1", "new", { team: "TEAM_B" });
            expect(mockPrisma.game.update).toHaveBeenCalledWith({ where: { id: "g1" }, data: { status: "FULL" } });
        });
    });

    describe("update", () => {
        it("should update when user is host", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ id: "g1", hostId: "u1" });
            mockPrisma.game.update.mockResolvedValue({ id: "g1", title: "Updated", host: {}, participants: [] });
            const result = await gameService.update("g1", "u1", { title: "Updated" });
            expect(result.title).toBe("Updated");
        });

        it("should throw 403 when non-host updates", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ id: "g1", hostId: "u1" });
            await expect(gameService.update("g1", "u2", { title: "Hacked" })).rejects.toMatchObject({ message: "Only the host can update the game", statusCode: 403 });
        });

        it("should throw 404 when game not found", async () => {
            mockPrisma.game.findUnique.mockResolvedValue(null);
            await expect(gameService.update("none", "u1", { title: "New" })).rejects.toMatchObject({ message: "Game not found", statusCode: 404 });
        });
    });

    describe("leave", () => {
        it("should remove a participant", async () => {
            mockPrisma.gameParticipant.findUnique.mockResolvedValue({ id: "p1", gameId: "g1", userId: "u2" });
            mockPrisma.gameParticipant.delete.mockResolvedValue({} as any);
            mockPrisma.gameParticipant.count.mockResolvedValue(5);
            mockPrisma.game.findUnique.mockResolvedValue({ maxPlayers: 10, status: "OPEN" });
            await gameService.leave("g1", "u2");
            expect(mockPrisma.gameParticipant.delete).toHaveBeenCalled();
        });

        it("should throw 404 when not a participant", async () => {
            mockPrisma.gameParticipant.findUnique.mockResolvedValue(null);
            await expect(gameService.leave("g1", "u2")).rejects.toMatchObject({ message: "Not a participant of this game", statusCode: 404 });
        });

        it("should reset FULL to OPEN after leave", async () => {
            mockPrisma.gameParticipant.findUnique.mockResolvedValue({ id: "p1", gameId: "g1", userId: "u2" });
            mockPrisma.gameParticipant.delete.mockResolvedValue({} as any);
            mockPrisma.gameParticipant.count.mockResolvedValue(3);
            mockPrisma.game.findUnique.mockResolvedValue({ maxPlayers: 10, status: "FULL" });
            await gameService.leave("g1", "u2");
            expect(mockPrisma.game.update).toHaveBeenCalledWith({ where: { id: "g1" }, data: { status: "OPEN" } });
        });
    });

    describe("delete", () => {
        it("should delete when user is host", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ id: "g1", hostId: "u1" });
            mockPrisma.game.delete.mockResolvedValue({} as any);
            await gameService.delete("g1", "u1");
            expect(mockPrisma.game.delete).toHaveBeenCalledWith({ where: { id: "g1" } });
        });

        it("should throw 403 when non-host deletes", async () => {
            mockPrisma.game.findUnique.mockResolvedValue({ id: "g1", hostId: "u1" });
            await expect(gameService.delete("g1", "u2")).rejects.toMatchObject({ message: "Only the host can delete the game", statusCode: 403 });
        });

        it("should throw 404 when game not found", async () => {
            mockPrisma.game.findUnique.mockResolvedValue(null);
            await expect(gameService.delete("none", "u1")).rejects.toMatchObject({ message: "Game not found", statusCode: 404 });
        });
    });
});
