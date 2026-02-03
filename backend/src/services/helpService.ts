import { PrismaClient } from '@prisma/client';
import { getAIResponse, getContextualHelp } from './azureAIService';
import { logger } from '../middleware/logger';

const prisma = new PrismaClient();

/**
 * Get all help messages for a session
 */
export async function getSessionMessages(sessionId: string) {
  const messages = await prisma.helpMessage.findMany({
    where: { sessionId },
    orderBy: { createdAt: 'asc' },
  });

  return messages.map((msg) => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
  }));
}

/**
 * Send a user message and get AI response
 */
export async function sendMessage(data: {
  sessionId: string;
  userId: string;
  content: string;
  screenContext?: string;
}) {
  try {
    // Save user message
    const userMessage = await prisma.helpMessage.create({
      data: {
        sessionId: data.sessionId,
        sender: 'user',
        content: data.content,
        screenContext: data.screenContext || null,
      },
    });

    // Get conversation history for context (last 10 messages before this one)
    const previousMessages = await prisma.helpMessage.findMany({
      where: { sessionId: data.sessionId },
      orderBy: { createdAt: 'desc' },
      take: 10, // Last 10 messages for context
    });

    // Reverse to get chronological order (oldest to newest) for the agent
    const conversationHistory = previousMessages
      .reverse()
      .filter((msg) => msg.id !== userMessage.id)
      .map((msg) => ({
        role: msg.sender as 'user' | 'assistant',
        content: msg.content,
      }));

    // Get AI response using Azure AI service
    const aiResponseText = await getAIResponse(
      data.content,
      conversationHistory,
      data.screenContext
    );

    // Save AI response
    const aiMessage = await prisma.helpMessage.create({
      data: {
        sessionId: data.sessionId,
        sender: 'ai',
        content: aiResponseText,
        screenContext: data.screenContext || null,
      },
    });

    return {
      userMessage: {
        ...userMessage,
        createdAt: userMessage.createdAt.toISOString(),
      },
      aiMessage: {
        ...aiMessage,
        createdAt: aiMessage.createdAt.toISOString(),
      },
    };
  } catch (error) {
    // Log the actual error for debugging
    logger.error('[Help Service] Error getting AI response:', error);

    // Save error message as AI response
    const errorMessage = await prisma.helpMessage.create({
      data: {
        sessionId: data.sessionId,
        sender: 'ai',
        content:
          'I apologize, but I encountered an error processing your request. Please try again.',
        screenContext: data.screenContext || null,
      },
    });

    return {
      userMessage: null,
      aiMessage: {
        ...errorMessage,
        createdAt: errorMessage.createdAt.toISOString(),
      },
      error: 'Failed to get AI response',
    };
  }
}

/**
 * Get contextual help for a specific screen
 */
export async function getContextHelp(data: {
  sessionId: string;
  screenContext: string;
}) {
  try {
    const helpText = await getContextualHelp(data.screenContext);

    const aiMessage = await prisma.helpMessage.create({
      data: {
        sessionId: data.sessionId,
        sender: 'ai',
        content: helpText,
        screenContext: data.screenContext,
      },
    });

    return {
      ...aiMessage,
      createdAt: aiMessage.createdAt.toISOString(),
    };
  } catch (error) {
    logger.error('[Help Service] Error getting contextual help:', error);
    throw new Error('Failed to get contextual help');
  }
}

/**
 * Clear a help session
 */
export async function clearSession(sessionId: string) {
  await prisma.helpMessage.deleteMany({
    where: { sessionId },
  });

  return { success: true };
}
