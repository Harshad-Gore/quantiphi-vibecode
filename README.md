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

## Setup (step by step)

Prerequisites: Node.js 18+ and npm. MongoDB Atlas (free) and a Ticketmaster
developer key are optional — the app runs fully without them (mock events +
in-memory stores), which is the fastest way to see the whole UI working.

1. Install everything from the repo root:
   ```bash
   npm run install:all
   ```
2. Backend config — copy and edit:
   ```bash
   copy backend\.env.example backend\.env   # Windows
   # cp backend/.env.example backend/.env   # macOS/Linux
   ```
   Fill in `backend/.env`:
   ```bash
   # Ticketmaster dashboard "Consumer Key" (Consumer Secret is NOT needed).
   # Leave blank to use the built-in mock catalogue.
   TICKETMASTER_API_KEY=paste_consumer_key_here
   TICKETMASTER_COUNTRY=IN
   # Atlas URI with THIS project's own db name (auto-created on first write).
   # Leave blank to use in-memory stores.
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/vibecheck?appName=vibecheck
   PORT=8080
   CORS_ORIGIN=http://localhost:5173
   PUBLIC_BASE_URL=http://localhost:5173
   ```
3. Frontend config:
   ```bash
   copy frontend\.env.example frontend\.env   # Windows
   # cp frontend/.env.example frontend/.env   # macOS/Linux
   # VITE_API_URL=http://localhost:8080 (default already correct)
   ```
4. Run (two terminals):
   ```bash
   npm run dev:backend    # API on :8080
   npm run dev:frontend   # UI on :5173
   ```
5. Verify: open http://localhost:8080/api/health — expect
   `{"ok":true,"source":"ticketmaster"|"mock","db":true|false}`.
   Then open http://localhost:5173 — the feed badge shows which feed is live.

## Troubleshooting

| Symptom | Cause & fix |
|---|---|
| Feed shows "Local picks" | No `TICKETMASTER_API_KEY`, key invalid, or live feed had no matches — by design the server falls back to local picks (see `note`). Paste the dashboard **Consumer Key** and restart the backend for live data. |
| `source: mock`, `db: false` | Both optionals unset — expected in zero-config mode. |
| Empty page / "Could not reach the event feed" | Backend not running or wrong `VITE_API_URL`. Start `npm run dev:backend` and confirm `/api/health` responds. |
| Mongo connection error | Password with `@ / ? #` must be percent-encoded; user needs readWrite on the `vibecheck` db; Atlas cluster must allow your IP (Network Access → Allow). |
| Ports busy | Change `PORT=` (backend) and `VITE_API_URL=` (frontend) consistently. |

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
