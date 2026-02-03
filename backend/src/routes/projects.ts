import { Router } from 'express';
import * as projectsController from '../controllers/projectsController';

const router = Router();

router.get('/', projectsController.listProjects);
router.get('/:id', projectsController.getProject);
router.get('/:id/tasks', projectsController.getProjectTasks);

export default router;
