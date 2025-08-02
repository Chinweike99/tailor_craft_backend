import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheck } from './health/health';
import authRouther from './routes/auth.routes'
import profileRouther from './routes/profile.routes'
import bookingRouther from './routes/booking.routes'
import { errorHandler } from './utils/error.utils';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const BASE_URL = "/api/v1";
app.use(`${BASE_URL}/auth`, authRouther);
app.use(`${BASE_URL}/profile`, profileRouther);
app.use(`${BASE_URL}/booking`, bookingRouther);

app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome to TailorCraft Backend..!! 👌`);
});

app.get(`${BASE_URL}/health`, HealthCheck)
app.use(errorHandler);

export default app;
