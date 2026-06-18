import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middlewares/auth";
import { messageService } from "@/services";

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gameId = req.params.gameId as string;
        const messages = await messageService.findByGame(gameId);
        res.json({ data: messages });
    } catch (error) {
        next(error);
    }
};

export const createMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gameId = req.params.gameId as string;
        const userId = req.userId!;
        const { content } = req.body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return next(Object.assign(new Error("Content is required"), { statusCode: 400 }));
        }

        const message = await messageService.create(gameId, userId, content.trim());
        res.status(201).json({ data: message });
    } catch (error) {
        next(error);
    }
};
