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

  private async ensureSheetExists(spreadsheetId: string, sheetName: string | undefined, auth: any): Promise<string> {
    const meta = await this.sheets.spreadsheets.get({ auth, spreadsheetId });
    const sheets = meta.data.sheets || [];
    const firstTitle = sheets[0]?.properties?.title || "Sheet1";

    if (!sheetName) {
      return firstTitle;
    }

    const exists = sheets.some((s) => s.properties?.title === sheetName);
    if (exists) return sheetName;

    // Try to create, if forbidden, fall back to first sheet
    try {
      await this.sheets.spreadsheets.batchUpdate({
        auth,
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: sheetName },
              },
            },
          ],
        },
      });
      return sheetName;
    } catch (e) {
      return firstTitle;
    }
  }

  async ensureHeader(spreadsheetId: string, sheetName: string | undefined): Promise<string> {
    const auth = this.getAuth();
    const targetSheet = await this.ensureSheetExists(spreadsheetId, sheetName, auth);

    const res = await this.sheets.spreadsheets.values.get({
      auth,
      spreadsheetId,
      range: `${targetSheet}!1:1`,
    });

    const existing = (res.data.values && res.data.values[0]) || [];
    const needsHeader = REQUIRED_HEADERS.some((h, i) => existing[i] !== h);
    if (!needsHeader) return targetSheet;

    await this.sheets.spreadsheets.values.update({
      auth,
      spreadsheetId,
      range: `${targetSheet}!A1:C1`,
      valueInputOption: "RAW",
      requestBody: { values: [REQUIRED_HEADERS] },
    });
    return targetSheet;
  }

  async appendRow(spreadsheetId: string, sheetName: string | undefined, fullName: string, email: string, message: string) {
    const auth = this.getAuth();
    const targetSheet = await this.ensureHeader(spreadsheetId, sheetName);
    await this.sheets.spreadsheets.values.append({
      auth,
      spreadsheetId,
      range: `${targetSheet}!A:C`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [[fullName, email, message]] },
    });
  }
}

export const sheetsService = new SheetsService();


