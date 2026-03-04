import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { DatabaseAdapter } from './DatabaseAdapter.js';
import { INITIAL_ACTIVITIES } from '../constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../tracker.db');

export class SqliteAdapter extends DatabaseAdapter {
    constructor() {
        super();
        // better-sqlite3 is synchronous — open connection immediately
        this._db = new Database(DB_PATH);
        // Enable WAL for better concurrent read performance
        this._db.pragma('journal_mode = WAL');
    }

    async init() {
        this._db.exec(`
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                count INTEGER NOT NULL,
                grid_id TEXT NOT NULL
            )
        `);

        this._db.exec(`
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_key TEXT NOT NULL,
                dot_index INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(activity_key, dot_index)
            )
        `);

        const count = this._db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
        if (count === 0) {
            const insert = this._db.prepare(
                'INSERT INTO activities (key, name, count, grid_id) VALUES (?, ?, ?, ?)'
            );
            const insertAll = this._db.transaction((activities) => {
                for (const a of activities) insert.run(a.key, a.name, a.count, a.grid_id);
            });
            insertAll(INITIAL_ACTIVITIES);
            console.log('✅ SQLite database seeded with initial activities');
        }

        console.log(`✅ Connected to SQLite database (local) → ${DB_PATH}`);
    }

    async getAllActivities() {
        return this._db.prepare('SELECT * FROM activities ORDER BY id').all();
    }

    async getAllProgress() {
        return this._db.prepare('SELECT * FROM progress').all();
    }

    async addProgress(activityKey, dotIndex) {
        try {
            this._db
                .prepare('INSERT OR IGNORE INTO progress (activity_key, dot_index) VALUES (?, ?)')
                .run(activityKey, dotIndex);
            return true;
        } catch (error) {
            console.error('SqliteAdapter.addProgress error:', error);
            return false;
        }
    }

    async removeProgress(activityKey, dotIndex) {
        try {
            this._db
                .prepare('DELETE FROM progress WHERE activity_key = ? AND dot_index = ?')
                .run(activityKey, dotIndex);
            return true;
        } catch (error) {
            console.error('SqliteAdapter.removeProgress error:', error);
            return false;
        }
    }

    async getLastUpdatedByActivity() {
        const rows = this._db.prepare(`
            SELECT
                CASE
                    WHEN activity_key IN ('films-cinema', 'films-home') THEN 'films'
                    ELSE activity_key
                END as activity_group,
                MAX(created_at) as last_updated
            FROM progress
            GROUP BY activity_group
        `).all();

        const lastUpdated = {};
        for (const row of rows) {
            lastUpdated[row.activity_group] = row.last_updated;
        }
        return lastUpdated;
    }
}
