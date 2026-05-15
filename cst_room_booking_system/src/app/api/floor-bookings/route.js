import { prisma } from "../../lib/prisma";

function normalize(value) {
  return String(value ?? "").toLowerCase().trim();
}

function canViewHostel(requester, hostel) {
  if (normalize(requester.role) === "admin") return true;

  const hostelGender = normalize(hostel.gender);
  const requesterGender = normalize(requester.gender);

  return !hostelGender || hostelGender === "any" || hostelGender === requesterGender;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const building = searchParams.get("building");
    const floor = Number(searchParams.get("floor"));
    const studentNumber = searchParams.get("studentNumber");

    if (!building || !Number.isFinite(floor) || !studentNumber) {
      return Response.json(
        { success: false, error: "Missing building, floor, or student number" },
        { status: 400 },
      );
    }

    const requester = await prisma.user.findUnique({
      where: { studentNumber: String(studentNumber) },
      select: { studentNumber: true, role: true, gender: true },
    });

    if (!requester) {
      return Response.json(
        { success: false, error: "Student not found. Please log in again." },
        { status: 404 },
      );
    }

    const hostel = await prisma.hostel.findFirst({
      where: { hostelName: { equals: building, mode: "insensitive" } },
      select: { id: true, hostelName: true, gender: true },
    });

    if (!hostel) {
      return Response.json(
        { success: false, error: `Hostel '${building}' not found` },
        { status: 404 },
      );
    }

    if (!canViewHostel(requester, hostel)) {
      return Response.json(
        { success: false, error: `Access denied: ${hostel.hostelName} is a ${hostel.gender} block.` },
        { status: 403 },
      );
    }

    const now = new Date();
    const rooms = await prisma.room.findMany({
      where: {
        hostel_id: hostel.id,
        floor,
      },
      select: {
        roomNumber: true,
        capacity: true,
        bookings: {
          where: { checkOut: { gte: now } },
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            user: {
              select: {
                studentNumber: true,
                name: true,
                department: true,
                year: true,
              },
            },
          },
        },
      },
      orderBy: { roomNumber: "asc" },
    });

    const rows = rooms.map((room) => ({
      roomNumber: room.roomNumber,
      capacity: room.capacity,
      students: room.bookings.map((booking) => ({
        bookingId: booking.id,
        studentNumber: booking.user?.studentNumber ?? "",
        name: booking.user?.name ?? "Unknown",
        department: booking.user?.department ?? "",
        year: booking.user?.year ?? "",
      })),
    }));

    return Response.json({
      success: true,
      hostel: hostel.hostelName,
      floor,
      gender: hostel.gender,
      rooms: rows,
    });
  } catch (error) {
    console.error("Floor bookings error:", error);
    return Response.json(
      { success: false, error: "Could not load floor bookings" },
      { status: 500 },
    );
  }
}
