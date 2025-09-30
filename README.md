## keysentry server

### Environment variables

Create a `.env` file (and optionally `.env.development`, `.env.production`) with:

```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=kubix
```

Optionally set `environment=development` to load `.env.development`.

### Run locally

```
npm run dev
```

### API

- POST `/contact`
  - body: `{ "fullName": string, "email": string, "message": string }`
  - 201: `{ id, fullName, email, message }`

### Google Sheets setup

Provide credentials either by path or inline JSON:

```
# Required: either of these
GOOGLE_CREDENTIALS_JSON_PATH=./kubix-473708-65adc0a26f58.json
# or
GOOGLE_CREDENTIALS_JSON={"type":"service_account", ...}

# Target spreadsheet and sheet name
SHEETS_SPREADSHEET_ID=your-spreadsheet-id
SHEETS_SHEET_NAME=Sheet1
```

Share the sheet with the service account email from the JSON.
