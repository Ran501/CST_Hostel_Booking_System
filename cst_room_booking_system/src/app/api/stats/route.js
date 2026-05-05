import { prisma } from "../../lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentNumber = searchParams.get("studentNumber");

    // Get total rooms count
    let totalRooms = 0;
    try {
      totalRooms = await prisma.room.count();
    } catch (e) {
      console.error("Error counting rooms:", e);
    }

    // Get available rooms count
    let availableRooms = 0;
    try {
      availableRooms = await prisma.room.count({
        where: { status: "available" },
      });
    } catch (e) {
      console.error("Error counting available rooms:", e);
    }

    // Get booked rooms count
    let bookedRooms = 0;
    try {
      bookedRooms = await prisma.room.count({
        where: { status: "booked" },
      });
    } catch (e) {
      console.error("Error counting booked rooms:", e);
    }

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0;

    // If student number provided, check user's booked room
    let bookedRoom = "None";
    if (studentNumber) {
      try {
        const activeBooking = await prisma.booking.findFirst({
          where: {
            user: { studentNumber: studentNumber },
            status: "active"
          },
          include: {
            room: true
          },
          orderBy: {
            createdAt: "desc"
          }
        });

        if (activeBooking?.room) {
          bookedRoom = `${activeBooking.room.hostelId} - Room ${activeBooking.room.roomNumber}`;
        }
      } catch (e) {
        console.error("Error finding user booking:", e);
      }
    }

    return Response.json({
      success: true,
      stats: {
        totalAvailableRooms: availableRooms,
        bookedRoom: bookedRoom,
        occupancyRate: occupancyRate,
        totalRooms: totalRooms,
        bookedRooms: bookedRooms,
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
