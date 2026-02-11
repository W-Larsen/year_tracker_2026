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

Each activity displays a "last updated" timestamp showing when progress was last made.

### Interactive Layout
- **Resizable blocks** — drag corners to resize any activity block (name, dots, counters all scale proportionally)
- **Movable blocks** — drag to reposition blocks anywhere on the canvas
- **Collision detection** — blocks highlight red when overlapping; releasing reverts to previous position
- **Minimum size limit** — blocks can't shrink below 50% of original size

## Tech Stack

### Frontend
- **React 19** - UI framework with hooks
- **Vite** - Build tool and dev server
- **Vanilla CSS** - Styling with design system

### Backend
- **Node.js** + **Express** - REST API server
- **Turso** - Cloud-hosted SQLite database (libsql)
- **CORS** - Cross-origin resource sharing

## Project Structure

```
year_tracker_2026/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dot.jsx              # Individual clickable dot
│   │   │   ├── ActivityGrid.jsx     # Grid of dots for activity
│   │   │   ├── ActivitySection.jsx  # Complete activity section with label
│   │   │   └── ResizableWrapper.jsx # Resize/move/collision handling
│   │   ├── hooks/
│   │   │   ├── useActivities.js     # State & API integration
│   │   │   ├── useLayout.js         # Responsive layout logic
│   │   │   └── useBlockLayout.js    # Block resize/position state
│   │   ├── App.jsx          # Main app component
│   │   ├── config.js        # API configuration
│   │   ├── constants.js     # App constants
│   │   └── index.css        # Global styles
│   └── package.json
├── server/                  # Node.js backend
│   ├── db/
│   │   └── database.js      # Turso database setup & queries
│   ├── routes/
│   │   └── activities.js    # API routes
│   ├── index.js             # Express server
│   ├── .env                 # Environment variables
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js v18+ installed
- npm or yarn
- Turso account (for database)

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Turso credentials:
   # TURSO_DATABASE_URL=libsql://your-db.turso.io
   # TURSO_AUTH_TOKEN=your-token
   ```

4. **Install frontend dependencies:**
   ```bash
   cd ../client
   npm install
   ```

## Running the Application

You need to run both the backend and frontend servers.

### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
The API will run on `http://localhost:3001`

### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
The app will open at `http://localhost:5173`

## API Endpoints

- `GET /api/activities` - Fetch all activity configurations
- `GET /api/progress` - Fetch user progress
- `GET /api/last-updated` - Fetch last updated timestamps per activity
- `POST /api/progress` - Update progress (toggle dot)
  - Body: `{ activityKey, dotIndex, isFilled }`
- `DELETE /api/progress/:activityKey/:dotIndex` - Delete specific progress

## Data Persistence

Data is stored in a Turso cloud SQLite database. The database is automatically created and seeded with initial activities on first run.

## Development

- **Backend**: Uses Node.js `--watch` flag for hot reloading
- **Frontend**: Vite provides instant HMR (Hot Module Replacement)

## Build for Production

### Frontend
```bash
cd client
npm run build
```
Outputs to `client/dist/`

### Backend
The backend runs as-is in production. Just ensure environment variables are set.

## License

Copyright 2026 Year Tracker. All rights reserved. Created by Valentyn Korniienko.
