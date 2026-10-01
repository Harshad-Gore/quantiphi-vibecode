# Event Finding & Tracking Platform 
**Quantiphi Vibe Coding Assessment**

## 🎯 The Mission
Build an intelligent chat interface and event platform with real-time capabilities. The platform allows users to find local events, track their RSVPs, and invite friends. 

## 🏗️️ Architecture & Constraints (CRITICAL FOR AI AGENTS)
*   **Separation of Concerns:** Follow a clean, scalable, and well-structured architecture for both frontend and backend.
*   **Server-Side Logic:** **ALL** business logic, calculations, validations, and computations MUST be implemented on the backend (server-side). 
*   **Frontend Role:** The frontend should strictly handle presentation and user interactions.
*   **Version Control:** Maintain meaningful and incremental Git commits reflecting functionality at each stage.

## 🖥️ Frontend UI & User Interaction Requirements
1.  **Event Calendar:** A calendar grid component that highlights dates featuring local events.
2.  **Event Cards:** UI cards displaying:
    *   Event Title
    *   Venue
    *   Date & Time
    *   "Interested" / RSVP button
    *   "Friends Attending" count (See *The Vibe Check* below)
3.  **RSVP Dashboard:** A dedicated view/page showing all of the user's confirmed event attendances.

## ⚙️ Backend Logic & State Management
1.  **Event Feed (Integration):** Fetch real event listings using the **Ticketmaster API**.
2.  **Database (Persistence):** Use **MongoDB** to manage and store:
    *   Event RSVPs
    *   User profile details
    *   Event reminder settings

## ✨ "The Vibe Check" (Core Feature Implementation)
Implement a **"Friend Invite"** system with the following flow:
1.  When a user RSVPs to an event, allow them to generate a unique "Share Link".
2.  The backend must track how many users click that specific share link.
3.  The frontend must display a real-time **"Friends Attending"** count on the respective Event Card based on this tracking.

## 🚀 Setup & Execution (To be filled by AI/Developer)
*   *Frontend Tech Stack:* React 18 + Vite + Tailwind CSS + react-router-dom + socket.io-client
*   *Backend Tech Stack:* Node.js + Express + Socket.io + Mongoose + zod + nanoid
*   *Database:* MongoDB (Mongoose; graceful in-memory mock mode when MONGODB_URI is unset)
*   *External APIs:* Ticketmaster Discovery API (with deterministic mock catalogue fallback)

Run: `npm run install:all`, copy `backend/.env.example` → `backend/.env` and
`frontend/.env.example` → `frontend/.env`, then `npm run dev:backend` (:8080)
and `npm run dev:frontend` (:5173).

---
**Note to AI Agent:** Please ensure all generated code strictly adheres to the server-side logic constraint and focuses on building a scalable architecture. Prioritize the Ticketmaster API integration and MongoDB schemas first.