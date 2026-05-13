// src/app/api/admin/room/route.js
// NOTE: Next.js App Router — named exports only, no default export.
import { NextResponse }  from "next/server";
import { roomService }   from "../../../../modules/room/room.service";

function errorResponse(err) {
  console.error("[/api/admin/room]", err);
  const status  = err.status  ?? 500;
  const message = err.message ?? "Internal server error";
  return NextResponse.json({ success: false, message }, { status });
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/room?hostelId=xxx&floor=1
//
// floor is optional:
//   - provided  → returns rooms for that floor only   (room grid)
//   - omitted   → returns ALL rooms for the hostel    (preview + download)
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostelId");
    const floor    = searchParams.get("floor");   // may be null

    if (!hostelId) {
      return NextResponse.json(
        { success: false, message: "hostelId is required" },
        { status: 400 }
      );
    }

    // Pass undefined when floor is not provided so repository returns all floors
    const rooms = await roomService.getRoomsByHostel(
      hostelId,
      floor !== null ? floor : undefined
    );

    return NextResponse.json({ success: true, data: rooms });
  } catch (err) {
    return errorResponse(err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/room
//
// Unified action endpoint — body must contain { action }.
//
//   action: "allocate"    { roomId, studentNumbers[], checkIn?, checkOut? }
//   action: "disable"     { roomIds[], reason? }
//   action: "enable"      { roomIds[] }
//   action: "edit"        { roomIds[], capacity }
//   action: "deallocate"  { bookingIds[]? } or { roomIds[]? }
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    const body   = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "allocate": {
        const { roomId, studentNumbers, checkIn, checkOut } = body;
        const result = await roomService.allocateStudents(roomId, studentNumbers, checkIn, checkOut);
        return NextResponse.json({ success: true, data: result }, { status: 201 });
      }

      case "disable": {
        const { roomIds, reason } = body;
        const result = await roomService.disableRooms(roomIds, reason);
        return NextResponse.json({ success: true, data: result });
      }

      case "enable": {
        const { roomIds } = body;
        const result = await roomService.enableRooms(roomIds);
        return NextResponse.json({ success: true, data: result });
      }

      case "edit": {
        const { roomIds, capacity, year } = body;
        const result = await roomService.editRooms(roomIds, { capacity, year });
        return NextResponse.json({ success: true, data: result });
      }

      case "deallocate": {
        const { bookingIds, roomIds } = body;
        const result = await roomService.deallocateStudents({ bookingIds, roomIds });
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (err) {
    return errorResponse(err);
  }
}