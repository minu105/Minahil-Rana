# Realtime Comments – Minimal Frontend

This is a tiny Next.js (App Router) client to test your NestJS backend (JWT + REST + Socket.IO).

## Quick Start
1. Ensure backend runs at `http://localhost:3001` and CORS allows `http://localhost:3000`.
2. `.env.local` already has:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   ```
3. Install & run:
   ```bash
   npm i
   npm run dev
   ```
4. Open `http://localhost:3000`:
   - Signup or Login
   - Post a comment, reply, like/unlike
   - Open two browser windows to see realtime events

## Where token is sent
- REST: `Authorization: Bearer <JWT>` via Axios interceptor.
- Socket.IO: handshake `auth.token = <JWT>` (matches your backend gateway).
