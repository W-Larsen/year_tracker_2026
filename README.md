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
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Vanilla CSS** - Styling

### Backend
- **Node.js** + **Express** - REST API server
- **SQL.js** - SQLite database (in-process, file-based)
- **CORS** - Cross-origin resource sharing

## Project Structure

```
year_tracker_2026/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── App.jsx      # Main app component
│   │   └── index.css    # Global styles
│   └── package.json
├── server/              # Node.js backend
│   ├── routes/          # API routes
│   ├── database.js      # Database configuration
│   ├── index.js         # Express server
│   └── package.json
└── README.md
```

## Installation

### Prerequisites
- Node.js v18+ installed
- npm or yarn

### Setup

1. **Clone the repository** (or navigate to the project directory)

2. **Install backend dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies:**
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
- `POST /api/progress` - Update progress (toggle dot)
  - Body: `{ activityKey, dotIndex, isFilled }`
- `DELETE /api/progress/:activityKey/:dotIndex` - Delete specific progress

## Data Persistence

Data is stored in an SQLite database (`server/tracker.db`). The database is automatically created and seeded with initial activities on first run.

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
The backend runs as-is in production. Just ensure `NODE_ENV=production` is set.

## License

Copyright 2026 Year Tracker. All rights reserved. Created by Valentyn Korniienko.
