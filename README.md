# VibeCheck — Event Finding & Tracking Platform

Intelligent event platform: discover local events (Ticketmaster feed), RSVP, invite friends via tracked share links, and watch **Friends Attending** update in realtime. Includes a concierge chat (server-side NLU) and an RSVP dashboard with reminders.

## Architecture

```
frontend/  (React + Vite + Tailwind — presentation only)
  src/pages  Home (feed+calendar) · Dashboard (RSVPs) · InviteLanding (/invite/:code)
  src/components  EventCalendar · EventCard · ChatWidget · Header
  src/lib  api.js (fetch wrapper) · socket.js · user.js
backend/   (Node + Express + Socket.io — ALL business logic here)
  src/routes  events · rsvps · users · share · reminders · chat
  src/services  ticketmaster.js (feed+normalise) · vibeService.js (friends-attending math) · chatService.js (NLU)
  src/models  User · Rsvp · ShareLink · ClickEvent · Reminder
```

Constraint honored: frontend never computes — calendar density, vibe counts, chat parsing, validation (zod) all run server-side.

## The Vibe Check flow

1. User RSVPs → `POST /api/rsvps` (upsert per user+event).
2. User hits **Invite** → `POST /api/share-links` returns `{ code, url: /invite/:code }`.
3. Friend opens link → `GET /api/share-links/:code/track` increments `clickCount`, stores a `ClickEvent`, emits `vibe:update` over Socket.io.
4. Event cards + invite page show `friendsAttending = rsvpCount + clickCount`, refreshed live.

## Setup

```bash
npm run install:all
# backend/.env — copy from backend/.env.example (works with everything blank = mock mode)
# frontend/.env — copy from frontend/.env.example
npm run dev:backend   # :8080
npm run dev:frontend  # :5173
```

Get a free Ticketmaster key at https://developer.ticketmaster.com/ and MongoDB from https://www.mongodb.com/atlas — or run without both (deterministic mock catalogue + in-memory stores so the calendar always lights up).

## API quick reference

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | feed source + db status |
| GET | `/api/events?keyword=&city=&startDate=&endDate=` | feed + `calendar` density + per-event `vibe` |
| GET | `/api/events/:id/vibe` | live Friends Attending |
| POST/GET/DELETE | `/api/rsvps` | RSVP upsert, dashboard feed, cancel |
| POST | `/api/users/ensure` | demo sign-in |
| POST | `/api/share-links` | generate invite link |
| GET | `/api/share-links/:code/track` | record click + fresh vibe |
| GET | `/api/share-links/event/:eventId/stats` | vibe stats |
| POST | `/api/chat` | concierge NLU → matching events |
| POST/GET | `/api/reminders` | reminder settings |

## Tech

- Frontend: React, Vite, Tailwind, react-router-dom, socket.io-client
- Backend: Node.js, Express, MongoDB (Mongoose), Socket.io, zod, nanoid
- External: Ticketmaster Discovery API
