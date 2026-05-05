import { prisma } from "../../lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();
    const { roomNumber, studentNumber, checkIn, checkOut } = body;

    if (!roomNumber || !studentNumber || !checkIn || !checkOut) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const room = await prisma.room.findFirst({
      where: { roomNumber: String(roomNumber) },
    });

    if (!room) {
      return Response.json(
        { success: false, error: `Room '${roomNumber}' not found` },
        { status: 404 }
      );
    }

    // Count actual bookings instead of using occupied field
    const occupiedCount = await prisma.booking.count({
      where: { roomId: roomNumber },
    });

    if (occupiedCount >= room.capacity) {
      return Response.json(
        { success: false, error: "Room is fully booked" },
        { status: 409 }
      );
    }

    const existingBooking = await prisma.booking.findFirst({
      where: { studentNumber: String(studentNumber) },
    });

    if (existingBooking) {
      return Response.json(
        { success: false, error: "You already have an active booking" },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        studentNumber: String(studentNumber),
        roomId: room.id,          // no parseInt, keep as-is
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
      },
    });

    return Response.json({ success: true, booking });

  } catch (err) {
    console.error("Booking error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}