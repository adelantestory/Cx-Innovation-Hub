import { Request, Response, NextFunction } from 'express';
import * as helpService from '../services/helpService';

export async function getSessionMessages(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;
    const messages = await helpService.getSessionMessages(sessionId);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
}

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;
    const { userId, content, screenContext } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'userId and content are required',
      });
    }

    const result = await helpService.sendMessage({
      sessionId,
      userId,
      content,
      screenContext,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getContextHelp(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;
    const { screenContext } = req.body;

    if (!screenContext) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'screenContext is required',
      });
    }

    const message = await helpService.getContextHelp({
      sessionId,
      screenContext,
    });

    res.json({ message });
  } catch (error) {
    next(error);
  }
}

export async function clearSession(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { sessionId } = req.params;
    const result = await helpService.clearSession(sessionId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}
