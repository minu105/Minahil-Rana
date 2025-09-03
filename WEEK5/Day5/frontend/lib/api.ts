'use client';
import axios from 'axios';
import { getToken } from '@/lib/storage';

// Normalize base URL so it always targets the NestJS '/api' prefix exactly once
function normalizeBaseUrl() {
  const raw = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000/api';
  // If raw already ends with '/api' -> keep
  if (/\/api\/?$/.test(raw)) return raw.replace(/\/$/, '');
  // If raw ends with '/' remove it, then append '/api'
  return `${raw.replace(/\/$/, '')}/api`;
}

export const api = axios.create({
  baseURL: normalizeBaseUrl(),
  // We use Authorization: Bearer <token>, not cookies. Avoid credentialed CORS to prevent
  // "CORS No Allow Credentials" blocks when the server doesn't need cookies.
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    // Make sure headers object exists and set Authorization in a TS-safe way
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${t}`;
  }
  return config;
});
