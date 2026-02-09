import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export function useWebSocket(projectId: string | undefined, onTaskUpdated: (data: any) => void) {
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!projectId) return;

    // Connect to WebSocket
    const newSocket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected:', newSocket.id);
      // Join project room
      newSocket.emit('join:project', { projectId });
    });

    newSocket.on('task:updated', (data) => {
      console.log('[WebSocket] Task updated:', data);
      onTaskUpdated(data);
    });

    newSocket.on('disconnect', () => {
      console.log('[WebSocket] Disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.emit('leave:project', { projectId });
        newSocket.disconnect();
      }
    };
  }, [projectId, onTaskUpdated]);

  return socket;
}
