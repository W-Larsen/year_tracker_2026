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

## technical_stack

### Frontend
- **React 19** - UI framework with hooks
- **Vite (Rolldown)** - Fast build tool with dev server
- **Vanilla CSS** - Complete design system migrated from original
- **Custom Hooks** - State management and API integration

### Backend
- **Node.js + Express** - REST API server
- **SQL.js** - Pure JavaScript SQLite implementation (no native dependencies)
- **CORS** - Enabled for cross-origin requests

## architecture

### Frontend Structure
```
client/src/
├── components/
│   ├── Dot.jsx          # Individual clickable dot component
│   └── ActivityGrid.jsx # Grid of dots for each activity
├── hooks/
│   └── useActivities.js # Custom hook for API integration
├── App.jsx              # Main app with layout and scaling logic
├── main.jsx             # React entry point
└── index.css            # Global styles (migrated from original)
```

### Backend Structure
```
server/
├── routes/
│   └── activities.js    # REST API endpoints
├── database.js          # SQLite setup and query helpers
├── index.js             # Express server configuration
└── .env                 # Environment configuration
```

## core_mechanics

### Data Flow
1. **Frontend** fetches activities and progress from backend API on mount
2. **User clicks** a dot → optimistic UI update + API call
3. **Backend** persists changes to SQLite database
4. **Database** auto-saves after each mutation

### Layout System
- **Desktop**: Canvas-based layout (2400x1300) with dynamic scaling
- **Mobile**: Responsive Flexbox/Grid layout (breakpoint: 1200px)
- **Scaling**: JavaScript calculates scale factor based on viewport

### State Management
- Custom `useActivities` hook manages all state
- Optimistic updates for instant UI feedback
- Error handling with automatic rollback

## api_endpoints

- `GET /api/activities` - Fetch all activity configurations
- `GET /api/progress` - Fetch user progress (grouped by activity)
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

## migration_notes

### Changes from Original
- **localStorage** → SQLite database via REST API
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
1. Update `server/database.js` seed data
2. Add corresponding sections in `client/src/App.jsx`
3. Ensure grid CSS is added to `client/src/index.css`

### Database
- SQLite file: `server/tracker.db`
- Auto-created on first run
- Auto-seeded with initial activities

### Hot Reloading
- Backend: Node.js `--watch` flag
- Frontend: Vite HMR
