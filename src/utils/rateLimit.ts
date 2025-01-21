import rateLimit from "express-rate-limit";

const rateLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 10,
    standardHeaders: true,
    message: {
        status: 429,
        message: 'Too many requests'
    }
})

export default rateLimiter