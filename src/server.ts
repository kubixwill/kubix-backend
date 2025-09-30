import dotenv from "dotenv";
import fs from "fs";
import app from "./app";

// Load base environment variables
dotenv.config({ path: ".env" });

// Load environment-specific variables if applicable
const environment = process.env.environment?.trim() || "";
const envFilePath = `.env.${environment}`;

if (environment && fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
  console.log(`Loaded environment variables from ${envFilePath}`);
} else {
  console.warn(`Environment-specific .env file not found: ${envFilePath}`);
}

// Fetch PORT safely
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
