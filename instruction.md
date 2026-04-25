# MoodMap — Agent Instruction File
> Full production guide for backend, frontend, database, DevOps, and code quality.
> This file is the single source of truth for any coding agent working on this project.
> Read this file completely before writing a single line of code.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Monorepo Structure](#2-monorepo-structure)
3. [Environment & Configuration](#3-environment--configuration)
4. [Database Guide](#4-database-guide)
5. [Backend Architecture](#5-backend-architecture)
6. [API Route Guide](#6-api-route-guide)
7. [Real-time (Socket.io) Guide](#7-real-time-socketio-guide)
8. [Frontend Architecture](#8-frontend-architecture)
9. [Authentication Guide](#9-authentication-guide)
10. [Error Handling Guide](#10-error-handling-guide)
11. [Validation Guide](#11-validation-guide)
12. [Security Guide](#12-security-guide)
13. [Testing Guide](#13-testing-guide)
14. [Logging Guide](#14-logging-guide)
15. [Deployment Guide](#15-deployment-guide)
16. [Code Style & Conventions](#16-code-style--conventions)
17. [Git & PR Conventions](#17-git--pr-conventions)
18. [Performance Checklist](#18-performance-checklist)
19. [Common Mistakes to Avoid](#19-common-mistakes-to-avoid)

---

## 1. Project Overview

**MoodMap** is a real-time, location-based social discovery platform. Users drop anonymous mood pins on a live city map. Other nearby users verify or dispute pins. When people share the same vibe within 2km, they can discover each other, form temporary group chats (Vibe Circles), exchange proximity pings, and connect — all without revealing identity until both sides agree.

### Core Concepts

| Concept | Description |
|---|---|
| Mood Pin | A geolocated mood drop by an anonymous or logged-in user. Expires after 2 hours. |
| Credibility Score | A pin's trustworthiness (0.0–1.0) calculated from confirm/dispute votes. |
| Neighborhood Mood | Dominant weighted mood of a city zone, recalculated every 30 seconds. |
| Session ID | UUID stored in localStorage. Identifies anonymous users across all requests. |
| Session Reputation | Reliability score for a session. Degrades when pins are repeatedly disputed. |
| Mood Snapshot | Periodic record of a neighborhood's mood. Powers the Trends charts. |
| Vibe Match | Anonymous connection between two nearby users sharing the same mood. |
| Vibe Circle | Temporary group chat auto-formed around a neighborhood mood. Dissolves after 2 hours. |
| Mood Story | 24-hour ephemeral post tied to a location zone. Visible only to people in that zone. |
| Proximity Ping | One-tap anonymous nudge to a nearby user with the same vibe. |
| Ghost Mode | User stays invisible in the social/match layer while still contributing pins to the map. |
| Vibe Passport | User's mood history visualized as a heatmap — their "vibe profile". |
| Mood Wrapped | Shareable weekly summary card of a user's vibes. Designed for Instagram stories. |
| Spontaneous Event | Auto-generated alert when 8+ same-mood pins cluster in 500m within 20 minutes. |
| Neighborhood Battle | Weekly competition between zones for dominant mood. Powers a live leaderboard. |
| Daily Vibe Quest | Daily challenge (e.g. "find a CHILL spot within 1km") rewarded with a badge. |
| Waitlist | Invite-gated pre-launch signup with referral code system and position tracking. |

### Tech Stack Summary

```
Frontend    : React 18 + Vite + Tailwind CSS + shadcn/ui + Leaflet.js + Recharts + Socket.io-client
Backend     : Node.js + Express + Socket.io + Prisma ORM
Database    : PostgreSQL 15
Cache       : Redis (rate limiting + socket state + response caching)
Push Notifs : Web Push API (VAPID)
Package Mgr : Bun (all workspaces — never use npm or yarn)
Deploy      : Vercel (frontend) + Railway (backend + PostgreSQL + Redis)
```

---

## 2. Monorepo Structure

```
moodmap/
├── client/
│   ├── public/
│   │   └── sw.js                       # Service worker for Web Push
│   └── src/
│       ├── api/
│       │   ├── client.js               # Axios instance with interceptors
│       │   ├── pins.js
│       │   ├── neighborhoods.js
│       │   ├── auth.js
│       │   ├── matches.js
│       │   ├── circles.js
│       │   ├── stories.js
│       │   ├── users.js
│       │   └── waitlist.js
│       ├── components/
│       │   ├── Map/
│       │   │   ├── Map.jsx
│       │   │   ├── MoodPin.jsx
│       │   │   ├── MoodHeatmap.jsx
│       │   │   ├── RadarPulse.jsx      # Animated 2km vibe radar
│       │   │   └── PinPopup.jsx
│       │   ├── Social/
│       │   │   ├── VibeMatch.jsx       # Nearby match discovery panel
│       │   │   ├── VibeCircle.jsx      # Circle chat UI
│       │   │   ├── ProximityPing.jsx   # Incoming ping notification
│       │   │   └── NearbyCount.jsx     # Floating nearby-user badge
│       │   ├── PinForm/
│       │   │   ├── PinForm.jsx
│       │   │   └── MoodSelector.jsx
│       │   ├── Panel/
│       │   │   ├── NeighborhoodPanel.jsx
│       │   │   ├── PinDetail.jsx
│       │   │   └── VoteButtons.jsx
│       │   ├── Stories/
│       │   │   ├── StoryRing.jsx       # Horizontal story scroll row
│       │   │   └── StoryViewer.jsx     # Full-screen story modal
│       │   ├── Profile/
│       │   │   ├── VibePassport.jsx    # Mood heatmap profile card
│       │   │   ├── MoodStreak.jsx
│       │   │   ├── BadgeGrid.jsx
│       │   │   └── MoodWrapped.jsx     # Canvas-rendered weekly card
│       │   ├── Gamification/
│       │   │   ├── QuestBanner.jsx     # Daily quest at bottom of Home
│       │   │   └── BattleLeaderboard.jsx
│       │   ├── Charts/
│       │   │   ├── TrendChart.jsx
│       │   │   └── MoodCalendar.jsx    # GitHub-style mood heatmap
│       │   └── UI/                     # shadcn/ui wrappers + custom generics
│       │       ├── Button.jsx          # re-exports shadcn Button
│       │       ├── Badge.jsx           # MoodBadge wrapper over shadcn Badge
│       │       ├── Toast.jsx           # re-exports shadcn Toaster/useToast
│       │       ├── Modal.jsx           # shadcn Dialog wrapper
│       │       ├── Avatar.jsx
│       │       ├── GhostToggle.jsx
│       │       └── ProtectedRoute.jsx
│       ├── hooks/
│       │   ├── useSocket.js            # All socket event handling
│       │   ├── useLocation.js
│       │   ├── usePins.js
│       │   ├── useSession.js
│       │   ├── useNearby.js            # Polls nearby match count every 60s
│       │   └── useCircle.js            # Circle join/leave/message
│       ├── pages/
│       │   ├── Home.jsx                # Main map page
│       │   ├── Trends.jsx              # Neighborhood history + battle leaderboard
│       │   ├── Dashboard.jsx           # User pin history (auth only)
│       │   ├── Profile.jsx             # Full profile + wrapped card
│       │   ├── Circle.jsx              # Vibe circle chat page
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Waitlist.jsx            # Pre-launch landing page
│       ├── store/
│       │   ├── usePinStore.js
│       │   ├── useAuthStore.js
│       │   ├── useCircleStore.js
│       │   └── useMatchStore.js
│       ├── utils/
│       │   ├── session.js
│       │   ├── moodColors.js
│       │   ├── formatters.js
│       │   ├── geo.js                  # Client-side distance helpers
│       │   └── wrapped.js              # Canvas card generation helpers
│       ├── lib/
│       │   └── utils.js                # shadcn cn() helper — do not edit
│       ├── App.jsx
│       └── main.jsx
│   ├── components.json                 # shadcn/ui config — do not edit manually
│   ├── .env.example
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/
│   └── src/
│       ├── config/
│       │   ├── env.js                  # Zod-validated env — import this everywhere
│       │   ├── database.js             # Prisma singleton
│       │   └── redis.js                # ioredis singleton
│       ├── routes/
│       │   ├── index.js                # Mounts all routers
│       │   ├── pins.js
│       │   ├── neighborhoods.js
│       │   ├── auth.js
│       │   ├── users.js
│       │   ├── matches.js
│       │   ├── circles.js
│       │   ├── stories.js
│       │   ├── pings.js
│       │   ├── quests.js
│       │   ├── battles.js
│       │   ├── events.js
│       │   ├── vibeChecks.js
│       │   ├── push.js
│       │   └── waitlist.js
│       ├── controllers/
│       │   └── (one file per route, e.g. pins.controller.js)
│       ├── services/
│       │   ├── pins.service.js
│       │   ├── votes.service.js
│       │   ├── mood.service.js
│       │   ├── auth.service.js
│       │   ├── match.service.js
│       │   ├── circle.service.js
│       │   ├── story.service.js
│       │   ├── ping.service.js
│       │   ├── users.service.js
│       │   ├── badge.service.js
│       │   ├── quest.service.js
│       │   ├── battle.service.js
│       │   ├── event.service.js
│       │   ├── vibeCheck.service.js
│       │   ├── push.service.js
│       │   ├── reputation.service.js
│       │   └── waitlist.service.js
│       ├── middleware/
│       │   ├── auth.middleware.js
│       │   ├── session.middleware.js
│       │   ├── rateLimit.middleware.js
│       │   ├── validate.middleware.js
│       │   └── error.middleware.js
│       ├── sockets/
│       │   ├── index.js
│       │   ├── pinHandler.js
│       │   ├── matchHandler.js
│       │   └── circleHandler.js
│       ├── jobs/
│       │   ├── index.js                # startJobs(io) — called from server entry
│       │   ├── snapshotJob.js          # Neighborhood mood every 30s
│       │   ├── expireJob.js            # Pins/circles/stories/pings every 5min
│       │   ├── matchJob.js             # Find vibe matches every 60s
│       │   ├── circleJob.js            # Auto-create circles + detect events every 2min
│       │   ├── battleJob.js            # Score + resolve weekly battles
│       │   └── questJob.js             # Generate daily quest at midnight
│       ├── validators/
│       │   ├── pin.validator.js
│       │   ├── auth.validator.js
│       │   ├── vote.validator.js
│       │   ├── match.validator.js
│       │   ├── circle.validator.js
│       │   └── story.validator.js
│       └── utils/
│           ├── logger.js
│           ├── response.js
│           ├── AppError.js
│           ├── catchAsync.js
│           ├── geo.js                  # haversineDistance, pointInPolygon
│           └── session.js
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── index.js                        # Server entry point
│   ├── .env.example
│   └── package.json
│
├── .gitignore
├── README.md
├── AGENT.md                            # This file
├── PHASES.md                           # Phase-by-phase build prompts
└── moodmap.dbml
```

---

## 3. Environment & Configuration

### server/.env.example

```env
# Server
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/moodmap

# Redis
REDIS_URL=redis://localhost:6379

# Auth
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
PIN_RATE_LIMIT_MAX=10
VOTE_RATE_LIMIT_MAX=30
PING_RATE_LIMIT_MAX=5

# Web Push (VAPID) — generate with: bunx web-push generate-vapid-keys
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:you@example.com

# Feature configuration
MATCH_RADIUS_METERS=2000
CIRCLE_AUTO_THRESHOLD=10
EVENT_CLUSTER_THRESHOLD=8
EVENT_CLUSTER_RADIUS_METERS=500
```

### client/.env.example

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### server/src/config/env.js — Always use this, never process.env directly

```js
import { z } from 'zod';

const schema = z.object({
  NODE_ENV:                    z.enum(['development', 'production', 'test']),
  PORT:                        z.coerce.number().default(5000),
  CLIENT_URL:                  z.string().url(),
  DATABASE_URL:                z.string(),
  REDIS_URL:                   z.string(),
  JWT_SECRET:                  z.string().min(32),
  JWT_EXPIRES_IN:              z.string().default('7d'),
  RATE_LIMIT_WINDOW_MS:        z.coerce.number().default(900000),
  RATE_LIMIT_MAX:              z.coerce.number().default(100),
  PIN_RATE_LIMIT_MAX:          z.coerce.number().default(10),
  VOTE_RATE_LIMIT_MAX:         z.coerce.number().default(30),
  PING_RATE_LIMIT_MAX:         z.coerce.number().default(5),
  VAPID_PUBLIC_KEY:            z.string(),
  VAPID_PRIVATE_KEY:           z.string(),
  VAPID_EMAIL:                 z.string().email(),
  MATCH_RADIUS_METERS:         z.coerce.number().default(2000),
  CIRCLE_AUTO_THRESHOLD:       z.coerce.number().default(10),
  EVENT_CLUSTER_THRESHOLD:     z.coerce.number().default(8),
  EVENT_CLUSTER_RADIUS_METERS: z.coerce.number().default(500),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
```

**Rule:** Never import `process.env` directly. Always import from `config/env.js`.

---

## 4. Database Guide

### PostgreSQL Setup

MoodMap uses **PostgreSQL 15** managed entirely through **Prisma ORM**. Never write raw SQL outside `$queryRaw` (reserved for health checks and complex aggregates only).

#### Local Development

```bash
docker run --name moodmap-pg \
  -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=moodmap -p 5432:5432 -d postgres:15

docker exec -it moodmap-pg psql -U user -c "CREATE DATABASE moodmap_test;"
```

### Prisma Client Singleton

```js
// server/src/config/database.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### Complete Table Reference

All 22 tables in the schema. Use as definitive reference for every service query.

```
ENUMS
  Mood          CHILL | HYPE | FOCUSED | ROMANTIC | SKETCHY
  VoteType      CONFIRM | DISPUTE
  MatchStatus   PENDING | CONNECTED | DECLINED | EXPIRED
  CircleStatus  ACTIVE | DISSOLVED
  BadgeType     FIRST_PIN | VERIFIED_10 | LOCAL_CROWN | MOOD_STREAK_7
                FIVE_NEIGHBORHOODS | PIONEER | SOCIAL_BUTTERFLY | NIGHT_OWL

CORE TABLES
  users                → accounts (optional; anon users use session_id only)
  neighborhoods        → city zones with GeoJSON polygon boundaries
  mood_pins            → core pin table; expires after 2 hours
  pin_votes            → confirm/dispute votes; unique(pin_id, session_id)
  session_reputation   → anonymous user reliability score
  mood_snapshots       → periodic neighborhood mood records (every 30s)

SOCIAL TABLES
  vibe_matches         → anonymous social match records; expires after 30 min
  vibe_circles         → temporary group chats; dissolve after 2 hours
  circle_members       → membership records; unique(circle_id, session_id)
  circle_messages      → messages sent inside circles
  mood_stories         → 24h ephemeral posts tied to a neighborhood
  story_views          → view tracking; unique(story_id, viewer_session)
  proximity_pings      → one-tap anonymous nudges; expires after 10 min

GAMIFICATION TABLES
  user_badges          → earned badges; unique(user_id, badge_type)
  daily_quests         → rotating daily challenges
  quest_completions    → completion records; unique(user_id OR session_id, quest_id)
  neighborhood_battles → weekly mood competition
  battle_scores        → hourly score records per neighborhood per battle
  mood_diaries         → auto-generated weekly summaries per user

SOCIAL (LOGGED-IN)
  vibe_checks          → two-way mood check between users; expires after 24h

INFRASTRUCTURE
  push_subscriptions   → Web Push subscription objects per session/user
  spontaneous_events   → auto-detected live events from pin clusters
  waitlist             → pre-launch signups with referral codes + position
```

### Schema Conventions

- All PKs use `@id @default(uuid())` — never auto-increment integers exposed to clients.
- Timestamps: `@default(now())` and `@updatedAt`.
- Expiry: always an explicit `expiresAt DateTime` — no soft-delete pattern.
- Every FK queried together has an explicit `@@index`.
- `sessionId` is always `String` (UUID format) — not a DB relation.

### Rules for Database Access

- **Never** query the DB in a route handler or controller. All DB calls go in a `service` file.
- Always use `prisma.$transaction()` when multiple writes must succeed or fail together.
- Always filter `where: { expiresAt: { gt: new Date() } }` for pins, circles, stories, pings.
- Use `select` to return only needed columns.
- Never return `passwordHash`, `vapidSubscription`, or raw reputation internals to any client.

### Key Queries Reference

```js
// Active pins for map load
await prisma.moodPin.findMany({
  where: { expiresAt: { gt: new Date() } },
  select: { id:true, mood:true, message:true, latitude:true, longitude:true,
            credibilityScore:true, createdAt:true, _count:{ select:{ votes:true } } }
});

// Recalculate credibility after a vote
const votes = await prisma.pinVote.groupBy({ by:['vote'], where:{ pinId }, _count:{ vote:true } });
const confirms = votes.find(v => v.vote==='CONFIRM')?._count.vote ?? 0;
const disputes = votes.find(v => v.vote==='DISPUTE')?._count.vote ?? 0;
const score = confirms + disputes === 0 ? 0.5 : confirms / (confirms + disputes);
await prisma.moodPin.update({ where:{ id:pinId }, data:{ credibilityScore:score } });

// Neighborhood weighted mood score
await prisma.moodPin.groupBy({
  by:['mood'], where:{ neighborhoodId, expiresAt:{ gt:new Date() } },
  _sum:{ credibilityScore:true }, orderBy:{ _sum:{ credibilityScore:'desc' } }
});

// Paginated circle messages
await prisma.circleMessage.findMany({
  where:{ circleId }, orderBy:{ createdAt:'desc' },
  take:50, skip: cursor ? 1 : 0, cursor: cursor ? { id:cursor } : undefined
});

// Active circles (post-query distance filter with haversineDistance)
await prisma.vibeCircle.findMany({
  where:{ status:'ACTIVE', dissolvesAt:{ gt:new Date() } },
  include:{ _count:{ select:{ members:true } } }
});
```

### Migrations

```bash
bunx prisma generate                        # always run after schema change
bunx prisma migrate dev --name <desc>       # development only
bunx prisma migrate deploy                  # production only — NEVER use migrate dev in prod
bunx prisma studio                          # local DB GUI
bun prisma/seed.js                          # seed neighborhoods and test data
```

---

## 5. Backend Architecture

### Layer Responsibilities

```
Route      → parse request, call validator, call controller, return response
Controller → extract validated data, call service(s), format response
Service    → ALL business logic and DB calls. The only place DB is touched.
Middleware → cross-cutting (auth, session, rate limit, validate, error)
Job        → background tasks (snapshot, expiry, match, circle, battle, quest)
Socket     → real-time emission only. Calls services, never touches DB directly.
```

### Entry Point — server/index.js

```js
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { Server } from 'socket.io';
import { env } from './src/config/env.js';
import { router } from './src/routes/index.js';
import { initSockets } from './src/sockets/index.js';
import { errorMiddleware } from './src/middleware/error.middleware.js';
import { sessionMiddleware } from './src/middleware/session.middleware.js';
import { globalRateLimit } from './src/middleware/rateLimit.middleware.js';
import { startJobs } from './src/jobs/index.js';
import { logger } from './src/utils/logger.js';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(sessionMiddleware);
app.use(globalRateLimit);
app.use('/api', router);
app.use(errorMiddleware); // MUST be last middleware

const io = new Server(server, { cors: { origin: env.CLIENT_URL } });
app.set('io', io); // make io available via req.app.get('io') in controllers
initSockets(io);
startJobs(io);

process.on('SIGTERM', () => { server.close(() => process.exit(0)); });
process.on('uncaughtException',  (err) => { logger.error(err); process.exit(1); });
process.on('unhandledRejection', (err) => { logger.error(err); process.exit(1); });

server.listen(env.PORT, () =>
  logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)
);
```

### Response Helpers — always use these

```js
// server/src/utils/response.js
export const success = (res, data, statusCode = 200) =>
  res.status(statusCode).json({ success: true, data });
export const created = (res, data) => success(res, data, 201);
export const fail    = (res, msg, statusCode = 400) =>
  res.status(statusCode).json({ success: false, error: msg });
```

### AppError — throw in every service

```js
// server/src/utils/AppError.js
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

### catchAsync — wraps every controller

```js
// server/src/utils/catchAsync.js
export const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

---

## 6. API Route Guide

### Route Registration

```js
// server/src/routes/index.js
import { Router } from 'express';
import { prisma } from '../config/database.js';
import pinRoutes          from './pins.js';
import neighborhoodRoutes from './neighborhoods.js';
import authRoutes         from './auth.js';
import userRoutes         from './users.js';
import matchRoutes        from './matches.js';
import circleRoutes       from './circles.js';
import storyRoutes        from './stories.js';
import pingRoutes         from './pings.js';
import questRoutes        from './quests.js';
import battleRoutes       from './battles.js';
import eventRoutes        from './events.js';
import vibeCheckRoutes    from './vibeChecks.js';
import pushRoutes         from './push.js';
import waitlistRoutes     from './waitlist.js';

export const router = Router();

router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'disconnected' });
  }
});

router.use('/pins',          pinRoutes);
router.use('/neighborhoods', neighborhoodRoutes);
router.use('/auth',          authRoutes);
router.use('/users',         userRoutes);
router.use('/matches',       matchRoutes);
router.use('/circles',       circleRoutes);
router.use('/stories',       storyRoutes);
router.use('/pings',         pingRoutes);
router.use('/quests',        questRoutes);
router.use('/battles',       battleRoutes);
router.use('/events',        eventRoutes);
router.use('/vibe-checks',   vibeCheckRoutes);
router.use('/push',          pushRoutes);
router.use('/waitlist',      waitlistRoutes);
```

### Complete API Reference

#### Pins
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/pins/active` | None | All non-expired pins |
| POST | `/api/pins` | None | Drop a new mood pin |
| DELETE | `/api/pins/:id` | Owner | Delete own pin |
| POST | `/api/pins/:id/vote` | None | Confirm or dispute a pin |
| GET | `/api/pins/:id/votes` | None | Vote counts for a pin |

#### Neighborhoods
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/neighborhoods` | None | All zones with current mood |
| GET | `/api/neighborhoods/:id/mood` | None | Current mood score |
| GET | `/api/neighborhoods/:id/history` | None | Mood trend last 24h |

#### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Create account |
| POST | `/api/auth/login` | None | Login, returns JWT |
| GET | `/api/auth/me` | JWT | Current user |

#### Users
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users/me` | JWT | Full profile |
| PUT | `/api/users/me` | JWT | Update profile |
| POST | `/api/users/me/ghost` | JWT | Toggle ghost mode |
| GET | `/api/users/me/pins` | JWT | Paginated pin history |
| GET | `/api/users/me/history` | JWT | Mood history (30 days) |
| GET | `/api/users/me/diary` | JWT | Weekly mood diary |
| GET | `/api/users/:id` | None | Public profile (limited) |

#### Vibe Matches
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/matches/nearby` | None | Nearby users by mood (lat/lon query) |
| GET | `/api/matches` | None | Session match history |
| POST | `/api/matches/:id/accept` | None | Accept a match |
| POST | `/api/matches/:id/decline` | None | Decline a match |

#### Vibe Circles
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/circles` | None | Active circles near lat/lon |
| GET | `/api/circles/:id` | None | Circle details |
| GET | `/api/circles/:id/messages` | None | Paginated messages |
| POST | `/api/circles/:id/join` | None | Join a circle |
| POST | `/api/circles/:id/leave` | None | Leave a circle |

#### Mood Stories
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/stories` | None | Active stories for neighborhood |
| POST | `/api/stories` | JWT | Post a story |
| DELETE | `/api/stories/:id` | JWT | Delete own story |

#### Proximity Pings
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/pings` | None | Send a ping |
| GET | `/api/pings/pending` | None | Unseen incoming pings |
| POST | `/api/pings/:id/seen` | None | Mark ping as seen |

#### Gamification
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/quests/today` | None | Today's active quest |
| GET | `/api/quests/my-progress` | None | Quest completion status |
| GET | `/api/battles/current` | None | Active battle + leaderboard |
| GET | `/api/battles/history` | None | Past battles |
| GET | `/api/events/nearby` | None | Active events near lat/lon |

#### Social (Logged-in)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/vibe-checks` | JWT | Send vibe check |
| POST | `/api/vibe-checks/:id/respond` | JWT | Respond with mood |
| GET | `/api/vibe-checks/pending` | JWT | Pending vibe checks |

#### Infrastructure
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/push/subscribe` | None | Save Web Push subscription |
| POST | `/api/waitlist` | None | Join waitlist |
| GET | `/api/waitlist/stats` | None | Total signups by city |

### Route File Pattern — follow exactly

```js
// server/src/routes/pins.js
import { Router } from 'express';
import { pinRateLimit, voteRateLimit } from '../middleware/rateLimit.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { createPinSchema, voteSchema } from '../validators/pin.validator.js';
import * as PinController from '../controllers/pins.controller.js';

const router = Router();
router.get('/active',    PinController.getActivePins);
router.post('/',         pinRateLimit, validate(createPinSchema), PinController.createPin);
router.delete('/:id',    optionalAuth, PinController.deletePin);
router.post('/:id/vote', voteRateLimit, validate(voteSchema), PinController.voteOnPin);
router.get('/:id/votes', PinController.getPinVotes);
export default router;
```

### Controller Pattern — follow exactly

```js
// server/src/controllers/pins.controller.js
import * as PinService from '../services/pins.service.js';
import { success, created } from '../utils/response.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getActivePins = catchAsync(async (req, res) => {
  const pins = await PinService.getActivePins();
  success(res, pins);
});

export const createPin = catchAsync(async (req, res) => {
  const io = req.app.get('io'); // get io from app for socket emission
  const pin = await PinService.createPin({
    ...req.body,
    sessionId: req.sessionId,
    userId: req.user?.id ?? null,
  }, io);
  created(res, pin);
});

export const voteOnPin = catchAsync(async (req, res) => {
  const io = req.app.get('io');
  const result = await PinService.voteOnPin({
    pinId: req.params.id,
    sessionId: req.sessionId,
    vote: req.body.vote,
  }, io);
  success(res, result);
});
```

---

## 7. Real-time (Socket.io) Guide

### Server Setup

```js
// server/src/sockets/index.js
import { pinHandler }    from './pinHandler.js';
import { matchHandler }  from './matchHandler.js';
import { circleHandler } from './circleHandler.js';

export const initSockets = (io) => {
  io.on('connection', (socket) => {
    const sessionId = socket.handshake.auth?.sessionId;
    if (!sessionId) { socket.disconnect(true); return; }

    socket.join(`session:${sessionId}`); // personal room for targeted events
    pinHandler(io, socket);
    matchHandler(io, socket);
    circleHandler(io, socket);

    socket.on('disconnect', () => {});
  });
};
```

### Complete Socket Event Reference

**Server → All clients (`io.emit`):**
| Event | Payload | Trigger |
|---|---|---|
| `new_pin` | `{ pin }` | Pin created |
| `pin_removed` | `{ pinId, reason }` | Pin deleted or auto-removed |
| `pin_credibility_update` | `{ pinId, score, votes }` | After every vote |
| `mood_update` | `{ neighborhoodId, mood, scores, totalPins }` | Every 30s snapshot job |
| `new_circle` | `{ circle }` | Circle auto-created |
| `circle_dissolved` | `{ circleId }` | Circle expired |
| `circle_member_count` | `{ circleId, count }` | On join/leave |
| `new_story` | `{ story }` | Story posted |
| `story_expired` | `{ storyId }` | Story expired |
| `new_event` | `{ event }` | Spontaneous event detected |

**Server → Personal room (`io.to('session:${id}').emit`):**
| Event | Payload | Trigger |
|---|---|---|
| `vibe_match_found` | `{ match }` | Match found by job |
| `match_accepted` | `{ matchId, circleId }` | Other user accepted |
| `match_declined` | `{ matchId }` | Other user declined |
| `proximity_ping` | `{ ping }` | Incoming ping |
| `badge_earned` | `{ badge }` | Badge awarded |
| `vibe_check_received` | `{ check }` | Incoming vibe check |
| `quest_completed` | `{ quest, badge }` | Quest completion |

**Client → Server:**
| Event | Payload | Description |
|---|---|---|
| `join_circle` | `{ circleId }` | Join circle Socket.io room |
| `leave_circle` | `{ circleId }` | Leave circle room |
| `circle_message` | `{ circleId, content }` | Send message to circle |
| `accept_match` | `{ matchId }` | Accept a vibe match |
| `decline_match` | `{ matchId }` | Decline a vibe match |

### Emitting from Services

Always pass `io` as a parameter. Never import `io` globally.

```js
// Correct — io passed as parameter
export const createPin = async (data, io) => {
  const pin = await prisma.moodPin.create({ data });
  io.emit('new_pin', { pin });
  return pin;
};

// Personal room emission
io.to(`session:${sessionId}`).emit('vibe_match_found', { match });
```

### Client Hook

```js
// client/src/hooks/useSocket.js
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { usePinStore }    from '../store/usePinStore';
import { useMatchStore }  from '../store/useMatchStore';
import { useCircleStore } from '../store/useCircleStore';
import { useToast }       from '@/components/ui/use-toast';
import { getSessionId }   from '../utils/session';

export const useSocket = () => {
  const socketRef = useRef(null);
  const { addPin, updateCredibility, removePin } = usePinStore();
  const { addMatch }                             = useMatchStore();
  const { addMessage, setMemberCount }           = useCircleStore();
  const { toast }                                = useToast();

  useEffect(() => {
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      transports: ['websocket'],
      auth: { sessionId: getSessionId() },
    });
    const s = socketRef.current;

    s.on('new_pin',                (d) => addPin(d.pin));
    s.on('pin_removed',            (d) => removePin(d.pinId));
    s.on('pin_credibility_update', (d) => updateCredibility(d.pinId, d.score));
    s.on('new_circle',             (d) => toast({ title: `New ${d.circle.mood} Circle nearby!` }));
    s.on('circle_dissolved',       ()  => toast({ title: 'Circle dissolved' }));
    s.on('circle_message',         (d) => addMessage(d.message));
    s.on('circle_member_count',    (d) => setMemberCount(d.count));
    s.on('vibe_match_found',       (d) => { addMatch(d.match); toast({ title: 'Someone nearby shares your vibe!' }); });
    s.on('match_accepted',         (d) => window.location.href = `/circles/${d.circleId}`);
    s.on('match_declined',         ()  => toast({ title: 'They passed on the vibe' }));
    s.on('proximity_ping',         ()  => toast({ title: 'Proximity ping received!' }));
    s.on('badge_earned',           (d) => toast({ title: `Badge earned: ${d.badge.type}` }));

    return () => s.disconnect();
  }, []);

  return socketRef.current;
};
```

---

## 8. Frontend Architecture

### shadcn/ui Setup

MoodMap uses **shadcn/ui** as its component library. It copies component source into `src/components/ui/`. Never manually edit those files.

#### Adding Components

```bash
# Always bunx — never npx
bunx shadcn@latest add button
bunx shadcn@latest add badge
bunx shadcn@latest add toast
bunx shadcn@latest add dialog
bunx shadcn@latest add sheet
bunx shadcn@latest add tooltip
bunx shadcn@latest add avatar
bunx shadcn@latest add progress
bunx shadcn@latest add separator
```

#### Component Rules

- Import shadcn from `@/components/ui/<name>` via path alias.
- The `UI/` wrappers in `src/components/UI/` apply project-specific defaults. Never bypass them in pages.
- Do not install `@radix-ui/*` manually — shadcn manages Radix.
- Always use `cn()` from `src/lib/utils.js` for conditional classNames.
- Use shadcn `<Sheet>` for slide-up panels (PinDetail, NeighborhoodPanel).
- Use shadcn `<Dialog>` for modals (story viewer, badge earned, match notification).
- Use shadcn `useToast` + `<Toaster>` for all notifications — no other toast library.

```jsx
// src/components/UI/Badge.jsx — MoodBadge wrapping shadcn Badge
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getMoodColor } from '@/utils/moodColors';

export const MoodBadge = ({ mood, className }) => {
  const { bg, text, label } = getMoodColor(mood);
  return (
    <Badge className={cn('font-semibold', className)} style={{ backgroundColor: bg, color: text }}>
      {label}
    </Badge>
  );
};
```

### Path Alias

```js
// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

```json
// client/jsconfig.json
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }
```

### Global State — Zustand

Use Zustand for all shared state. Never React Context for frequently-changing data.

```js
// client/src/store/usePinStore.js
import { create } from 'zustand';
export const usePinStore = create((set) => ({
  pins: [], selectedPin: null,
  setPins:           (pins)  => set({ pins }),
  addPin:            (pin)   => set((s) => ({ pins: [...s.pins, pin] })),
  removePin:         (id)    => set((s) => ({ pins: s.pins.filter(p => p.id !== id) })),
  updateCredibility: (id, score) => set((s) => ({
    pins: s.pins.map(p => p.id === id ? { ...p, credibilityScore: score } : p)
  })),
  setSelectedPin:    (pin)   => set({ selectedPin: pin }),
}));

// client/src/store/useMatchStore.js
export const useMatchStore = create((set) => ({
  nearbyCount: 0, pendingMatches: [],
  setNearbyCount: (n)     => set({ nearbyCount: n }),
  addMatch:       (match) => set((s) => ({ pendingMatches: [...s.pendingMatches, match] })),
  removeMatch:    (id)    => set((s) => ({ pendingMatches: s.pendingMatches.filter(m => m.id !== id) })),
}));

// client/src/store/useCircleStore.js
export const useCircleStore = create((set) => ({
  activeCircle: null, messages: [], memberCount: 0,
  setCircle:      (c)   => set({ activeCircle: c }),
  addMessage:     (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  setMemberCount: (n)   => set({ memberCount: n }),
  clearCircle:    ()    => set({ activeCircle: null, messages: [], memberCount: 0 }),
}));
```

### API Layer

```js
// client/src/api/client.js
import axios from 'axios';
import { getSessionId } from '../utils/session';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, timeout: 10000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['x-session-id'] = getSessionId();
  return config;
});

api.interceptors.response.use(
  (res) => res.data.data,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err.response?.data?.error ?? 'Something went wrong');
  }
);

export default api;
```

### Session ID

```js
// client/src/utils/session.js
import { v4 as uuidv4 } from 'uuid';
const SESSION_KEY = 'moodmap_session_id';
export const getSessionId = () => {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) { id = uuidv4(); localStorage.setItem(SESSION_KEY, id); }
  return id;
};
```

### Mood Colors

```js
// client/src/utils/moodColors.js
export const MOODS = {
  CHILL:    { bg:'#FEF08A', border:'#CA8A04', text:'#713F12', emoji:'🟡', label:'Chill',    description:'Calm & relaxed' },
  HYPE:     { bg:'#FCA5A5', border:'#DC2626', text:'#7F1D1D', emoji:'🔴', label:'Hype',     description:'Energetic & loud' },
  FOCUSED:  { bg:'#86EFAC', border:'#16A34A', text:'#14532D', emoji:'🟢', label:'Focused',  description:'Work & study vibes' },
  ROMANTIC: { bg:'#93C5FD', border:'#2563EB', text:'#1E3A5F', emoji:'🔵', label:'Romantic', description:'Date-night worthy' },
  SKETCHY:  { bg:'#FDBA74', border:'#EA580C', text:'#7C2D12', emoji:'🟠', label:'Sketchy',  description:'Heads-up nearby' },
};
export const getMoodColor = (mood) => MOODS[mood] ?? MOODS.CHILL;
export const getCredibilityStyle = (score) => ({
  opacity: score >= 0.8 ? 1.0 : score >= 0.5 ? 0.85 : score >= 0.3 ? 0.55 : 0.30,
  ring: score >= 0.8 ? 'glow' : score < 0.3 ? 'disputed' : 'none',
});
```

### Map Component Rules

- Use `react-leaflet`. Tiles: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` (free, no API key).
- `React.memo` on `MoodPin`. `useMemo` for pin markers list — no full re-render on store updates.
- Pins with `credibilityScore < 0.30` render at opacity 0.30.
- `<PinDetail>` opens in a shadcn `<Sheet>` on pin click.
- Neighborhoods render as GeoJSON polygon overlays colored by dominant mood.
- `RadarPulse` shows animated 2km ring at user position with nearby count.
- Geolocation requested only on pin drop — never on page load.
- Use `leaflet.markercluster` when zoom < 13.

### Page Rules

- `Home.jsx` — fullscreen map, floating pin button, `NearbyCount`, `GhostToggle`, `QuestBanner`, `useSocket()`.
- `Trends.jsx` — `TrendChart` + `BattleLeaderboard`. Fetch on mount only.
- `Circle.jsx` — full-page live circle chat. `join_circle` on mount, `leave_circle` on unmount.
- `Profile.jsx` — `VibePassport`, mood stats, `BadgeGrid`, `MoodCalendar`, `MoodWrapped` generator.
- `Waitlist.jsx` — conversion-only landing page. No nav header.

### Routing

```jsx
// client/src/App.jsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ProtectedRoute } from './components/UI/ProtectedRoute';

const Home     = React.lazy(() => import('./pages/Home'));
const Trends   = React.lazy(() => import('./pages/Trends'));
const Circle   = React.lazy(() => import('./pages/Circle'));
const Profile  = React.lazy(() => import('./pages/Profile'));
const Login    = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const Waitlist = React.lazy(() => import('./pages/Waitlist'));

const qc = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/"            element={<Home />} />
            <Route path="/trends"      element={<Trends />} />
            <Route path="/circles/:id" element={<Circle />} />
            <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/login"       element={<Login />} />
            <Route path="/register"    element={<Register />} />
            <Route path="/waitlist"    element={<Waitlist />} />
          </Routes>
        </Suspense>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

---

## 9. Authentication Guide

- Stateless JWTs signed with `JWT_SECRET`. Expiry: 7 days.
- Client sends `Authorization: Bearer <token>`.
- No refresh tokens in v1.

```js
// server/src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('Authentication required', 401);
  try { req.user = jwt.verify(token, env.JWT_SECRET); next(); }
  catch { throw new AppError('Invalid or expired token', 401); }
};

export const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) { try { req.user = jwt.verify(token, env.JWT_SECRET); } catch {} }
  next();
};
```

```js
import bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;
export const hashPassword   = (p)    => bcrypt.hash(p, SALT_ROUNDS);
export const verifyPassword = (p, h) => bcrypt.compare(p, h);
```

**Never return to client:** `passwordHash`, raw VAPID subscription objects, session reputation internals.

---

## 10. Error Handling Guide

```js
// server/src/middleware/error.middleware.js
import { Prisma } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

export const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode ?? 500;
  let message    = err.isOperational ? err.message : 'Internal server error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') { statusCode = 409; message = 'Resource already exists'; }
    if (err.code === 'P2025') { statusCode = 404; message = 'Resource not found'; }
    if (err.code === 'P2003') { statusCode = 400; message = 'Invalid reference'; }
  }

  if (statusCode === 500) logger.error({ err, method: req.method, url: req.url });

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

| Prisma Code | Meaning | HTTP |
|---|---|---|
| P2002 | Unique constraint | 409 |
| P2025 | Not found | 404 |
| P2003 | FK violation | 400 |

---

## 11. Validation Guide

```js
// server/src/validators/pin.validator.js
import { z } from 'zod';

export const createPinSchema = z.object({
  body: z.object({
    mood:      z.enum(['CHILL', 'HYPE', 'FOCUSED', 'ROMANTIC', 'SKETCHY']),
    message:   z.string().max(100).optional(),
    latitude:  z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  })
});

export const voteSchema = z.object({
  body:   z.object({ vote: z.enum(['CONFIRM', 'DISPUTE']) }),
  params: z.object({ id: z.string().uuid() })
});
```

```js
// server/src/middleware/validate.middleware.js
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) {
    const message = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new AppError(message, 422);
  }
  req.body   = result.data.body   ?? req.body;
  req.params = result.data.params ?? req.params;
  req.query  = result.data.query  ?? req.query;
  next();
};
```

---

## 12. Security Guide

### Rate Limiting — all use Redis store

```js
const sessionKey = (req) => req.headers['x-session-id'] ?? req.ip;

export const globalRateLimit = rateLimit({ windowMs: 900000,  max: 100,                        store });
export const pinRateLimit    = rateLimit({ windowMs: 3600000, max: env.PIN_RATE_LIMIT_MAX,     store, keyGenerator: sessionKey });
export const voteRateLimit   = rateLimit({ windowMs: 3600000, max: env.VOTE_RATE_LIMIT_MAX,    store, keyGenerator: sessionKey });
export const authRateLimit   = rateLimit({ windowMs: 900000,  max: 10,                         store });
export const pingRateLimit   = rateLimit({ windowMs: 600000,  max: env.PING_RATE_LIMIT_MAX,    store, keyGenerator: sessionKey });
export const circleRateLimit = rateLimit({ windowMs: 5000,    max: 2,                          store, keyGenerator: sessionKey });
```

### Redis Response Cache Pattern

```js
// Cache key pattern: moodmap:<resource>:<identifier>
// TTLs: neighborhoods=60s, mood score=30s, battle=60s, waitlist stats=120s

const cached = await redisClient.get(cacheKey);
if (cached) return JSON.parse(cached);
const data = await prisma...;
await redisClient.setEx(cacheKey, TTL_SECONDS, JSON.stringify(data));
return data;

// Invalidate when data changes in the relevant service write
await redisClient.del(cacheKey);
```

### Security Checklist

- `helmet()` + `compression()` applied globally — never remove.
- CORS restricted to `CLIENT_URL` only — no wildcards in production.
- All bodies limited to `10kb`.
- `passwordHash` never returned in any response.
- UUID v4 for all PKs — no sequential IDs exposed.
- All strings Zod-validated before DB access.
- `x-session-id` validated as UUID format in `sessionMiddleware`.
- VAPID keys stored only in env vars — never committed to git.
- Ghost mode users filtered from every match query without exception.

---

## 13. Testing Guide

```bash
cd server && bun run test
cd server && bun run test:watch
cd server && bun run test:coverage
cd client && bun run test
```

### Priority Test Areas

```
pins.service.test.js        credibility calc, auto-remove, session reputation
votes.service.test.js       own-pin block, dupe vote (P2002), formula
auth.service.test.js        dupe email, wrong password, token
match.service.test.js       radius filter, ghost mode exclusion, expiry
circle.service.test.js      join, leave, member count, empty dissolve
badge.service.test.js       all badge trigger conditions
geo.js.test.js              haversineDistance accuracy, pointInPolygon
pins.routes.test.js         valid pin, invalid mood, rate limit
votes.routes.test.js        own pin blocked, dupe blocked
waitlist.routes.test.js     signup, referral position adjustment
```

---

## 14. Logging Guide

```js
// server/src/utils/logger.js
import winston from 'winston';
import { env } from '../config/env.js';

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.colorize({ all: true })
  ),
  transports: [
    new winston.transports.Console(),
    ...(env.NODE_ENV === 'production' ? [
      new winston.transports.File({ filename: 'logs/error.log',   level: 'error' }),
      new winston.transports.File({ filename: 'logs/combined.log' }),
    ] : []),
  ],
});
```

**Rules:** Never `console.log` in production. Never log passwords, tokens, full bodies, or PII. Log any request > 500ms as `logger.warn`.

---

## 15. Deployment Guide

### Package Manager — Bun everywhere

Lockfile is `bun.lockb` — always commit it. Never commit `package-lock.json` or `yarn.lock`.

```bash
bun install       # install deps
bun run dev       # dev server
bun run build     # production build
bun run start     # production server
bun run test      # test suite
```

### server/package.json scripts

```json
{
  "scripts": {
    "start":         "bun src/index.js",
    "build":         "bunx prisma generate && bunx prisma migrate deploy",
    "dev":           "bun --watch src/index.js",
    "test":          "vitest run",
    "test:watch":    "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Railway (Backend + PostgreSQL + Redis)

1. New Project → Deploy from GitHub.
2. Add PostgreSQL plugin → copy `DATABASE_URL`.
3. Add Redis plugin → copy `REDIS_URL`.
4. Root directory: `server/`
5. Build command: `bun run build`
6. Start command: `bun run start`
7. Set all env vars from `server/.env.example` with real values.
8. Generate VAPID keys: `bunx web-push generate-vapid-keys` → set in env.
9. `NODE_ENV=production`
10. Deploy. Verify `GET /api/health` → `{ status: "ok", db: "connected" }`.

### Vercel (Frontend)

1. New Project → Import GitHub.
2. Root directory: `client/`
3. Framework: Vite. Build: `bun run build`. Install: `bun install`.
4. Env vars: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_VAPID_PUBLIC_KEY`.
5. Deploy. Copy Vercel URL → update `CLIENT_URL` in Railway → redeploy Railway.

---

## 16. Code Style & Conventions

- ES Modules everywhere — no `require()`.
- `async/await` — no `.then()/.catch()` chains.
- `const` by default. `let` when reassignment needed. Never `var`.
- One function, one job. Max 40 lines. Extract helpers if longer.
- No magic numbers — use named constants.

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `pins.service.js` |
| Variables / Functions | camelCase | `getActivePins` |
| Classes | PascalCase | `AppError` |
| Constants | SCREAMING_SNAKE | `SALT_ROUNDS` |
| React Components | PascalCase | `MoodPin.jsx` |
| DB tables | snake_case | `mood_pins` |
| API routes | kebab-case | `/api/vibe-checks` |
| Env vars | SCREAMING_SNAKE | `VAPID_PUBLIC_KEY` |

### ESLint Config

```json
{
  "env": { "node": true, "es2022": true },
  "extends": ["eslint:recommended"],
  "parserOptions": { "ecmaVersion": 2022, "sourceType": "module" },
  "rules": {
    "no-console":     "warn",
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const":   "error",
    "eqeqeq":         "error"
  }
}
```

---

## 17. Git & PR Conventions

### Branch Naming

```
feature/vibe-circle-chat
feature/mood-wrapped-card
feature/neighborhood-battle
fix/match-ghost-mode-filter
fix/circle-dissolve-event
chore/add-vapid-env-vars
refactor/badge-service
docs/update-socket-events
```

### Commit Messages (Conventional Commits)

```
feat: add vibe match background job
feat: add proximity ping endpoint
feat: add mood wrapped canvas card
fix: filter ghost users from match pool
fix: emit circle_dissolved to room not all clients
chore: add VAPID keys to .env.example
test: add badge service trigger condition tests
```

### PR Checklist

- [ ] All tests pass (`bun run test`)
- [ ] No `console.log` in code
- [ ] New routes have validators and rate limiters
- [ ] All DB queries are in service files
- [ ] `.env.example` updated if new env vars added
- [ ] `AGENT.md` updated if architecture changed
- [ ] `bun.lockb` committed
- [ ] New shadcn components added via CLI and committed to `src/components/ui/`
- [ ] Redis cache invalidation added for any affected service writes
- [ ] Socket events documented in Section 7 if new events added
- [ ] Ghost mode filter applied to any new match/social query

---

## 18. Performance Checklist

### Backend

- [ ] `expiresAt > now()` on every pin/circle/story/ping query
- [ ] Neighborhood mood score from `mood_snapshots` — never live-recalculated
- [ ] Redis cache on neighborhoods, mood scores, waitlist stats, battle leaderboard
- [ ] Socket events carry minimum data — no full objects with all joins
- [ ] Rate limiting uses Redis store — not in-memory
- [ ] Prisma client singleton — never per-request instantiation
- [ ] Background jobs in-process — no separate worker in v1
- [ ] Graceful shutdown with SIGTERM handling
- [ ] Requests > 500ms logged as `logger.warn`

### Frontend

- [ ] Pins in Zustand — not local component state
- [ ] `React.memo` on `MoodPin`
- [ ] `useMemo` for pin marker list — no full map re-render on store update
- [ ] `leaflet.markercluster` active when zoom < 13
- [ ] All pages lazy-loaded via `React.lazy` + `Suspense`
- [ ] Axios timeout: 10 seconds
- [ ] No double-fetch on mount — correct `useEffect` deps
- [ ] `@tanstack/react-query` used for server data fetching and caching
- [ ] Vite build < 200KB initial JS bundle
- [ ] shadcn components through `UI/` wrappers — never duplicated

---

## 19. Common Mistakes to Avoid

| Mistake | Correct Approach |
|---|---|
| DB query in a controller | Move to service file |
| `process.env.X` directly | Import from `config/env.js` |
| Returning `passwordHash` | Use `select` to exclude it |
| Missing `expiresAt > now()` | Use service query helpers for active records |
| `console.log` in production | Use `logger` from `utils/logger.js` |
| Hardcoded `localhost` URLs | Always env vars |
| `bunx prisma migrate dev` in production | Use `bunx prisma migrate deploy` |
| Forgetting `bunx prisma generate` | Run after every schema change |
| Emitting sockets from controller | Emit only from services or jobs |
| Business logic in route files | Routes wire middleware + controllers only |
| Vague Zod types (`z.any()`) | Always be explicit |
| New Prisma client per request | Use singleton from `config/database.js` |
| Voting on own pin in DB layer | Block in service before DB call |
| Using `npm` or `yarn` | Always `bun` — this is a Bun project |
| `npx shadcn ...` | Use `bunx shadcn@latest ...` |
| Editing `src/components/ui/` manually | Use shadcn CLI only |
| Importing shadcn directly in pages | Import through `src/components/UI/` wrappers |
| Custom modal/sheet | Use shadcn `<Dialog>` / `<Sheet>` |
| Custom toast library | Use `useToast` from `@/components/ui/use-toast` |
| Skipping Redis invalidation on writes | Invalidate cache in every service write |
| Ghost user appearing in match pool | Filter `isGhost: false` in every match/social query |
| Match job running with 0–1 active users | Skip silently, log debug |
| Auto-creating circle without existence check | Check for active circle in same zone + mood first |
| Broadcasting personal events to all clients | Use `io.to('session:${id}')` for personal rooms |
| VAPID keys committed to git | Env vars only — never in source code |
| Push subscription returned to wrong session | Validate ownership before any push operation |
| Circle message rate limit bypassed | Enforce `circleRateLimit` middleware on socket message event |
| Forgetting to filter expired matches | Always `expiresAt > now()` on match queries |

---

> Last updated: April 2026
> Update this file whenever architecture, routes, env vars, socket events, or DB tables change.
> Any agent working on this project must read this entire file before writing any code.