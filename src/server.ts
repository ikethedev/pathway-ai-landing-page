// Load environment variables first
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Define allowed origins
const allowedOrigins = [
    'https://pathway-ai-landing-page.onrender.com',
    'https://pathwaylearning.app',
    'https://www.pathwaylearning.app',
    'https://courageous-daifuku-4bc234.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000'
];

// Enhanced CORS configuration with proper origin checking
const corsOptions: cors.CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        console.log('🌐 Request origin:', origin);
        
        // Allow requests with no origin (like mobile apps, curl, Postman, or same-origin requests)
        if (!origin) {
            console.log('✅ No origin - allowing request');
            return callback(null, true);
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.includes(origin)) {
            console.log('✅ Origin allowed:', origin);
            return callback(null, true);
        }
        
        // For development, allow localhost and 127.0.0.1 origins on any port
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isDeployment = origin.includes('netlify.app') || origin.includes('onrender.com') || origin.includes('vercel.app');
        
        if (isLocalhost || isDeployment) {
            console.log('🔧 Allowing development/deployment origin:', origin);
            return callback(null, true);
        }
        
        console.log('❌ CORS blocked origin:', origin);
        console.log('📋 Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Request-Method',
        'Access-Control-Request-Headers'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
    preflightContinue: false
};

// Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// Add explicit OPTIONS handler for all routes
app.options('*', cors(corsOptions));

// Add manual CORS headers as backup
app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    
    if (!origin || allowedOrigins.includes(origin) || 
        origin.includes('localhost') || origin.includes('127.0.0.1') ||
        origin.includes('netlify.app') || origin.includes('onrender.com') || origin.includes('vercel.app')) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add debugging middleware to log all requests
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`🔍 ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
    next();
});

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
    console.log('🧪 Test endpoint hit from origin:', req.headers.origin);
    res.json({
        message: 'CORS is working!',
        timestamp: new Date().toISOString(),
        origin: req.headers.origin,
        allowedOrigins: allowedOrigins,
        method: req.method,
        path: req.path
    });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Mailchimp check endpoint
app.get('/api/mailchimp-check', (req: Request, res: Response) => {
    const apiKey = process.env.MAILCHIMP_API_KEY;
    const listId = process.env.MAILCHIMP_LIST_ID;
    
    res.json({
        hasApiKey: !!apiKey,
        hasListId: !!listId,
        apiKeyPrefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'missing',
        datacenter: apiKey ? apiKey.split('-')[1] : 'missing'
    });
});

// Subscribe endpoint - Simplified and working implementation
app.post('/api/subscribe', async (req: Request, res: Response) => {
    console.log('📥 POST /api/subscribe hit!');
    console.log('📋 Request body:', req.body);
    console.log('🌐 Origin:', req.headers.origin);
    
    const { email }: { email: string } = req.body;
    
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
        const response = await axios.post(url, {
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
    } catch (error: any) {
        console.error('❌ Mailchimp error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            message: error.message
        });
        
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
            } else if (errorDetail.includes('invalid')) {
                res.status(400).json({
                    message: 'Please enter a valid email address',
                    success: false
                });
                return;
            }
        }
        
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

// Base API route - shows this is working
app.get('/api', (req: Request, res: Response) => {
    res.json({
        message: 'API is working',
        availableEndpoints: [
            'GET /api/test',
            'GET /api/mailchimp-check',
            'POST /api/subscribe',
            'GET /health'
        ],
        timestamp: new Date().toISOString()
    });
});

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/styles', express.static(path.join(__dirname, 'styles')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/dist', express.static(path.join(__dirname, 'dist')));

// Fix the index.html path too
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Debug files endpoint
app.get('/debug-files', (req: Request, res: Response) => {
    try {
        res.json({
            currentDir: __dirname,
            filesInCurrentDir: fs.readdirSync(__dirname),
            hasStyles: fs.existsSync(path.join(__dirname, 'styles')),
            hasAssets: fs.existsSync(path.join(__dirname, 'assets')),
            hasDist: fs.existsSync(path.join(__dirname, 'dist')),
            hasIndexHtml: fs.existsSync(path.join(__dirname, 'index.html'))
        });
    } catch (error: any) {
        res.json({ error: error.message });
    }
});

// Catch-all route
app.get('*', (req: Request, res: Response) => {
    console.log(`🔍 Catch-all route hit: ${req.method} ${req.path}`);
    
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api/')) {
        console.log('📄 Serving index.html for:', req.path);
        res.sendFile(path.join(__dirname, '../public/index.html'));
    } else {
        console.log('❌ API endpoint not found:', req.path);
        res.status(404).json({
            message: 'API endpoint not found',
            path: req.path,
            method: req.method,
            availableRoutes: ['/api', '/api/test', '/api/subscribe', '/api/mailchimp-check', '/health']
        });
    }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('❌ Express error:', err);
    
    if (err.message === 'Not allowed by CORS') {
        res.status(403).json({
            message: 'CORS policy violation',
            origin: req.headers.origin
        });
        return;
    }
    
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('🌐 CORS Origins:', allowedOrigins);
    console.log('📧 Environment check:', {
        hasMailchimpKey: !!process.env.MAILCHIMP_API_KEY,
        hasListId: !!process.env.MAILCHIMP_LIST_ID,
        keyFormat: process.env.MAILCHIMP_API_KEY ? `${process.env.MAILCHIMP_API_KEY.substring(0, 8)}...` : 'missing',
        nodeEnv: process.env.NODE_ENV || 'development'
    });
    
    // Log all registered routes
    console.log('📋 Registered routes:');
    console.log('  GET  /api');
    console.log('  GET  /api/test');
    console.log('  GET  /health');
    console.log('  GET  /api/mailchimp-check');
    console.log('  POST /api/subscribe');
});

// Process error handling
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

export default app;