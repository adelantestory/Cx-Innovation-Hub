import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../middleware/logger';

let io: SocketIOServer;

export function setIO(ioInstance: SocketIOServer) {
  io = ioInstance;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

export function setupWebSocketHandlers(ioInstance: SocketIOServer) {
  ioInstance.on('connection', (socket) => {
    logger.info(`[WebSocket] Client connected: ${socket.id}`);

    socket.on('join:project', ({ projectId }: { projectId: string }) => {
      socket.join(`project:${projectId}`);
      logger.info(`[WebSocket] Client ${socket.id} joined project:${projectId}`);
    });

    socket.on('leave:project', ({ projectId }: { projectId: string }) => {
      socket.leave(`project:${projectId}`);
      logger.info(`[WebSocket] Client ${socket.id} left project:${projectId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`[WebSocket] Client disconnected: ${socket.id}`);
    });
  });
}

// Helper function to broadcast events (will be used by services)
export { io };
