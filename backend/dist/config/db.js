"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI || MONGODB_URI.includes('<db_password>')) {
        console.warn('WARNING: MongoDB URI is not fully configured. Please update .env with your credentials.');
    }
    try {
        await mongoose_1.default.connect(MONGODB_URI);
        console.log('Successfully connected to MongoDB Atlas.');
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};
exports.default = connectDB;
