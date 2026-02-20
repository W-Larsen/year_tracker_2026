import { createClient } from '@libsql/client';
import { DatabaseAdapter } from './DatabaseAdapter.js';
import { INITIAL_ACTIVITIES } from '../constants.js';

export class TursoAdapter extends DatabaseAdapter {
    constructor() {
        super();
        this._client = createClient({
            url: process.env.TURSO_DATABASE_URL,
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
    }

    async init() {
        await this._client.execute(`
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                count INTEGER NOT NULL,
                grid_id TEXT NOT NULL
            )
        `);

        await this._client.execute(`
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_key TEXT NOT NULL,
                dot_index INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(activity_key, dot_index)
            )
        `);

        const result = await this._client.execute('SELECT COUNT(*) as count FROM activities');
        if ((result.rows[0]?.count ?? 0) === 0) {
            for (const activity of INITIAL_ACTIVITIES) {
                await this._client.execute({
                    sql: 'INSERT INTO activities (key, name, count, grid_id) VALUES (?, ?, ?, ?)',
                    args: [activity.key, activity.name, activity.count, activity.grid_id],
                });
            }
            console.log('✅ Turso database seeded with initial activities');
        }

        console.log('✅ Connected to Turso database (production)');
    }

    async getAllActivities() {
        const result = await this._client.execute('SELECT * FROM activities ORDER BY id');
        return result.rows.map(row => ({
            id: row.id,
            key: row.key,
            name: row.name,
            count: row.count,
            grid_id: row.grid_id,
        }));
    }

    async getAllProgress() {
        const result = await this._client.execute('SELECT * FROM progress');
        return result.rows.map(row => ({
            id: row.id,
            activity_key: row.activity_key,
            dot_index: row.dot_index,
            created_at: row.created_at,
        }));
    }

    async addProgress(activityKey, dotIndex) {
        try {
            await this._client.execute({
                sql: 'INSERT OR IGNORE INTO progress (activity_key, dot_index) VALUES (?, ?)',
                args: [activityKey, dotIndex],
            });
            return true;
        } catch (error) {
            console.error('TursoAdapter.addProgress error:', error);
            return false;
        }
    }

    async removeProgress(activityKey, dotIndex) {
        try {
            await this._client.execute({
                sql: 'DELETE FROM progress WHERE activity_key = ? AND dot_index = ?',
                args: [activityKey, dotIndex],
            });
            return true;
        } catch (error) {
            console.error('TursoAdapter.removeProgress error:', error);
            return false;
        }
    }

    async getLastUpdatedByActivity() {
        const result = await this._client.execute(`
            SELECT
                CASE
                    WHEN activity_key IN ('films-cinema', 'films-home') THEN 'films'
                    ELSE activity_key
                END as activity_group,
                MAX(created_at) as last_updated
            FROM progress
            GROUP BY activity_group
        `);

        const lastUpdated = {};
        for (const row of result.rows) {
            lastUpdated[row.activity_group] = row.last_updated;
        }
        return lastUpdated;
    }
}
