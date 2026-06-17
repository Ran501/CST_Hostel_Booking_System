// src/app/api/admin/counselor/route.js

import { prisma } from "../../../../app/lib/prisma";

function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// GET /api/admin/counselor
//   ?available=true  → hostels not yet assigned to any counselor
//   (no params)      → all counselor assignments with user + hostel
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("available") === "true") {
      const assigned = await prisma.counselor.findMany({
        select: { hostelId: true },
      });
      const assignedIds = assigned.map((c) => c.hostelId);

      const hostels = await prisma.hostel.findMany({
        where: {
          status: "active",
          ...(assignedIds.length > 0 ? { id: { notIn: assignedIds } } : {}),
        },
        select: {
          id: true,
          hostelName: true,
          gender: true,
          numberOfFloor: true,
          capacity: true,
        },
        orderBy: { hostelName: "asc" },
      });

      return Response.json({ hostels });
    }

    const counselors = await prisma.counselor.findMany({
      include: {
        user:   { select: { id: true, name: true, email: true, studentNumber: true } },
        hostel: { select: { id: true, hostelName: true, gender: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ counselors });
  } catch (err) {
    console.error("[GET /api/admin/counselor]", err);
    return errorResponse(err.message, 500);
  }
}

// POST /api/admin/counselor
// Body: { userId, hostelId }
export async function POST(req) {
  try {
    const { userId, hostelId } = await req.json();

    if (!userId || !hostelId) {
      return errorResponse("userId and hostelId are required");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) return errorResponse("User not found", 404);
    if (user.role !== "counselor") {
      return errorResponse(`User role is "${user.role}", not "counselor". Update the role first.`);
    }

    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      select: { id: true, hostelName: true },
    });
    if (!hostel) return errorResponse("Hostel not found", 404);

    const existingForHostel = await prisma.counselor.findUnique({
      where: { hostelId },
      include: { user: { select: { name: true } } },
    });

    if (existingForHostel && existingForHostel.userId !== userId) {
      return errorResponse(
        `Hostel "${hostel.hostelName}" is already managed by ${existingForHostel.user.name}. Reassign them first.`
      );
    }

    const counselor = await prisma.counselor.upsert({
      where:  { userId },
      update: { hostelId },
      create: { userId, hostelId },
      include: {
        user:   { select: { id: true, name: true, email: true } },
        hostel: { select: { id: true, hostelName: true } },
      },
    });

    return Response.json({ success: true, counselor }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/counselor]", err);
    return errorResponse(err.message, 500);
  }
}

// DELETE /api/admin/counselor
// Body: { userId }
export async function DELETE(req) {
  try {
    const { userId } = await req.json();
    if (!userId) return errorResponse("userId is required");

    await prisma.counselor.delete({ where: { userId } });

    return Response.json({ success: true, message: "Counselor assignment removed" });
  } catch (err) {
    console.error("[DELETE /api/admin/counselor]", err);
    return errorResponse(err.message, 500);
  }
}
