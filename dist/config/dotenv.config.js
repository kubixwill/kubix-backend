"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const environment = process.env.environment?.trim();
if (environment) {
    dotenv_1.default.config({ path: `.env.${environment}` });
}
// Validate critical envs for DB when present; keep non-fatal to not break dev
process.env.DB_HOST = process.env.DB_HOST || "localhost";
process.env.DB_PORT = process.env.DB_PORT || "5432";
process.env.DB_USERNAME = process.env.DB_USERNAME || "postgres";
process.env.DB_PASSWORD = process.env.DB_PASSWORD || "postgres";
process.env.DB_NAME = process.env.DB_NAME || "kubix";
