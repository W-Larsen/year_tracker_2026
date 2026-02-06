import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const API_BASE = `${API_URL}/api`;

export function useActivities() {
    const [activities, setActivities] = useState([]);
    const [progress, setProgress] = useState({});
    const [lastUpdated, setLastUpdated] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch activities and progress on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [activitiesRes, progressRes, lastUpdatedRes] = await Promise.all([
                fetch(`${API_BASE}/activities`),
                fetch(`${API_BASE}/progress`),
                fetch(`${API_BASE}/last-updated`)
            ]);

            if (!activitiesRes.ok || !progressRes.ok || !lastUpdatedRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const activitiesData = await activitiesRes.json();
            const progressData = await progressRes.json();
            const lastUpdatedData = await lastUpdatedRes.json();

            setActivities(activitiesData);
            setProgress(progressData);
            setLastUpdated(lastUpdatedData);
            setError(null);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleProgress = async (activityKey, dotIndex) => {
        // Optimistic update
        const isFilled = !isProgressFilled(activityKey, dotIndex);
        const newProgress = { ...progress };

        if (isFilled) {
            if (!newProgress[activityKey]) {
                newProgress[activityKey] = [];
            }
            if (!newProgress[activityKey].includes(dotIndex)) {
                newProgress[activityKey] = [...newProgress[activityKey], dotIndex];
            }
        } else {
            if (newProgress[activityKey]) {
                newProgress[activityKey] = newProgress[activityKey].filter(i => i !== dotIndex);
            }
        }

        setProgress(newProgress);

        // Update lastUpdated optimistically with current timestamp
        const now = new Date().toISOString();
        const groupKey = (activityKey === 'films-cinema' || activityKey === 'films-home') ? 'films' : activityKey;
        setLastUpdated(prev => ({ ...prev, [groupKey]: now }));

        // Send to backend
        try {
            const response = await fetch(`${API_BASE}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activityKey, dotIndex, isFilled })
            });

            if (!response.ok) {
                throw new Error('Failed to update progress');
            }
        } catch (err) {
            console.error('Error updating progress:', err);
            // Revert on error
            setProgress(progress);
            setError(err.message);
        }
    };

    const isProgressFilled = (activityKey, dotIndex) => {
        return progress[activityKey]?.includes(dotIndex) || false;
    };

    const getProgressCount = (activityKey) => {
        return progress[activityKey]?.length || 0;
    };

    const getLastUpdated = (activityKey) => {
        // Map activity keys to their group keys for lookup
        const groupKey = (activityKey === 'films-cinema' || activityKey === 'films-home') ? 'films' : activityKey;
        return lastUpdated[groupKey] || null;
    };

    return {
        activities,
        progress,
        lastUpdated,
        loading,
        error,
        toggleProgress,
        isProgressFilled,
        getProgressCount,
        getLastUpdated
    };
}
