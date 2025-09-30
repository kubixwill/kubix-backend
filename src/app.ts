import express from "express";
import morgan from "morgan";

const app = express();

// Middlewares
app.use(morgan('tiny'));

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express + TypeScript server 🚀');
});

export default app;
