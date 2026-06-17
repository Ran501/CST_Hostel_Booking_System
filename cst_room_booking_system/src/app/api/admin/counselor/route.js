// src/app/api/admin/counselor/route.js

import { prisma } from "../../../../app/lib/prisma";

function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// ── GET /api/admin/counselor ──────────────────────────────────────────────
//
// ?available=true   → return only hostels NOT yet assigned to any counselor
// (no params)       → return all counselor assignments with user + hostel info
//
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    if (searchParams.get("available") === "true") {
      // Find hostelIds already assigned to a counselor
      const assigned = await prisma.counselor.findMany({
        select: { hostelId: true },
      });
      const assignedIds = assigned.map((c) => c.hostelId);

      // Return hostels that are NOT in that list
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

    // Full list of assignments
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

// ── POST /api/admin/counselor ─────────────────────────────────────────────
//
// Body: { userId, hostelId }
//
// Creates (or updates) the Counselor record linking a user to a hostel.
// Uses upsert on userId so re-assigning a counselor to a different hostel
// replaces the old record rather than throwing a unique constraint error.
//
export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, hostelId } = body;

    if (!userId || !hostelId) {
      return errorResponse("userId and hostelId are required");
    }

    // Verify the user exists and has the counselor role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true },
    });

    if (!user) return errorResponse("User not found", 404);
    if (user.role !== "counselor") {
      return errorResponse(`User role is "${user.role}", not "counselor". Update the role first.`);
    }

    // Verify the hostel exists
    const hostel = await prisma.hostel.findUnique({
      where: { id: hostelId },
      select: { id: true, hostelName: true },
    });
    if (!hostel) return errorResponse("Hostel not found", 404);

    // Check if another counselor is already assigned to this hostel
    const existingForHostel = await prisma.counselor.findUnique({
      where: { hostelId },
      include: { user: { select: { name: true } } },
    });

    if (existingForHostel && existingForHostel.userId !== userId) {
      return errorResponse(
        `Hostel "${hostel.hostelName}" is already managed by ${existingForHostel.user.name}. Reassign them first.`
      );
    }

    // Upsert: update hostel if counselor record already exists for this user,
    // otherwise create a fresh record.
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

// ── DELETE /api/admin/counselor ───────────────────────────────────────────
//
// Body: { userId }  — removes the counselor's hostel assignment
//
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