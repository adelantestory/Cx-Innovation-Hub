import { Router } from 'express';
import * as commentsController from '../controllers/commentsController';

const router = Router();

// GET /api/comments/task/:taskId - Get all comments for a task
router.get('/task/:taskId', commentsController.getTaskComments);

// POST /api/comments/task/:taskId - Create a new comment
router.post('/task/:taskId', commentsController.createComment);

// PATCH /api/comments/:commentId - Update a comment
router.patch('/:commentId', commentsController.updateComment);

// DELETE /api/comments/:commentId - Delete a comment
router.delete('/:commentId', commentsController.deleteComment);

export default router;
