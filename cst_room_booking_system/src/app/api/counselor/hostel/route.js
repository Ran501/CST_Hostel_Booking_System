import { prisma } from "../../../lib/prisma";

// GET /api/counselor/hostel?hostelId=xxx
// Returns hostel details, all rooms (by floor), and active student bookings.
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get("hostelId");

    if (!hostelId) {
      return Response.json({ error: "hostelId is required" }, { status: 400 });
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      include: {
        rooms: {
          orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
        },
      },
    });

    if (!hostel) {
      return Response.json({ error: "Hostel not found" }, { status: 404 });
    }

    const bookings = await prisma.booking.findMany({
      where: {
        room: { hostel_id: hostelId },
        checkOut: { gte: new Date() },
      },
      include: {
        room: { select: { roomNumber: true, floor: true } },
        user: {
          select: {
            name: true,
            studentNumber: true,
            department: true,
            year: true,
            gender: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ hostel, bookings });
  } catch (err) {
    console.error("[GET /api/counselor/hostel]", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
