import type { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    details?: unknown;
}

const errorHandler = (
    err: AppError,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    console.error(`[ERROR] ${statusCode} - ${message}`, err.details || '');

    res.status(statusCode).json({
        error: {
            message,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
        },
    });
};

export default errorHandler;
