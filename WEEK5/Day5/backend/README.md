# Auction Hackathon Backend (NestJS + MongoDB + Socket.IO)

## Quick start
```bash
cp .env.example .env
npm install
npm run build
npm run seed   # creates seller/buyer, one car, one auction (starts in ~15s, ends in ~75s)
npm run start:dev
```

- REST base: `http://localhost:$PORT` (default 4000)
- Socket.IO: connect to same origin, send auth token in handshake: `{ auth: { token: <JWT> } }`

## Seeded Accounts
- Seller: `seller@example.com` / `password`
- Buyer:  `buyer@example.com` / `password`

## Important endpoints
- `POST /api/auth/register` / `POST /api/auth/login`
- `POST /api/cars` (auth)
- `POST /api/auctions` (auth, must own car)
- `POST /api/auctions/:id/bids` (auth) — or use socket event `place_bid`
- `POST /api/payments/auction/:id/intent` then `POST /api/payments/:pid/confirm` (mock)
- `GET /api/notifications`

## Socket events
- join: `join_auction { auctionId }`
- place: `place_bid { auctionId, amount }`
- server broadcasts: `auction_started, new_bid, bid_rejected, auction_ended, notification, shipping_update`

## Auction lifecycle jobs
- Scheduler checks every 10s to flip scheduled->live and live->ended, then emits realtime notifications.
- Payment confirmation triggers mock shipping: `ready` -> 60s -> `in_transit` -> 60s -> `delivered`, then auction `completed`.
