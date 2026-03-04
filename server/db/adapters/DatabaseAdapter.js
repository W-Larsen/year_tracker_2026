/**
 * Abstract base class that defines the database interface.
 * All concrete adapters must extend this class and implement every method.
 */
export class DatabaseAdapter {
    /**
     * Initialize the database: create tables and seed initial data.
     * @returns {Promise<void>}
     */
    async init() {
        throw new Error(`${this.constructor.name} must implement init()`);
    }

    /**
     * Retrieve all activity configurations.
     * @returns {Promise<Array<{id, key, name, count, grid_id}>>}
     */
    async getAllActivities() {
        throw new Error(`${this.constructor.name} must implement getAllActivities()`);
    }

    /**
     * Retrieve all progress entries.
     * @returns {Promise<Array<{id, activity_key, dot_index, created_at}>>}
     */
    async getAllProgress() {
        throw new Error(`${this.constructor.name} must implement getAllProgress()`);
    }

    /**
     * Insert a progress entry (filled dot).
     * @param {string} activityKey
     * @param {number} dotIndex
     * @returns {Promise<boolean>}
     */
    async addProgress(activityKey, dotIndex) {
        throw new Error(`${this.constructor.name} must implement addProgress()`);
    }

    /**
     * Remove a progress entry (unfilled dot).
     * @param {string} activityKey
     * @param {number} dotIndex
     * @returns {Promise<boolean>}
     */
    async removeProgress(activityKey, dotIndex) {
        throw new Error(`${this.constructor.name} must implement removeProgress()`);
    }

    /**
     * Get the last updated timestamp per activity group.
     * Films-cinema and films-home are merged into a single "films" group.
     * @returns {Promise<Record<string, string>>}
     */
    async getLastUpdatedByActivity() {
        throw new Error(`${this.constructor.name} must implement getLastUpdatedByActivity()`);
    }
}
