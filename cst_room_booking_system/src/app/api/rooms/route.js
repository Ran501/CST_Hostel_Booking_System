import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; // Adjust this path to your prisma client

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const floor = searchParams.get("floor");
    const building = searchParams.get("building"); // e.g., "RKA", "NK", "HC"

    if (!floor || !building) {
      return NextResponse.json(
        { success: false, error: "Missing floor or building parameters" },
        { status: 400 }
      );
    }

    const rooms = await prisma.room.findMany({
      where: {
        floor: Number(floor),
        hostel: {
          is: {
            hostelName: building,
          },
        },
      },
      include: {
        hostel: {
          include: {
            floorAllocations: {
              where: { floor: Number(floor) },
              orderBy: { floor: "asc" },
            },
          },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    const occupancyCounts = rooms.length
      ? await prisma.booking.groupBy({
          by: ["roomId"],
          where: {
            roomId: { in: rooms.map((room) => room.id) },
            checkOut: { gte: new Date() },
          },
          _count: {
            _all: true,
          },
        })
      : [];
    const occupiedByRoom = new Map(
      occupancyCounts.map((group) => [group.roomId, group._count._all]),
    );

    const formattedRooms = rooms.map((room) => {
      const status = String(room.status ?? "").toLowerCase().trim();
      const hostelStatus = String(room.hostel?.status ?? "").toLowerCase().trim();
      const isActive =
        !["false", "disabled", "inactive", "maintenance"].includes(status) &&
        !["false", "inactive", "maintenance"].includes(hostelStatus);

      return {
        id: room.id,
        roomNumber: room.roomNumber,
        capacity: room.capacity,
        occupied: occupiedByRoom.get(room.id) || 0,
        floor: room.floor,
        floorAllocation: room.hostel?.floorAllocations?.[0] ?? null,
        allocatedYear: room.hostel?.floorAllocations?.[0]?.studentYear ?? null,
        forGender: room.hostel?.gender ?? "",
        status: room.status,
        isActive,
        year: room.year,
      };
    });


    return NextResponse.json({ success: true, rooms: formattedRooms });
  } catch (error) {
  console.error("DETAILED_PRISMA_ERROR:", error);
  return NextResponse.json(
    { 
      success: false, 
      error: error.message || "Database connection failed",
      code: error.code // Prisma error codes (like P2025)
    },
    { status: 500 }
  );
  }
}
