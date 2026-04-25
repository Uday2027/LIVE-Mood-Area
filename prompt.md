# MoodMap — Complete Master Build Prompt
# Phase-by-Phase Agent Instructions
# Copy each phase prompt into your coding agent when you start that phase.
# Do NOT skip phases. Each phase builds on the previous one.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABOUT THIS PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MoodMap is a real-time, location-based social discovery platform.
Users drop anonymous "mood pins" on a live city map. Other nearby
users verify pins. When people share the same vibe within 2km,
they can discover each other, form temporary group chats, and
connect — all without revealing identity until both sides agree.

Stack: React + Vite + Tailwind + Leaflet.js (frontend)
       Node.js + Express + Socket.io + Prisma (backend)
       PostgreSQL + Redis (data)
       Vercel (frontend deploy) + Railway (backend + DB deploy)

Read AGENT.md before writing any code.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 0 — PROJECT SCAFFOLD & TOOLING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are setting up the full monorepo for MoodMap from scratch.
Do exactly the following and nothing else in this phase.

FOLDER STRUCTURE TO CREATE:
moodmap/
├── client/          (React + Vite frontend)
├── server/          (Node.js + Express backend)
├── .gitignore
├── README.md
└── AGENT.md

STEP 1 — Root setup
- Create the root folder moodmap/
- Create .gitignore with: node_modules, .env, dist, .DS_Store, coverage, logs
- The README.md and AGENT.md already exist — do not overwrite them

STEP 2 — Backend scaffold (server/)
Run:
  cd server
  npm init -y
  npm install express cors helmet dotenv prisma @prisma/client
              socket.io jsonwebtoken bcrypt zod winston
              express-rate-limit rate-limit-redis ioredis
              node-cron uuid
  npm install -D nodemon vitest @vitest/coverage-v8 supertest eslint

Create server/package.json scripts:
  "start":    "node src/index.js"
  "dev":      "nodemon src/index.js"
  "build":    "npx prisma generate && npx prisma migrate deploy"
  "test":     "vitest run"
  "test:watch":    "vitest"
  "test:coverage": "vitest run --coverage"

Create server/.env from .env.example with these keys:
  NODE_ENV, PORT, CLIENT_URL, DATABASE_URL, REDIS_URL,
  JWT_SECRET, JWT_EXPIRES_IN, RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX, PIN_RATE_LIMIT_MAX, VOTE_RATE_LIMIT_MAX

Initialize Prisma:
  npx prisma init

Create the full folder structure under server/src/:
  config/        (env.js, database.js, redis.js)
  routes/        (index.js, pins.js, neighborhoods.js, auth.js,
                  users.js, matches.js, circles.js)
  controllers/   (one file per route file)
  services/      (pins, votes, mood, auth, match, circle, reputation)
  middleware/    (auth, session, rateLimit, validate, error)
  sockets/       (index.js, pinHandler.js, matchHandler.js,
                  circleHandler.js)
  jobs/          (index.js, snapshotJob.js, expireJob.js,
                  matchJob.js, circleJob.js)
  validators/    (pin.validator.js, auth.validator.js,
                  vote.validator.js, match.validator.js)
  utils/         (logger.js, response.js, AppError.js,
                  catchAsync.js, geo.js, session.js)

STEP 3 — Frontend scaffold (client/)
Run:
  cd client
  npm create vite@latest . -- --template react
  npm install
  npm install axios socket.io-client leaflet react-leaflet
              zustand react-router-dom recharts
              @tanstack/react-query zod react-hot-toast
              uuid date-fns
  npm install -D tailwindcss postcss autoprefixer
  npx tailwindcss init -p

Create the full folder structure under client/src/:
  api/           (client.js, pins.js, neighborhoods.js,
                  auth.js, matches.js, circles.js, users.js)
  components/
    Map/         (Map.jsx, MoodPin.jsx, MoodHeatmap.jsx,
                  RadarPulse.jsx, PinPopup.jsx)
    Social/      (VibeMatch.jsx, VibeCircle.jsx,
                  ProximityPing.jsx, NearbyCount.jsx)
    PinForm/     (PinForm.jsx, MoodSelector.jsx)
    Panel/       (NeighborhoodPanel.jsx, PinDetail.jsx,
                  VoteButtons.jsx)
    Profile/     (VibePasteport.jsx, MoodStreak.jsx,
                  BadgeGrid.jsx, MoodWrapped.jsx)
    Charts/      (TrendChart.jsx, MoodCalendar.jsx)
    UI/          (Button.jsx, Badge.jsx, Toast.jsx,
                  Modal.jsx, Avatar.jsx, ProtectedRoute.jsx,
                  GhostToggle.jsx)
  hooks/         (useSocket.js, useLocation.js, usePins.js,
                  useSession.js, useNearby.js, useCircle.js)
  pages/         (Home.jsx, Trends.jsx, Dashboard.jsx,
                  Profile.jsx, Circle.jsx, Login.jsx,
                  Register.jsx, Waitlist.jsx)
  store/         (usePinStore.js, useAuthStore.js,
                  useCircleStore.js, useMatchStore.js)
  utils/         (session.js, moodColors.js, formatters.js,
                  geo.js, wrapped.js)
  App.jsx
  main.jsx

STEP 4 — Create all placeholder files
Every file listed above must exist with a one-line comment:
  // TODO: implement in Phase [N]
So the agent in the next phase knows where to write.

STEP 5 — Git init
  git init
  git add .
  git commit -m "init: scaffold full monorepo"

DELIVERABLE: Full folder structure exists. All packages installed.
No logic written yet. Zero errors on npm install.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 1 — DATABASE SCHEMA & SEED DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are implementing the complete PostgreSQL database schema
using Prisma ORM. Read the existing schema.prisma and AGENT.md
before writing anything.

IMPLEMENT server/prisma/schema.prisma with ALL of the following
tables. Use exact field names, types, and constraints.

─── ENUMS ───────────────────────────────────────────────────────

enum Mood         { CHILL HYPE FOCUSED ROMANTIC SKETCHY }
enum VoteType     { CONFIRM DISPUTE }
enum MatchStatus  { PENDING CONNECTED DECLINED EXPIRED }
enum CircleStatus { ACTIVE DISSOLVED }
enum BadgeType    {
  FIRST_PIN VERIFIED_10 LOCAL_CROWN MOOD_STREAK_7
  FIVE_NEIGHBORHOODS PIONEER SOCIAL_BUTTERFLY NIGHT_OWL
}

─── TABLES ──────────────────────────────────────────────────────

Table: users
  id               uuid PK default gen_random_uuid()
  username         varchar(50) unique nullable
  email            varchar(100) unique nullable
  password_hash    text nullable
  avatar_url       text nullable
  bio              varchar(160) nullable
  is_ghost         boolean default false        ← ghost mode toggle
  reputation_score decimal(5,2) default 1.00
  total_pins       int default 0
  created_at       timestamp default now()
  updated_at       timestamp @updatedAt

Table: neighborhoods
  id               serial PK
  name             varchar(100) not null
  city             varchar(100) not null
  boundary         jsonb not null               ← GeoJSON polygon
  created_at       timestamp default now()

Table: mood_pins
  id               uuid PK default gen_random_uuid()
  session_id       varchar(100) not null
  user_id          uuid FK → users nullable
  neighborhood_id  int FK → neighborhoods nullable
  mood             Mood not null
  message          varchar(100) nullable
  latitude         decimal(9,6) not null
  longitude        decimal(9,6) not null
  credibility_score decimal(5,2) default 0.50
  created_at       timestamp default now()
  expires_at       timestamp not null           ← created_at + 2hr

  INDEXES: expires_at, (neighborhood_id, expires_at), session_id

Table: pin_votes
  id               serial PK
  pin_id           uuid FK → mood_pins (cascade delete)
  session_id       varchar(100) not null
  vote             VoteType not null
  created_at       timestamp default now()

  UNIQUE: (pin_id, session_id)
  INDEX: pin_id

Table: session_reputation
  session_id       varchar(100) PK
  total_pins       int default 0
  disputed_pins    int default 0
  reputation_score decimal(5,2) default 1.00
  updated_at       timestamp @updatedAt

Table: mood_snapshots
  id               serial PK
  neighborhood_id  int FK → neighborhoods
  mood             Mood not null
  pin_count        int not null
  avg_credibility  decimal(5,2) not null
  snapshot_time    timestamp default now()

  INDEX: (neighborhood_id, snapshot_time)

Table: vibe_matches              ← NEW social table
  id               uuid PK default gen_random_uuid()
  initiator_id     varchar(100) not null        ← session_id or user_id
  target_id        varchar(100) not null
  initiator_mood   Mood not null
  target_mood      Mood not null
  distance_meters  int not null                 ← distance at match time
  status           MatchStatus default PENDING
  matched_at       timestamp default now()
  responded_at     timestamp nullable
  expires_at       timestamp not null           ← matched_at + 30 min

  INDEX: (initiator_id, status), (target_id, status), expires_at

Table: vibe_circles              ← NEW social table
  id               uuid PK default gen_random_uuid()
  neighborhood_id  int FK → neighborhoods nullable
  mood             Mood not null
  name             varchar(60) not null         ← auto-generated
  latitude         decimal(9,6) not null        ← centroid
  longitude        decimal(9,6) not null
  status           CircleStatus default ACTIVE
  member_count     int default 0
  created_at       timestamp default now()
  dissolves_at     timestamp not null           ← created_at + 2hr

  INDEX: (status, dissolves_at), (neighborhood_id, status)

Table: circle_members            ← NEW social table
  id               serial PK
  circle_id        uuid FK → vibe_circles (cascade delete)
  session_id       varchar(100) not null
  user_id          uuid FK → users nullable
  joined_at        timestamp default now()
  last_seen        timestamp default now()

  UNIQUE: (circle_id, session_id)
  INDEX: circle_id

Table: circle_messages           ← NEW social table
  id               uuid PK default gen_random_uuid()
  circle_id        uuid FK → vibe_circles (cascade delete)
  session_id       varchar(100) not null
  user_id          uuid FK → users nullable
  content          varchar(300) not null
  created_at       timestamp default now()

  INDEX: (circle_id, created_at)

Table: user_badges               ← NEW gamification table
  id               serial PK
  user_id          uuid FK → users (cascade delete)
  badge_type       BadgeType not null
  earned_at        timestamp default now()
  metadata         jsonb nullable               ← e.g. { neighborhood: "Gulshan" }

  UNIQUE: (user_id, badge_type)

Table: mood_stories              ← NEW ephemeral content table
  id               uuid PK default gen_random_uuid()
  user_id          uuid FK → users (cascade delete)
  neighborhood_id  int FK → neighborhoods
  mood             Mood not null
  content          varchar(200) nullable
  image_url        text nullable
  view_count       int default 0
  created_at       timestamp default now()
  expires_at       timestamp not null           ← created_at + 24hr

  INDEX: (neighborhood_id, expires_at), user_id

Table: story_views               ← NEW table
  id               serial PK
  story_id         uuid FK → mood_stories (cascade delete)
  viewer_session   varchar(100) not null
  viewed_at        timestamp default now()

  UNIQUE: (story_id, viewer_session)

Table: proximity_pings           ← NEW social table
  id               uuid PK default gen_random_uuid()
  sender_session   varchar(100) not null
  receiver_session varchar(100) not null
  mood             Mood not null
  latitude         decimal(9,6) not null
  longitude        decimal(9,6) not null
  seen             boolean default false
  sent_at          timestamp default now()
  expires_at       timestamp not null           ← sent_at + 10 min

  INDEX: (receiver_session, seen), expires_at

Table: waitlist                  ← NEW launch table
  id               serial PK
  email            varchar(100) unique not null
  city             varchar(100) not null
  referral_code    varchar(12) unique not null
  referred_by      varchar(12) nullable         ← referral code of referrer
  referral_count   int default 0
  position         int not null
  joined_at        timestamp default now()

  INDEX: referral_code, position

─── AFTER SCHEMA ────────────────────────────────────────────────

Run:
  npx prisma migrate dev --name init_full_schema
  npx prisma generate

Create server/prisma/seed.js with:
- 10 neighborhood records for YOUR city (use Sylhet, Bangladesh)
  with realistic GeoJSON polygon boundaries
- 3 test users (hashed passwords using bcrypt, SALT_ROUNDS=12)
- 20 sample mood_pins spread across neighborhoods
- 5 vibe_circles in ACTIVE status
- Sample waitlist entries

Run:
  node prisma/seed.js

DELIVERABLE: npx prisma studio opens and shows all tables
populated with seed data. Zero migration errors.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 2 — BACKEND CORE (CONFIG, MIDDLEWARE, AUTH, PINS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are implementing the core backend infrastructure.
Follow the layered architecture in AGENT.md exactly.
Route → Controller → Service → DB. No exceptions.

─── IMPLEMENT IN THIS ORDER ─────────────────────────────────────

1. server/src/config/env.js
   Zod schema validating all env vars. Export `env` object.
   Process.exit(1) if validation fails with clear error.

2. server/src/config/database.js
   Prisma singleton. Log queries in development only.

3. server/src/config/redis.js
   ioredis client singleton with reconnect strategy.
   Export `redisClient`.

4. server/src/utils/logger.js
   Winston logger. JSON format in production, colorized in dev.
   Export `logger`.

5. server/src/utils/AppError.js
   AppError class extending Error with statusCode + isOperational.

6. server/src/utils/catchAsync.js
   Wraps async controllers to forward errors to next().

7. server/src/utils/response.js
   success(res, data, 200), created(res, data),
   fail(res, message, 400) helpers.

8. server/src/utils/geo.js
   haversineDistance(lat1, lon1, lat2, lon2) → meters
   isWithinRadius(point, center, radiusMeters) → boolean
   pointInPolygon(lat, lon, geoJsonPolygon) → boolean (for neighborhood assignment)

9. server/src/middleware/session.middleware.js
   Read x-session-id header. Validate it is a UUID v4.
   If missing or invalid: generate new UUID, attach to req.sessionId.
   Always set x-session-id in response header.

10. server/src/middleware/auth.middleware.js
    requireAuth — throws 401 if no valid JWT
    optionalAuth — attaches req.user if token present, continues either way

11. server/src/middleware/error.middleware.js
    Global error handler. Handles AppError, Prisma errors (P2002→409,
    P2025→404), Zod errors (→422), JWT errors (→401).
    Never expose stack traces in production.

12. server/src/middleware/rateLimit.middleware.js
    globalRateLimit  — 100 req / 15 min per IP
    pinRateLimit     — 10 pins / 1 hour per session
    voteRateLimit    — 30 votes / 1 hour per session
    authRateLimit    — 10 attempts / 15 min per IP
    pingRateLimit    — 5 pings / 10 min per session
    All use Redis store. Key by session_id not IP where possible.

13. server/src/middleware/validate.middleware.js
    validate(schema) middleware using Zod.
    Attaches parsed values back to req.body, req.params, req.query.

14. server/src/validators/auth.validator.js
    registerSchema: email (valid), password (min 8, 1 uppercase,
    1 number), username (3-30 chars, alphanumeric+underscore)
    loginSchema: email, password

15. server/src/validators/pin.validator.js
    createPinSchema: mood (enum), message (max 100, optional),
    latitude (-90 to 90), longitude (-180 to 180)
    voteSchema: vote (CONFIRM|DISPUTE), params.id (uuid)

─── AUTH SERVICE & ROUTES ───────────────────────────────────────

16. server/src/services/auth.service.js
    register({ username, email, password })
      - Check email uniqueness (throw 409 if taken)
      - Hash password with bcrypt SALT_ROUNDS=12
      - Create user, generate JWT, return { user, token }
    login({ email, password })
      - Find user by email (throw 401 if not found)
      - Compare password (throw 401 if wrong)
      - Return { user, token }
    generateToken(userId) → signed JWT with userId + email
    Never return password_hash. Use Prisma select explicitly.

17. server/src/controllers/auth.controller.js
    register, login, getMe — all use catchAsync

18. server/src/routes/auth.js
    POST /register  authRateLimit, validate(registerSchema)
    POST /login     authRateLimit, validate(loginSchema)
    GET  /me        requireAuth

─── PIN SERVICE & ROUTES ────────────────────────────────────────

19. server/src/services/pins.service.js
    getActivePins()
      Returns all pins where expires_at > now()
      Include vote counts (_count), exclude user sensitive data
    createPin({ mood, message, latitude, longitude, sessionId, userId })
      - Determine neighborhood via pointInPolygon geo utility
      - Set expires_at = created_at + 2 hours
      - Apply session reputation to starting credibility_score:
        credibility_score = 0.5 * session_reputation_score
      - Increment user.total_pins if userId present
      - Check and award FIRST_PIN badge if first pin ever
      - Return created pin
    deletePin(pinId, sessionId)
      - Only delete if session_id matches (or user_id matches)
      - Throw 403 if not owner

20. server/src/services/votes.service.js
    voteOnPin({ pinId, sessionId, vote })
      - Find pin (throw 404 if not found or expired)
      - Block if sessionId matches pin.session_id (can't vote own pin)
      - Upsert is blocked by unique constraint → catch P2002 → throw 409
      - After vote: recalculate credibility_score
          confirms = count of CONFIRM votes
          disputes = count of DISPUTE votes
          score = confirms / (confirms + disputes)
      - If disputes > confirms * 3 AND disputes >= 5: delete pin (auto-remove)
      - Update session_reputation for the PIN OWNER:
          if disputed_pins / total_pins > 0.70: degrade reputation by 0.05
      - Check and award VERIFIED_10 badge to voter if 10+ confirm votes total
      - Return { pin, newCredibilityScore, removed: bool }

21. server/src/controllers/pins.controller.js
    getActivePins, createPin, deletePin, voteOnPin, getPinVotes
    All use catchAsync. createPin emits socket event after creation.

22. server/src/routes/pins.js
    GET    /active          getActivePins
    POST   /                pinRateLimit, validate(createPinSchema), createPin
    DELETE /:id             optionalAuth, deletePin
    POST   /:id/vote        voteRateLimit, validate(voteSchema), voteOnPin
    GET    /:id/votes       getPinVotes

─── NEIGHBORHOOD ROUTES ─────────────────────────────────────────

23. server/src/services/mood.service.js
    getNeighborhoodMoodScore(neighborhoodId)
      GROUP BY mood, SUM credibility_score WHERE active pins
      Return { dominantMood, scores: [{mood, score}], totalPins }
    getNeighborhoodHistory(neighborhoodId, hours=24)
      Query mood_snapshots ordered by snapshot_time ASC
    getAllNeighborhoods() → all neighborhoods with current mood score

24. Routes GET /neighborhoods, /neighborhoods/:id/mood,
    /neighborhoods/:id/history

─── SERVER ENTRY POINT ──────────────────────────────────────────

25. server/src/index.js
    Express app with helmet, cors, body parser, session middleware,
    global rate limit, routes mounted at /api,
    global error handler LAST.
    HTTP server for Socket.io.
    Start background jobs.
    Log startup with port and environment.

─── TESTS ───────────────────────────────────────────────────────

26. Write unit tests for:
    - geo.js: haversineDistance accuracy, pointInPolygon
    - votes.service.js: credibility formula, auto-remove logic
    - auth.service.js: register duplicate email, wrong password

27. Write integration tests for:
    - POST /api/pins: valid pin, invalid mood, missing coords
    - POST /api/pins/:id/vote: own pin blocked, duplicate vote blocked
    - POST /api/auth/register: success, duplicate email
    - POST /api/auth/login: success, wrong password

DELIVERABLE: npm run test passes all tests.
npm run dev starts without errors. All routes return correct responses.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 3 — REAL-TIME ENGINE (SOCKET.IO + BACKGROUND JOBS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are implementing the complete real-time layer.
Socket.io events are the heartbeat of this app.
Every user action that changes map state must broadcast instantly.

─── SOCKET SERVER SETUP ─────────────────────────────────────────

server/src/sockets/index.js
  Initialize Socket.io with:
    cors: { origin: env.CLIENT_URL, credentials: true }
    transports: ['websocket', 'polling']
  On connection:
    - Extract session_id from handshake.auth.sessionId
    - If missing, disconnect with error
    - socket.join(`session:${sessionId}`) ← personal room
    - Register all handlers
    - Log connection count on connect/disconnect

─── EVENT REFERENCE (implement all of these) ────────────────────

SERVER → ALL CLIENTS:
  new_pin                { pin }                  on pin created
  pin_removed            { pinId, reason }        on delete or auto-remove
  pin_credibility_update { pinId, score, votes }  on every vote
  mood_update            { neighborhoodId, mood, scores, totalPins }  every 30s
  new_circle             { circle }               on circle auto-created
  circle_dissolved       { circleId }             on circle expiry
  circle_member_count    { circleId, count }      on join/leave
  new_story              { story }                on story posted
  story_expired          { storyId }              on story expiry

SERVER → PERSONAL ROOM (session:${sessionId}):
  vibe_match_found       { match }                on match found
  match_accepted         { matchId, circleId }    when other user accepts
  match_declined         { matchId }              when other user declines
  proximity_ping         { ping }                 on incoming ping
  badge_earned           { badge }                on badge award

CLIENT → SERVER:
  join_circle            { circleId }             join a vibe circle room
  leave_circle           { circleId }             leave circle room
  circle_message         { circleId, content }    send message to circle

─── PIN HANDLER ─────────────────────────────────────────────────

server/src/sockets/pinHandler.js
  After pin creation in HTTP route: io.emit('new_pin', { pin })
  After vote: io.emit('pin_credibility_update', { pinId, score, votes })
  After auto-remove: io.emit('pin_removed', { pinId, reason: 'disputed' })
  Pass io into service functions that need to emit.

─── CIRCLE HANDLER ──────────────────────────────────────────────

server/src/sockets/circleHandler.js
  join_circle event:
    - Upsert circle_members record
    - socket.join(`circle:${circleId}`)
    - Emit circle_member_count to circle room
  leave_circle event:
    - Delete circle_members record
    - socket.leave(`circle:${circleId}`)
    - Emit circle_member_count update
  circle_message event:
    - Validate content (max 300 chars, not empty)
    - Save to circle_messages table
    - Rate limit: max 2 messages per 5 seconds per session
    - Emit to circle room: io.to(`circle:${circleId}`).emit('circle_message', msg)

─── MATCH HANDLER ───────────────────────────────────────────────

server/src/sockets/matchHandler.js
  accept_match event:
    - Update vibe_matches status to CONNECTED
    - Create a new vibe_circle for the matched pair
    - Emit match_accepted to both sessions with new circleId
    - Auto-join both to the new circle room
  decline_match event:
    - Update vibe_matches status to DECLINED
    - Emit match_declined to initiator's personal room

─── BACKGROUND JOBS ─────────────────────────────────────────────

server/src/jobs/index.js
  Start all jobs. Export startJobs(io).

server/src/jobs/snapshotJob.js
  Every 30 seconds (node-cron: '*/30 * * * * *'):
    - For each neighborhood: calculate dominant mood from active pins
    - Write a mood_snapshots record
    - Emit mood_update to all clients via io.emit()
    - Log: "Snapshot job: N neighborhoods processed"

server/src/jobs/expireJob.js
  Every 5 minutes (node-cron: '*/5 * * * *'):
    - Delete mood_pins where expires_at < now()
    - Dissolve vibe_circles where dissolves_at < now()
      - For each: emit circle_dissolved to circle room
      - Update status to DISSOLVED
    - Delete mood_stories where expires_at < now()
    - Delete proximity_pings where expires_at < now()
    - Expire vibe_matches where expires_at < now() and status PENDING
    - Log counts of each type cleaned up

server/src/jobs/matchJob.js
  Every 60 seconds (node-cron: '* * * * *'):
    - Get all active (non-ghost) users with pins in last 10 minutes
    - For each user: find other active users within 2km
    - If same mood: check no existing PENDING match between them
    - Create vibe_match record
    - Emit vibe_match_found to both sessions via personal rooms
    - Do not run if fewer than 2 active users (skip silently)

server/src/jobs/circleJob.js
  Every 2 minutes (node-cron: '*/2 * * * *'):
    - Find neighborhoods where 10+ HYPE pins in last 30 minutes
    - If no ACTIVE circle exists for that neighborhood + mood: create one
    - Auto-generate circle name: "[Neighborhood] [Mood] Circle"
    - Set dissolves_at = now() + 2 hours
    - Emit new_circle to all clients
    - Update circle member_count from circle_members table every 2 min

DELIVERABLE: All socket events fire correctly.
Background jobs run without errors. Console shows job logs every cycle.
Test by dropping a pin and seeing new_pin event in browser console.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 4 — SOCIAL FEATURES BACKEND (MATCHES, CIRCLES, STORIES, PINGS)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are implementing the social layer backend — the features
that make MoodMap a platform, not just a map.

─── VIBE MATCH SERVICE ──────────────────────────────────────────

server/src/services/match.service.js

  getNearbyVibeMatches(sessionId, latitude, longitude, radiusMeters=2000)
    - Find all active mood_pins within radius (use haversineDistance)
    - Exclude pins from same sessionId
    - Group by mood, return counts per mood + list of sessions
    - Return { totalNearby, byMood: [{mood, count}] }

  respondToMatch(matchId, sessionId, accept: boolean)
    - Find match where target_id = sessionId (throw 404 if not found)
    - If expired: throw 410 Gone
    - Update status to CONNECTED or DECLINED
    - Set responded_at = now()
    - If CONNECTED: create vibe_circle for the pair
    - Return { match, circle? }

  getUserMatches(sessionId, status?)
    - Return matches where initiator_id or target_id = sessionId
    - Filter by status if provided, exclude expired

Routes:
  GET  /api/matches/nearby   → getNearbyVibeMatches (lat/lon from query)
  GET  /api/matches          → getUserMatches
  POST /api/matches/:id/accept  → respondToMatch(true)
  POST /api/matches/:id/decline → respondToMatch(false)

─── VIBE CIRCLE SERVICE ─────────────────────────────────────────

server/src/services/circle.service.js

  getActiveCircles(latitude, longitude, radiusMeters=5000)
    - Return ACTIVE circles within radius
    - Include member_count
    - Exclude dissolved ones

  getCircleMessages(circleId, limit=50, before?)
    - Paginated message history
    - Throw 404 if circle not found
    - Throw 403 if session not a member

  joinCircle(circleId, sessionId, userId?)
    - Upsert circle_members
    - Increment circle.member_count
    - Return { circle, messages: last 50 }

  leaveCircle(circleId, sessionId)
    - Delete from circle_members
    - Decrement member_count
    - If member_count reaches 0: dissolve circle

  getCircleById(circleId) → full circle with member list

Routes:
  GET  /api/circles          → getActiveCircles (lat/lon query)
  GET  /api/circles/:id      → getCircleById
  GET  /api/circles/:id/messages → getCircleMessages
  POST /api/circles/:id/join    → joinCircle
  POST /api/circles/:id/leave   → leaveCircle

─── MOOD STORIES SERVICE ────────────────────────────────────────

server/src/services/stories.service.js

  getNeighborhoodStories(neighborhoodId, sessionId)
    - Return active (not expired) stories for neighborhood
    - Mark as viewed (insert story_views, ignore duplicate)
    - Return stories with view_count and hasViewed flag

  createStory({ userId, neighborhoodId, mood, content, imageUrl })
    - Set expires_at = now() + 24 hours
    - Check user has at most 3 active stories (throw 429 if exceeded)
    - Return created story

  deleteStory(storyId, userId)
    - Only owner can delete
    - Throw 403 if not owner

Routes:
  GET    /api/stories?neighborhoodId=N    → getNeighborhoodStories
  POST   /api/stories                     requireAuth, createStory
  DELETE /api/stories/:id                 requireAuth, deleteStory

─── PROXIMITY PINGS SERVICE ─────────────────────────────────────

server/src/services/ping.service.js

  sendPing({ senderSession, receiverSession, mood, latitude, longitude })
    - Validate sender != receiver
    - Check no ping sent to same receiver in last 10 minutes (429)
    - Set expires_at = now() + 10 minutes
    - After insert: emit proximity_ping to receiver's personal socket room
    - Return created ping

  getPendingPings(sessionId)
    - Return pings where receiver_session = sessionId AND seen = false
    - AND expires_at > now()

  markPingSeen(pingId, sessionId)
    - Validate receiver_session = sessionId
    - Update seen = true

Routes:
  POST /api/pings              pingRateLimit, sendPing
  GET  /api/pings/pending      getPendingPings
  POST /api/pings/:id/seen     markPingSeen

─── USER PROFILE SERVICE ────────────────────────────────────────

server/src/services/users.service.js

  getUserProfile(userId)
    - Return user with badges, total_pins, reputation_score
    - Never return password_hash

  getUserMoodHistory(userId, days=30)
    - Return pins grouped by mood and day
    - Used for vibe passport heatmap

  getUserPins(userId, page=1, limit=20)
    - Paginated user pin history with credibility scores

  updateProfile(userId, { username, bio, avatarUrl })
    - Validate username uniqueness
    - Return updated user

  toggleGhostMode(userId)
    - Flip is_ghost boolean
    - Return new is_ghost value

  checkAndAwardBadges(userId)
    - Check all badge conditions
    - Insert missing earned badges
    - Emit badge_earned socket event for each new badge
    Badge conditions:
      FIRST_PIN:          total_pins >= 1
      VERIFIED_10:        given 10+ confirm votes (from pin_votes)
      MOOD_STREAK_7:      same mood for 7 consecutive days
      FIVE_NEIGHBORHOODS: pins in 5+ distinct neighborhoods
      NIGHT_OWL:          5+ pins between 11pm and 4am
      LOCAL_CROWN:        most pins in a neighborhood this week
      PIONEER:            one of first 100 users in their city

Routes:
  GET   /api/users/me            requireAuth, getUserProfile
  PUT   /api/users/me            requireAuth, updateProfile
  POST  /api/users/me/ghost      requireAuth, toggleGhostMode
  GET   /api/users/me/pins       requireAuth, getUserPins
  GET   /api/users/me/history    requireAuth, getUserMoodHistory
  GET   /api/users/:id           getUserProfile (public, limited fields)

─── WAITLIST SERVICE ────────────────────────────────────────────

server/src/services/waitlist.service.js

  joinWaitlist({ email, city, referralCode? })
    - Generate unique 12-char referral code
    - Calculate position (total count + 1)
    - If referredBy is valid code: find referrer, increment their
      referral_count, move them up 10 positions (decrement position)
    - Return { position, referralCode, totalAhead }

  getWaitlistStats()
    - Return { totalSignups, byCity: [{city, count}] }

Routes:
  POST /api/waitlist            joinWaitlist
  GET  /api/waitlist/stats      getWaitlistStats (no auth, for landing page)

DELIVERABLE: All social API endpoints return correct data.
Socket events fire for matches, pings, and badge awards.
Write basic integration tests for each new route group.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 5 — FRONTEND CORE (MAP, PINS, REAL-TIME)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are building the main map interface and real-time pin system.
This is what users see first. It must be fast, beautiful, and live.

─── GLOBAL SETUP ────────────────────────────────────────────────

client/src/utils/session.js
  getSessionId() → read from localStorage or generate uuid v4 and store it
  clearSession() → remove from localStorage

client/src/utils/moodColors.js
  MOODS = {
    CHILL:    { bg:'#FEF08A', border:'#CA8A04', text:'#713F12',
                emoji:'🟡', label:'Chill',   description:'Calm & relaxed' },
    HYPE:     { bg:'#FCA5A5', border:'#DC2626', text:'#7F1D1D',
                emoji:'🔴', label:'Hype',    description:'Energetic & loud' },
    FOCUSED:  { bg:'#86EFAC', border:'#16A34A', text:'#14532D',
                emoji:'🟢', label:'Focused', description:'Work & study vibes' },
    ROMANTIC: { bg:'#93C5FD', border:'#2563EB', text:'#1E3A5F',
                emoji:'🔵', label:'Romantic',description:'Date-night worthy' },
    SKETCHY:  { bg:'#FDBA74', border:'#EA580C', text:'#7C2D12',
                emoji:'🟠', label:'Sketchy', description:'Heads up nearby' },
  }
  getCredibilityStyle(score) → { opacity, ring } based on score thresholds:
    score >= 0.8 → opacity 1.0, ring 'glow'
    score >= 0.5 → opacity 0.85, ring 'none'
    score >= 0.3 → opacity 0.55, ring 'none'
    score <  0.3 → opacity 0.30, ring 'disputed'

client/src/api/client.js
  Axios instance with:
    baseURL = VITE_API_URL
    timeout = 10000
  Request interceptor:
    - Attach Authorization: Bearer {token} if token in localStorage
    - Attach x-session-id header from getSessionId()
  Response interceptor:
    - Unwrap res.data.data on success
    - On 401: clear token, redirect to /login

─── GLOBAL STATE ────────────────────────────────────────────────

client/src/store/usePinStore.js
  State: pins[], selectedPin (null), mapCenter, mapZoom
  Actions: setPins, addPin, removePin, updatePinCredibility,
           setSelectedPin, setMapView

client/src/store/useAuthStore.js
  State: user (null), token (null), isAuthenticated
  Actions: setAuth({ user, token }), logout, updateUser
  On init: read token from localStorage, decode user

client/src/store/useMatchStore.js
  State: nearbyCount (0), pendingMatches [], activeMatch (null)
  Actions: setNearbyCount, addMatch, removeMatch, setActiveMatch

client/src/store/useCircleStore.js
  State: activeCircle (null), messages [], memberCount 0
  Actions: setCircle, addMessage, setMemberCount, clearCircle

─── SOCKET HOOK ─────────────────────────────────────────────────

client/src/hooks/useSocket.js
  Connect to VITE_SOCKET_URL with auth: { sessionId }
  Handle ALL server events:
    new_pin                → usePinStore.addPin()
    pin_removed            → usePinStore.removePin()
    pin_credibility_update → usePinStore.updatePinCredibility()
    mood_update            → update neighborhood mood in local state
    new_circle             → show toast "New Hype Circle in [area]!"
    circle_dissolved       → show toast, clear if current circle
    circle_message         → useCircleStore.addMessage()
    circle_member_count    → useCircleStore.setMemberCount()
    vibe_match_found       → useMatchStore.addMatch(), show notification
    match_accepted         → navigate to circle
    match_declined         → show toast "They passed"
    proximity_ping         → show ping notification
    badge_earned           → show badge earned modal
  Expose: socket instance, isConnected bool
  Reconnect automatically. Log connection state changes.

─── MAP COMPONENT ───────────────────────────────────────────────

client/src/components/Map/Map.jsx
  Use react-leaflet MapContainer, TileLayer, useMap hook.
  Tile layer: OpenStreetMap (free, no API key needed)
    URL: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
  On mount: request geolocation, center map on user position
  Render: MoodPin for each pin in usePinStore
  Render: MoodHeatmap overlay layer
  Render: RadarPulse component centered on user position
  Handle: map click → open PinForm at clicked location
  Performance: use useMemo for pin markers — do NOT re-render all
    pins on every store update. Only re-render changed pins.
  Do not show exact user location on map (privacy).

client/src/components/Map/MoodPin.jsx
  Leaflet Marker with custom DivIcon.
  DivIcon renders: emoji circle with mood color background.
  Apply credibility-based opacity from getCredibilityStyle().
  Disputed pins (< 0.3): render with strikethrough and grey tint.
  onClick: usePinStore.setSelectedPin(pin) → opens PinDetail panel.
  Pin label shows: mood emoji + time ago (e.g. "🔴 12m ago")

client/src/components/Map/MoodHeatmap.jsx
  Neighborhood zones rendered as GeoJSON polygons.
  Color fill based on dominant mood of each zone.
  Opacity = normalized active pin count (more pins = more opaque).
  On click: open NeighborhoodPanel for that zone.
  Update every time mood_update socket event fires.

client/src/components/Map/RadarPulse.jsx
  Animated pulsing circle at user's location.
  Shows 2km radius ring (dashed).
  Inner pulse animation: CSS keyframe, repeating.
  Color changes to match most common nearby mood.
  Shows nearby count number in center.
  On click: open VibeMatch panel.

─── PIN FORM ────────────────────────────────────────────────────

client/src/components/PinForm/PinForm.jsx
  Modal/drawer that opens when user taps map.
  Shows: MoodSelector, optional message input (100 char limit
         with counter), submit button.
  On submit: POST /api/pins with { mood, message, latitude, longitude }
  After success: close form, show toast "Vibe dropped!", pin appears
    on map via socket event (do not add manually to avoid duplication).
  Show error if rate limited (too many pins).
  Require location permission before showing — if denied, show
    friendly message explaining why location is needed.

client/src/components/PinForm/MoodSelector.jsx
  Grid of 5 mood cards. Each shows emoji, label, description.
  Selected mood has colored border glow effect.
  Animate selection with subtle scale transform.

─── PANELS ──────────────────────────────────────────────────────

client/src/components/Panel/PinDetail.jsx
  Slide-up panel when a pin is selected.
  Shows: mood badge, message, time ago, credibility bar,
    confirm/dispute buttons, vote counts.
  VoteButtons: call POST /api/pins/:id/vote
    Disable both buttons after voting.
    Show real-time vote count updates from socket.
  Close button or map click dismisses panel.

client/src/components/Panel/NeighborhoodPanel.jsx
  Right-side panel for neighborhood details.
  Shows: zone name, dominant mood badge, active pin count,
    credibility heatmap, mood trend sparkline (last 24h from API),
    list of mood stories for this neighborhood,
    "Join the [Mood] Circle" button if active circle exists.

─── PAGES ───────────────────────────────────────────────────────

client/src/pages/Home.jsx
  Layout: fullscreen Map, floating PinForm trigger button,
    NearbyCount badge top-right, GhostToggle top-left (if logged in),
    bottom drawer for NeighborhoodPanel.
  On mount: fetch active pins → usePinStore.setPins()
  Initialize useSocket() hook.
  Initialize useNearby() hook to poll nearby count every 60s.

client/src/App.jsx
  Routes:
    /              → Home (public)
    /trends        → Trends (public)
    /circles/:id   → Circle (public with session)
    /profile       → Profile (protected)
    /login         → Login
    /register      → Register
    /waitlist      → Waitlist (landing page)
  Wrap all routes with QueryClientProvider, react-hot-toast Toaster.
  Read auth state from useAuthStore on app init.

DELIVERABLE: Map loads, shows pins, real-time updates work.
Pin drop form works end-to-end. Vote buttons work.
No console errors. Mobile responsive (test at 375px width).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 6 — SOCIAL UI (MATCHES, CIRCLES, STORIES, PROFILES)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are building the social layer UI — the features that make
users come back and tell their friends.

─── NEARBY VIBE COUNT ───────────────────────────────────────────

client/src/components/Social/NearbyCount.jsx
  Floating badge top-right on the map.
  Shows: "N people nearby" with mood breakdown on hover/tap.
  Tapping opens VibeMatch panel.
  Animates when count changes (subtle bounce).
  Uses useNearby() hook that polls GET /api/matches/nearby every 60s.
  If 0 nearby: show "You're the only one here — set the vibe!"

client/src/components/Social/VibeMatch.jsx
  Bottom sheet/modal with nearby vibe people.
  Shows: mood breakdown bars (HYPE: 4, CHILL: 2, etc.)
  Big CTA: "Find my vibe tribe" button → triggers match search.
  When match found (via socket): show match card with:
    - Their mood emoji (NOT their identity)
    - Distance ("~800m away")
    - "Connect" and "Pass" buttons
    - 30-second countdown timer (match expires)
  On connect: navigate to new Vibe Circle.
  Ghost mode toggle integrated here.

─── VIBE CIRCLE UI ──────────────────────────────────────────────

client/src/pages/Circle.jsx
  Full-page circle experience.
  Header: circle name, mood badge, dissolve countdown timer,
    member count with animated avatars (initials circles).
  Message list: auto-scrolls to bottom on new message.
    Each message: session avatar (initials), content, time ago.
    Own messages: right-aligned.
    Others: left-aligned.
  Input: text field + send button. Enter key sends.
    Character limit 300. Counter shows remaining chars.
    Rate limit feedback: "Slow down a bit" if too fast.
  Empty state: "Be the first to say something in this circle!"
  Circle is LIVE — all messages via Socket.io, not HTTP polling.
  Dissolved state: "This circle has dissolved. The vibe has moved on."
  On mount: joinCircle API call + socket join_circle event.
  On unmount: socket leave_circle event.

client/src/components/Social/ProximityPing.jsx
  Notification that appears when a ping is received.
  Shows: mood emoji + "Someone nearby sent you a vibe ping"
  Two buttons: "Ping back" and "Ignore"
  Auto-dismisses after 15 seconds if not interacted with.
  Ping back → sends a ping to that session via POST /api/pings.

─── MOOD STORIES UI ─────────────────────────────────────────────

  Stories shown in NeighborhoodPanel as horizontal scroll row.
  Each story: colored circle with mood emoji + poster initials.
  Tap to open story modal:
    Full-screen overlay.
    Progress bar at top (auto-advance if multiple).
    Shows: mood badge, content text, neighborhood name, time ago.
    View count shown if viewer is the author.
  Add Story button: only shown if logged in.
    Opens story creation form with mood selector + text input.
    Image upload placeholder (show "coming soon" tooltip for v1).

─── USER PROFILE ────────────────────────────────────────────────

client/src/pages/Profile.jsx
  Protected page. Fetch from GET /api/users/me.

  Section 1 — Vibe Passport:
    User avatar (initials circle) with mood ring border
    (color = most frequent mood this week).
    Username, bio, member since date.
    Ghost mode toggle with explanation tooltip.
    Edit profile button.

  Section 2 — Mood Stats:
    This week's mood breakdown as horizontal bar chart (Recharts).
    Total pins, neighborhoods visited, verified pins count.
    Current streak if any.

  Section 3 — Badge Wall:
    Grid of earned badges. Greyed out for unearned.
    Each badge: icon + name + earned date.
    Hover/tap shows badge description.
    Badges: 🗺️ Pioneer, 🔥 Mood Streak, 👑 Local Crown,
            ✅ Verified Pro, 🌍 Explorer, 🦉 Night Owl,
            🤝 Social Butterfly, 🎯 First Pin

  Section 4 — Vibe History:
    MoodCalendar component: GitHub-style contribution grid
    where each cell = a day, color = dominant mood that day.
    Last 3 months shown. Hover shows "3 pins on Dec 12, mostly CHILL"

  Section 5 — My Pins:
    Paginated list of own pins with mood, location, credibility score,
    confirm/dispute counts. Delete button on each.

client/src/components/Profile/MoodWrapped.jsx
  Generates a shareable weekly mood summary card.
  Canvas-rendered card (use HTML Canvas API):
    Background: gradient based on dominant mood color
    Title: "My Week in Vibes"
    Stats: most frequent mood with emoji, neighborhoods visited count,
      total pins, highlight moment ("Most verified: [message]")
    Bottom: "MoodMap" branding + week date range
  "Share" button: uses Web Share API on mobile, downloads PNG on desktop.
  This card is designed to look GREAT as an Instagram story.
  Triggered from Profile page: "Generate My Mood Wrapped" button.
  Data from GET /api/users/me/history (last 7 days).

─── AUTH PAGES ──────────────────────────────────────────────────

client/src/pages/Login.jsx
  Clean centered card. Email + password fields.
  "Continue with session" option (skip login, use anonymous mode).
  Link to register. Form validation with Zod on client.
  On success: store token, redirect to home.

client/src/pages/Register.jsx
  Username, email, password fields. Password strength indicator.
  Terms checkbox. On success: auto-login, redirect to home.

─── WAITLIST LANDING PAGE ───────────────────────────────────────

client/src/pages/Waitlist.jsx
  This is the page you share before launch. Make it beautiful.
  Hero: "Your city has a mood. Now you can feel it."
  Subheadline: "Real-time mood map + find your vibe tribe nearby."
  Animated map preview (fake but beautiful — CSS animated dots
    appearing and disappearing on a blurred map background).
  Email + city input form → POST /api/waitlist.
  After submit: show position + referral link.
    "You're #[N] in [city]. Share your link to move up."
  Referral link: [domain]/waitlist?ref=[code]
  Feature teaser grid: 4 cards showing key features with icons.
  Live counter: "X people already waiting" (from /api/waitlist/stats).
  NO navigation header. Full-screen, conversion-focused.

DELIVERABLE: Full social UI working end-to-end.
Circles load and receive messages live. Profile shows real data.
Mood Wrapped card generates and is shareable. Waitlist form submits.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 7 — ENGAGEMENT LOOPS & GAMIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are implementing the features that make users return daily
and tell their friends. These are not optional — they are the
growth engine of the entire platform.

─── DAILY VIBE QUEST ────────────────────────────────────────────

Backend:
  Add table: daily_quests
    id, quest_type, description, target_mood (nullable),
    target_count, radius_meters, created_date (date), is_active bool

  Add table: quest_completions
    id, user_id FK users, session_id, quest_id FK daily_quests,
    completed_at, metadata jsonb
    UNIQUE: (user_id, quest_id) or (session_id, quest_id)

  Quest types to generate daily (rotate via cron job, daily at midnight):
    FIND_CHILL   "Find a CHILL spot within 1km before 6pm"
    VERIFY_5     "Verify 5 mood pins today"
    HYPE_HUNTER  "Find a HYPE zone and drop a pin"
    EXPLORER     "Drop pins in 3 different neighborhoods today"
    CONNECTOR    "Connect with someone who has the same vibe"

  service: getActiveQuest() → today's quest
  service: checkQuestCompletion(sessionId, userId) → check and award
  route: GET /api/quests/today
  route: GET /api/quests/my-progress

Frontend:
  Quest banner at bottom of Home page.
  Shows: quest icon, description, progress bar, reward badge preview.
  Dismissable but reappears next day.
  On completion: confetti animation + badge award notification.

─── NEIGHBORHOOD BATTLES ────────────────────────────────────────

Backend:
  Add table: neighborhood_battles
    id, start_date (date), end_date (date), mood Mood,
    winner_neighborhood_id FK nullable, is_active bool

  Add table: battle_scores
    id, battle_id FK, neighborhood_id FK, score decimal,
    pin_count int, avg_credibility decimal, recorded_at timestamp

  Every Friday at 8pm: auto-create a battle for that weekend
  Battle: "Which neighborhood has the most HYPE this weekend?"
  Score = SUM(credibility_score) of HYPE pins in time window
  Every hour: update battle_scores for all neighborhoods
  Sunday midnight: determine winner, store winner_neighborhood_id

  Routes:
    GET /api/battles/current   → active battle with live leaderboard
    GET /api/battles/history   → past battles with winners

Frontend:
  Leaderboard component: animated bar chart (Recharts) on Trends page.
  Shows top 5 neighborhoods with live score bars.
  Winning neighborhood gets crown overlay on map.
  Push notification opt-in: "Get notified when your neighborhood wins"

─── MOOD DIARY (WEEKLY SUMMARY PUSH) ───────────────────────────

Backend:
  Every Sunday at 9am (cron): generate weekly diary for all users
  with activity in last 7 days.
  Store in table: mood_diaries
    id, user_id FK, week_start date, week_end date,
    summary_data jsonb (moods, neighborhoods, pins, highlights),
    generated_at timestamp
  Route: GET /api/users/me/diary?week=YYYY-MM-DD

Frontend:
  Diary card in Profile page — same design system as Mood Wrapped.
  Auto-opens on Sunday if user has been active.
  Shareable via same canvas card mechanism as Mood Wrapped.
  Past diaries accessible in a "My Journal" tab on profile.

─── SPONTANEOUS EVENT DETECTION ─────────────────────────────────

Backend (extend circleJob.js):
  Threshold for "event detected": 8+ pins of same mood
  in a 500m radius within 20 minutes.
  When detected:
    - Create a vibe_circle (already implemented)
    - Also write to events table:
        id, neighborhood_id, mood, latitude, longitude,
        detected_at, pin_count, circle_id FK, is_active bool
    - Push notification to users within 3km (if opted in):
        "Something HYPE is happening in [area] right now!"
  Route: GET /api/events/nearby?lat&lon&radius

Frontend:
  Pulsing red dot on map at event location (different from normal pins).
  Event marker popup: "LIVE EVENT — 12 people here, HYPE vibes"
  Tap to join the auto-generated circle.

─── VIBE CHECK FEATURE ──────────────────────────────────────────

Backend:
  Add table: vibe_checks
    id, sender_id FK users, receiver_id FK users,
    sender_mood Mood nullable, receiver_mood Mood nullable,
    sent_at timestamp, responded_at timestamp nullable,
    expires_at timestamp (sent_at + 24hr)

  service: sendVibeCheck(senderId, receiverId)
  service: respondVibeCheck(checkId, receiverId, mood)
  Socket event: vibe_check_received → to receiver's personal room
  Routes:
    POST /api/vibe-checks         requireAuth, sendVibeCheck
    POST /api/vibe-checks/:id/respond requireAuth, respondVibeCheck
    GET  /api/vibe-checks/pending requireAuth

Frontend:
  Only for logged-in users with connections.
  "Send vibe check" button on another user's public profile.
  Notification: "[@user] wants to know your vibe"
  One-tap response: pick your current mood.
  After both respond: show comparison "You: CHILL · They: HYPE"
    with funny compatibility comment.

─── PUSH NOTIFICATIONS (WEB PUSH) ──────────────────────────────

Backend:
  Install: npm install web-push
  Generate VAPID keys, store in env as VAPID_PUBLIC, VAPID_PRIVATE.
  Add table: push_subscriptions
    id, session_id, user_id FK nullable, subscription jsonb,
    created_at timestamp
  Route: POST /api/push/subscribe
  service: sendPush(subscriptions, { title, body, data })
  Use sendPush for:
    - Vibe match found (immediate)
    - Proximity ping received (immediate)
    - Circle about to dissolve — 15 min warning
    - Badge earned
    - Battle winner announced (Sunday)
    - Quest completed

Frontend:
  On first pin drop: ask permission for notifications.
  service worker: client/public/sw.js
    Handle push events, show notification.
    On notification click: open app to relevant page.
  Register service worker in main.jsx.
  POST subscription to /api/push/subscribe after permission granted.

DELIVERABLE: Daily quest shows on home page. Battle leaderboard
updates live on Trends page. Events appear on map in real-time.
Push notifications fire for matches and pings (test in Chrome DevTools).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 8 — POLISH, PERFORMANCE & PRODUCTION HARDENING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are making MoodMap production-ready. No shortcuts.
Every item in this phase must be completed before deployment.

─── BACKEND HARDENING ───────────────────────────────────────────

Security:
  - Add express-mongo-sanitize equivalent: strip $ and . from all
    string inputs before they reach the DB layer
  - Add X-Content-Type-Options, X-Frame-Options via helmet (already
    included, verify config is strict)
  - Verify CORS allows only CLIENT_URL — no wildcards
  - Add request size limit 10kb on all JSON routes
  - Add compression middleware (npm install compression)
  - Sanitize all user-facing text fields: strip HTML tags
    (npm install sanitize-html), apply on message and bio fields
  - Validate UUID format on all :id params before DB query

Performance:
  - Add Redis caching for GET /api/neighborhoods (TTL 60s)
  - Add Redis caching for GET /api/neighborhoods/:id/mood (TTL 30s)
  - Add Redis caching for GET /api/waitlist/stats (TTL 120s)
  - Cache key pattern: moodmap:${route}:${params}
  - Invalidate caches in services when data changes
  - Add database connection pooling: set prisma connection_limit=10
  - Add response time logging: log any request > 500ms as warning

Reliability:
  - Graceful shutdown: on SIGTERM, stop accepting new connections,
    finish in-flight requests, close DB and Redis, then exit
  - Handle uncaughtException and unhandledRejection globally:
    log the error, then exit(1) in production
  - Add /api/health endpoint that checks DB + Redis connectivity
  - Add job failure recovery: if snapshotJob fails, log error and
    continue — never crash the process

─── FRONTEND PERFORMANCE ────────────────────────────────────────

Map performance:
  - Use React.memo on MoodPin to prevent unnecessary re-renders
  - Cluster nearby pins when zoom < 13 (use leaflet.markercluster)
    npm install leaflet.markercluster
  - Virtualize the pin list in profile page (only render visible items)
  - Lazy load Circle page and Profile page with React.lazy + Suspense

Bundle optimization:
  - Configure Vite to code-split by route
  - Add vite-plugin-compression for gzip
  - Target < 200KB initial JS bundle (check with vite build --report)
  - Preload critical fonts in index.html

UX polish:
  - Add skeleton loaders for: map pins on load, profile sections,
    circle messages, trends chart data
  - Add optimistic UI for pin voting: update count immediately,
    revert on error
  - Add pull-to-refresh on mobile (touch event on Home)
  - Add empty states for every list component (never show blank areas)
  - Add connection status indicator: show "Reconnecting..." banner
    when socket disconnects, hide when reconnected
  - All interactive elements: min touch target 44x44px
  - Add haptic feedback on mobile for: pin drop, vote, match found
    (use navigator.vibrate API)

Accessibility:
  - All interactive elements have aria-label attributes
  - Mood selector is keyboard navigable with arrow keys
  - Color is never the only differentiator — always add text label
  - Focus ring visible on all interactive elements
  - Add <title> to all pages

─── ERROR BOUNDARIES ────────────────────────────────────────────

  Wrap the Map component in an error boundary.
  If map fails to load: show "Map unavailable — try refreshing"
  Wrap Circle page in error boundary.
  If socket disconnects in circle: show reconnect banner.
  Global error boundary in App.jsx: catch unexpected crashes,
    show friendly error page with "Reload app" button.

─── ENVIRONMENT & SECRETS AUDIT ─────────────────────────────────

  Confirm these are NEVER in git:
    .env files, JWT_SECRET, VAPID keys, DATABASE_URL, REDIS_URL
  Confirm these ARE in Railway env vars:
    All keys from server/.env.example
  Confirm these ARE in Vercel env vars:
    VITE_API_URL, VITE_SOCKET_URL
  Add .env.example with placeholders (no real values) to git.

─── FINAL TESTING ───────────────────────────────────────────────

  Run full test suite: npm run test (must be green)
  Manual test checklist:
    [ ] Drop pin anonymously → appears on map in < 2 seconds
    [ ] Vote on pin → credibility updates live for all clients
    [ ] Match found → notification fires, navigate to circle
    [ ] Circle message → appears for all members instantly
    [ ] Pin expires after 2 hours → disappears from map
    [ ] Circle dissolves → all members see dissolved message
    [ ] Ghost mode → user disappears from match pool
    [ ] Badge earned → notification fires, badge appears in profile
    [ ] Mood Wrapped → card generates and is shareable
    [ ] Waitlist signup → position shown, referral link works
    [ ] Push notification → fires for match and ping
    [ ] Mobile (375px) → all UI fits, no overflow
    [ ] Slow connection (throttle to 3G) → skeleton loaders show

DELIVERABLE: Zero console errors. All manual tests pass.
Lighthouse score > 85 on Performance, > 90 on Accessibility.
npm run test: all green.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 9 — DEPLOYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

You are deploying MoodMap to production.
Follow every step exactly. Do not skip steps.

─── STEP 1 — RAILWAY (Backend + Database + Redis) ───────────────

1. Create Railway account at railway.app
2. New Project → Deploy from GitHub repo
3. Add PostgreSQL plugin to the project
4. Add Redis plugin to the project
5. Copy DATABASE_URL from PostgreSQL plugin → set in service env vars
6. Copy REDIS_URL from Redis plugin → set in service env vars
7. Set ALL remaining env vars from server/.env.example:
     NODE_ENV=production
     PORT=5000
     CLIENT_URL=https://your-vercel-url.vercel.app
     JWT_SECRET=[generate: openssl rand -base64 32]
     JWT_EXPIRES_IN=7d
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX=100
     PIN_RATE_LIMIT_MAX=10
     VOTE_RATE_LIMIT_MAX=30
     VAPID_PUBLIC=[from web-push generate-vapid-keys]
     VAPID_PRIVATE=[from web-push generate-vapid-keys]
8. Set root directory: server/
9. Set build command: npm run build
   (runs: prisma generate && prisma migrate deploy)
10. Set start command: npm start
11. Deploy. Verify /api/health returns { status: "ok", db: "connected" }
12. Copy the Railway backend URL for next step.

─── STEP 2 — VERCEL (Frontend) ──────────────────────────────────

1. Create Vercel account at vercel.com
2. New Project → Import GitHub repo
3. Set root directory: client/
4. Framework preset: Vite
5. Set env vars:
     VITE_API_URL=https://your-railway-url.railway.app/api
     VITE_SOCKET_URL=https://your-railway-url.railway.app
6. Build command: npm run build
7. Output directory: dist
8. Deploy.
9. Go back to Railway: update CLIENT_URL to the Vercel URL.
10. Redeploy Railway backend (triggers CORS update).

─── STEP 3 — VERIFY PRODUCTION ──────────────────────────────────

  [ ] Frontend loads at Vercel URL
  [ ] Map displays with OpenStreetMap tiles
  [ ] POST /api/auth/register creates a user
  [ ] POST /api/pins creates a pin visible on map
  [ ] Socket.io connects (check browser DevTools Network → WS)
  [ ] Background jobs running (check Railway logs for job outputs)
  [ ] /api/health returns ok

─── STEP 4 — SEED PRODUCTION DATA ──────────────────────────────

  Run seed script against production DB:
  DATABASE_URL=[railway-url] node server/prisma/seed.js
  This populates neighborhoods so the map is not empty on launch.

─── STEP 5 — CUSTOM DOMAIN (OPTIONAL) ──────────────────────────

  Vercel: Settings → Domains → Add your domain
  Update VITE_API_URL and VITE_SOCKET_URL if using custom backend domain.
  Update CLIENT_URL in Railway env vars.

DELIVERABLE: Live URL accessible. Full feature set working in
production. Share the URL and test on a real mobile device.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE 10 — LAUNCH STRATEGY EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This is not a coding phase. These are the exact actions to take
to make this app go viral. Execute in order.

WEEK BEFORE LAUNCH:
  [ ] Share the /waitlist page in 3 university WhatsApp groups
  [ ] Post a teaser video: screen recording of the live map
      with 20 pins on it (use seed data). No talking. Just the
      pulsing pins and the mood heatmap. Add lo-fi music.
      Caption: "We built something for your city. Coming soon."
  [ ] Set up a Twitter/X account: @MoodMapApp
  [ ] Post the teaser on Reddit: r/bangladesh, r/dhaka,
      r/SylhetBD (wherever your target city has communities)
  [ ] DM 10 university student influencers with early access

LAUNCH DAY:
  [ ] Post on Product Hunt (prepare listing in advance):
      Tagline: "See your city's live mood — and find your vibe tribe"
      First comment: explain the verification system (makes it unique)
      Screenshots: live map with pins, circle chat, vibe passport
  [ ] Post on all social media simultaneously
  [ ] Send email to everyone on waitlist: "You're in. Go drop your vibe."
  [ ] Post a thread on X: "We built a social app where your mood
      is your profile and location is your matchmaker. Here's how..."
      Thread: show each feature in 1 screenshot per tweet.

WEEK AFTER LAUNCH:
  [ ] Find the first person to earn LOCAL_CROWN badge.
      Post about them (with permission): "Meet [city]'s first
      neighborhood mood king."
  [ ] Screenshot the first spontaneous event that auto-generated
      on the map. Post it.
  [ ] Reach out to ONE local journalist with the angle:
      "This app shows the live mood of your city — built by a
      developer from [your city]." Local angle + live demo = story.
  [ ] Launch the neighborhood battle for the second weekend.
      Post: "[Neighborhood A] vs [Neighborhood B] this weekend.
      Drop your pins. The winner gets crowned."

ONGOING GROWTH LOOPS:
  [ ] Every Sunday: tweet the top Mood Wrapped cards submitted
      that week (with user permission)
  [ ] Every battle winner: post a graphic of the winning neighborhood
  [ ] Reply to every tweet that mentions MoodMap in first 2 weeks
  [ ] Add "Made in [your city]" to the waitlist page — local pride
      is a growth lever

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 0  — Monorepo scaffold & tooling         (1 day)
Phase 1  — Database schema & seed data         (1 day)
Phase 2  — Backend core: auth, pins, votes     (3 days)
Phase 3  — Real-time: Socket.io + background   (2 days)
Phase 4  — Social backend: matches, circles,
           stories, pings, waitlist            (3 days)
Phase 5  — Frontend core: map, pins, real-time (3 days)
Phase 6  — Social UI: matches, circles,
           profiles, wrapped card              (3 days)
Phase 7  — Engagement: quests, battles,
           events, web push                   (2 days)
Phase 8  — Polish, performance, hardening      (2 days)
Phase 9  — Deployment                         (1 day)
Phase 10 — Launch strategy                    (ongoing)

TOTAL: ~3.5 weeks solo. Faster with an agent.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW TO USE THIS FILE WITH A CODING AGENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Copy the content of one PHASE block at a time.
2. Paste it into your coding agent (Claude Code, Cursor, etc.)
   as the task prompt.
3. Let the agent complete the phase fully before starting the next.
4. After each phase: run the tests, verify the deliverable,
   commit: git commit -m "feat: complete phase N — [description]"
5. Never start the next phase until the current one is green.

If the agent gets stuck on a phase, paste this additional context:
  "Read AGENT.md for the full architecture guide.
   Follow the layered architecture strictly.
   All DB access goes through a service file.
   All errors use AppError. All responses use the response helpers."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━