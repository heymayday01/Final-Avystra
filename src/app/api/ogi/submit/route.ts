import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  questions,
  answerLabel,
  dimensionLabels,
  type DimensionCode,
} from "@/lib/ogi-data";

// ── Resend client ──────────────────────────────────────────────────────────
// NOTE: Until avystra.co.in is verified with Resend DNS, we must use the
// shared onboarding sender. Once the domain is verified, swap FROM_EMAIL to
// something like "AVYSTRA <noreply@avystra.co.in>".
const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
const FROM_EMAIL = "AVYSTRA <onboarding@resend.dev>";
const AVYSTRA_NOTIFY_EMAIL =
  process.env.AVYSTRA_NOTIFY_EMAIL?.trim() || "info@avystra.co.in";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ── Zod validation ─────────────────────────────────────────────────────────
const BodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(120, "Name is too long")
    // strip CR/LF to prevent email header injection
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  role: z
    .string()
    .min(1, "Role is required")
    .max(120, "Role is too long")
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  contact: z
    .string()
    .min(1, "Contact is required")
    .max(200, "Contact is too long")
    .transform((s) => s.replace(/[\r\n]/g, " ").trim()),
  email: z
    .string()
    .email("Invalid email address")
    .max(200, "Email is too long")
    .optional()
    .or(z.literal(""))
    .transform((s) => (s ? s.trim() : undefined)),
  answers: z
    .record(z.string(), z.union([z.number(), z.string()]))
    .refine((obj) => {
      // every value must be 0–4
      return Object.values(obj).every((v) => {
        const n = typeof v === "string" ? Number(v) : v;
        return Number.isFinite(n) && n >= 0 && n <= 4;
      });
    }, "Answer values must be numbers between 0 and 4"),
  score: z.number().int().min(0).max(100),
  band: z.string().min(1).max(60),
});

type ParsedBody = z.infer<typeof BodySchema>;

// ── Email HTML builders ────────────────────────────────────────────────────

/** Build the AVYSTRA notification email — full data, readable HTML table. */
function buildAvystraEmailHtml(data: ParsedBody): string {
  const { name, role, contact, email, score, band, answers } = data;

  // Normalise answers keys to numbers for lookup
  const numericAnswers: Record<number, number> = {};
  for (const [k, v] of Object.entries(answers)) {
    numericAnswers[Number(k)] = typeof v === "string" ? Number(v) : v;
  }

  // Group questions by dimension for readability
  const dimensions: DimensionCode[] = ["L", "M", "T", "E"];
  const rows = dimensions
    .map((code) => {
      const dimQuestions = questions.filter((q) => q.dimensionCode === code);
      const dimRows = dimQuestions
        .map((q) => {
          const ans = numericAnswers[q.id];
          return `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #eef1f5;color:#64748b;font-size:12px;white-space:nowrap;">Q${q.id}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eef1f5;color:#0f172a;font-size:13px;line-height:1.5;">${escapeHtml(q.text)}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #eef1f5;color:#b8924e;font-weight:700;font-size:12px;text-align:center;white-space:nowrap;">${answerLabel(ans)} <span style="color:#94a3b8;font-weight:400;">(${ans ?? "—"})</span></td>
            </tr>`;
        })
        .join("");
      return `
          <tr>
            <td colspan="3" style="padding:12px 12px 6px;background:#f8fafc;border-bottom:1px solid #e2e8f0;">
              <span style="font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#334155;">${escapeHtml(dimensionLabels[code])}</span>
            </td>
          </tr>
          ${dimRows}`;
    })
    .join("");

  const scoreColour =
    score >= 82 ? "#10B981" : score >= 66 ? "#3B82F6" : score >= 45 ? "#F59E0B" : "#EF4444";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#0B1B2E;padding:28px 32px;">
            <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#B8924E;font-weight:700;margin-bottom:6px;">New OGI Submission</div>
            <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">${escapeHtml(name)} <span style="color:#94a3b8;font-weight:400;font-size:16px;">— ${escapeHtml(role)}</span></div>
          </td>
        </tr>

        <!-- Score band -->
        <tr>
          <td style="padding:24px 32px;border-bottom:1px solid #eef1f5;">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="vertical-align:middle;">
                  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:4px;">OGI Score</div>
                  <div style="font-size:34px;font-weight:800;color:${scoreColour};line-height:1;">${score}<span style="font-size:16px;color:#94a3b8;font-weight:400;">/100</span></div>
                </td>
                <td align="right" style="vertical-align:middle;">
                  <span style="display:inline-block;padding:6px 14px;border-radius:999px;background:${scoreColour}15;color:${scoreColour};font-size:12px;font-weight:700;letter-spacing:0.04em;">${escapeHtml(band)}</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Contact details -->
        <tr>
          <td style="padding:20px 32px;border-bottom:1px solid #eef1f5;">
            <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:10px;">Contact</div>
            <table cellpadding="0" cellspacing="0" style="font-size:13px;color:#0f172a;line-height:1.7;">
              <tr><td style="color:#64748b;padding-right:12px;width:80px;">Phone:</td><td>${escapeHtml(contact)}</td></tr>
              <tr><td style="color:#64748b;padding-right:12px;">Email:</td><td>${email ? escapeHtml(email) : '<span style="color:#94a3b8;">Not provided</span>'}</td></tr>
            </table>
          </td>
        </tr>

        <!-- Answers table -->
        <tr>
          <td style="padding:20px 32px 8px;">
            <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:10px;">Full Assessment Responses</div>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              <thead>
                <tr>
                  <th align="left" style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">#</th>
                  <th align="left" style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">Question</th>
                  <th align="center" style="padding:8px 12px;background:#f8fafc;border-bottom:1px solid #e2e8f0;font-size:10px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;font-weight:700;">Response</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;">
            <p style="font-size:11px;color:#94a3b8;margin:0;line-height:1.6;">This submission was recorded automatically from the AVYSTRA website OGI diagnostic. Reply to this email or contact the lead directly to follow up.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Build the user's result email — concise, branded. */
function buildUserEmailHtml(data: {
  name: string;
  score: number;
  band: string;
}): string {
  const { name, score, band } = data;
  const scoreColour =
    score >= 82 ? "#10B981" : score >= 66 ? "#3B82F6" : score >= 45 ? "#F59E0B" : "#EF4444";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">

        <!-- Header -->
        <tr>
          <td style="background:#0B1B2E;padding:32px;text-align:center;">
            <div style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#B8924E;font-weight:700;margin-bottom:8px;">AVYSTRA Consulting</div>
            <div style="font-size:20px;font-weight:600;color:#ffffff;letter-spacing:-0.01em;">Your OGI Result</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="font-size:15px;color:#0f172a;margin:0 0 24px;line-height:1.6;">Hi ${escapeHtml(name)},</p>
            <p style="font-size:14px;color:#475569;margin:0 0 28px;line-height:1.7;">Thank you for completing the Organizational Growth Index assessment. Here is your result:</p>

            <!-- Score block -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:10px;border:1px solid #eef1f5;margin-bottom:28px;">
              <tr>
                <td style="padding:24px;text-align:center;">
                  <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:600;margin-bottom:6px;">Your OGI Score</div>
                  <div style="font-size:44px;font-weight:800;color:${scoreColour};line-height:1;margin-bottom:10px;">${score}<span style="font-size:18px;color:#94a3b8;font-weight:400;">/100</span></div>
                  <span style="display:inline-block;padding:6px 16px;border-radius:999px;background:${scoreColour}15;color:${scoreColour};font-size:12px;font-weight:700;letter-spacing:0.04em;">${escapeHtml(band)}</span>
                </td>
              </tr>
            </table>

            <p style="font-size:14px;color:#475569;margin:0 0 12px;line-height:1.7;">A member of the AVYSTRA team will follow up with you shortly to walk through what these results mean for your organization and discuss potential next steps.</p>
            <p style="font-size:14px;color:#475569;margin:0 0 32px;line-height:1.7;">In the meantime, if you have any questions, simply reply to this email or reach us at <a href="mailto:info@avystra.co.in" style="color:#B8924E;text-decoration:none;">info@avystra.co.in</a>.</p>

            <p style="font-size:14px;color:#0f172a;margin:0;line-height:1.6;">Warm regards,<br><strong style="font-weight:600;">The AVYSTRA Team</strong></p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #eef1f5;">
            <p style="font-size:11px;color:#94a3b8;margin:0;text-align:center;line-height:1.6;">AVYSTRA Consulting Pvt. Ltd. — info@avystra.co.in — +91 85960 59607</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Minimal HTML escaper to prevent injection in email bodies. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Route handler ──────────────────────────────────────────────────────────
export async function POST(request: Request) {
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

  // 1. Persist to database (this is the source of truth — always succeeds
  //    unless the DB is down, in which case we return 500).
  let submission;
  try {
    submission = await db.ogiSubmission.create({
      data: {
        name: data.name,
        role: data.role,
        contact: data.contact,
        email: data.email ?? null,
        score: data.score,
        band: data.band,
        answersJson: JSON.stringify(data.answers),
      },
    });
  } catch (err) {
    console.error("[ogi/submit] DB insert failed:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save submission" },
      { status: 500 }
    );
  }

  // 2. Send emails via Resend. Each send is independently handled so a
  //    failure in one doesn't block the other. If RESEND_API_KEY is not
  //    configured, we skip both and return emailSent: false — the DB record
  //    is still saved, which is the user's primary requirement.
  //
  //    NOTE: The Resend SDK resolves (does not throw) on API-level errors
  //    like 403/422. It returns { data, error } — we must check `.error`
  //    explicitly, not just rely on try/catch (which only catches network
  //    errors).
  let emailSent = false;

  if (resend) {
    // Email #1 → AVYSTRA (full data)
    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: AVYSTRA_NOTIFY_EMAIL,
        subject: `New OGI Submission — ${data.name} (${data.role})`,
        html: buildAvystraEmailHtml(data),
      });
      if (result.error) {
        console.error(
          "[ogi/submit] AVYSTRA notification email rejected by Resend:",
          result.error
        );
      }
    } catch (err) {
      console.error("[ogi/submit] AVYSTRA notification email failed:", err);
    }

    // Email #2 → User (result summary), only if a valid email was provided
    if (data.email) {
      try {
        const result = await resend.emails.send({
          from: FROM_EMAIL,
          to: data.email,
          subject: "Your AVYSTRA OGI Result",
          html: buildUserEmailHtml({
            name: data.name,
            score: data.score,
            band: data.band,
          }),
        });
        if (result.error) {
          console.error(
            "[ogi/submit] User result email rejected by Resend:",
            result.error
          );
        } else {
          emailSent = true;
        }
      } catch (err) {
        console.error("[ogi/submit] User result email failed:", err);
      }
    }
  } else {
    console.warn("[ogi/submit] RESEND_API_KEY not set — skipping email sends");
  }

  return NextResponse.json({
    success: true,
    submissionId: submission.id,
    emailSent,
  });
}
