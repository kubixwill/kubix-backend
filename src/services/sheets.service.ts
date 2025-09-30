import { google } from "googleapis";
import fs from "fs";
import path from "path";

const REQUIRED_HEADERS = ["Fullname", "Email", "Message"];

export class SheetsService {
  private sheets = google.sheets({ version: "v4" });

  private getAuth() {
    const keyFile = process.env.GOOGLE_CREDENTIALS_JSON_PATH;
    const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;

    let credentials: any;
    if (credentialsJson) {
      credentials = JSON.parse(credentialsJson);
    } else if (keyFile) {
      const absolute = path.isAbsolute(keyFile) ? keyFile : path.join(process.cwd(), keyFile);
      const raw = fs.readFileSync(absolute, "utf8");
      credentials = JSON.parse(raw);
    } else {
      throw new Error("Google credentials not provided. Set GOOGLE_CREDENTIALS_JSON or GOOGLE_CREDENTIALS_JSON_PATH");
    }

    const scopes = ["https://www.googleapis.com/auth/spreadsheets"]; 
    const auth = new google.auth.GoogleAuth({ credentials, scopes });
    return auth;
  }

  async ensureHeader(spreadsheetId: string, sheetName: string) {
    const auth = this.getAuth();
    const res = await this.sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${sheetName}!1:1`,
    });

    const existing = (res.data.values && res.data.values[0]) || [];
    const needsHeader = REQUIRED_HEADERS.some((h, i) => existing[i] !== h);
    if (!needsHeader) return;

    await this.sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: `${sheetName}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: { values: [REQUIRED_HEADERS] },
    });
  }

  async appendRow(spreadsheetId: string, sheetName: string, fullName: string, email: string, message: string) {
    const auth = this.getAuth();
    await this.ensureHeader(spreadsheetId, sheetName);
    await this.sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [[fullName, email, message]] },
    });
  }
}

export const sheetsService = new SheetsService();


