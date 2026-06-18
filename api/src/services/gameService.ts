import prisma from "@/lib/prisma";
import type { CreateGameInput, UpdateGameInput, JoinGameInput } from "@/types/game";
import type { $Enums } from "@/lib/generated/prisma/client";

const gameService = {
    async findAll(status?: $Enums.GameStatus) {
        return prisma.game.findMany({
            where: status ? { status } : undefined,
            include: {
                host: { select: { id: true, name: true, avatar: true, rating: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true, rating: true } },
                    },
                },
                _count: { select: { messages: true } },
            },
            orderBy: { dateTime: "asc" },
        });
    },

    async findById(id: string) {
        const game = await prisma.game.findUnique({
            where: { id },
            include: {
                host: { select: { id: true, name: true, avatar: true, rating: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true, rating: true } },
                    },
                },
            },
        });

        if (!game) {
            throw Object.assign(new Error("Game not found"), { statusCode: 404 });
        }

        return game;
    },

    async create(hostId: string, data: CreateGameInput) {
        return prisma.game.create({
            data: {
                hostId,
                title: data.title,
                location: data.location,
                dateTime: new Date(data.dateTime),
                maxPlayers: data.maxPlayers ?? 10,
                teamAPlayers: data.teamAPlayers ?? 5,
                teamBPlayers: data.teamBPlayers ?? 5,
                pricePerHead: data.pricePerHead ?? 0,
                notes: data.notes,
            },
            include: {
                host: { select: { id: true, name: true, avatar: true, rating: true } },
            },
        });
    },

    async update(id: string, userId: string, data: UpdateGameInput) {
        const game = await prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw Object.assign(new Error("Game not found"), { statusCode: 404 });
        }
        if (game.hostId !== userId) {
            throw Object.assign(new Error("Only the host can update the game"), { statusCode: 403 });
        }

        return prisma.game.update({
            where: { id },
            data: {
                ...(data.title !== undefined && { title: data.title }),
                ...(data.location !== undefined && { location: data.location }),
                ...(data.dateTime !== undefined && { dateTime: new Date(data.dateTime) }),
                ...(data.maxPlayers !== undefined && { maxPlayers: data.maxPlayers }),
                ...(data.teamAPlayers !== undefined && { teamAPlayers: data.teamAPlayers }),
                ...(data.teamBPlayers !== undefined && { teamBPlayers: data.teamBPlayers }),
                ...(data.pricePerHead !== undefined && { pricePerHead: data.pricePerHead }),
                ...(data.status !== undefined && { status: data.status }),
                ...(data.notes !== undefined && { notes: data.notes }),
            },
            include: {
                host: { select: { id: true, name: true, avatar: true, rating: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, avatar: true, rating: true } },
                    },
                },
            },
        });
    },

    async join(gameId: string, userId: string, data: JoinGameInput) {
        const game = await prisma.game.findUnique({
            where: { id: gameId },
            include: { participants: true },
        });
        if (!game) {
            throw Object.assign(new Error("Game not found"), { statusCode: 404 });
        }
        if (game.status !== "OPEN") {
            throw Object.assign(new Error("Game is not open for joining"), { statusCode: 400 });
        }

        const alreadyJoined = game.participants.some((p) => p.userId === userId);
        if (alreadyJoined) {
            throw Object.assign(new Error("Already joined this game"), { statusCode: 409 });
        }

        const totalParticipants = game.participants.length;
        if (totalParticipants >= game.maxPlayers) {
            throw Object.assign(new Error("Game is full"), { statusCode: 400 });
        }

        const participation = await prisma.gameParticipant.create({
            data: { gameId, userId, team: data.team },
            include: {
                user: { select: { id: true, name: true, avatar: true, rating: true } },
            },
        });

        // Auto-set status to FULL when max reached
        const updatedCount = totalParticipants + 1;
        if (updatedCount >= game.maxPlayers) {
            await prisma.game.update({ where: { id: gameId }, data: { status: "FULL" } });
        }

        return participation;
    },

    async leave(gameId: string, userId: string) {
        const participation = await prisma.gameParticipant.findUnique({
            where: { gameId_userId: { gameId, userId } },
        });
        if (!participation) {
            throw Object.assign(new Error("Not a participant of this game"), { statusCode: 404 });
        }

        await prisma.gameParticipant.delete({
            where: { gameId_userId: { gameId, userId } },
        });

        // Reset status to OPEN if it was FULL
        const remaining = await prisma.gameParticipant.count({ where: { gameId } });
        const game = await prisma.game.findUnique({ where: { id: gameId }, select: { maxPlayers: true, status: true } });
        if (game && game.status === "FULL" && remaining < game.maxPlayers) {
            await prisma.game.update({ where: { id: gameId }, data: { status: "OPEN" } });
        }
    },

    async markAttendance(gameId: string, userId: string, attendees: { participantId: string; attendanceStatus: "PRESENT" | "ABSENT" }[]) {
        const game = await prisma.game.findUnique({ where: { id: gameId } });
        if (!game) {
            throw Object.assign(new Error("Game not found"), { statusCode: 404 });
        }
        if (game.hostId !== userId) {
            throw Object.assign(new Error("Only the host can mark attendance"), { statusCode: 403 });
        }

        // Attendance can only be updated after match start time
        if (new Date() < game.dateTime) {
            throw Object.assign(new Error("Attendance can only be marked after the match start time"), { statusCode: 400 });
        }

        const updates = attendees.map((a) =>
            prisma.gameParticipant.update({
                where: { id: a.participantId },
                data: { attendanceStatus: a.attendanceStatus },
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                },
            })
        );

        return prisma.$transaction(updates);
    },

    async delete(id: string, userId: string) {
        const game = await prisma.game.findUnique({ where: { id } });
        if (!game) {
            throw Object.assign(new Error("Game not found"), { statusCode: 404 });
        }
        if (game.hostId !== userId) {
            throw Object.assign(new Error("Only the host can delete the game"), { statusCode: 403 });
        }

        await prisma.game.delete({ where: { id } });
    },
};

export default gameService;
