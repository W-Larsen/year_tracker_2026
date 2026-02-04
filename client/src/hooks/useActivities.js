import { useState, useEffect } from 'react';

const API_URL = 'http://localhost:3001/api';

export function useActivities() {
    const [activities, setActivities] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch activities and progress on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [activitiesRes, progressRes] = await Promise.all([
                fetch(`${API_URL}/activities`),
                fetch(`${API_URL}/progress`)
            ]);

            if (!activitiesRes.ok || !progressRes.ok) {
                throw new Error('Failed to fetch data');
            }

            const activitiesData = await activitiesRes.json();
            const progressData = await progressRes.json();

            setActivities(activitiesData);
            setProgress(progressData);
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

        // Send to backend
        try {
            const response = await fetch(`${API_URL}/progress`, {
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

    return {
        activities,
        progress,
        loading,
        error,
        toggleProgress,
        isProgressFilled,
        getProgressCount
    };
}
