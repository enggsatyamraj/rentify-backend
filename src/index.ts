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

const app = express();
// Add this after const app = express();
// app.set('trust proxy', 1);
app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(rateLimiter);

const port = process.env.PORT || 4545;
const DB_URI = process.env.MONGODB_URL!;
const router = express.Router();

app.get("/", (_, res) => {
    res.status(200).json({ message: "Rentify backend is running" })
})

app.get("/health", (_, res) => {
    res.status(200).json({ status: "OK" });
});

app.use("/api/v1/auth", authRoutes);

app.use("*", (_, res) => {
    res.status(404).json({ message: "Resource not found" });
});



mongoose
    .connect(DB_URI)
    .then(() => {
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
