# Year Tracker 2026 - React + Node.js

A modern full-stack habit and activity tracker for the year 2026, built with React and Node.js.

## Features

Track your progress across multiple activities:
- **Training**: 156 sessions (3 times a week)
- **English**: 80 sessions
- **Squash**: 20 sessions
- **Books**: 5 reads
- **Games**: 5 plays
- **Films**: 50 total (20 Cinema, 30 Home)

## Tech Stack

### Frontend
- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Vanilla CSS** - Styling

### Backend
- **Node.js** + **Express** - REST API server
- **better-sqlite3** - Local SQLite database (development)
- **Turso (libsql)** - Cloud SQLite database (production)
- **CORS** - Cross-origin resource sharing

## Project Structure

```
year_tracker_2026/
├── client/                    # React frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── App.jsx            # Main app component
│   │   └── index.css          # Global styles
│   └── package.json
├── server/                    # Node.js backend
│   ├── db/
│   │   ├── adapters/
│   │   │   ├── DatabaseAdapter.js  # Abstract base class (interface)
│   │   │   ├── SqliteAdapter.js    # Development (local file)
│   │   │   └── TursoAdapter.js     # Production (Turso cloud)
│   │   ├── constants.js       # Shared DB constants (seed data)
│   │   └── database.js        # Factory — picks adapter by NODE_ENV
│   ├── routes/                # API routes
│   ├── index.js               # Express server
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js v18+ installed
- npm or yarn

### Setup

1. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

2. **Install frontend dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Configure environment** (backend):
   ```bash
   cp server/.env.example server/.env
   ```
   - For local dev no further changes are needed — SQLite is used automatically.
   - For production, fill in your Turso credentials and set `NODE_ENV=production`.

## Running the Application

### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
API runs on `http://localhost:3001`

### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
App runs on `http://localhost:5173`

## Database Strategy

The backend uses an **OOP adapter pattern** to swap between databases based on `NODE_ENV`:

| `NODE_ENV` | Adapter | Storage |
|---|---|---|
| `development` (default) | `SqliteAdapter` | `server/tracker.db` (auto-created) |
| `production` | `TursoAdapter` | Turso cloud DB |

`DatabaseAdapter` is the abstract base class; both `SqliteAdapter` and `TursoAdapter` extend it with a consistent async interface. The factory in `database.js` instantiates the correct adapter — the rest of the codebase is unaware of which backend is in use.

## API Endpoints

- `GET /api/activities` - Fetch all activity configurations
- `GET /api/progress` - Fetch user progress
- `GET /api/last-updated` - Fetch last updated timestamp per activity
- `POST /api/progress` - Update progress (toggle dot)
  - Body: `{ activityKey, dotIndex, isFilled }`
- `DELETE /api/progress/:activityKey/:dotIndex` - Delete specific progress

## Environment Variables

Backend reads from `server/.env`:

```env
PORT=3001

# development → SQLite (local), production → Turso (cloud)
NODE_ENV=development

# Required only when NODE_ENV=production
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Development

- **Backend**: Node.js `--watch` flag for hot reloading
- **Frontend**: Vite HMR (Hot Module Replacement)

## Build for Production

### Frontend
```bash
cd client
npm run build
```
Outputs to `client/dist/`

### Backend
Runs as-is. Ensure `NODE_ENV=production` and Turso credentials are set in the environment.

## License

Copyright 2026 Year Tracker. All rights reserved. Created by Valentyn Korniienko.
