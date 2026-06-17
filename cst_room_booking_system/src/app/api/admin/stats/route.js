// src/app/api/admin/stats/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import { prisma } from "../../../../app/lib/prisma";
import { statsService } from "../../../../modules/stats/stats.service";
import { cache } from "../../../../app/lib/cache";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const data = await statsService.getDashboardStats();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load statistics" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/admin/stats
//
// Body: { isActive: boolean }
//
// Behaviour:
//   • If isActive = true  → disable ALL existing periods first, then enable
//     the most recent one (or create a new one for the current year).
//   • If isActive = false → disable ALL existing periods.
//
// Returns the updated BookingPeriod row.
// ─────────────────────────────────────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const body = await request.json();

    if (typeof body?.isActive !== "boolean") {
      return NextResponse.json(
        { success: false, message: "isActive (boolean) is required in the request body" },
        { status: 400 }
      );
    }

    const { isActive } = body;
    const now = new Date();

    let updatedPeriod;

    if (isActive) {
      // ── Opening bookings ──────────────────────────────────────────────────
      // 1. Deactivate every existing period (enforce single-active invariant)
      await prisma.bookingPeriod.updateMany({
        where: { isActive: true },
        data:  { isActive: false },
      });

      // 2. Find the most recent period to re-activate, or create a new one
      const existing = await prisma.bookingPeriod.findFirst({
        orderBy: { startDate: "desc" },
      });

      if (existing) {
        updatedPeriod = await prisma.bookingPeriod.update({
          where: { id: existing.id },
          data: {
            isActive:  true,
            startDate: now,
            // Extend endDate to 6 months from now if it has already passed
            endDate: existing.endDate < now
              ? new Date(now.getFullYear(), now.getMonth() + 6, now.getDate())
              : existing.endDate,
          },
        });
      } else {
        // No rows at all — bootstrap one
        updatedPeriod = await prisma.bookingPeriod.create({
          data: {
            isActive:  true,
            startDate: now,
            endDate:   new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()),
            year:      now.getFullYear(),
          },
        });
      }
    } else {
      // ── Closing bookings ──────────────────────────────────────────────────
      // Deactivate all active periods and return the one we just closed
      await prisma.bookingPeriod.updateMany({
        where: { isActive: true },
        data:  { isActive: false },
      });

      // Return the most recent period (now inactive) for UI feedback
      updatedPeriod = await prisma.bookingPeriod.findFirst({
        orderBy: { startDate: "desc" },
      });

      // Edge case: table was empty, nothing to close
      if (!updatedPeriod) {
        updatedPeriod = { isActive: false, startDate: null, endDate: null, year: now.getFullYear() };
      }
    }

    // Invalidate dashboard stats cache on successful update
    cache.del("stats:dashboard");

    return NextResponse.json({
      success: true,
      data: updatedPeriod,
    });
  } catch (err) {
    console.error("[PATCH /api/admin/stats]", err);
    return NextResponse.json(
      { success: false, message: "Failed to update booking period" },
      { status: 500 }
    );
  }
}