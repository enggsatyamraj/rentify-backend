import 'module-alias/register';
import dotenv from 'dotenv'
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimiter from "./utils/rateLimit";
import logger from "./utils/logger";
import mongoose from "mongoose";
import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes'
import adminRoutes from './routes/admin.routes';
import UserModel from './models/UserModel/user.models';

const app = express();
app.use(express.json());
// Add this after const app = express();
// app.set('trust proxy', 1);
app.use((req, res, next) => {
    console.log('Request received:', {
        path: req.path,
        method: req.method,
        body: req.body
    });
    next();
});
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(rateLimiter);

const port = process.env.PORT || 4545;
const DB_URI = process.env.MONGODB_URL!;
// const router = express.Router();

app.get("/", (_, res) => {
    res.status(200).json({ message: "Rentify backend is running" })
})

app.get("/health", (_, res) => {
    logger.info("Health check is happening");
    logger.info("logger is working correctly");
    logger.error("logger is working correctly");
    res.status(200).json({ status: "OK" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/property", propertyRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use("*", (_, res) => {
    res.status(404).json({ message: "Resource not found" });
});



mongoose
    .connect(DB_URI)
    .then(async () => {
        logger.info("Connected to MongoDB");
    })
    .catch((error) => {
        logger.error("MongoDB connection error:", error);
        process.exit(1);
    });

app
    .listen(port, () => {
        logger.info(`Server running on http://localhost:${port}`);
    })
    .on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            logger.error("Error: address already in use");
        } else {
            logger.error(err);
        }
    });

process.on("uncaughtException", (err: Error) => {
    logger.error("Uncaught Exception:", err);
    process.exit(1);
});

process.on("unhandledRejection", (err: Error) => {
    logger.error("Unhandled Rejection:", err);
    process.exit(1);
});

export default app;
