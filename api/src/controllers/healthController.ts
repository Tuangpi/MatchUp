import type { Request, Response } from 'express';
import { healthService } from '@/services';

export const getHealth = (_req: Request, res: Response) => {
    const health = healthService.check();
    res.json(health);
};
