/**
 * Excel export for OGI submissions.
 *
 * Generates a styled .xlsx file from all OgiSubmission records and writes
 * it to `public/ogi-submissions.xlsx` so it's downloadable via the URL
 * `/ogi-submissions.xlsx`. The file is regenerated on every new submission
 * and can also be regenerated on-demand via GET /api/ogi/export.
 *
 * No external service, no credentials — just a local file.
 */

import ExcelJS from "exceljs";
import path from "path";
import fs from "fs/promises";
import { db } from "@/lib/db";

/** Path where the generated Excel file is written to (and served from via /public). */
const EXCEL_FILE_PATH = path.join(
  process.cwd(),
  "public",
  "ogi-submissions.xlsx"
);

/** Column definitions — order here determines column order in the sheet. */
interface ExportColumn {
  header: string;
  key: keyof RowData;
  width: number; // min width, auto-fit expands beyond this
}

interface RowData {
  id: string;
  name: string;
  role: string;
  contact: string;
  email: string;
  score: number;
  band: string;
  createdAt: string;
}

const COLUMNS: ExportColumn[] = [
  { header: "ID", key: "id", width: 26 },
  { header: "Name", key: "name", width: 18 },
  { header: "Role", key: "role", width: 24 },
  { header: "Contact", key: "contact", width: 20 },
  { header: "Email", key: "email", width: 28 },
  { header: "Score", key: "score", width: 10 },
  { header: "Band", key: "band", width: 20 },
  { header: "Submitted At", key: "createdAt", width: 24 },
];

/** Band → fill colour mapping (matches the email template palette). */
function bandFillColour(band: string): string {
  if (band.includes("High Growth")) return "E6F7F0"; // emerald-50
  if (band.includes("Growth Ready")) return "E6F0FF"; // blue-50
  if (band.includes("Execution Gap")) return "FFF7E6"; // amber-50
  return "FFE6E6"; // red-50 (Immediate Attention)
}

/** Format a Date as a readable IST timestamp. */
function formatTimestamp(date: Date): string {
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
 * Generate (or regenerate) the OGI submissions Excel file in /public.
 *
 * @returns The absolute file path of the generated file.
 * @throws If the filesystem write or DB query fails. Callers should
 *         wrap in try/catch — Excel generation is best-effort and must
 *         never block the DB save or email sends.
 */
export async function exportOgiSubmissionsToExcel(): Promise<string> {
  // Fetch all submissions, newest first.
  const submissions = await db.ogiSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "AVYSTRA Website";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("OGI Submissions", {
    views: [{ state: "frozen", ySplit: 1 }], // freeze header row
  });

  // ── Header row ──
  sheet.columns = COLUMNS.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width,
  }));

  // Style the header row: navy background, bold white text, centered, gold bottom border
  const headerRow = sheet.getRow(1);
  headerRow.height = 28;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0B1B2E" }, // navy-deep
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = {
      bottom: { style: "thin", color: { argb: "FFB8924E" } }, // gold accent
    };
  });

  // ── Data rows ──
  for (const sub of submissions) {
    const row = sheet.addRow({
      id: sub.id,
      name: sub.name,
      role: sub.role,
      contact: sub.contact,
      email: sub.email || "",
      score: sub.score,
      band: sub.band,
      createdAt: formatTimestamp(sub.createdAt),
    } satisfies RowData);

    // Colour-tint the Band cell based on the band value
    const bandCell = row.getCell("band");
    bandCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: bandFillColour(sub.band) },
    };
    bandCell.font = { bold: true };

    // Score cell: bold + centered
    const scoreCell = row.getCell("score");
    scoreCell.font = { bold: true };
    scoreCell.alignment = { horizontal: "center" };

    // Subtle bottom border on every row for readability
    row.eachCell((cell) => {
      cell.border = {
        bottom: { style: "hair", color: { argb: "FFE2E8F0" } },
      };
      cell.alignment = cell.alignment || { vertical: "middle" };
    });

    row.height = 20;
  }

  // ── Auto-fit column widths ──
  // exceljs has no built-in auto-fit, so we calculate the max content length
  // per column and set width = max(header_len, max_content_len) + 2 padding.
  sheet.columns.forEach((column) => {
    let maxLen = String(column.header ?? "").length;
    column.eachCell?.({ includeEmpty: false }, (cell) => {
      const val = cell.value;
      const len =
        val === null || val === undefined
          ? 0
          : val instanceof Date
            ? formatTimestamp(val).length
            : String(val).length;
      if (len > maxLen) maxLen = len;
    });
    // cap at 50 to avoid absurdly wide columns
    column.width = Math.min(Math.max(maxLen + 2, 10), 50);
  });

  // If there are no submissions yet, add an empty placeholder row so the
  // file isn't empty (helps the user confirm the file is valid).
  if (submissions.length === 0) {
    sheet.addRow({
      id: "—",
      name: "No submissions yet",
      role: "",
      contact: "",
      email: "",
      score: 0,
      band: "",
      createdAt: "",
    } satisfies RowData);
  }

  // ── Write to /public ──
  // Ensure the directory exists (it should, but be defensive).
  await fs.mkdir(path.dirname(EXCEL_FILE_PATH), { recursive: true });
  const buffer = await workbook.xlsx.writeBuffer();
  await fs.writeFile(EXCEL_FILE_PATH, Buffer.from(buffer));

  return EXCEL_FILE_PATH;
}
