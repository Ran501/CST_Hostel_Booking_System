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

    // 1. Fetch all rooms for this floor/building
    // 2. Use 'include' with '_count' to get active bookings per room
    // app/api/rooms/route.ts
const rooms = await prisma.room.findMany({
  where: {
    floor: Number(floor),
    hostel: { 
      is: {
        hostelName: building 
      }
    } // assuming building is the hostel name
  },
  
  include: {
    _count: { select: { bookings: true } },
    hostel: true, // This brings in the forGender from the Hostel table
  },
});


const formattedRooms = rooms.map((room) => ({
  roomNumber: room.roomNumber,
  capacity: room.capacity,
  occupied: room._count.bookings,
  floor: room.floor,
  // Now we get forGender from the hostel relation!
  floorAllocation: room.hostel?.FloorAllocations || "unspecified", 
  status: room.status,
  year: room.year,
  disabledReason: room.disabledReason,
}));


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