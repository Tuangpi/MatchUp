import type { Response, NextFunction } from "express";
import type { AuthRequest } from "@/middlewares/auth";
import { authService } from "@/services";

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return next(Object.assign(new Error("Name, email and password are required"), { statusCode: 400 }));
        }
        const result = await authService.register(name, email, password);
        res.status(201).json({ data: result });
    } catch (error) {
        next(error);
    }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(Object.assign(new Error("Email and password are required"), { statusCode: 400 }));
        }
        const result = await authService.login(email, password);
        res.json({ data: result });
    } catch (error) {
        next(error);
    }
};

export const me = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = await authService.me(req.userId!);
        res.json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(Object.assign(new Error("Refresh token is required"), { statusCode: 400 }));
        }
        const tokens = await authService.refresh(refreshToken);
        res.json({ data: tokens });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (refreshToken) {
            await authService.logout(refreshToken);
        }
        res.json({ data: { message: "Logged out successfully" } });
    } catch (error) {
        next(error);
    }
};
