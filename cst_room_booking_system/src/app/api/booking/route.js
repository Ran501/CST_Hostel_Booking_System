// app/api/booking/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { sendBookingEmail } from "@/app/lib/mail";

export async function POST(req) { 
  try {
    const { roomNumber, userId, email, checkIn, checkOut } = await req.json();

    // 1. Check if user already has a booking
    const existingUserBooking = await prisma.booking.findFirst({
      where: { userPhone: userId },
    });

    if (existingUserBooking) {
      return NextResponse.json(
        { error: "You have already booked a room." },
        { status: 400 }
      );
    }

    // 2. Use a Transaction to handle the room check and booking creation together
    const result = await prisma.$transaction(async (tx) => {
      // Find the room
      const room = await tx.room.findFirst({
        where: { roomNumber: String(roomNumber) },
      });

      if (!room) {
        throw new Error("ROOM_NOT_FOUND");
      }

      // Check for date overlaps
      const activeBookingsCount = await tx.booking.count({
        where: {
          roomId: room.id,
          AND: [
            { checkIn: { lte: new Date(checkOut) } },
            { checkOut: { gte: new Date(checkIn) } },
          ],
        },
      });

      // Check if room is at full capacity
      if (activeBookingsCount >= room.capacity) {
        throw new Error("ROOM_FULL");
      }

      // Create the booking record
      return await tx.booking.create({
        data: {
          userPhone: userId,
          roomId: room.id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
        },
      });
    });

    // 3. Send Email (Success path)
    try {
      const parts = roomNumber.split('-');
      const hostelName = parts[0];
      const floorNumber = parts[1] ? parts[1][0] : "N/A";

      await sendBookingEmail(email, {
        roomNumber,
        userId,
        checkIn,
        hostelName,
        floor: floorNumber
      });
    } catch (mailError) {
      console.error("Email failed to send:", mailError);
    }

    return NextResponse.json({ success: true, booking: result });

  } catch (error) { // Removed ": any"
    if (error.message === "ROOM_FULL") {
      return NextResponse.json({ error: "Room occupied, try other rooms" }, { status: 409 });
    }
    if (error.message === "ROOM_NOT_FOUND") {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    
    console.error("Booking Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}