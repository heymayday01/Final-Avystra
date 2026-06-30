/**
 * Google Sheets logging for OGI submissions.
 *
 * Authenticates with a Google Cloud service account (JWT) and appends one
 * row per submission to the shared "AVYSTRA OGI Submissions" sheet.
 *
 * Env vars (all required for sheet logging to activate):
 *   GOOGLE_SHEETS_CLIENT_EMAIL  — service account email (xxx@yyy.iam.gserviceaccount.com)
 *   GOOGLE_SHEETS_PRIVATE_KEY   — service account private key (PEM, with \n escapes)
 *   GOOGLE_SHEET_ID             — the sheet ID from the URL
 *
 * If any of these are missing, appendOgiSubmissionToSheet() logs a warning
 * and returns — it never throws. Sheet logging is purely additive and must
 * never block the DB save or email sends.
 */

import { google } from "googleapis";

const CLIENT_EMAIL = process.env.GOOGLE_SHEETS_CLIENT_EMAIL?.trim();
// The private key is stored with literal "\n" sequences in .env; convert
// them back to real newlines so the PEM parses correctly.
const PRIVATE_KEY = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
).trim();
const SHEET_ID = process.env.GOOGLE_SHEET_ID?.trim();

const SHEET_TAB_NAME = "AVYSTRA OGI Submissions";
const SHEET_RANGE = `${SHEET_TAB_NAME}!A:G`; // 7 columns: Name..Submitted At

export interface OgiSheetRow {
  name: string;
  role: string;
  contact: string;
  email: string | null;
  score: number;
  band: string;
}

/** Format a Date as a human-readable IST timestamp for the sheet. */
function formatTimestamp(date: Date): string {
  // IST = UTC+5:30. Format: "30 Jun 2026, 06:15 PM IST"
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(",", ",") + " IST";
}

/**
 * Append one OGI submission row to the Google Sheet.
 *
 * Never throws — any error (missing creds, API failure, sheet not shared
 * with the service account, etc.) is caught, logged, and swallowed so the
 * caller's main flow (DB save + emails) is unaffected.
 */
export async function appendOgiSubmissionToSheet(
  data: OgiSheetRow
): Promise<void> {
  // Guard: if creds aren't configured, skip silently (warn once).
  if (!CLIENT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
    console.warn(
      "[sheets] Google Sheets credentials not set — skipping sheet append. Set GOOGLE_SHEETS_CLIENT_EMAIL, GOOGLE_SHEETS_PRIVATE_KEY, GOOGLE_SHEET_ID in .env to enable."
    );
    return;
  }

  try {
    const auth = new google.auth.JWT({
      email: CLIENT_EMAIL,
      key: PRIVATE_KEY,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const row = [
      data.name,
      data.role,
      data.contact,
      data.email || "",
      data.score,
      data.band,
      formatTimestamp(new Date()),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [row] },
    });

    console.log("[sheets] OGI submission row appended to sheet:", data.name);
  } catch (err) {
    // Log full error server-side but never throw — sheet logging is best-effort.
    console.error("[sheets] Failed to append OGI submission to sheet:", err);
  }
}
