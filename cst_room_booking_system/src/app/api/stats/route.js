import { prisma } from "../../lib/prisma";

const STATS_CACHE_TTL_MS = 30_000;
let roomStatsCache = {
  expiresAt: 0,
  data: null,
};

function isActiveRoom(room) {
  const status = String(room.status ?? "").toLowerCase().trim();
  const hostelStatus = String(room.hostel?.status ?? "").toLowerCase().trim();

  return (
    !["false", "disabled", "inactive", "maintenance"].includes(status) &&
    !["false", "inactive", "maintenance"].includes(hostelStatus)
  );
}

async function getRoomStats() {
  const nowMs = Date.now();
  if (roomStatsCache.data && roomStatsCache.expiresAt > nowMs) {
    return roomStatsCache.data;
  }

  const now = new Date();
  const rooms = await prisma.room.findMany({
    select: {
      id: true,
      capacity: true,
      status: true,
      hostel: {
        select: {
          status: true,
        },
      },
    },
  });

  const activeRooms = rooms.filter(isActiveRoom);
  const activeRoomIds = activeRooms.map((room) => room.id);

  const occupiedGroups = activeRoomIds.length
    ? await prisma.booking.groupBy({
        by: ["roomId"],
        where: {
          roomId: { in: activeRoomIds },
          checkOut: { gte: now },
        },
        _count: {
          _all: true,
        },
      })
    : [];

  const occupiedByRoom = new Map(
    occupiedGroups.map((group) => [group.roomId, group._count._all]),
  );

  const totalRooms = activeRooms.length;
  const fullyBookedRooms = activeRooms.filter((room) => {
    const capacity = Number(room.capacity) || 0;
    const occupied = occupiedByRoom.get(room.id) || 0;
    return capacity > 0 && occupied >= capacity;
  }).length;
  const availableRooms = activeRooms.filter((room) => {
    const capacity = Number(room.capacity) || 0;
    const occupied = occupiedByRoom.get(room.id) || 0;
    return capacity > 0 && occupied < capacity;
  }).length;

  const data = {
    totalRooms,
    totalAvailableRooms: availableRooms,
    bookedRooms: fullyBookedRooms,
    occupancyRate: totalRooms > 0 ? Math.round((fullyBookedRooms / totalRooms) * 100) : 0,
  };

  roomStatsCache = {
    data,
    expiresAt: nowMs + STATS_CACHE_TTL_MS,
  };

  return data;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentNumber = searchParams.get("studentNumber");
    const roomStats = await getRoomStats();

    // If student number provided, check user's booked room
    let bookedRoom = "None";
    if (studentNumber) {
      try {
        const activeBooking = await prisma.booking.findFirst({
          where: {
            studentNumber: String(studentNumber),
            checkOut: { gte: new Date() },
          },
          include: {
            room: {
              select: {
                roomNumber: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (activeBooking?.room) {
          bookedRoom = activeBooking.room.roomNumber;
        }
      } catch (e) {
        console.error("Error finding user booking:", e);
      }
    }

    return Response.json({
      success: true,
      stats: {
        totalAvailableRooms: roomStats.totalAvailableRooms,
        bookedRoom: bookedRoom,
        occupancyRate: roomStats.occupancyRate,
        totalRooms: roomStats.totalRooms,
        bookedRooms: roomStats.bookedRooms,
      },
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return Response.json(
      {
        success: false,
        error: "Failed to fetch stats",
        stats: {
          totalAvailableRooms: 0,
          bookedRoom: "None",
          occupancyRate: 0,
        },
      },
      { status: 200 }
    );
  }
}
