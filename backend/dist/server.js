"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
// Load environment variables
dotenv_1.default.config();
// Verify OpenAI API key is set
if (!process.env.OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}
// Import routes after environment variables are loaded
const search_1 = __importDefault(require("./routes/search"));
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Rate limiting configuration
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again after 15 minutes',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
// Apply rate limiting to all routes
app.use(apiLimiter);
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? [/\.vercel\.app$/, /\.vercel\.app$/] // Allow any Vercel deployment
        : ['http://localhost:5173'],
    credentials: true
}));
app.use(express_1.default.json());
// Routes
app.use('/api', search_1.default);
// Basic health check route
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({
            error: 'Invalid JSON payload',
            code: 'INVALID_JSON'
        });
    }
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        code: err.code || 'INTERNAL_SERVER_ERROR'
    });
});
// For Vercel: export the app as default
exports.default = app;
