import rateLimit from "express-rate-limit";

// Challenge 3: Protects the server from being overwhelmed by rapid-fire spam bots applying 500 times a second
export const applyRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // Maximum 10 applications per minute per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many application requests. Please slow down.",
        success: false
    }
});

// General rate limiter to prevent denial-of-service / scraping
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Max 500 requests per 15 minutes per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: "Too many requests from this IP. Please try again later.",
        success: false
    }
});
