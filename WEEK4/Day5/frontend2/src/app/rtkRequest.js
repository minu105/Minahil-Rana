
// Lightweight RTK Query-based request helper that preserves existing component code.
// Uses fetchBaseQuery under the hood; no Redux store/provider required for this usage.
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = (import.meta?.env?.VITE_API_URL || 'http://localhost:5000/api').replace(/\/?$/, '/');
const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    // Forward any localStorage token if the app uses it
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('authToken') : null;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
});

const stripBase = (url) => {
  if (!url) return '';
  // If absolute URL starts with BASE_URL, strip it for baseQuery
  if (url.startsWith(BASE_URL)) return url.slice(BASE_URL.length);
  // If it's absolute but with /api/ path root, strip leading slash
  if (url.startsWith('/')) return url.replace(/^\/+/, '');
  return url;
};

const run = async ({ url, method = 'GET', body, headers }) => {
  const args = { url: stripBase(url), method, body, headers };
  const result = await baseQuery(args, { dispatch: () => {} }, {});
  if (result.error) {
    const message = result.error?.error || result.error?.data?.message || 'Request failed';
    const err = new Error(message);
    err.details = result.error;
    throw err;
  }
  return result.data;
};

const api = {
  setAuthToken(token) {
    if (typeof localStorage !== 'undefined' && token) {
      localStorage.setItem('token', token);
    }
  },
  async get(url, config = {}) {
    const data = await run({ url, method: 'GET', headers: config.headers });
    return { data };
  },
  async post(url, body, config = {}) {
    // If body is FormData, pass as-is
    const payload = (typeof FormData !== 'undefined' && body instanceof FormData) ? body : body;
    const data = await run({ url, method: 'POST', body: payload, headers: config.headers });
    return { data };
  },
  async put(url, body, config = {}) {
    const payload = (typeof FormData !== 'undefined' && body instanceof FormData) ? body : body;
    const data = await run({ url, method: 'PUT', body: payload, headers: config.headers });
    return { data };
  },
  async delete(url, config = {}) {
    const data = await run({ url, method: 'DELETE', headers: config.headers });
    return { data };
  },
  // Compatibility layer for existing fetch(...) usage in code
  async fetch(input, init = {}) {
    const url = typeof input === 'string' ? input : (input?.url || '');
    const method = init?.method || 'GET';
    let body = init?.body;
    // Try to parse JSON string bodies to object (fetch usually passes stringified JSON)
    if (body && typeof body === 'string' && (init.headers?.['Content-Type']?.includes('application/json') || init.headers?.['content-type']?.includes('application/json'))) {
      try { body = JSON.parse(body); } catch {}
    }
    const data = await run({ url, method, body, headers: init?.headers });
    // Return fetch-like Response shim (minimal)
    return {
      ok: true,
      status: 200,
      async json() { return data; }
    };
  }
};

export default api;
