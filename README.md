# 🗺️ MoodMap — Real-Time Crowd Mood Tracker

> See the vibe of your city, right now.

MoodMap is a real-time web application where users anonymously drop "mood pins" on a live city map. Anyone can instantly see the current atmosphere of any neighborhood — no login required. Pins are verified by nearby users to ensure data accuracy and trustworthiness.

---

## 🌟 Features

- **Live Mood Map** — Interactive map with color-coded neighborhood vibes updating in real time
- **Anonymous Mood Pins** — Drop a pin in seconds, no account needed
- **Crowd Verification** — Nearby users confirm or dispute pins to maintain data integrity
- **Credibility Scoring** — Pins are weighted by how many people verified them
- **Mood Trends** — Charts showing how a neighborhood's vibe changes throughout the day
- **Auto-Expiry** — Pins automatically disappear after 2 hours to keep data fresh
- **Optional Accounts** — Save your pin history and earn badges
- **Native In-App Routing** — Calculate and draw street-level routes from your GPS to any pin using OSRM
- **Live Activity Feed** — Sidebar grouped by mood with real-time updates and map panning
- **Smart Geocoding** — Automatically resolves GPS coordinates to human-readable location names
- **Session Security** — Manage and delete your own pins via secure device-fingerprinting (no login required)

---

## 🧠 Mood Types

| Mood | Emoji | Description |
|------|-------|-------------|
| Chill | 🟡 | Calm, relaxed atmosphere |
| Hype | 🔴 | Energetic, loud, crowd/party |
| Focused | 🟢 | Great for work or studying |
| Romantic | 🔵 | Date-night worthy |
| Sketchy | 🟠 | Safety heads-up for others |
| Nature | 🍃 | Soothing, green viewpoints |
| Study | 📚 | Quiet places for focus |
| Festive | 🎉 | Celebrations and events |
| Relaxing | ☕ | Calm spots to unwind |

---

## 🛠️ Tech Stack

### Frontend
- **React + Vite** — UI framework
- **Leaflet.js** — Interactive map rendering
- **Shadcn + Tailwind CSS** — Styling
- **Recharts** — Mood trend charts
- **Socket.io Client** — Real-time updates

### Backend
- **Node.js + Express** — REST API server
- **Socket.io** — WebSocket real-time events
- **Prisma ORM** — Database access layer
- **JWT + bcrypt** — Optional authentication

### Database
- **PostgreSQL** — Primary database

### Deployment
- **Vercel** — Frontend hosting
- **Railway** — Backend + PostgreSQL hosting

### APIs & Tools
- **OSRM (Open Source Routing Machine)** — Native street-level routing
- **BigDataCloud** — Client-side reverse geocoding
- **Redis** — High-performance real-time data caching

---

## 🗄️ Database Schema Overview

```
users           → Optional accounts with reputation tracking
neighborhoods   → City zones with GeoJSON boundaries
mood_pins       → Core pin data with location, mood, expiry
pin_votes       → Confirm/dispute votes per pin per session
session_reputation → Tracks anonymous user reliability over time
```

![Database Design](Public/db_desing.png)


---

## ⚡ How Real-Time Works

```
User drops a pin
  → POST /api/pins  (saved to PostgreSQL)
  → Server emits "new_pin" via Socket.io
  → All connected maps show the pin instantly

User votes on a pin
  → POST /api/pins/:id/vote
  → Credibility score recalculated in PostgreSQL
  → Server emits "pin_credibility_update"
  → Pin visual state updates across all maps live

Every 30 seconds
  → Server recalculates neighborhood mood scores
  → Emits "mood_update" to all clients
  → Heatmap recolors on every open map
```

---

## ✅ Verification System

Every pin can be **confirmed** or **disputed** by nearby users:

- A pin's credibility score = `confirms / (confirms + disputes)`
- Pins below **30% credibility** are dimmed and carry less weight
- Pins disputed 3x more than confirmed are auto-removed
- Users who consistently post disputed pins start with lower base credibility
- One vote per session per pin — cannot vote on your own pin

---

## 📁 Project Structure

```
moodmap/
├── client/                   # React frontend
│   └── src/
│       ├── components/
│       │   ├── Map.jsx
│       │   ├── MoodPinForm.jsx
│       │   ├── NeighborhoodPanel.jsx
│       │   └── TrendChart.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Trends.jsx
│       │   └── Dashboard.jsx
│       ├── hooks/
│       │   ├── useSocket.js
│       │   └── useLocation.js
│       └── api/
│           ├── pins.js
│           └── neighborhoods.js
│
├── server/                   # Node.js backend
│   ├── routes/
│   │   ├── pins.js
│   │   ├── neighborhoods.js
│   │   └── auth.js
│   ├── controllers/
│   ├── sockets/
│   │   └── pinHandler.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── index.js
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/moodmap.git
cd moodmap
```

### 2. Setup environment variables
```bash
cp .env.example .env
```

Fill in your `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/moodmap
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

### 3. Install dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Setup the database
```bash
cd server
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Run the app
```bash
# In /server
npm run dev

# In /client
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:5000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pins/active` | Get all active (non-expired) pins |
| POST | `/api/pins` | Drop a new mood pin |
| POST | `/api/pins/:id/vote` | Confirm or dispute a pin |
| GET | `/api/pins/:id/votes` | Get vote counts for a pin |
| GET | `/api/neighborhoods` | Get all neighborhood zones |
| GET | `/api/neighborhoods/:id/mood` | Current mood score for a zone |
| GET | `/api/neighborhoods/:id/history` | Mood trend over last 24 hours |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Login |
| GET | `/api/users/me/pins` | Get personal pin history |

---

## 🗓️ Build Roadmap

- [x] Project setup & planning
- [x] PostgreSQL schema + Prisma setup
- [x] REST API (pins, neighborhoods, votes)
- [x] React map with Leaflet + pin dropping
- [x] Socket.io real-time pin updates
- [x] Verification / voting system
- [x] Neighborhood mood scoring + heatmap
- [x] Mood trends page with charts
- [x] Optional auth + user dashboard
- [x] Deploy to Vercel + Railway
- [x] Native In-App OSRM Routing
- [x] Dynamic Live Mood Feed & Geocoding

---

## 🤝 Contributing

This is a personal resume project. Feel free to fork and build your own version!

---

## 📄 License

MIT License — feel free to use this for learning and inspiration.

---

> Built with ❤️ to learn real-time systems, PostgreSQL, and full-stack React development.
