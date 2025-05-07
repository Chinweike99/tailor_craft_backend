"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
mongoose_1.default.set('strictQuery', false);
// Connect to mongoDB
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        ;
        const connect = yield mongoose_1.default.connect(env_1.config.mongoUri);
        console.log(`MongoDB connected: ${connect.connection.host}`);
    }
    catch (error) {
        console.error("Error connecting to MongoDB: ", error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
// Close mongoDB connection
const closeDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connection.close();
        console.log("MongoDB connection closed");
    }
    catch (error) {
        console.error('Error closing MongoDB connection: ', error);
    }
});
exports.closeDB = closeDB;
