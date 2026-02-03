import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import app from './index';
import { setupWebSocketHandlers, setIO } from './websocket/taskEvents';
import { logger } from './middleware/logger';
import { initializeAzureAI } from './services/azureAIService';

const PORT = process.env.PORT || 3000;
const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

const prisma = new PrismaClient();

// Make io and prisma available to controllers
app.set('io', io);
app.set('prisma', prisma);

// Set up WebSocket handlers
setupWebSocketHandlers(io);
setIO(io);

// Initialize Azure AI (async, non-blocking)
initializeAzureAI().catch((error) => {
  logger.error('[Server] Failed to initialize Azure AI:', error);
  console.error('[Server] Azure AI initialization failed - help features may not work');
});

httpServer.listen(PORT, () => {
  logger.info(`[Server] Listening on http://localhost:${PORT}`);
  console.log(`[Server] Listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[Server] SIGTERM received, closing server...');
  httpServer.close(() => {
    logger.info('[Server] Server closed');
    process.exit(0);
  });
});
