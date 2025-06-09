"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load environment variables first
require('dotenv').config();
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const subscribe_1 = __importDefault(require("./api/subscribe"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files (your HTML, CSS, JS)
app.use(express_1.default.static(path_1.default.join(__dirname, '../')));
app.use('/dist', express_1.default.static(path_1.default.join(__dirname, '../dist')));
app.use('/styles', express_1.default.static(path_1.default.join(__dirname, '../styles')));
app.use('/assets', express_1.default.static(path_1.default.join(__dirname, '../assets')));
// API routes
app.use('/api/subscribe', subscribe_1.default);
// Serve index.html for the root route
app.get('*', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../index.html'));
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
exports.default = app;
