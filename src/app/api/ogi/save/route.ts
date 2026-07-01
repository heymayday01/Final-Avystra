import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { exportOgiSubmissionsToExcel } from "@/lib/excel-export";
import { rateLimit } from "@/lib/rate-limit";
import { computeOgiScore } from "@/lib/ogi-data";

/**
 * POST /api/ogi/save
 *
 * Auto-saves an OGI submission to the database + regenerates the Excel file.
 * Called automatically when the RESULTS screen appears (before the user
 * clicks "GET MY Full Report"). Does NOT send any emails — that happens
 * separately via /api/ogi/submit when the user explicitly clicks the button.
 *
 * The score + band are recomputed server-side from the answers to ensure
 * the DB record matches what the user saw (client can't be trusted).
 *
 * Returns: { success: true, submissionId }
 * If a submission with the same name+email+phone already exists (within the
 * last 5 minutes), returns the existing ID instead of creating a duplicate.
 * This prevents duplicate rows if the user navigates back and forth.
 */
const BodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120)
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  role: z
    .string()
    .min(1, "Role is required")
    .max(120)
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  contact: z
    .string()
    .min(1, "Contact is required")
    .max(200)
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  email: z
    .string()
    .email()
    .max(200)
    .optional()
    .or(z.literal(""))
    .transform((s) => (s ? s.trim() : undefined)),
  answers: z
    .record(z.string(), z.union([z.number(), z.string()]))
    .refine((obj) => {
      return Object.values(obj).every((v) => {
        const n = typeof v === "string" ? Number(v) : v;
        return Number.isFinite(n) && n >= 0 && n <= 4;
      });
    }, "Answer values must be numbers between 0 and 4"),
});

export async function POST(request: Request) {
  // Rate limit: 10 saves per IP per hour (more lenient than submit since
  // no emails are sent).
  const rl = rateLimit(request, { limit: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Validation failed",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }
  const data = parsed.data;

  // Recompute score + band server-side from the raw answers.
  const { score, band } = computeOgiScore(
    Object.fromEntries(
      Object.entries(data.answers).map(([k, v]) => [
        Number(k),
        typeof v === "string" ? Number(v) : v,
      ])
    )
  );

  // Check for duplicate (same name + contact within last 5 minutes).
  // This prevents duplicate rows if the user navigates back and forth
  // to the results screen.
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await db.ogiSubmission.findFirst({
    where: {
      name: data.name,
      contact: data.contact,
      createdAt: { gte: fiveMinutesAgo },
    },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    // Return the existing submission — don't create a duplicate.
    return NextResponse.json({
      success: true,
      submissionId: existing.id,
      duplicate: true,
    });
  }

  // Save to database
  let submission;
  try {
    submission = await db.ogiSubmission.create({
      data: {
        name: data.name,
        role: data.role,
        contact: data.contact,
        email: data.email ?? null,
        score,
        band: band.badge,
        answersJson: JSON.stringify(data.answers),
      },
    });
  } catch (err) {
    console.error("[ogi/save] DB insert failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save submission" },
      { status: 500 }
    );
  }

  // Regenerate the Excel file (best-effort — don't block on failure).
  exportOgiSubmissionsToExcel().catch((err) => {
    console.error("[ogi/save] Excel export failed:", err);
  });

  return NextResponse.json({
    success: true,
    submissionId: submission.id,
  });
}
