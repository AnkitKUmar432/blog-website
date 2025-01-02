import express from 'express';
import userRoute from './routes/user.routes.js';
import blogRoutes from './routes/Blog.routes.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import cookiesParser from 'cookie-parser';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000; // Ensure this is 4000
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cookiesParser());
app.use(express.json());
app.use(morgan('combined')); // Log HTTP requests

app.use(cors({
    origin:'http://localhost:3000', // Updated to 3000
    // origin: process.env.FRONTEND_URL, // Updated to 3000
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Ensure temp file directory exists
const tempDir = '/tmp/';
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: tempDir,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}));

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);  // Exit process to avoid undefined behavior
});

// Check if required environment variables are available
const requiredEnv = ['MONGO_URL', 'CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_SECRET_KEY'];
const missingEnv = requiredEnv.filter(env => !process.env[env]);

if (missingEnv.length > 0) {
    console.error('Missing required environment variables:', missingEnv.join(', '));
    process.exit(1);
}

// MongoDB connection with retry logic
const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;
    while (retries < maxRetries) {
        try {
            // await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
            await mongoose.connect(MONGO_URL);

            console.log("Connected to MongoDB");
            break;
        } catch (error) {
            retries++;
            console.error(`MongoDB connection failed (Attempt ${retries} of ${maxRetries})`, error);
            await new Promise(res => setTimeout(res, 5000)); // wait 5 seconds before retrying
        }
    }
    if (retries === maxRetries) {
        console.error("Exceeded maximum MongoDB connection attempts, exiting...");
        process.exit(1);
    }
};
connectDB();

// Routes
app.use('/api/users', userRoute);
app.use('/api/blogs', blogRoutes);

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error Middleware:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});
