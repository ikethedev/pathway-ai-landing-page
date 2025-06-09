// Load environment variables first
require('dotenv').config();

import express from 'express';
import path from 'path';
import subscribeRouter from './api/subscribe';



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../')));
app.use('/dist', express.static(path.join(__dirname, '../dist')));
app.use('/styles', express.static(path.join(__dirname, '../styles')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// API routes
app.use('/api/subscribe', subscribeRouter);

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        res.status(404).json({ message: 'API endpoint not found' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('📧 Environment check:', {
        hasMailchimpKey: !!process.env.MAILCHIMP_API_KEY,
        hasListId: !!process.env.MAILCHIMP_LIST_ID,
        keyFormat: process.env.MAILCHIMP_API_KEY ? `${process.env.MAILCHIMP_API_KEY.substring(0, 8)}...` : 'missing'
    });
});

// Error handling
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

export default app;