// src/app/api/admin/reports/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import {prisma} from "../../../../app/lib/prisma";

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/reports
//
// Returns all data needed for the admin dashboard reports section:
// {
//   students: { total, active, inactive, male, female, byYear }
//   hostels:  [ { id, hostelName, gender, status, capacity, roomCount,
//                 occupiedBeds, availableBeds, occupancyPct,
//                 floors: [ { floor, studentYear, roomCount, capacity, occupiedBeds } ] } ]
//   yearBreakdown: [ { year, total, residing, hostels: [ { hostelName, count } ] } ]
// }
// ─────────────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const now = new Date();

    const [
      allUsers,
      allHostels,
      allRooms,
      activeBookings,
    ] = await Promise.all([
      // 1. All students
      prisma.user.findMany({
        where: { role: { in: ["student", "counselor"] } },
        select: {
          id:           true,
          gender:       true,
          isActive:     true,
          year:         true,
          studentNumber: true,
        },
      }),

      // 2. All hostels with floor allocations
      prisma.hostel.findMany({
        include: {
          floorAllocations: { orderBy: { floor: "asc" } },
        },
        orderBy: { hostelName: "asc" },
      }),

      // 3. All rooms with their hostel
      prisma.room.findMany({
        select: {
          id:        true,
          roomNumber: true,
          floor:     true,
          capacity:  true,
          status:    true,
          hostel_id: true,
          year:      true,
        },
      }),

      // 4. All active bookings with room + user info
      prisma.booking.findMany({
        where: { checkOut: { gt: now } },
        select: {
          id:     true,
          roomId: true,
          user: {
            select: { year: true, gender: true, studentNumber: true },
          },
          room: {
            select: { hostel_id: true, floor: true, capacity: true },
          },
        },
      }),
    ]);

    // ── 1. Student stats ────────────────────────────────────────────────────
    const studentStats = {
      total:    allUsers.length,
      active:   allUsers.filter((u) => u.isActive).length,
      inactive: allUsers.filter((u) => !u.isActive).length,
      male:     allUsers.filter((u) => u.gender?.toLowerCase() === "male").length,
      female:   allUsers.filter((u) => u.gender?.toLowerCase() === "female").length,
      // students per year
      byYear: Object.entries(
        allUsers.reduce((acc, u) => {
          const y = u.year ?? "Unknown";
          acc[y] = (acc[y] ?? 0) + 1;
          return acc;
        }, {})
      )
        .map(([year, count]) => ({ year, count }))
        .sort((a, b) => a.year - b.year),
    };

    // ── 2. Per-hostel summary ────────────────────────────────────────────────
    // Build lookup: roomId → active booking count
    const bookingsByRoom = activeBookings.reduce((acc, b) => {
      acc[b.roomId] = (acc[b.roomId] ?? 0) + 1;
      return acc;
    }, {});

    const hostelSummaries = allHostels.map((hostel) => {
      const hostelRooms = allRooms.filter((r) => r.hostel_id === hostel.id);

      const capacity     = hostelRooms.reduce((s, r) => s + r.capacity, 0);
      const occupiedBeds = hostelRooms.reduce((s, r) => s + (bookingsByRoom[r.id] ?? 0), 0);
      const roomCount    = hostelRooms.length;

      // Floor breakdown — merge floorAllocation metadata with room aggregates
      const floors = hostel.floorAllocations.map((fa) => {
        const floorRooms = hostelRooms.filter((r) => r.floor === fa.floor);
        const floorCap   = floorRooms.reduce((s, r) => s + r.capacity, 0);
        const floorOcc   = floorRooms.reduce((s, r) => s + (bookingsByRoom[r.id] ?? 0), 0);
        return {
          floor:        fa.floor,
          studentYear:  fa.studentYear,
          roomCount:    floorRooms.length,
          capacity:     floorCap,
          occupiedBeds: floorOcc,
          availableBeds: Math.max(0, floorCap - floorOcc),
        };
      });

      return {
        id:            hostel.id,
        hostelName:    hostel.hostelName,
        gender:        hostel.gender,
        status:        hostel.status,
        numberOfFloor: hostel.numberOfFloor,
        roomCount,
        capacity,
        occupiedBeds,
        availableBeds: Math.max(0, capacity - occupiedBeds),
        occupancyPct:  capacity > 0 ? Math.round((occupiedBeds / capacity) * 100) : 0,
        floors,
      };
    });

    // ── 3. Year-wise breakdown: how many students per year are residing ───────
    const residentByYear = activeBookings.reduce((acc, b) => {
      const y = b.user?.year ?? "Unknown";
      if (!acc[y]) acc[y] = { total: 0, byHostel: {} };
      acc[y].total++;
      const hostelId   = b.room?.hostel_id;
      const hostelName = allHostels.find((h) => h.id === hostelId)?.hostelName ?? "Unknown";
      acc[y].byHostel[hostelName] = (acc[y].byHostel[hostelName] ?? 0) + 1;
      return acc;
    }, {});

    const yearBreakdown = studentStats.byYear.map(({ year, count }) => {
      const residing  = residentByYear[year]?.total ?? 0;
      const byHostel  = residentByYear[year]?.byHostel ?? {};
      return {
        year,
        totalStudents: count,
        residing,
        notResiding:   count - residing,
        hostels: Object.entries(byHostel)
          .map(([hostelName, c]) => ({ hostelName, count: c }))
          .sort((a, b) => b.count - a.count),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        students:      studentStats,
        hostels:       hostelSummaries,
        yearBreakdown,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/reports]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load reports" },
      { status: 500 }
    );
  }
}