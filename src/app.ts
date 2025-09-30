import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { json } from "express";
import cors from "cors";
import "./config/dotenv.config";
import contactRouter from "./routes/contact.routes";
import { AppDataSource } from "./typeorm/data-source";

const app = express();

// Middlewares
app.use(morgan('tiny'));
app.use(json());

// CORS - allow all origins (reflect request origin)
app.use(cors({ origin: true, credentials: true }));
// Handle preflight for all routes
app.options("*", cors());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript server 🚀');
});

app.use('/contact', contactRouter);

app.get('/health', (req, res) => {
  const db = AppDataSource.isInitialized ? 'up' : 'down';
  res.status(200).json({ status: 'ok', db });
});

export default app;
