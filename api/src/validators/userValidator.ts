import type { Request, Response, NextFunction } from "express";

export const validateCreateUser = (req: Request, _res: Response, next: NextFunction) => {
    const { name, email } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
        return next(Object.assign(new Error("Name is required"), { statusCode: 400 }));
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
        return next(Object.assign(new Error("Valid email is required"), { statusCode: 400 }));
    }

    next();
};

export const validateUpdateUser = (req: Request, _res: Response, next: NextFunction) => {
    const body = req.body;
    if (Object.keys(body).length === 0) {
        return next(Object.assign(new Error("No fields to update"), { statusCode: 400 }));
    }
    next();
};
