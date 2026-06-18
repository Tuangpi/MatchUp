import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middlewares/auth";
import { gameService } from "@/services";

export const getGames = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const status = req.query.status as string | undefined;
        const games = await gameService.findAll(status as any);
        res.json({ data: games });
    } catch (error) {
        next(error);
    }
};

export const getGameById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const game = await gameService.findById(id);
        res.json({ data: game });
    } catch (error) {
        next(error);
    }
};

export const createGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const hostId = req.userId!;
        const game = await gameService.create(hostId, req.body);
        res.status(201).json({ data: game });
    } catch (error) {
        next(error);
    }
};

export const updateGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId!;
        const game = await gameService.update(id, userId, req.body);
        res.json({ data: game });
    } catch (error) {
        next(error);
    }
};

export const joinGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gameId = req.params.id as string;
        const userId = req.userId!;
        const result = await gameService.join(gameId, userId, req.body);
        res.status(201).json({ data: result });
    } catch (error) {
        next(error);
    }
};

export const leaveGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gameId = req.params.id as string;
        const userId = req.userId!;
        await gameService.leave(gameId, userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const deleteGame = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const userId = req.userId!;
        await gameService.delete(id, userId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const markAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const gameId = req.params.id as string;
        const userId = req.userId!;
        const { attendees } = req.body;

        if (!Array.isArray(attendees) || attendees.length === 0) {
            return next(Object.assign(new Error("attendees array is required"), { statusCode: 400 }));
        }

        for (const a of attendees) {
            if (!a.participantId || !["PRESENT", "ABSENT"].includes(a.attendanceStatus)) {
                return next(Object.assign(new Error("Each attendee must have participantId and attendanceStatus (PRESENT or ABSENT)"), { statusCode: 400 }));
            }
        }

        const result = await gameService.markAttendance(gameId, userId, attendees);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};
