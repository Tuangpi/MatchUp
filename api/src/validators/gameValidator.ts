import type { Request, Response, NextFunction } from "express";
import type { $Enums } from "@/lib/generated/prisma/client";

export const validateCreateGame = (req: Request, _res: Response, next: NextFunction) => {
    const { title, location, dateTime } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
        return next(Object.assign(new Error("Title is required"), { statusCode: 400 }));
    }
    if (!location || typeof location !== "string" || location.trim().length === 0) {
        return next(Object.assign(new Error("Location is required"), { statusCode: 400 }));
    }
    if (!dateTime || isNaN(Date.parse(dateTime))) {
        return next(Object.assign(new Error("Valid dateTime is required (ISO string)"), { statusCode: 400 }));
    }

    next();
};

export const validateJoinGame = (req: Request, _res: Response, next: NextFunction) => {
    const { team } = req.body;
    const validTeams = ["TEAM_A", "TEAM_B"];

    if (!team || !validTeams.includes(team as string)) {
        return next(Object.assign(new Error("Team must be TEAM_A or TEAM_B"), { statusCode: 400 }));
    }

    next();
};
