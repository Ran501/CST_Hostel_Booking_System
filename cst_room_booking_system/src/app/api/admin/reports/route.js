// src/app/api/admin/reports/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import { statsService } from "../../../../modules/stats/stats.service";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const data = await statsService.getReportsData();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[GET /api/admin/reports]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load reports" },
      { status: 500 }
    );
  }
}