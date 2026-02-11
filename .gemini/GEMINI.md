# Year Tracker 2026 - React + Node.js

A modern full-stack habit and activity tracker for the year 2026, converted from vanilla HTML/CSS/JS to React + Node.js.

## project_overview
Full-stack web application that tracks various personal goals:
- **Training**: 156 sessions (3 times a week)
- **English**: 80 sessions
- **Squash**: 20 sessions
- **Books**: 5 reads
- **Games**: 5 plays
- **Films**: 50 total (split between 20 Cinema and 30 Home)

Each activity displays a "last updated on DD/MM/YY" label showing when progress was last made.

### Interactive Layout
- **Resizable blocks** — drag corners to resize any activity block (name, dots, text, updated labels all scale proportionally)
- **Movable blocks** — drag to reposition blocks anywhere on the canvas
- **Collision detection** — blocks highlight red when overlapping another block; releasing mouse reverts to previous position/size
- **Minimum size limit** — blocks can't shrink below 50% of original size (scale >= 0.5)
- **Films block** — special handling for cinema-zone, cinema-label, and home films with unified scaling

## technical_stack

### Frontend
- **React 19** - UI framework with hooks
- **Vite** - Fast build tool with dev server
- **Vanilla CSS** - Complete design system migrated from original

### Backend
- **Node.js + Express** - REST API server
- **Turso (libsql)** - Cloud-hosted SQLite database
- **CORS** - Enabled for cross-origin requests

## architecture

### Frontend Structure
```
client/src/
├── components/
│   ├── Dot.jsx              # Individual clickable dot component
│   ├── ActivityGrid.jsx     # Grid of dots for each activity
│   ├── ActivitySection.jsx  # Complete section with title and last updated label
│   └── ResizableWrapper.jsx # Resize, move, and collision detection overlay
├── hooks/
│   ├── useActivities.js     # Custom hook for API integration & state
│   ├── useLayout.js         # Responsive layout and scaling logic
│   └── useBlockLayout.js    # Block resize/position state management
├── App.jsx                  # Main app with layout
├── main.jsx                 # React entry point
├── config.js                # API base URL configuration
├── constants.js             # App-wide constants
└── index.css                # Global styles (migrated from original)
```

### Backend Structure
```
server/
├── db/
│   └── database.js          # Turso setup and query helpers
├── routes/
│   └── activities.js        # REST API endpoints
├── index.js                 # Express server configuration
├── .env                     # Environment configuration (Turso credentials)
└── .env.example             # Template for environment variables
```

## core_mechanics

### Data Flow
1. **Frontend** fetches activities, progress, and last-updated timestamps from backend API on mount
2. **User clicks** a dot → optimistic UI update + API call
3. **Backend** persists changes to Turso cloud database
4. **Last updated** labels refresh to show current timestamp

### Layout System
- **Desktop**: Canvas-based layout (2400x1300) with dynamic scaling
- **Mobile**: Responsive Flexbox/Grid layout (breakpoint: 1200px)
- **Scaling**: JavaScript calculates scale factor based on viewport

### State Management
- Custom `useActivities` hook manages all activity state
- Custom `useLayout` hook manages responsive scaling
- Custom `useBlockLayout` hook manages block resize/position state
- `ResizableWrapper` component handles drag, resize, collision detection, and state revert
- Optimistic updates for instant UI feedback
- Error handling with automatic rollback

## api_endpoints

- `GET /api/activities` - Fetch all activity configurations
- `GET /api/progress` - Fetch user progress (grouped by activity)
- `GET /api/last-updated` - Fetch last updated timestamp per activity group
- `POST /api/progress` - Toggle dot state
  - Body: `{ activityKey, dotIndex, isFilled }`
- `DELETE /api/progress/:activityKey/:dotIndex` - Delete progress entry

## running_the_app

### Development
Two terminals required:

**Terminal 1 (Backend):**
```bash
cd server && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd client && npm run dev
```

Access app at: `http://localhost:5173`
API runs at: `http://localhost:3001`

## environment_variables

Backend requires Turso credentials in `server/.env`:
```
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token
PORT=3001
```

## migration_notes

### Changes from Original
- **localStorage** → Turso cloud SQLite database via REST API
- **SQL.js (local)** → Turso (cloud-hosted libsql)
- **Vanilla JS** → React components and hooks
- **Single HTML file** → Component-based architecture
- **Direct DOM manipulation** → React state management
- **No server** → Express backend with API

### Preserved
- ✅ Exact same visual design and CSS
- ✅ Dot grid layout and positioning
- ✅ Responsive mobile layout
- ✅ Scaling algorithm for desktop
- ✅ All activity configurations

## developer_notes

### Adding New Activities
1. Update `server/db/database.js` seed data
2. Add corresponding sections in `client/src/App.jsx`
3. Ensure grid CSS is added to `client/src/index.css`

### Database
- Cloud-hosted on Turso
- Auto-created tables on first connection
- Auto-seeded with initial activities if empty

### Hot Reloading
- Backend: Node.js `--watch` flag
- Frontend: Vite HMR (no need to restart dev server after code changes)

### ResizableWrapper
- Stores base sizes (CSS positions/dimensions) for each block in `BASE_SIZES`
- Scales all child elements proportionally: name, box, text, updated label, subtitle, padding
- Films block has special handling for cinema-zone (via `films-inner` wrapper), cinema-label positioning
- Collision detection uses bounding rect comparison across all block elements
- State snapshot/restore mechanism for reverting on overlap
