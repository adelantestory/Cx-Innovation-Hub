import { Router } from 'express';
import * as helpController from '../controllers/helpController';

const router = Router();

// GET /api/help/session/:sessionId - Get all messages for a session
router.get('/session/:sessionId', helpController.getSessionMessages);

// POST /api/help/session/:sessionId/message - Send a message and get AI response
router.post('/session/:sessionId/message', helpController.sendMessage);

// POST /api/help/session/:sessionId/context - Get contextual help
router.post('/session/:sessionId/context', helpController.getContextHelp);

// DELETE /api/help/session/:sessionId - Clear a session
router.delete('/session/:sessionId', helpController.clearSession);

export default router;
