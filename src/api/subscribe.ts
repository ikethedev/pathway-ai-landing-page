import express from 'express';
import axios from 'axios';

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/', async (req: any, res: any) => {
    console.log('📥 POST /api/subscribe hit!');
    console.log('📋 Request body:', req.body);
    
    const { email } = req.body;
    
    // Validate email
    if (!email) {
        console.log('❌ No email provided');
        return res.status(400).json({ message: 'Email is required' });
    }
    
    if (!emailRegex.test(email)) {
        console.log('❌ Invalid email format:', email);
        return res.status(400).json({ message: 'Please enter a valid email address' });
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
        return res.status(500).json({ message: 'Server configuration error' });
    }
    
    // Extract datacenter from API key
    const DATACENTER = API_KEY.split('-')[1];
    
    if (!DATACENTER) {
        console.error('❌ Invalid API key format - no datacenter found');
        return res.status(500).json({ message: 'Server configuration error' });
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
        
        // Handle specific Mailchimp errors
        if (error.response?.status === 400) {
            const errorDetail = error.response.data?.detail || '';
            if (errorDetail.includes('already a list member')) {
                return res.status(400).json({ 
                    message: 'This email is already subscribed to our newsletter!' 
                });
            } else if (errorDetail.includes('invalid')) {
                return res.status(400).json({ 
                    message: 'Please enter a valid email address' 
                });
            }
        }
        
        const errorMessage = error.response?.data?.detail || 'Unable to subscribe. Please try again.';
        res.status(400).json({ 
            message: errorMessage,
            success: false 
        });
    }
});

export default router;