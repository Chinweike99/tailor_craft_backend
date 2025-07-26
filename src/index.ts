import dotenv from 'dotenv';
import app from './app';
import { prisma } from './config/config';
dotenv.config();


const port = process.env.PORT || 4000;


const start = async () => {
    try {
        await prisma.$connect();
        console.log("Successfully connected to database via prisma");

        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connection verified');

        app.listen(port, () => {
        console.log(`Server running on port http://localhost:${port}`)
    })


    } catch (error) {
        console.log("Error starting the server: ", error);
        await prisma.$disconnect();
        process.exit(1)
    }
}

process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});


start()


