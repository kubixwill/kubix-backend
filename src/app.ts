import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { json } from "express";
import "./config/dotenv.config";
import contactRouter from "./routes/contact.routes";

const app = express();

// Middlewares
app.use(morgan('tiny'));
app.use(json());

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript server 🚀');
});

app.use('/contact', contactRouter);

export default app;
