import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function useWebSocket(projectId: string | undefined, onTaskUpdated: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSocket
    const socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected:', socket.id);
      // Join project room
      socket.emit('join:project', { projectId });
    });

    socket.on('task:updated', (data) => {
      console.log('[WebSocket] Task updated:', data);
      onTaskUpdated(data);
    });

    socket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.emit('leave:project', { projectId });
        socket.disconnect();
      }
    };
  }, [projectId, onTaskUpdated]);

  return socketRef.current;
}
