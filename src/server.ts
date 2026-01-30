import dotenv from "dotenv";
import fs from "fs";
import app from "./app";
import { AppDataSource } from "./typeorm/data-source";

// Load base environment variables
dotenv.config({ path: ".env" });

// Load environment-specific variables if applicable
const environment = process.env.environment?.trim() || "";
if (environment) {
  const envFilePath = `.env.${environment}`;
  if (fs.existsSync(envFilePath)) {
    dotenv.config({ path: envFilePath });
    console.log(`Loaded environment variables from ${envFilePath}`);
  } else {
    console.warn(`Environment-specific .env file not found: ${envFilePath}`);
  }
}

// Fetch PORT safely
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize DB and then start server
AppDataSource.initialize()
  .then(() => {
    console.log("Connected to PostgreSQL via TypeORM");
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
