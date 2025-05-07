import mongoose from "mongoose";
import { config } from "./env";



mongoose.set('strictQuery', false);

// Connect to mongoDB

export const connectDB = async () : Promise<void> => {
    try {;
        const connect = await mongoose.connect(config.mongoUri);
        console.log(`MongoDB connected: ${connect.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB: ", error);
        process.exit(1);
    }
}

// Close mongoDB connection
export const closeDB = async () : Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log("MongoDB connection closed");
    } catch (error) {
        console.error('Error closing MongoDB connection: ', error)
    }
}


