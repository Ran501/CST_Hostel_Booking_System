import { prisma } from "../../lib/prisma";
import { sendBookingEmail } from "../../lib/mail";

function isBookableRoom(room) {
  const roomStatus = String(room.status ?? "").toLowerCase().trim();
  const hostelStatus = String(room.hostel?.status ?? "").toLowerCase().trim();

  return (
    !["false", "disabled", "inactive", "maintenance"].includes(roomStatus) &&
    !["false", "inactive", "maintenance"].includes(hostelStatus)
  );
}

function bookingResponse(body, status = 200) {
  return { body, status };
}

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

    const result = await prisma.$transaction(async (tx) => {
      const room = await tx.room.findFirst({
        where: { roomNumber: String(roomNumber) },
        include: { hostel: true },
      });

      if (!room) {
        return bookingResponse(
          { success: false, error: `Room '${roomNumber}' not found` },
          404,
        );
      }

      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`room:${room.id}`}))`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`student:${studentNumber}`}))`;

      const lockedRoom = await tx.room.findFirst({
        where: { id: room.id },
        include: { hostel: true },
      });

      if (!lockedRoom || !isBookableRoom(lockedRoom)) {
        return bookingResponse(
          { success: false, error: "Room is not available for booking" },
          409,
        );
      }

      const user = await tx.user.findUnique({
        where: { studentNumber: String(studentNumber) },
      });

      if (!user) {
        return bookingResponse(
          { success: false, error: "Student not found" },
          404,
        );
      }

      const floorAllocation = await tx.floorAllocation.findUnique({
        where: {
          hostelId_floor: {
            hostelId: lockedRoom.hostel_id,
            floor: lockedRoom.floor,
          },
        },
      });

      if (floorAllocation && floorAllocation.studentYear !== user.year) {
        return bookingResponse(
          {
            success: false,
            error: `This floor is reserved for Year ${floorAllocation.studentYear} students`,
          },
          403,
        );
      }

      const roomGender = String(lockedRoom.hostel?.gender ?? "").toLowerCase().trim();
      const userGender = String(user.gender ?? "").toLowerCase().trim();

      if (roomGender && roomGender !== "any" && userGender && roomGender !== userGender) {
        return bookingResponse(
          { success: false, error: `This hostel is for ${lockedRoom.hostel.gender} students only` },
          403,
        );
      }

      const now = new Date();
      const occupiedCount = await tx.booking.count({
        where: {
          roomId: lockedRoom.id,
          checkOut: { gte: now },
        },
      });

      if (occupiedCount >= lockedRoom.capacity) {
        return bookingResponse(
          { success: false, error: "Room is fully booked" },
          409,
        );
      }

      const existingBooking = await tx.booking.findFirst({
        where: { studentNumber: String(studentNumber) },
      });

      if (existingBooking) {
        return bookingResponse(
          { success: false, error: "You have already booked a room. Only one room per person is allowed" },
          409,
        );
      }

      const booking = await tx.booking.create({
        data: {
          studentNumber: String(studentNumber),
          roomId: lockedRoom.id,
          checkIn: new Date(checkIn),
          checkOut: new Date(checkOut),
        },
      });

      return bookingResponse({
        success: true,
        booking,
        email: user.email,
        emailDetails: {
          roomNumber: lockedRoom.roomNumber,
          userId: user.studentNumber,
          checkIn,
          hostelName: lockedRoom.hostel?.hostelName ?? "",
          floor: String(lockedRoom.floor),
        },
      });
    });

    if (result.body.success && result.body.email) {
      try {
        await sendBookingEmail(result.body.email, result.body.emailDetails);
      } catch (emailError) {
        console.error("Booking confirmation email error:", emailError);
        return Response.json(
          {
            success: true,
            booking: result.body.booking,
            warning: "Room booked successfully, but confirmation email could not be sent.",
          },
          { status: result.status },
        );
      }
    }

    const { email, emailDetails, ...responseBody } = result.body;
    return Response.json(responseBody, { status: result.status });

  } catch (err) {
    console.error("Booking error:", err);
    return Response.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
