// src/app/api/admin/stats/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import {prisma} from "../../../../app/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/stats
//
// Returns a single aggregated object for the dashboard overview:
// {
//   totalCapacity   — SUM of every room's capacity across all hostels
//   occupiedBeds    — number of currently active bookings (checkOut > now)
//   availableBeds   — totalCapacity - occupiedBeds
//   totalHostels    — total number of hostels in the system
//   activeHostels   — hostels with status = "active"
//   maleBookings    — active bookings where the student is male
//   femaleBookings  — active bookings where the student is female
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const now = new Date();

    const [
      capacityAgg,      // total bed capacity across all rooms
      occupiedCount,    // active bookings count
      hostelCounts,     // total + active hostels
      genderCounts,     // active bookings split by student gender
    ] = await Promise.all([

      // 1. SUM all room capacities (same logic as hostel route)
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
      // Join booking → user to get gender
      prisma.booking.findMany({
        where: { checkOut: { gt: now } },
        select: {
          user: { select: { gender: true } },
        },
      }),
    ]);

    const totalCapacity  = capacityAgg._sum.capacity ?? 0;
    const occupiedBeds   = occupiedCount;
    const availableBeds  = Math.max(0, totalCapacity - occupiedBeds);

    // hostelCounts is [{ status: "active", _count: { id: N } }, ...]
    const totalHostels  = hostelCounts.reduce((s, g) => s + g._count.id, 0);
    const activeHostels = hostelCounts.find((g) => g.status === "active")?._count.id ?? 0;

    // Tally gender from active bookings
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