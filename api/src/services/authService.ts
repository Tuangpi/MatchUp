import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import prisma from "@/lib/prisma";
import config from "@/config";

interface TokenPayload {
    userId: string;
    email: string;
}

export const authService = {
    async register(name: string, email: string, password: string) {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw Object.assign(new Error("Email already in use"), { statusCode: 409 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword },
            select: { id: true, name: true, email: true, rating: true, createdAt: true },
        });

        const tokens = await this.generateTokens(user.id, user.email);
        return { user, ...tokens };
    },

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw Object.assign(new Error("Invalid email or password"), { statusCode: 401 });
        }

        const tokens = await this.generateTokens(user.id, user.email);
        const { password: _, ...userData } = user;
        return { user: userData, ...tokens };
    },

    async me(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, name: true, email: true, phone: true, avatar: true,
                rating: true, positions: true, createdAt: true, updatedAt: true,
                hostedGames: { select: { id: true, title: true, dateTime: true, status: true } },
                gameParticipations: {
                    select: {
                        id: true, team: true,
                        game: { select: { id: true, title: true, dateTime: true, status: true } },
                    },
                },
            },
        });
        if (!user) {
            throw Object.assign(new Error("User not found"), { statusCode: 404 });
        }
        return user;
    },

    async refresh(refreshToken: string) {
        const stored = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });

        if (!stored || stored.expiresAt < new Date()) {
            // Clean up expired tokens
            if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
            throw Object.assign(new Error("Invalid or expired refresh token"), { statusCode: 401 });
        }

        // Delete old token (rotation)
        await prisma.refreshToken.delete({ where: { id: stored.id } });

        const tokens = await this.generateTokens(stored.user.id, stored.user.email);
        return tokens;
    },

    async logout(refreshToken: string) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    },

    async generateTokens(userId: string, email: string): Promise<{ accessToken: string; refreshToken: string }> {
        const accessToken = jwt.sign(
            { userId, email } satisfies TokenPayload,
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn } as jwt.SignOptions,
        );

        const rawRefreshToken = crypto.randomBytes(config.refreshTokenBytes).toString("hex");
        await prisma.refreshToken.create({
            data: {
                token: rawRefreshToken,
                userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });

        return { accessToken, refreshToken: rawRefreshToken };
    },
};
