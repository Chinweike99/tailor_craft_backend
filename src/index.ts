import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
    res.send(`Welcome to TailorCraft Backend! 👌`);
})

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`)
})

