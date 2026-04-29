import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

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
    // Assuming 'hostel' is a relation in your Prisma schema
    const rooms = await prisma.room.findMany({
      where: {
        floor: Number(floor),
        hostel: { name: building } 
      },
      include: {
        _count: { 
          select: { bookings: true } 
        },
        hostel: true, // Brings in related hostel data (like forGender)
      },
    });

    // 2. Format the data for the frontend
    const formattedRooms = rooms.map((room) => ({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      occupied: room._count.bookings,
      floor: room.floor,
      // Safely access forGender from the related hostel object
      forGender: room.hostel?.forGender || "unspecified", 
      isActive: room.isActive,
      disabledReason: room.disabledReason,
    }));

    return NextResponse.json({ success: true, rooms: formattedRooms });

  } catch (error) {
    console.error("DETAILED_PRISMA_ERROR:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || "Database connection failed",
        code: error.code // Useful for debugging Prisma errors (e.g., P2002)
      }, 
      { status: 500 }
    );
  }
}