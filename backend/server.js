const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory database (for demo purposes)
let orders = [];
let emailLogs = [];

// Email configuration (using Gmail)
// Create .env file with: EMAIL_USER=your-email@gmail.com, EMAIL_PASS=your-app-password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Helper function to send email
async function sendOrderEmail(order) {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.customerEmail,
        subject: `🎉 Order Confirmation: ${order.orderId}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #4CAF50;">Order Confirmed!</h2>
                <p>Hello ${order.customerName},</p>
                <p>Thank you for your purchase from Student Shop!</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>Order Details:</h3>
                    <p><strong>Order ID:</strong> ${order.orderId}</p>
                    <p><strong>Product:</strong> ${order.product}</p>
                    <p><strong>Price:</strong> $${order.price}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
                </div>
                
                <p>We'll notify you when your order ships.</p>
                <p>Best regards,<br>Student Shop Team</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, message: error.message };
    }
}

// Add to server.js after email sending
async function sendToGoogleSheets(order) {
    const webhookUrl = 'https://hooks.zapier.com/hooks/catch/25689523/uf07dq3/';
    
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            orderId: order.orderId,
            customer: order.customerName,
            product: order.product,
            price: order.price,
            date: new Date().toISOString()
        })
    });
}

// Routes
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        service: 'E-commerce Integration API',
        timestamp: new Date().toISOString()
    });
});

// Create new order
app.post('/api/orders', async (req, res) => {
    try {
        const order = req.body;
        order.timestamp = new Date().toISOString();
        
        // Store order
        orders.push(order);
        
        console.log('📦 New order received:', order);
        
        // Send email notification
        const emailResult = await sendOrderEmail(order);
        
        if (emailResult.success) {
            emailLogs.push({
                orderId: order.orderId,
                email: order.customerEmail,
                status: 'sent',
                timestamp: new Date().toISOString()
            });
            
            res.status(201).json({
                success: true,
                message: 'Order created and email sent',
                orderId: order.orderId,
                emailStatus: 'sent'
            });
        } else {
            // Email failed but order still created
            emailLogs.push({
                orderId: order.orderId,
                email: order.customerEmail,
                status: 'failed',
                error: emailResult.message
            });
            
            res.status(201).json({
                success: true,
                message: 'Order created but email failed',
                orderId: order.orderId,
                emailStatus: 'failed',
                warning: emailResult.message
            });
        }
        
    } catch (error) {
        console.error('Order processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process order'
        });
    }
});

// Get all orders
app.get('/api/orders', (req, res) => {
    res.json({
        count: orders.length,
        orders: orders.reverse(), // Latest first
        emailLogs: emailLogs
    });
});

// Serve static files (frontend)
app.use(express.static('../frontend'));

// Start server
app.listen(PORT, () => {
    console.log(`
    🚀 Server running on http://localhost:${PORT}
    
    📍 Endpoints:
    - GET  /api/health          - Check server status
    - POST /api/orders          - Create new order
    - GET  /api/orders          - View all orders
    
    🌐 Frontend: http://localhost:3000/index.html
    
    ⚠️  Make sure to create a .env file with:
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-app-password
    `);
});