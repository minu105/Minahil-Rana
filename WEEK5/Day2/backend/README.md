# Realtime Comments Backend (NestJS)

## Quick Start
```bash
cd backend
npm i
cp .env.example .env
# edit .env to set MONGODB_URI and JWT_SECRET
npm run start:dev
```

### REST Endpoints (JWT Bearer)
- POST `/auth/signup` { name, email, password }
- POST `/auth/login` { email, password }
- GET `/users/me`
- PATCH `/users/me` { name?, bio?, avatarUrl? }
- POST `/followers/:userId` / DELETE `/followers/:userId`
- GET `/comments`
- POST `/comments` { content }
- GET `/comments/:id/replies`
- POST `/comments/:id/replies` { content }
- POST `/likes/:commentId` / DELETE `/likes/:commentId`
- GET `/notifications`
- PATCH `/notifications/:id/read`
- PATCH `/notifications/read-all`

### Socket.IO
Connect with JWT in handshake:
```js
const socket = io('http://localhost:3001', { auth: { token: 'Bearer ' + token } });
socket.on('comment.created', console.log);
socket.on('comment.replied', console.log);
socket.on('comment.liked', console.log);
socket.on('notification.created', console.log);
```
