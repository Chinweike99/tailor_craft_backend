import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { HealthCheck } from './health/health';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const BASE_URL = "/api/v1";

app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome to TailorCraft Backend..!! 👌`);
});

app.get(`${BASE_URL}/health`, HealthCheck)


export default app;
