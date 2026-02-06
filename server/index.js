import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import activitiesRouter from './routes/activities.js';
import { waitForDb } from './db/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api', activitiesRouter);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Year Tracker 2026 API is running' });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    const isDevelopment = process.env.NODE_ENV !== 'production';

    res.status(500).json({
        error: 'Internal server error',
        ...(isDevelopment && { details: err.message })
    });
});

// Start server after database is initialized
await waitForDb();
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});
