import { Router } from 'express';
import * as tasksController from '../controllers/tasksController';

const router = Router();

router.get('/:id', tasksController.getTask);
router.patch('/:id', tasksController.updateTask);

export default router;
