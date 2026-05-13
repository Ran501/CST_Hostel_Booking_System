// src/modules/room/room.repository.js
import { prisma } from "../../app/lib/prisma";

export const roomRepository = {

  // ── All rooms for a hostel, optionally filtered by floor ──────────────────
  async findAllByHostel(hostelId, floor) {
    return prisma.room.findMany({
      where: {
        hostel_id: hostelId,
        ...(floor !== undefined && floor !== null
          ? { floor: parseInt(floor, 10) }
          : {}),
      },
      include: {
        bookings: {
          // Only active bookings (not yet checked out)
          where: { checkOut: { gt: new Date() } },
          include: {
            user: {
              select: {
                name:          true,
                studentNumber: true,
                phoneNumber:   true,
              },
            },
          },
        },
      },
      orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
    });
  },

  // ── Single room by id ─────────────────────────────────────────────────────
  async findById(roomId) {
    return prisma.room.findUnique({
      where: { id: roomId },
      include: {
        bookings: {
          where: { checkOut: { gt: new Date() } },
          include: {
            user: {
              select: {
                name:          true,
                studentNumber: true,
                phoneNumber:   true,
              },
            },
          },
        },
        hostel: true,
      },
    });
  },

  // ── Update a single room ──────────────────────────────────────────────────
  async update(roomId, data) {
    return prisma.room.update({ where: { id: roomId }, data });
  },

  // ── Bulk update status ────────────────────────────────────────────────────
  async bulkUpdateStatus(roomIds, status) {
    return prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data:  { status },
    });
  },

  // ── Bulk update capacity ──────────────────────────────────────────────────
  async bulkUpdateCapacity(roomIds, capacity) {
    return prisma.room.updateMany({
      where: { id: { in: roomIds } },
      data:  { capacity: parseInt(capacity, 10) },
    });
  },

  // ── Find many rooms by ids ────────────────────────────────────────────────
  async findManyByIds(roomIds) {
    return prisma.room.findMany({
      where: { id: { in: roomIds } },
      include: {
        bookings: {
          where: { checkOut: { gt: new Date() } },
          include: {
            user: {
              select: {
                name:          true,
                studentNumber: true,
                phoneNumber:   true,
              },
            },
          },
        },
      },
    });
  },
};