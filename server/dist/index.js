"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const restaurant_routes_1 = __importDefault(require("./routes/restaurant.routes"));
const subscription_routes_1 = __importDefault(require("./routes/subscription.routes"));
const module_routes_1 = __importDefault(require("./routes/module.routes"));
const outlet_routes_1 = __importDefault(require("./routes/outlet.routes"));
const db_1 = require("./config/db");
const error_1 = require("./middleware/error");
const errors_1 = require("./utils/errors");
// Load environment variables
const envPath = path_1.default.resolve(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv_1.default.config({ path: envPath });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001; // Changed from 5000 to 5001 to avoid conflict
// Middleware
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Handle preflight requests
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Logging
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api', restaurant_routes_1.default); // Restaurant routes
app.use('/api/subscription', subscription_routes_1.default); // Subscription routes
app.use('/api/modules', module_routes_1.default); // Module routes
app.use('/api', outlet_routes_1.default); // Outlet routes
// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'BillMitra API is running',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});
// Handle 404
app.use((req, res, next) => {
    throw new errors_1.NotFoundError(`Not Found - ${req.originalUrl}`);
});
// Error handling middleware
app.use(error_1.errorHandler);
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Close server & exit process
    db_1.pool.end(() => process.exit(1));
});
// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
});
