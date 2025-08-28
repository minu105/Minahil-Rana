'use client';
import { io, Socket } from 'socket.io-client';
import { getToken } from './storage';

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;
  const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
  const token = getToken();
  socket = io(url, {
    transports: ['websocket'],
    autoConnect: true,
    auth: token ? { token } : undefined,
    withCredentials: true,
  });
  return socket;
}
