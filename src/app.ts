import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { HealthCheck } from './health/health';
import authRouther from './routes/auth.routes'
import profileRouther from './routes/profile.routes'
import bookingRouther from './routes/booking.routes'
import { errorHandler } from './utils/error.utils';
import adminRouther from './routes/admin/admin.routes'
import designRouther from './routes/admin/design.routes'
import guideRouther from './routes/admin/guide.routes'
import reviewRouther from './routes/review.routes'
import paymentRouther from './routes/payment.routes'
import feedbackRouther from './routes/feedback.routes'
import contactRouther from './routes/contact.routes'
import { setUpDeliveryReminders } from './services/reminder.service';
import { setupKeepAlive } from './services/keep-alive.service';
import { configCors } from './config/cors.config';
import { initCleanupService } from './services/cleanup.service';
import { swaggerSpec } from './config/swagger.config';
// import { verifyEmailConfig } from './utils/email.service';

dotenv.config();

const app = express();

// Trust proxy - Required for Render, Heroku, etc.
app.set('trust proxy', 1);

app.use(express.json());
app.use(configCors());
setUpDeliveryReminders();
setupKeepAlive();
initCleanupService(); 
// verifyEmailConfig(); 

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'TailorCraft API Documentation',
  customfavIcon: '/favicon.ico',
}));

const BASE_URL = "/api/v1";
app.use(`${BASE_URL}/auth`, authRouther);
app.use(`${BASE_URL}/profile`, profileRouther);
app.use(`${BASE_URL}/booking`, bookingRouther);
app.use(`${BASE_URL}/client`, adminRouther);
app.use(`${BASE_URL}/design`, designRouther);
app.use(`${BASE_URL}/guide`, guideRouther);
app.use(`${BASE_URL}/review`, reviewRouther);
app.use(`${BASE_URL}/payment`, paymentRouther);
app.use(`${BASE_URL}/feedback`, feedbackRouther);
app.use(`${BASE_URL}/contact`, contactRouther);

app.get('/', (req: Request, res: Response) => {
    res.send(`
        <html>
            <head>
                <title>TailorCraft API</title>
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        text-align: center;
                    }
                    .container {
                        max-width: 600px;
                        padding: 2rem;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.2rem;
                        margin-bottom: 2rem;
                    }
                    a {
                        display: inline-block;
                        padding: 1rem 2rem;
                        background: white;
                        color: #667eea;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: bold;
                        transition: transform 0.2s;
                    }
                    a:hover {
                        transform: scale(1.05);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🧵 TailorCraft API</h1>
                    <p>Welcome to the TailorCraft Backend API</p>
                    <a href="/api-docs">📚 View API Documentation</a>
                </div>
            </body>
        </html>
    `);
});
// setUpDeliveryReminders();
app.get(`${BASE_URL}/health`, HealthCheck)
app.use(errorHandler);

export default app;
