import dotenv from 'dotenv';
dotenv.config();

import { TursoAdapter } from './adapters/TursoAdapter.js';
import { SqliteAdapter } from './adapters/SqliteAdapter.js';

/**
 * Factory — picks the right DB adapter based on NODE_ENV.
 *  - production  → TursoAdapter  (cloud libsql)
 *  - development → SqliteAdapter (local file)
 */
function createAdapter() {
    const env = process.env.NODE_ENV ?? 'development';

    if (env === 'production') {
        console.log('🌐 Using Turso adapter (production)');
        return new TursoAdapter();
    }

    console.log('💾 Using SQLite adapter (development)');
    return new SqliteAdapter();
}

const adapter = createAdapter();

// Initialize database when module is loaded
const dbInitPromise = adapter.init().catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    process.exit(1);
});

/** Await this before handling requests to ensure tables are ready. */
export const waitForDb = () => dbInitPromise;

/**
 * Shared query interface — identical API regardless of which adapter is active.
 * All methods return Promises so callers never need to care about the implementation.
 */
export const queries = {
    getAllActivities: () => adapter.getAllActivities(),
    getAllProgress: () => adapter.getAllProgress(),
    addProgress: (activityKey, dotIndex) => adapter.addProgress(activityKey, dotIndex),
    removeProgress: (activityKey, dotIndex) => adapter.removeProgress(activityKey, dotIndex),
    getLastUpdatedByActivity: () => adapter.getLastUpdatedByActivity(),
};

export default adapter;
