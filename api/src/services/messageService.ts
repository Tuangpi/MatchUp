import prisma from "@/lib/prisma";

const messageService = {
    async findByGame(gameId: string) {
        return prisma.message.findMany({
            where: { gameId },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
            orderBy: { createdAt: "asc" },
        });
    },

    async create(gameId: string, userId: string, content: string) {
        // Verify user is a participant in this game
        const participation = await prisma.gameParticipant.findUnique({
            where: { gameId_userId: { gameId, userId } },
        });

        if (!participation) {
            throw Object.assign(
                new Error("Only joined players can send messages"),
                { statusCode: 403 }
            );
        }

        return prisma.message.create({
            data: { gameId, userId, content },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
            },
        });
    },
};

export default messageService;
