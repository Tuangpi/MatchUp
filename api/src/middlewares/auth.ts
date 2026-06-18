import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "@/config";

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next(Object.assign(new Error("Authentication required"), { statusCode: 401 }));
    }

    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
        req.userId = payload.userId;
        req.userEmail = payload.email;
        next();
    } catch {
        return next(Object.assign(new Error("Invalid or expired token"), { statusCode: 401 }));
    }
};

// Optional auth — sets userId if token present, but doesn't fail
export const optionalAuth = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return next();
    }

    const token = header.split(" ")[1];
    try {
        const payload = jwt.verify(token, config.jwtSecret) as { userId: string; email: string };
        req.userId = payload.userId;
        req.userEmail = payload.email;
    } catch {
        // silently ignore
    }
    next();
};
