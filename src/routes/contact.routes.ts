import { Router } from "express";
import { AppDataSource } from "../typeorm/data-source";
import { Contact } from "../typeorm/entities/Contact";
import { sheetsService } from "../services/sheets.service";
import { kylasService } from "../services/kylas.service";

const router = Router();

// Create header row in the configured Google Sheet
router.post('/header', async (req, res): Promise<void> => {
  try {
    const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID as string;
    const sheetName = process.env.SHEETS_SHEET_NAME || "Sheet1";
    if (!spreadsheetId) {
      res.status(400).json({ error: "SHEETS_SPREADSHEET_ID is not configured" });
      return;
    }
    await sheetsService.ensureHeader(spreadsheetId, sheetName);
    res.status(200).json({ ok: true, sheetName });
  } catch (err: any) {
    console.error("Failed to create header", err);
    const message = err?.message || "Failed to create header";
    const reason = err?.errors?.[0]?.message || err?.response?.data?.error?.message;
    res.status(500).json({ error: message, reason });
  }
});

router.post('/', async (req, res): Promise<void> => {
  try {
    const { fullName, email, message } = req.body ?? {};

    if (!fullName || !email || !message) {
      res.status(400).json({ error: "fullName, email, and message are required" });
      return;
    }

    const trimmedMessage = String(message).trim();
    if (trimmedMessage.length < 10 || trimmedMessage.length > 500) {
      res.status(400).json({ error: "message must be between 10 and 500 characters" });
      return;
    }

    const repo = AppDataSource.getRepository(Contact);
    const record = repo.create({ fullName, email, message: trimmedMessage });
    await repo.save(record);

    const spreadsheetId = process.env.SHEETS_SPREADSHEET_ID as string;
    const sheetName = process.env.SHEETS_SHEET_NAME || "Sheet1";
    if (spreadsheetId) {
      try {
        await sheetsService.appendRow(spreadsheetId, sheetName, fullName, email, message);
      } catch (sheetErr) {
        console.error("Sheets append failed", sheetErr);
      }
    }

    // Create/update lead in Kylas CRM and add a contact-us note (non-blocking)
    try {
      await kylasService.handleContactSubmission(fullName, email, trimmedMessage);
    } catch (kylasErr) {
      console.error("Kylas CRM sync failed", kylasErr);
    }

    res.status(201).json({ id: record.id, fullName: record.fullName, email: record.email, message: record.message });
  } catch (err) {
    console.error("Failed to save contact", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
