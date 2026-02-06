import dotenv from 'dotenv';
dotenv.config();

import { createClient } from '@libsql/client';

// Initialize Turso client
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

// Initialize database tables
async function initDatabase() {
    try {
        // Create tables
        await client.execute(`
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                key TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                count INTEGER NOT NULL,
                grid_id TEXT NOT NULL
            )
        `);

        await client.execute(`
            CREATE TABLE IF NOT EXISTS progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                activity_key TEXT NOT NULL,
                dot_index INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(activity_key, dot_index)
            )
        `);

        // Seed initial activities if table is empty
        const result = await client.execute('SELECT COUNT(*) as count FROM activities');
        const count = result.rows[0]?.count || 0;

        if (count === 0) {
            const activities = [
                { key: 'training', name: 'Training', count: 156, grid_id: 'grid-training' },
                { key: 'english', name: 'English', count: 80, grid_id: 'grid-english' },
                { key: 'squash', name: 'Squash', count: 20, grid_id: 'grid-activities' },
                { key: 'books', name: 'Books', count: 5, grid_id: 'grid-books' },
                { key: 'games', name: 'Games', count: 5, grid_id: 'grid-games' },
                { key: 'films-cinema', name: 'Films (Cinema)', count: 20, grid_id: 'grid-films-cinema' },
                { key: 'films-home', name: 'Films (Home)', count: 30, grid_id: 'grid-films-home' }
            ];

            for (const activity of activities) {
                await client.execute({
                    sql: 'INSERT INTO activities (key, name, count, grid_id) VALUES (?, ?, ?, ?)',
                    args: [activity.key, activity.name, activity.count, activity.grid_id]
                });
            }

            console.log('✅ Database seeded with initial activities');
        }

        console.log('✅ Connected to Turso database');
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        throw error;
    }
}

// Query helpers (all async for Turso)
export const queries = {
    getAllActivities: async () => {
        const result = await client.execute('SELECT * FROM activities ORDER BY id');
        return result.rows.map(row => ({
            id: row.id,
            key: row.key,
            name: row.name,
            count: row.count,
            grid_id: row.grid_id
        }));
    },

    getAllProgress: async () => {
        const result = await client.execute('SELECT * FROM progress');
        return result.rows.map(row => ({
            id: row.id,
            activity_key: row.activity_key,
            dot_index: row.dot_index,
            created_at: row.created_at
        }));
    },

    addProgress: async (activityKey, dotIndex) => {
        try {
            await client.execute({
                sql: 'INSERT OR IGNORE INTO progress (activity_key, dot_index) VALUES (?, ?)',
                args: [activityKey, dotIndex]
            });
            return true;
        } catch (error) {
            console.error('Error adding progress:', error);
            return false;
        }
    },

    removeProgress: async (activityKey, dotIndex) => {
        try {
            await client.execute({
                sql: 'DELETE FROM progress WHERE activity_key = ? AND dot_index = ?',
                args: [activityKey, dotIndex]
            });
            return true;
        } catch (error) {
            console.error('Error removing progress:', error);
            return false;
        }
    },

    getLastUpdatedByActivity: async () => {
        const result = await client.execute(`
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
};

// Initialize database when module is loaded
const dbInitPromise = initDatabase();

export const waitForDb = () => dbInitPromise;
export default client;
