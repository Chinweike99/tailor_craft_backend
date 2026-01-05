import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
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
import { setUpDeliveryReminders } from './services/reminder.service';
import { setupKeepAlive } from './services/keep-alive.service';
import { configCors } from './config/cors.config';

dotenv.config();

const app = express();

// Trust proxy - Required for Render, Heroku, etc.
app.set('trust proxy', 1);

app.use(express.json());
app.use(configCors());
setUpDeliveryReminders();
setupKeepAlive();

const BASE_URL = "/api/v1";
app.use(`${BASE_URL}/auth`, authRouther);
app.use(`${BASE_URL}/profile`, profileRouther);
app.use(`${BASE_URL}/booking`, bookingRouther);
app.use(`${BASE_URL}/client`, adminRouther);
app.use(`${BASE_URL}/design`, designRouther);
app.use(`${BASE_URL}/guide`, guideRouther);
app.use(`${BASE_URL}/review`, reviewRouther);
app.use(`${BASE_URL}/payment`, paymentRouther);

app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome to TailorCraft Backend..!! 👌`);
});
// setUpDeliveryReminders();
app.get(`${BASE_URL}/health`, HealthCheck)
app.use(errorHandler);

export default app;
