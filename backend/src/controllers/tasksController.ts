import { Request, Response, NextFunction } from 'express';
import * as tasksService from '../services/tasksService';

export async function getTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.getTask(req.params.id);
    res.json({ task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction) {
  try {
    const task = await tasksService.updateTask(req.params.id, req.body);
    res.json({ task });
  } catch (error) {
    next(error);
  }
}
