import { Request, Response, NextFunction } from 'express';
import * as commentsService from '../services/commentsService';

export async function getTaskComments(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const comments = await commentsService.getTaskComments(taskId);
    res.json({ comments });
  } catch (error) {
    next(error);
  }
}

export async function createComment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'authorId and content are required',
      });
    }

    const comment = await commentsService.createComment({
      taskId,
      authorId,
      content,
    });

    // Broadcast comment:added event via WebSocket
    const io = req.app.get('io');
    if (io) {
      // Get the task to find the projectId
      const task = await (req.app.get('prisma') as any).task.findUnique({
        where: { id: taskId },
        select: { projectId: true },
      });

      if (task) {
        io.to(`project:${task.projectId}`).emit('comment:added', {
          comment,
          taskId,
        });
      }
    }

    res.status(201).json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function updateComment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { commentId } = req.params;
    const { authorId, content } = req.body;

    if (!authorId || !content) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'authorId and content are required',
      });
    }

    const comment = await commentsService.updateComment(
      commentId,
      authorId,
      content
    );

    // Broadcast comment:updated event via WebSocket
    const io = req.app.get('io');
    if (io && comment) {
      const task = await (req.app.get('prisma') as any).task.findUnique({
        where: { id: comment.taskId },
        select: { projectId: true },
      });

      if (task) {
        io.to(`project:${task.projectId}`).emit('comment:updated', {
          comment,
        });
      }
    }

    res.json({ comment });
  } catch (error) {
    next(error);
  }
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { commentId } = req.params;
    const { authorId } = req.body;

    if (!authorId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'authorId is required',
      });
    }

    // Get comment before deletion to know the taskId for WebSocket broadcast
    const prisma = req.app.get('prisma');
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { taskId: true },
    });

    await commentsService.deleteComment(commentId, authorId);

    // Broadcast comment:deleted event via WebSocket
    const io = req.app.get('io');
    if (io && comment) {
      const task = await prisma.task.findUnique({
        where: { id: comment.taskId },
        select: { projectId: true },
      });

      if (task) {
        io.to(`project:${task.projectId}`).emit('comment:deleted', {
          commentId,
          taskId: comment.taskId,
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}
