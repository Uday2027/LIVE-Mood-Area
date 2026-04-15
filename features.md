# Features of MoodMap 🗺️

**MoodMap** represents the cutting-edge of real-time geography-based socialization. Here is an overview of the features engineered in this project:

### 📍 The Core Engine: Mood Pins
- **Live Location Pins**: Tap anywhere on the active map to drop a pin.
- **Mood Types**: Classify the Vibe (Chill, Hype, Focused, Romantic, Sketchy, Nature, Study, Festive, Relaxing).
- **Live Camera Integration (NEW)**: To preserve raw authenticity, dropping a pin requires snapping a real-time photo of your surroundings using the native device camera. Gallery uploads are disallowed.
- **Radius Collision Safeguards (NEW)**: We prevent map spam by restricting duplicate pins within a 50m radius. If you attempt to drop a pin on the same mood nearby, you'll be prompted to upvote the existing one!

### ⏳ Ephemeral Data & Upvotes
- **Anti-Stale Engine**: Pins mathematically decay after 2 hours. Your map is exactly what is happening *right now*.
- **Credibility Engine (Upvote to Extend)**: Other users physically in the area can `CONFIRM` or `DISPUTE` your pin. 
  - `CONFIRM` extends the pin's life by 30 minutes!
  - Excessive `DISPUTE` flags will permanently delete the pin.

### 🏘️ Neighborhood Mood Index
- **Live Geofencing**: Dropped pins automatically associate with predefined city coordinates (Neighborhoods).
- **Real-Time Heatmaps**: The entire SVG/GeoJSON overlay shifts colors and pulses based on the dominant aggregated mood within its boundaries.

### 💬 Instant Social connection
- **Vibe Match Radar**: Sit back and wait. Background chronological jobs sync users emitting the same "mood" within a 1km radius and generate a `VibeMatch`.
- **Ephemeral Circles (Native Group Chat)**: If multiple users connect through VibeMatch, a real-time `Socket.io` chat room is instantiated. Once the mood is over, the chat dissolves forever.

### 👤 Verified User Progression
- Zod-protected and secure JWT authenticated user profiles.
- **MoodCalendar**: See your 90-day checking history visualized similarly to a GitHub activity graph.
- **MoodWrapped Canvas**: A dynamic HTML5 customized badge aggregating your week's vibe, allowing you to instantly share it to native social platforms using the Web Share API.
- **Gamification Badges**: Earn specific profile tags (e.g., Night Owl, Local Crown) based on pin activities.
