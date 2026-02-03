import { Request, Response, NextFunction } from 'express';
import * as projectsService from '../services/projectsService';

export async function listProjects(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projects = await projectsService.getAllProjects();
    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function getProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const project = await projectsService.getProjectById(req.params.id);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function getProjectTasks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const tasks = await projectsService.getProjectTasks(req.params.id);
    res.json({ tasks });
  } catch (error) {
    next(error);
  }
}
