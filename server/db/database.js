import initSqlJs from 'sql.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, 'tracker.db');

let db;

// Initialize database
async function initDatabase() {
    const SQL = await initSqlJs();

    // Load existing database or create new one
    if (existsSync(dbPath)) {
        const buffer = readFileSync(dbPath);
        db = new SQL.Database(buffer);
        console.log('📂 Loaded existing database');
    } else {
        db = new SQL.Database();
        console.log('🆕 Created new database');
    }

    // Create tables
    db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      count INTEGER NOT NULL,
      grid_id TEXT NOT NULL
    )
  `);

    db.run(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      activity_key TEXT NOT NULL,
      dot_index INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(activity_key, dot_index)
    )
  `);

    // Seed initial activities if table is empty
    const result = db.exec('SELECT COUNT(*) as count FROM activities');
    const count = result[0]?.values[0]?.[0] || 0;

    if (count === 0) {
        const activities = [
            { key: 'training', name: 'Training', count: 156, grid_id: 'grid-training' },
            { key: 'english', name: 'English', count: 80, grid_id: 'grid-english' },
            { key: 'squash', name: 'Squash', count: 20, grid_id: 'grid-squash' },
            { key: 'books', name: 'Books', count: 5, grid_id: 'grid-books' },
            { key: 'games', name: 'Games', count: 5, grid_id: 'grid-games' },
            { key: 'films-cinema', name: 'Films (Cinema)', count: 20, grid_id: 'grid-films-cinema' },
            { key: 'films-home', name: 'Films (Home)', count: 30, grid_id: 'grid-films-home' }
        ];

        for (const activity of activities) {
            db.run(
                'INSERT INTO activities (key, name, count, grid_id) VALUES (?, ?, ?, ?)',
                [activity.key, activity.name, activity.count, activity.grid_id]
            );
        }

        saveDatabase();
        console.log('✅ Database seeded with initial activities');
    }
}

// Save database to file
function saveDatabase() {
    const data = db.export();
    const buffer = Buffer.from(data);
    writeFileSync(dbPath, buffer);
}

// Query helpers
export const queries = {
    getAllActivities: () => {
        const result = db.exec('SELECT * FROM activities ORDER BY id');
        if (!result[0]) return [];
        return result[0].values.map(row => ({
            id: row[0],
            key: row[1],
            name: row[2],
            count: row[3],
            grid_id: row[4]
        }));
    },

    getAllProgress: () => {
        const result = db.exec('SELECT * FROM progress');
        if (!result[0]) return [];
        return result[0].values.map(row => ({
            id: row[0],
            activity_key: row[1],
            dot_index: row[2],
            created_at: row[3]
        }));
    },

    addProgress: (activityKey, dotIndex) => {
        try {
            db.run(
                'INSERT OR IGNORE INTO progress (activity_key, dot_index) VALUES (?, ?)',
                [activityKey, dotIndex]
            );
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error adding progress:', error);
            return false;
        }
    },

    removeProgress: (activityKey, dotIndex) => {
        try {
            db.run(
                'DELETE FROM progress WHERE activity_key = ? AND dot_index = ?',
                [activityKey, dotIndex]
            );
            saveDatabase();
            return true;
        } catch (error) {
            console.error('Error removing progress:', error);
            return false;
        }
    }
};

// Initialize database when module is loaded
const dbInitPromise = initDatabase();

export const waitForDb = () => dbInitPromise;
export default db;
