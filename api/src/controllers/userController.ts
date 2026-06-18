import type { Request, Response, NextFunction } from "express";
import { userService } from "@/services";

export const getUsers = async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await userService.findAll();
        res.json({ data: users });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const user = await userService.findById(id);
        if (!user) {
            return next(Object.assign(new Error("User not found"), { statusCode: 404 }));
        }
        res.json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await userService.create(req.body);
        res.status(201).json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        const user = await userService.update(id, req.body);
        res.json({ data: user });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id as string;
        await userService.delete(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
