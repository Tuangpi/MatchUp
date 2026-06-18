import prisma from "@/lib/prisma";
import type { CreateUserInput, UpdateUserInput } from "@/types/user";
import type { $Enums } from "@/lib/generated/prisma/client";

const userService = {
    async findAll() {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                rating: true,
                positions: true,
                createdAt: true,
            },
        });
    },

    async findById(id: string) {
        return prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                rating: true,
                positions: true,
                createdAt: true,
                hostedGames: {
                    select: { id: true, title: true, dateTime: true, status: true },
                },
                gameParticipations: {
                    select: {
                        id: true,
                        team: true,
                        game: { select: { id: true, title: true, dateTime: true, status: true } },
                    },
                },
            },
        });
    },

    async findByEmail(email: string) {
        return prisma.user.findUnique({ where: { email } });
    },

    async create(data: CreateUserInput) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
        }

        // Temporary placeholder — real registration handled by auth/register
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: 'placeholder',
                phone: data.phone,
                avatar: data.avatar,
                positions: (data.positions ?? []) as $Enums.Position[],
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                rating: true,
                positions: true,
                createdAt: true,
            },
        });
    },

    async update(id: string, data: UpdateUserInput) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw Object.assign(new Error("User not found"), { statusCode: 404 });
        }

        return prisma.user.update({
            where: { id },
            data: {
                ...(data.name !== undefined && { name: data.name }),
                ...(data.phone !== undefined && { phone: data.phone }),
                ...(data.avatar !== undefined && { avatar: data.avatar }),
                ...(data.rating !== undefined && { rating: data.rating }),
                ...(data.positions !== undefined && { positions: data.positions as $Enums.Position[] }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true,
                rating: true,
                positions: true,
                createdAt: true,
            },
        });
    },

    async delete(id: string) {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw Object.assign(new Error("User not found"), { statusCode: 404 });
        }

        await prisma.user.delete({ where: { id } });
    },
};

export default userService;
