// src/app/api/admin/student/route.js
import { studentService } from "../../../../modules/student/student.service";
import { prisma }         from "../../../../app/lib/prisma";

function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ── Detect Caller B (room allocation) ────────────────────────────────────
    const isRoomAllocationCall =
      searchParams.has("gender")         ||
      searchParams.has("allowedYears")   ||
      searchParams.has("unallocated")    ||
      searchParams.has("studentNumbers");

    if (isRoomAllocationCall) {
      return handleRoomAllocationGet(searchParams);
    }

    // ── Caller A: original student-page logic ─────────────────────────────────

    // ?export=true → full list for Excel export (no pagination)
    if (searchParams.get("export") === "true") {
      const students = await studentService.exportStudents({
        department: searchParams.get("department") || "",
        year:       searchParams.get("year")       || "",
        search:     searchParams.get("search")     || "",
      });
      return Response.json({ data: students });
    }

    // Default: cursor-paginated list
    const data = await studentService.getStudents({
      cursor:     searchParams.get("cursor")     || null,
      limit:      searchParams.get("limit")      || 50,
      search:     searchParams.get("search")     || "",
      department: searchParams.get("department") || "",
      year:       searchParams.get("year")       || "",
    });

    return Response.json(data);
  } catch (err) {
    console.error("[GET /api/admin/student]", err);
    return errorResponse(err.message, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Room-allocation handler (Caller B)
//
// Queries Prisma directly — bypasses studentService pagination so we can
// apply gender/year/unallocated filters without touching studentService.
// ─────────────────────────────────────────────────────────────────────────────
async function handleRoomAllocationGet(searchParams) {
  try {
    const gender         = searchParams.get("gender");
    const allowedYears   = searchParams.get("allowedYears");
    const unallocated    = searchParams.get("unallocated") === "true";
    const search         = searchParams.get("search");
    const studentNumbers = searchParams.get("studentNumbers");

    const where = {
      isActive: true,
    };

    // Fetch specific students by number (used by the download button)
    if (studentNumbers) {
      const nums = studentNumbers.split(",").map((s) => s.trim()).filter(Boolean);
      where.studentNumber = { in: nums };
    }

    // Gender filter
    if (gender) {
      where.gender = { equals: gender, mode: "insensitive" };
    }

    // Year filter (from FloorAllocation.studentYear)
    if (allowedYears) {
      const years = allowedYears
        .split(",")
        .map((y) => parseInt(y.trim(), 10))
        .filter((y) => !isNaN(y));

      if (years.length > 0) {
        where.year = { in: years };
      }
    }

    // Text search
    if (search) {
      where.OR = [
        { name:          { contains: search, mode: "insensitive" } },
        { studentNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    // Unallocated: exclude students that already have an active booking
    if (unallocated) {
      const now            = new Date();
      const activeBookings = await prisma.booking.findMany({
        where:  { checkOut: { gt: now } },
        select: { studentNumber: true },
      });
      const bookedNums = activeBookings.map((b) => b.studentNumber);

      if (bookedNums.length > 0) {
        if (where.studentNumber?.in) {
          // Intersect: requested list minus already-booked
          where.studentNumber.in = where.studentNumber.in.filter(
            (sn) => !bookedNums.includes(sn)
          );
        } else {
          where.studentNumber = { notIn: bookedNums };
        }
      }
    }

    const students = await prisma.user.findMany({
      where,
      select: {
        id:            true,
        studentNumber: true,
        name:          true,
        email:         true,
        gender:        true,
        year:          true,
        department:    true,
        phoneNumber:   true,
      },
      orderBy: { name: "asc" },
      // Cap results for the allocate modal; no cap for the download path
      ...(!studentNumbers ? { take: 100 } : {}),
    });

    return Response.json({ success: true, data: students });
  } catch (err) {
    console.error("[GET /api/admin/student — room allocation]", err);
    return errorResponse(err.message, 500);
  }
}

// ── POST: create one student | bulk JSON import | CSV import ──────────────────
export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // CSV import (sent as text/csv from the ImportModal)
    if (contentType.includes("text/csv")) {
      const csvText = await req.text();
      if (!csvText.trim()) return errorResponse("CSV body is empty");

      const result = await studentService.importFromCsv(csvText);
      return Response.json(result, { status: 201 });
    }

    // JSON: bulk array or single student
    const body = await req.json();

    if (Array.isArray(body.students)) {
      const result = await studentService.bulkCreateStudents(body.students);
      return Response.json(result, { status: 201 });
    }

    const student = await studentService.createStudent(body);
    return Response.json(student, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/student]", err);
    return errorResponse(err.message);
  }
}

// ── PUT: update one student ────────────────────────────────────────────────────
export async function PUT(req) {
  try {
    const body    = await req.json();
    const updated = await studentService.updateStudent(body);
    return Response.json(updated);
  } catch (err) {
    console.error("[PUT /api/admin/student]", err);
    return errorResponse(err.message);
  }
}

// ── DELETE: one or many ────────────────────────────────────────────────────────
export async function DELETE(req) {
  try {
    const body = await req.json();

    if (Array.isArray(body.ids) && body.ids.length > 0) {
      await studentService.deleteStudents(body.ids);
    } else if (body.id) {
      await studentService.deleteStudent(body.id);
    } else {
      return errorResponse("Provide id or ids");
    }

    return Response.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/admin/student]", err);
    return errorResponse(err.message);
  }
}