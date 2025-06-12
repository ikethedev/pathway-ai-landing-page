"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Handle OPTIONS requests for CORS preflight
router.options('/subscribe', (req, res) => {
    const origin = req.headers.origin;
    console.log('🔧 OPTIONS request from origin:', origin);
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
});
// Subscribe route - mounted at '/api', so this becomes '/api/subscribe'
router.post('/subscribe', async (req, res) => {
    console.log('📥 POST /api/subscribe hit via router!');
    console.log('📋 Request body:', req.body);
    console.log('🌐 Origin:', req.headers.origin);
    // Set CORS headers for the response
    const origin = req.headers.origin;
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log('✅ Setting CORS origin header:', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    const { email } = req.body;
    // Validate email
    if (!email) {
        console.log('❌ No email provided');
        res.status(400).json({
            message: 'Email is required',
            success: false
        });
        return;
    }
    if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format:', email);
        res.status(400).json({
            message: 'Please enter a valid email address',
            success: false
        });
        return;
    }
    const API_KEY = process.env.MAILCHIMP_API_KEY;
    const LIST_ID = process.env.MAILCHIMP_LIST_ID;
    console.log('🔑 Environment variables check:', {
        hasApiKey: !!API_KEY,
        hasListId: !!LIST_ID,
        apiKeyFormat: API_KEY ? `${API_KEY.substring(0, 8)}...` : 'missing'
    });
    if (!API_KEY || !LIST_ID) {
        console.error('❌ Missing environment variables');
        res.status(500).json({
            message: 'Server configuration error',
            success: false
        });
        return;
    }
    // Extract datacenter from API key
    const DATACENTER = API_KEY.split('-')[1];
    if (!DATACENTER) {
        console.error('❌ Invalid API key format - no datacenter found');
        res.status(500).json({
            message: 'Server configuration error',
            success: false
        });
        return;
    }
    console.log('🌐 Using datacenter:', DATACENTER);
    const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${LIST_ID}/members`;
    console.log('🔗 Mailchimp URL:', url);
    try {
        const response = await axios_1.default.post(url, {
            email_address: email,
            status: 'subscribed',
        }, {
            headers: {
                Authorization: `apikey ${API_KEY}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000 // 10 second timeout
        });
        console.log('✅ Mailchimp response status:', response.status);
        console.log('📧 Successfully subscribed:', email);
        res.status(200).json({
            message: 'Successfully subscribed to our newsletter!',
            success: true
        });
    }
    catch (error) {
        console.error('❌ Mailchimp error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        // Handle specific Mailchimp errors
        if (error.response?.status === 400) {
            const errorDetail = error.response.data?.detail || '';
            const errorTitle = error.response.data?.title || '';
            if (errorDetail.includes('already a list member') || errorTitle.includes('Member Exists')) {
                res.status(409).json({
                    message: 'This email is already subscribed to our newsletter!',
                    success: false,
                    alreadySubscribed: true
                });
                return;
            }
            else if (errorDetail.includes('invalid')) {
                res.status(400).json({
                    message: 'Please enter a valid email address',
                    success: false
                });
                return;
            }
        }
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            res.status(408).json({
                message: 'Request timeout. Please try again.',
                success: false
            });
            return;
        }
        const errorMessage = error.response?.data?.detail || 'Unable to subscribe. Please try again.';
        res.status(400).json({
            message: errorMessage,
            success: false
        });
    }
});
// Add a test route to verify router is working
router.get('/test-router', (req, res) => {
    console.log('🧪 Router test endpoint hit');
    res.json({ message: 'Router is working!', timestamp: new Date().toISOString() });
});
// Use only ES6 export syntax
exports.default = router;
