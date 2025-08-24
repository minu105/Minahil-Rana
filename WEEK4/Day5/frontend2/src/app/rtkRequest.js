import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = (import.meta?.env?.VITE_API_URL || 'https://minahil-rana.vercel.app/api').replace(/\/?$/, '/');

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers) => {
    const token = typeof localStorage !== 'undefined'
      ? localStorage.getItem('token') || localStorage.getItem('authToken')
      : null;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  }
});

const stripBase = (url) => {
  if (!url) return '';
  if (url.startsWith(BASE_URL)) return url.slice(BASE_URL.length); 
  if (url.startsWith('/')) return url.replace(/^\/+/, ''); 
  return url;
};

const run = async ({ url, method = 'GET', body, headers }) => {
  const finalHeaders = new Headers(headers || {});

  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    finalHeaders.delete("Content-Type");
  } else if (body && typeof body === "object") {
    body = JSON.stringify(body);
    finalHeaders.set("Content-Type", "application/json");
  } else if (!body) {
    finalHeaders.delete("Content-Type");
  }

  const args = { url: stripBase(url), method, body, headers: finalHeaders };
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
    const data = await run({ url, method: 'POST', body, headers: config.headers });
    return { data };
  },

  async put(url, body, config = {}) {
    const data = await run({ url, method: 'PUT', body, headers: config.headers });
    return { data };
  },

  async delete(url, config = {}) {
    const data = await run({ url, method: 'DELETE', headers: config.headers });
    return { data };
  },
  async fetch(input, init = {}) {
    const url = typeof input === 'string' ? input : (input?.url || '');
    const method = init?.method || 'GET';
    let body = init?.body;
    if (
      body &&
      typeof body === 'string' &&
      (init.headers?.['Content-Type']?.includes('application/json') ||
        init.headers?.['content-type']?.includes('application/json'))
    ) {
      try { body = JSON.parse(body); } catch {}
    }

    const data = await run({ url, method, body, headers: init?.headers });

    return {
      ok: true,
      status: 200,
      async json() { return data; }
    };
  }
};

export default api;
