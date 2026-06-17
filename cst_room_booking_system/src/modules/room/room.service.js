// src/modules/room/room.service.js
import { roomRepository } from "./room.repository";
import { prisma } from "../../app/lib/prisma";
import { sendBookingEmail } from "../../app/lib/mail";
import { cache } from "../../app/lib/cache";

// ── Helpers ───────────────────────────────────────────────────────────────────

function deriveStatus(room) {
  if (room.status === "disabled") return "disabled";
  const occupied = room.bookings?.length ?? 0;
  if (occupied === 0) return "empty";
  if (occupied >= room.capacity) return "full";
  return "partial";
}

function formatRoom(room) {
  const occupants = (room.bookings ?? []).map((b) => ({
    bookingId: b.id,
    studentNumber: b.user?.studentNumber ?? b.studentNumber,
    name: b.user?.name ?? "Unknown",
    phoneNumber: b.user?.phoneNumber ?? "",
  }));

  return {
    id: room.id,
    room: room.roomNumber,
    floor: room.floor,
    hostelId: room.hostel_id,
    status: deriveStatus(room),
    capacity: room.capacity,
    occupants,
    year: room.year,
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const roomService = {
  // ── GET rooms ─────────────────────────────────────────────────────────────
  async getRoomsByHostel(hostelId, floor) {
    if (!hostelId) throw { status: 400, message: "hostelId is required" };
    
    const cacheKey = `rooms:${hostelId}:${floor !== undefined && floor !== null ? floor : "all"}`;
    const cached = cache.get(cacheKey);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const rooms = await roomRepository.findAllByHostel(hostelId, floor);
    const formatted = rooms.map(formatRoom);
    
    cache.set(cacheKey, formatted, 300); // 5 minutes TTL
    return formatted;
  },

  // ── DISABLE rooms ─────────────────────────────────────────────────────────
  async disableRooms(roomIds, reason) {
    if (!roomIds?.length) throw { status: 400, message: "No rooms selected" };

    const rooms = await roomRepository.findManyByIds(roomIds);

    const alreadyDisabled = rooms
      .filter((r) => r.status === "disabled")
      .map((r) => r.roomNumber);

    const occupied = rooms
      .filter((r) => r.status !== "disabled" && (r.bookings?.length ?? 0) > 0)
      .map((r) => r.roomNumber);

    if (alreadyDisabled.length || occupied.length) {
      const parts = [];
      if (occupied.length) parts.push(`Occupied: ${occupied.join(", ")}`);
      if (alreadyDisabled.length)
        parts.push(`Already disabled: ${alreadyDisabled.join(", ")}`);
      throw { status: 400, message: parts.join(" | ") };
    }

    await roomRepository.bulkUpdateStatus(roomIds, "disabled");

    // Invalidate caches ONLY on success
    cache.delPattern("rooms:*");
    cache.del("stats:dashboard");
    cache.del("reports:admin");

    return { disabled: roomIds.length, reason: reason ?? "" };
  },

  // ── ENABLE rooms ──────────────────────────────────────────────────────────
  async enableRooms(roomIds) {
    if (!roomIds?.length) throw { status: 400, message: "No rooms selected" };
    await roomRepository.bulkUpdateStatus(roomIds, "available");

    // Invalidate caches ONLY on success
    cache.delPattern("rooms:*");
    cache.del("stats:dashboard");
    cache.del("reports:admin");

    return { enabled: roomIds.length };
  },

  // ── EDIT rooms ────────────────────────────────────────────────────────────
  async editRooms(roomIds, { capacity, year }) {
    if (!roomIds?.length) throw { status: 400, message: "No rooms selected" };

    if (capacity === undefined && year === undefined) {
      throw { status: 400, message: "Nothing to update" };
    }

    const data = {};

    if (capacity !== undefined) {
      const cap = parseInt(capacity, 10);
      if (isNaN(cap) || cap < 1) {
        throw { status: 400, message: "Capacity must be at least 1" };
      }
      data.capacity = cap;
    }

    if (year !== undefined) {
      const yr = parseInt(year, 10);
      if (isNaN(yr) || yr < 1) {
        throw { status: 400, message: "Year must be a positive number" };
      }
      data.year = yr;
    }

    await prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data,
    });

    // Invalidate caches ONLY on success
    cache.delPattern("rooms:*");
    cache.del("stats:dashboard");
    cache.del("reports:admin");

    return { updated: roomIds.length };
  },

  // ── ALLOCATE students (WITH EMAIL) ────────────────────────────────────────
  async allocateStudents(roomId, studentNumbers, checkIn, checkOut) {
    if (!roomId) throw { status: 400, message: "roomId is required" };
    if (!studentNumbers?.length)
      throw { status: 400, message: "No students provided" };

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { hostel: true, bookings: true },
    });

    if (!room) throw { status: 404, message: "Room not found" };
    if (room.status === "disabled")
      throw { status: 400, message: "Room is disabled" };

    const availableBeds = room.capacity - (room.bookings?.length ?? 0);
    if (studentNumbers.length > availableBeds) {
      throw {
        status: 400,
        message: `Only ${availableBeds} bed(s) available in this room`,
      };
    }

    const users = await prisma.user.findMany({
      where: { studentNumber: { in: studentNumbers } },
    });

    if (users.length !== studentNumbers.length) {
      const found = users.map((u) => u.studentNumber);
      const missing = studentNumbers.filter((s) => !found.includes(s));
      throw {
        status: 404,
        message: `Students not found: ${missing.join(", ")}`,
      };
    }

    const checkInDate = checkIn ? new Date(checkIn) : new Date();
    const checkOutDate = checkOut
      ? new Date(checkOut)
      : new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );

    const existing = await prisma.booking.findMany({
      where: {
        roomId,
        studentNumber: { in: studentNumbers },
        checkIn: { lt: checkOutDate },
        checkOut: { gt: checkInDate },
      },
    });

    if (existing.length) {
      const dupes = existing.map((b) => b.studentNumber);
      throw {
        status: 409,
        message: `Already booked in this room: ${dupes.join(", ")}`,
      };
    }

    // ── CREATE BOOKINGS ─────────────────────────────────────────────────────
    const bookings = await prisma.$transaction(
      studentNumbers.map((sn) =>
        prisma.booking.create({
          data: {
            studentNumber: sn,
            roomId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
          },
          include: {
            user: {
              select: { name: true, studentNumber: true, email: true },
            },
          },
        })
      )
    );

    // ── SEND EMAILS (NON-BLOCKING SAFE) ─────────────────────────────────────
    await Promise.all(
      bookings.map(async (b) => {
        try {
          if (!b.user?.email) return;

          await sendBookingEmail(b.user.email, {
            roomNumber: room.roomNumber,
            userId: b.user.studentNumber,
            checkIn: b.checkIn.toISOString(),
            hostelName: room.hostel?.hostelName || "N/A",
            floor: String(room.floor ?? "N/A"),
          });
        } catch (err) {
          console.error("Email failed:", b.user?.email, err);
        }
      })
    );

    // Invalidate caches ONLY on successful bookings creation/email handling
    cache.delPattern("rooms:*");
    cache.del("stats:dashboard");
    cache.del("reports:admin");

    // ── RETURN RESPONSE ─────────────────────────────────────────────────────
    return bookings.map((b) => ({
      bookingId: b.id,
      studentNumber: b.studentNumber,
      name: b.user?.name,
      roomId: b.roomId,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
    }));
  },

  // ── DEALLOCATE ────────────────────────────────────────────────────────────
  async deallocateStudents({ bookingIds, roomIds }) {
    if (!bookingIds?.length && !roomIds?.length) {
      throw { status: 400, message: "Provide bookingIds or roomIds" };
    }

    let resultCount = 0;

    if (bookingIds?.length) {
      const result = await prisma.booking.deleteMany({
        where: { id: { in: bookingIds } },
      });
      resultCount = result.count;
    } else {
      const result = await prisma.booking.deleteMany({
        where: {
          roomId: { in: roomIds },
          checkOut: { gt: new Date() },
        },
      });
      resultCount = result.count;
    }

    // Invalidate caches ONLY on success
    cache.delPattern("rooms:*");
    cache.del("stats:dashboard");
    cache.del("reports:admin");

    return { deallocated: resultCount };
  },
};