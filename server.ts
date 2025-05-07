import {app} from './src/app';
import dotenv from 'dotenv';
import { createServer } from 'http';
import {connectDB} from './src/config/database';
dotenv.config();

const PORT = process.env.PORT || 8000;
const server = createServer(app);


connectDB().then(() =>{
    console.log("Connected to MongoDB");

    // Start the server
    server.listen(PORT, ()=>{
        console.log(`Server running on ${PORT}`);
        console.log(`API available at http://localhost:${PORT}/api`)
    });
    
}).catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
})


process.on('uncaughtExceptionMonitor', (error) => {
    console.log('Unhandled Promise Rejection:', error);
    server.close(()=>process.exit(1));
})
