import rateLimit from "express-rate-limit";

const pdfLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    success: false,
    message: "Too many PDF requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default pdfLimiter;
