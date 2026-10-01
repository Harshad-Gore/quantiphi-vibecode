import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
let socket = null;

export function getSocket() {
  // Polling first, then auto-upgrade to websocket (socket.io default strategy).
  // Leading with websocket makes every cold start log a scary ws error and
  // fails outright behind proxies that block ws upgrades.
  if (!socket) {
    socket = io(BASE, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
