import dotenv from "dotenv";


dotenv.config({ path: ".env" });


dotenv.config({
  path: `.env.${process.env.environment?.trim() || ""}`,
});