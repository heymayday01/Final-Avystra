/**
 * Shared OGI (Organizational Growth Index) data + scoring logic.
 *
 * Imported by:
 *  - src/components/avystra/OGIDiagnostic.tsx (client — renders questions & results)
 *  - src/app/api/ogi/submit/route.ts         (server — persists + emails)
 *
 * Keeping the question bank and score formula here guarantees the score the
 * user sees on screen is identical to the score stored in the database.
 */

export type DimensionCode = "L" | "M" | "T" | "E";

export interface Question {
  id: number;
  text: string;
  dimensionCode: DimensionCode;
  dimensionName: string;
  color: string;
}

export const questions: Question[] = [
  // DIMENSION 1 — Leadership & Direction (code: L, color: navy #2C3947)
  {
    id: 1,
    dimensionCode: "L",
    dimensionName: "Leadership & Direction",
    color: "#2C3947",
    text: "When leadership sets a new priority — does it change how teams actually work on the ground?",
  },
  {
    id: 2,
    dimensionCode: "L",
    dimensionName: "Leadership & Direction",
    color: "#2C3947",
    text: "Are important decisions made at the right level — without coming back to the founder every time?",
  },
  {
    id: 3,
    dimensionCode: "L",
    dimensionName: "Leadership & Direction",
    color: "#2C3947",
    text: "Does your organization consistently recognize and reward high performers — regardless of who they are close to?",
  },
  {
    id: 4,
    dimensionCode: "L",
    dimensionName: "Leadership & Direction",
    color: "#2C3947",
    text: "Does your organization run smoothly — even when the founder is not directly involved in day-to-day decisions?",
  },
  // DIMENSION 2 — Manager Effectiveness (code: M, color: gold #C2A56D)
  {
    id: 5,
    dimensionCode: "M",
    dimensionName: "Manager Effectiveness",
    color: "#C2A56D",
    text: "When a manager gives feedback to a team member — does it lead to visible, lasting change?",
  },
  {
    id: 6,
    dimensionCode: "M",
    dimensionName: "Manager Effectiveness",
    color: "#C2A56D",
    text: "Are promotions and salary decisions based on measurable performance — rather than personal relationships?",
  },
  {
    id: 7,
    dimensionCode: "M",
    dimensionName: "Manager Effectiveness",
    color: "#C2A56D",
    text: "When someone underperforms consistently — does a manager address it directly and quickly?",
  },
  {
    id: 8,
    dimensionCode: "M",
    dimensionName: "Manager Effectiveness",
    color: "#C2A56D",
    text: "Do employees in your organization feel safe raising concerns about their manager?",
  },
  // DIMENSION 3 — Team Accountability (code: T, color: blue #547A95)
  {
    id: 9,
    dimensionCode: "T",
    dimensionName: "Team Accountability",
    color: "#547A95",
    text: "After a meeting where tasks are agreed — are they actually completed two weeks later?",
  },
  {
    id: 10,
    dimensionCode: "T",
    dimensionName: "Team Accountability",
    color: "#547A95",
    text: "When something goes wrong — does your organization clearly identify who was responsible?",
  },
  {
    id: 11,
    dimensionCode: "T",
    dimensionName: "Team Accountability",
    color: "#547A95",
    text: "Are the same rules and standards applied to everyone — regardless of seniority or relationships?",
  },
  {
    id: 12,
    dimensionCode: "T",
    dimensionName: "Team Accountability",
    color: "#547A95",
    text: "When two departments need to collaborate — does it happen smoothly and without friction?",
  },
  // DIMENSION 4 — Execution Systems (code: E, color: green #10B981)
  {
    id: 13,
    dimensionCode: "E",
    dimensionName: "Execution Systems",
    color: "#10B981",
    text: "By mid-year — is your annual plan still being actively tracked and acted upon?",
  },
  {
    id: 14,
    dimensionCode: "E",
    dimensionName: "Execution Systems",
    color: "#10B981",
    text: "When a new process is introduced — is it still being followed three months later?",
  },
  {
    id: 15,
    dimensionCode: "E",
    dimensionName: "Execution Systems",
    color: "#10B981",
    text: "Does the most deserving person get ahead — rather than the most visible or politically connected?",
  },
  {
    id: 16,
    dimensionCode: "E",
    dimensionName: "Execution Systems",
    color: "#10B981",
    text: "When your organization faces pressure or tight deadlines — does the team stay focused and perform well?",
  },
];

export const answerOptions = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Usually", value: 3 },
  { label: "Always", value: 4 },
];

/** Map a raw answer value (0–4) to its human label. Defaults to "Sometimes". */
export function answerLabel(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return answerOptions.find((o) => o.value === value)?.label ?? "—";
}

export interface ResultBand {
  badge: string;
  colour: string;
  headline: string;
  description: string;
}

/** Return the band metadata for a given 0–100 OGI score. */
export function getResultBand(score: number): ResultBand {
  if (score >= 82) {
    return {
      badge: "High Growth Ready",
      colour: "#10B981",
      headline: "Strong Foundations. Specific Gaps To Close.",
      description:
        "Your organization runs on strong strategic clarity, empowered managers, high accountability, and robust execution systems. Ready for heavy structural scaling with minimal friction.",
    };
  } else if (score >= 66) {
    return {
      badge: "Growth Ready",
      colour: "#3B82F6",
      headline: "Good Intent. Execution Consistency Is The Gap.",
      description:
        "Core systems and strategies are mostly aligned, but execution remains variable or dependent on specific key players. Scaling is feasible but will create strain without standardizing manager authority.",
    };
  } else if (score >= 45) {
    return {
      badge: "Execution Gap",
      colour: "#F59E0B",
      headline: "Clear Gaps That Are Costing You Every Day.",
      description:
        "Communication blocks and department silos are slowing execution. Action depends heavily on crisis control, pressure, or key managers tracking things manually. Accountability is tribal rather than systematic.",
    };
  } else {
    return {
      badge: "Immediate Attention",
      colour: "#EF4444",
      headline: "Significant Gaps Across Multiple Dimensions.",
      description:
        "Extreme key-person dependency. Decisions must route through the founder to stay active. Underperformance lags, accountability loops are weak, and long-term plans are lost under reactive fire-fighting.",
    };
  }
}

/**
 * Compute the OGI score (0–100) and band from a raw answers map.
 *
 * Formula (mirrors the inline computation in OGIDiagnostic.tsx so the
 * number the user sees == the number stored in the DB):
 *   - For each pillar, average its 4 question scores (each 0–4).
 *   - overallScorePct = round( (sumOf4Averages / 4) / 4 * 100 )
 *                     = round( (sumOf4Averages / 16) * 100 )
 *   - Unanswered questions default to 2 ("Sometimes").
 */
export function computeOgiScore(
  answers: Record<number, number>
): { score: number; band: ResultBand } {
  const pillars: DimensionCode[] = ["L", "M", "T", "E"];
  const averages = pillars.map((code) => {
    const qIds = questions
      .filter((q) => q.dimensionCode === code)
      .map((q) => q.id);
    const sum = qIds.reduce((acc, id) => acc + (answers[id] ?? 2), 0);
    return sum / 4;
  });
  const sumOfAverages = averages.reduce((acc, avg) => acc + avg, 0);
  const score = Math.round(((sumOfAverages / 4) / 4) * 100);
  const band = getResultBand(score);
  return { score, band };
}

/** Dimension display metadata, for email tables. */
export const dimensionLabels: Record<DimensionCode, string> = {
  L: "Leadership & Direction",
  M: "Manager Effectiveness",
  T: "Team Accountability",
  E: "Execution Systems",
};
