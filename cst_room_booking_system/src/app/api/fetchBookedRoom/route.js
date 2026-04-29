import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");

    // If no phone is provided, return early
    if (!phone) {
      return NextResponse.json({ roomNumber: "No Phone" });
    }

    // Look for the booking and include the related Room data
    const booking = await prisma.booking.findFirst({
      where: { userPhone: phone },
      include: { room: true },
    });

    // Use optional chaining (?.) to safely access the room number
    // If booking or room is null, it defaults to "No Booking"
    return NextResponse.json({ 
      roomNumber: booking?.room?.roomNumber || "No Booking" 
    });
    
  } catch (error) {
    console.error("Fetch Room Error:", error);
    return NextResponse.json({ roomNumber: "Error" }, { status: 500 });
  }
}