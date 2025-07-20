import express, { Response } from 'express';

const app = express();

const port = 3000;

app.get('/', ( res: Response) => {
    res.send(`Welcome to TailorCraft Backend! 👌`)
})

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`)
})

