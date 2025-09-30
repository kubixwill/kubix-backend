"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_2 = require("express");
const cors_1 = __importDefault(require("cors"));
require("./config/dotenv.config");
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const data_source_1 = require("./typeorm/data-source");
const app = (0, express_1.default)();
// Middlewares
app.use((0, morgan_1.default)('tiny'));
app.use((0, express_2.json)());
// CORS
const allowedOrigins = [
    "http://localhost:3000",
    "https://www.kubix.careers"
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            // Allow non-browser requests (e.g., curl, Postman)
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
}));
// Handle preflight for all routes
app.options("*", (0, cors_1.default)());
// Routes
app.get('/', (req, res) => {
    res.send('Hello from Express + TypeScript server 🚀');
});
app.use('/contact', contact_routes_1.default);
app.get('/health', (req, res) => {
    const db = data_source_1.AppDataSource.isInitialized ? 'up' : 'down';
    res.status(200).json({ status: 'ok', db });
});
exports.default = app;
