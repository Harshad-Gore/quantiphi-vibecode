import { io } from 'socket.io-client';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';
let socket = null;

export function getSocket() {
  if (!socket) socket = io(BASE, { transports: ['websocket', 'polling'] });
  return socket;
}
