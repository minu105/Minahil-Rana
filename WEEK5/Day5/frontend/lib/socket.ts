"use client";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/lib/storage";

let socket: Socket | null = null;
let lastToken: string | null = null;

function getWsBaseUrl() {
  const http = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
  // For socket.io, we don't need to convert to ws:// - just use the HTTP URL
  return http;
}

export function getSocket() {
  if (typeof window === "undefined") return null;
  const token = getToken() || null;

  // If we already have a socket but token changed, recycle the connection
  if (socket && lastToken !== token) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }

  if (socket && socket.connected) return socket;

  const url = getWsBaseUrl();

  socket = io(url, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 20000,
    auth: token ? { token } : undefined,
  });

  // Add connection event listeners for debugging
  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  lastToken = token;

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Force refresh/reconnect with the current token
export function refreshSocket() {
  disconnectSocket();
  return getSocket();
}

