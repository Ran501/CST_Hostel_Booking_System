// src/app/api/admin/stats/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import { prisma } from "../../../../app/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the single "current" BookingPeriod row.
 *
 * Strategy:
 *   1. Prefer the row where isActive = true (there should be at most one).
 *   2. If none is active, fall back to the most recently created row.
 *   3. If the table is empty, return null — the PATCH handler will upsert.
 */
async function getCurrentBookingPeriod() {
  const active = await prisma.bookingPeriod.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });
  if (active) return active;

  return prisma.bookingPeriod.findFirst({
    orderBy: { startDate: "desc" },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
//
// Returns a single aggregated object for the dashboard overview:
// {
//   totalCapacity    — SUM of every room's capacity across all hostels
//   occupiedBeds     — number of currently active bookings (checkOut > now)
//   availableBeds    — totalCapacity - occupiedBeds
//   totalHostels     — total number of hostels in the system
//   activeHostels    — hostels with status = "active"
//   maleBookings     — active bookings where the student is male
//   femaleBookings   — active bookings where the student is female
//   bookingPeriod    — current BookingPeriod row (or null)
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const now = new Date();

    const [
      capacityAgg,    // total bed capacity across all rooms
      occupiedCount,  // active bookings count
      hostelCounts,   // total + active hostels
      genderCounts,   // active bookings split by student gender
      bookingPeriod,  // current booking period status
    ] = await Promise.all([

      // 1. SUM all room capacities
      prisma.room.aggregate({
        _sum: { capacity: true },
      }),

      // 2. Count active bookings (checkOut in the future)
      prisma.booking.count({
        where: { checkOut: { gt: now } },
      }),

      // 3. Count total + active hostels in one query
      prisma.hostel.groupBy({
        by: ["status"],
        _count: { id: true },
      }),

      // 4. Count active bookings grouped by student gender
      prisma.booking.findMany({
        where: { checkOut: { gt: now } },
        select: {
          user: { select: { gender: true } },
        },
      }),

      // 5. Fetch current booking period
      getCurrentBookingPeriod(),
    ]);

    const totalCapacity  = capacityAgg._sum.capacity ?? 0;
    const occupiedBeds   = occupiedCount;
    const availableBeds  = Math.max(0, totalCapacity - occupiedBeds);

    const totalHostels  = hostelCounts.reduce((s, g) => s + g._count.id, 0);
    const activeHostels = hostelCounts.find((g) => g.status === "active")?._count.id ?? 0;

    let maleBookings   = 0;
    let femaleBookings = 0;
    for (const b of genderCounts) {
      const g = b.user?.gender?.toLowerCase();
      if (g === "male")   maleBookings++;
      if (g === "female") femaleBookings++;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCapacity,
        occupiedBeds,
        availableBeds,
        totalHostels,
        activeHostels,
        maleBookings,
        femaleBookings,
        bookingPeriod,  // { id, startDate, endDate, isActive, year } | null
      },
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