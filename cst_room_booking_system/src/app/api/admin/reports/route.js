// src/app/api/admin/reports/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import { getAdminReportData } from "../../../../modules/report/report.service";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports
//
// Returns all data needed for the admin dashboard reports section:
// {
//   students: { total, active, inactive, male, female, byYear }
//   hostels:  [ { id, hostelName, gender, status, capacity, roomCount,
//                 occupiedBeds, availableBeds, occupancyPct,
//                 floors: [ { floor, studentYear, roomCount, capacity, occupiedBeds } ] } ]
//   yearBreakdown: [ { year, totalStudents, residing, notResiding,
//                      hostels: [ { hostelName, count } ] } ]
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const { cached, ...data } = await getAdminReportData();

    return NextResponse.json(
      { success: true, data },
      cached
        ? { headers: { "X-Cache": "HIT" } }
        : { headers: { "X-Cache": "MISS" } }
    );
  } catch (err) {
    console.error("[GET /api/admin/reports]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load reports" },
      { status: 500 }
    );
  }
}