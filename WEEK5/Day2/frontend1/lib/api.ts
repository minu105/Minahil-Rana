'use client';
import axios from 'axios';
import { getToken } from './storage';

const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const t = getToken();
  console.log('🔗 API Request interceptor - Token:', t ? `${t.substring(0, 20)}...` : 'null');
  if (t) config.headers.Authorization = `Bearer ${t}`;
  console.log('🔗 API Request to:', config.url, 'with auth:', !!config.headers.Authorization);
  return config;
});
