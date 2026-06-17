// src/modules/stats/stats.service.js
import { prisma } from "../../app/lib/prisma";
import { cache } from "../../app/lib/cache";

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

export const statsService = {
  async getDashboardStats() {
    const cacheKey = "stats:dashboard";
    const cached = cache.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

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

    const statsData = {
      totalCapacity,
      occupiedBeds,
      availableBeds,
      totalHostels,
      activeHostels,
      maleBookings,
      femaleBookings,
      bookingPeriod,
    };

    cache.set(cacheKey, statsData, 30); // 30 seconds TTL
    return statsData;
  },

  async getReportsData() {
    const cacheKey = "reports:admin";
    const cached = cache.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

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

    const reportsData = {
      students:      studentStats,
      hostels:       hostelSummaries,
      yearBreakdown,
    };

    cache.set(cacheKey, reportsData, 30); // 30 seconds TTL
    return reportsData;
  },
};
