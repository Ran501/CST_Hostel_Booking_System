// src/app/api/admin/hostel/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse } from "next/server";
import { prisma }         from "../../../../app/lib/prisma";


// ── Helper: compute real capacity by summing all room capacities ──────────────
// This replaces the stale `capacity` column on Hostel with a live aggregate.
async function computeCapacity(hostelId) {
  const result = await prisma.room.aggregate({
    where:  { hostel_id: hostelId },
    _sum:   { capacity: true },
  });
  return result._sum.capacity ?? 0;
}

// ── Helper: build the full hostel response object ─────────────────────────────
async function buildHostelResponse(h) {
  const capacity = await computeCapacity(h.id);
  return {
    id:               h.id,
    hostelName:       h.hostelName,
    gender:           h.gender,
    status:           h.status,
    numberOfFloor:    h.numberOfFloor,
    year:             h.year,
    roomCount:        h._count?.rooms ?? 0,
    capacity,                              // ← live sum, never stale
    floorAllocations: h.floorAllocations ?? [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/hostel          → all hostels
// GET /api/admin/hostel?name=HF  → single hostel by hostelName
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");

    const include = {
      floorAllocations: { orderBy: { floor: "asc" } },
      _count:           { select: { rooms: true } },
    };

    if (name) {
      const h = await prisma.hostel.findFirst({
        where: { hostelName: name },
        include,
      });

      if (!h) {
        return NextResponse.json(
          { success: false, message: `Hostel "${name}" not found` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: await buildHostelResponse(h) });
    }

    const hostels = await prisma.hostel.findMany({
      include,
      orderBy: { hostelName: "asc" },
    });

    const data = await Promise.all(hostels.map(buildHostelResponse));
    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[GET /api/admin/hostel]", err);
    return NextResponse.json(
      { success: false, message: "Failed to load hostels" },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/hostel
// Body: { id, gender?, status? }
// Updates editable fields only — capacity is never written here.
// ─────────────────────────────────────────────────────────────────────────────
export async function PUT(request) {
  try {
    const { id, gender, status } = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, message: "id is required" },
        { status: 400 }
      );
    }

    const updates = {};
    if (gender !== undefined) updates.gender = gender;
    if (status !== undefined) updates.status = status;

    if (!Object.keys(updates).length) {
      return NextResponse.json(
        { success: false, message: "Nothing to update" },
        { status: 400 }
      );
    }

    const updated = await prisma.hostel.update({
      where:   { id },
      data:    updates,
      include: {
        floorAllocations: { orderBy: { floor: "asc" } },
        _count:           { select: { rooms: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data:    await buildHostelResponse(updated),
    });
  } catch (err) {
    console.error("[PUT /api/admin/hostel]", err);
    return NextResponse.json(
      { success: false, message: "Failed to update hostel" },
      { status: 500 }
    );
  }
}