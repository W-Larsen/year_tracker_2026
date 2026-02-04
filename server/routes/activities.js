import express from 'express';
import { queries } from '../database.js';

const router = express.Router();

// GET /api/activities - Get all activities
router.get('/activities', (req, res) => {
    try {
        const activities = queries.getAllActivities();
        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ error: 'Failed to fetch activities' });
    }
});

// GET /api/progress - Get all progress
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

// POST /api/progress - Toggle progress
router.post('/progress', (req, res) => {
    try {
        const { activityKey, dotIndex, isFilled } = req.body;

        if (!activityKey || dotIndex === undefined || isFilled === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

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

// DELETE /api/progress/:activityKey/:dotIndex - Delete specific progress
router.delete('/progress/:activityKey/:dotIndex', (req, res) => {
    try {
        const { activityKey, dotIndex } = req.params;
        queries.removeProgress(activityKey, parseInt(dotIndex));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting progress:', error);
        res.status(500).json({ error: 'Failed to delete progress' });
    }
});

export default router;
