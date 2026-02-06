import express from 'express';
import { queries } from '../db/database.js';

const router = express.Router();

/**
 * GET /api/activities
 * Retrieves all activity configurations from the database
 * @returns {Array} Array of activity objects
 */
router.get('/activities', (req, res) => {
    try {
        const activities = queries.getAllActivities();
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

/**
 * GET /api/progress
 * Retrieves all user progress data grouped by activity
 * @returns {Object} Object with activity keys as properties, each containing array of completed dot indices
 */
router.get('/progress', (req, res) => {
    try {
        const progress = queries.getAllProgress();

        // Transform to match frontend format: { activityKey: [indices] }
        const progressByActivity = progress.reduce((acc, item) => {
            if (!acc[item.activity_key]) {
                acc[item.activity_key] = [];
            }
            acc[item.activity_key].push(item.dot_index);
            return acc;
        }, {});

        res.json(progressByActivity);
    } catch (error) {
        console.error('Error fetching progress:', error);
        res.status(500).json({ error: 'Failed to fetch progress' });
    }
});

/**
 * GET /api/last-updated
 * Retrieves the last updated timestamp for each activity group
 * @returns {Object} Object with activity keys and their last updated timestamps
 */
router.get('/last-updated', (req, res) => {
    try {
        const lastUpdated = queries.getLastUpdatedByActivity();
        res.json(lastUpdated);
    } catch (error) {
        console.error('Error fetching last updated:', error);
        res.status(500).json({ error: 'Failed to fetch last updated' });
    }
});

/**
 * POST /api/progress
 * Toggles progress for a specific activity dot
 * @body {string} activityKey - The activity identifier (e.g., 'training', 'english')
 * @body {number} dotIndex - The dot index (0-based integer)
 * @body {boolean} isFilled - Whether the dot should be filled (true) or unfilled (false)
 * @returns {Object} Success response with updated state
 */
router.post('/progress', (req, res) => {
    try {
        const { activityKey, dotIndex, isFilled } = req.body;

        // Validate required fields
        if (!activityKey || dotIndex === undefined || isFilled === undefined) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['activityKey', 'dotIndex', 'isFilled']
            });
        }

        // Validate types
        if (typeof activityKey !== 'string') {
            return res.status(400).json({ error: 'activityKey must be a string' });
        }

        if (typeof dotIndex !== 'number' || !Number.isInteger(dotIndex) || dotIndex < 0) {
            return res.status(400).json({ error: 'dotIndex must be a non-negative integer' });
        }

        if (typeof isFilled !== 'boolean') {
            return res.status(400).json({ error: 'isFilled must be a boolean' });
        }

        // Update progress
        if (isFilled) {
            queries.addProgress(activityKey, dotIndex);
        } else {
            queries.removeProgress(activityKey, dotIndex);
        }

        res.json({ success: true, activityKey, dotIndex, isFilled });
    } catch (error) {
        console.error('Error updating progress:', error);
        res.status(500).json({ error: 'Failed to update progress' });
    }
});

/**
 * DELETE /api/progress/:activityKey/:dotIndex
 * Deletes progress for a specific activity dot
 * @param {string} activityKey - The activity identifier
 * @param {string} dotIndex - The dot index (will be parsed to integer)
 * @returns {Object} Success response
 */
router.delete('/progress/:activityKey/:dotIndex', (req, res) => {
    try {
        const { activityKey, dotIndex } = req.params;

        const parsedIndex = parseInt(dotIndex, 10);

        if (isNaN(parsedIndex) || parsedIndex < 0) {
            return res.status(400).json({ error: 'dotIndex must be a valid non-negative integer' });
        }

        queries.removeProgress(activityKey, parsedIndex);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress' });
    }
});

export default router;
