import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import config from "@/config";
import prisma from "@/lib/prisma";

let io: Server | null = null;

export function getIO(): Server {
    if (!io) {
        throw new Error("Socket.IO not initialized");
    }
    return io;
}

export function setupSocket(httpServer: HttpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: config.isProduction ? "http://localhost:5173" : true,
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket, next) => {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error("Authentication required"));
        }

        try {
            const payload = jwt.verify(token as string, config.jwtSecret) as { userId: string; email: string };
            (socket as any).userId = payload.userId;
            (socket as any).userEmail = payload.email;
            next();
        } catch {
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = (socket as any).userId;
        console.log(`Socket connected: user ${userId}`);

        // Join a game room
        socket.on("join:game", async (gameId: string) => {
            // Verify user is a participant
            const participation = await prisma.gameParticipant.findUnique({
                where: { gameId_userId: { gameId, userId } },
            });

            if (!participation) {
                socket.emit("error", { message: "You must be a participant to join this chat room" });
                return;
            }

            socket.join(`game:${gameId}`);
            console.log(`User ${userId} joined game room ${gameId}`);
        });

        // Leave a game room
        socket.on("leave:game", (gameId: string) => {
            socket.leave(`game:${gameId}`);
            console.log(`User ${userId} left game room ${gameId}`);
        });

        // Send a message
        socket.on("message:send", async (data: { gameId: string; content: string }) => {
            const { gameId, content } = data;

            if (!content || typeof content !== "string" || content.trim().length === 0) {
                socket.emit("error", { message: "Content is required" });
                return;
            }

            // Verify user is a participant
            const participation = await prisma.gameParticipant.findUnique({
                where: { gameId_userId: { gameId, userId } },
            });

            if (!participation) {
                socket.emit("error", { message: "Only joined players can send messages" });
                return;
            }

            // Save message to database
            const message = await prisma.message.create({
                data: { gameId, userId, content: content.trim() },
                include: {
                    user: { select: { id: true, name: true, avatar: true } },
                },
            });

            // Broadcast to all users in the game room
            io!.to(`game:${gameId}`).emit("message:new", message);
        });

        // Mark user as typing
        socket.on("message:typing", (data: { gameId: string; isTyping: boolean }) => {
            socket.to(`game:${data.gameId}`).emit("message:typing", {
                userId,
                isTyping: data.isTyping,
            });
        });

        socket.on("disconnect", () => {
            console.log(`Socket disconnected: user ${userId}`);
        });
    });

    return io;
}
