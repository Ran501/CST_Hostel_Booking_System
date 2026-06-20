// src/app/api/admin/room/route.js
import { NextResponse } from "next/server";
import { roomService } from "../../../../modules/room/room.service";
import { invalidateAdminReportCache } from "../../../../modules/report/report.service";

function errorResponse(err) {
  console.error("[/api/admin/room]", err);
  const status = err.status ?? 500;
  const message = err.message ?? "Internal server error";

  return NextResponse.json(
    { success: false, message },
    { status }
  );
}

// ─────────────────────────────────────────────
// GET /api/admin/room
// ─────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const hostelId = searchParams.get("hostelId");
    const floor = searchParams.get("floor");

    if (!hostelId) {
      return NextResponse.json(
        { success: false, message: "hostelId is required" },
        { status: 400 }
      );
    }

    const rooms = await roomService.getRoomsByHostel(
      hostelId,
      floor !== null ? floor : undefined
    );

    return NextResponse.json({
      success: true,
      data: rooms,
    });

  } catch (err) {
    return errorResponse(err);
  }
}

// ─────────────────────────────────────────────
// POST /api/admin/room
// ─────────────────────────────────────────────
export async function POST(request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, message: "action is required" },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case "allocate": {
        const { roomId, studentNumbers, checkIn, checkOut } = body;
        result = await roomService.allocateStudents(
          roomId,
          studentNumbers,
          checkIn,
          checkOut
        );
        break;
      }

      case "disable": {
        const { roomIds, reason } = body;
        result = await roomService.disableRooms(roomIds, reason);
        break;
      }

      case "enable": {
        const { roomIds } = body;
        result = await roomService.enableRooms(roomIds);
        break;
      }

      case "edit": {
        const { roomIds, capacity, year } = body;
        result = await roomService.editRooms(roomIds, { capacity, year });
        break;
      }

      case "deallocate": {
        const { bookingIds, roomIds } = body;
        result = await roomService.deallocateStudents({ bookingIds, roomIds });
        break;
      }

      default:
        return NextResponse.json(
          { success: false, message: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    // All actions above change data used in reports → invalidate cache
    invalidateAdminReportCache();

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (err) {
    return errorResponse(err);
  }
}