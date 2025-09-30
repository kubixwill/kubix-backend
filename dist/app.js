"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const express_2 = require("express");
require("./config/dotenv.config");
const contact_routes_1 = __importDefault(require("./routes/contact.routes"));
const data_source_1 = require("./typeorm/data-source");
const app = (0, express_1.default)();
// Middlewares
app.use((0, morgan_1.default)('tiny'));
app.use((0, express_2.json)());
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
