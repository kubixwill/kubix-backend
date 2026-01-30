"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const app_1 = __importDefault(require("./app"));
const data_source_1 = require("./typeorm/data-source");
// Load base environment variables
dotenv_1.default.config({ path: ".env" });
// Load environment-specific variables if applicable
const environment = process.env.environment?.trim() || "";
if (environment) {
    const envFilePath = `.env.${environment}`;
    if (fs_1.default.existsSync(envFilePath)) {
        dotenv_1.default.config({ path: envFilePath });
        console.log(`Loaded environment variables from ${envFilePath}`);
    }
    else {
        console.warn(`Environment-specific .env file not found: ${envFilePath}`);
    }
}
// Fetch PORT safely
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// Initialize DB and then start server
data_source_1.AppDataSource.initialize()
    .then(() => {
    console.log("Connected to PostgreSQL via TypeORM");
    app_1.default.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
});
