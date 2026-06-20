// src/modules/report/report.repository.js
import { prisma } from "../../app/lib/prisma";

export async function getStudentAggregates() {
  const [activeBreakdown, genderBreakdown, yearBreakdown] = await Promise.all([
    prisma.user.groupBy({
      by: ["isActive"],
      where: { role: { in: ["student", "counselor"] } },
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["gender"],
      where: { role: { in: ["student", "counselor"] } },
      _count: { id: true },
    }),
    prisma.user.groupBy({
      by: ["year"],
      where: { role: { in: ["student", "counselor"] } },
      _count: { id: true },
      orderBy: { year: "asc" },
    }),
  ]);
  return { activeBreakdown, genderBreakdown, yearBreakdown };
}

export async function getHostelsWithFloors() {
  return prisma.hostel.findMany({
    include: { floorAllocations: { orderBy: { floor: "asc" } } },
    orderBy: { hostelName: "asc" },
  });
}

export async function getRoomAggregatesByHostel() {
  return prisma.room.groupBy({
    by: ["hostel_id"],
    _sum: { capacity: true },
    _count: { id: true },
  });
}

export async function getRoomAggregatesByHostelAndFloor() {
  return prisma.room.groupBy({
    by: ["hostel_id", "floor"],
    _sum: { capacity: true },
    _count: { id: true },
  });
}

/**
 * Fetch active booking counts per room (checkOut in the future).
 */
export async function getActiveBookingCountsByRoom() {
  return prisma.booking.groupBy({
    by: ["roomId"],
    where: { checkOut: { gt: new Date() } },
    _count: { id: true },
  });
}

/**
 * Fetch active booking rows with minimal fields needed for:
 * - year breakdown (user.year)
 * - occupancy by hostel + floor (room.hostel_id, room.floor)
 */
export async function getActiveBookingsForYearBreakdown() {
  return prisma.booking.findMany({
    where: { checkOut: { gt: new Date() } },
    select: {
      roomId: true,
      user: { select: { year: true } },
      room: { select: { hostel_id: true, floor: true } }, // ← added floor
    },
  });
}