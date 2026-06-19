// src/app/api/admin/student/route.js
import { studentService } from "../../../../modules/student/student.service";
import { prisma }         from "../../../../app/lib/prisma";
import { invalidateAdminReportCache } from "../../../../modules/report/report.service";

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

    if (searchParams.get("export") === "true") {
      const students = await studentService.exportStudents({
        department: searchParams.get("department") || "",
        year:       searchParams.get("year")       || "",
        search:     searchParams.get("search")     || "",
      });
      return Response.json({ data: students });
    }

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

    if (studentNumbers) {
      const nums = studentNumbers.split(",").map((s) => s.trim()).filter(Boolean);
      where.studentNumber = { in: nums };
    }

    if (gender) {
      where.gender = { equals: gender, mode: "insensitive" };
    }

    if (allowedYears) {
      const years = allowedYears
        .split(",")
        .map((y) => parseInt(y.trim(), 10))
        .filter((y) => !isNaN(y));

      if (years.length > 0) {
        where.year = { in: years };
      }
    }

    if (search) {
      where.OR = [
        { name:          { contains: search, mode: "insensitive" } },
        { studentNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    if (unallocated) {
      const now            = new Date();
      const activeBookings = await prisma.booking.findMany({
        where:  { checkOut: { gt: now } },
        select: { studentNumber: true },
      });
      const bookedNums = activeBookings.map((b) => b.studentNumber);

      if (bookedNums.length > 0) {
        if (where.studentNumber?.in) {
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

    if (contentType.includes("text/csv")) {
      const csvText = await req.text();
      if (!csvText.trim()) return errorResponse("CSV body is empty");

      const result = await studentService.importFromCsv(csvText);
      // Invalidate because new students are added
      invalidateAdminReportCache();
      return Response.json(result, { status: 201 });
    }

    const body = await req.json();

    if (Array.isArray(body.students)) {
      const result = await studentService.bulkCreateStudents(body.students);
      invalidateAdminReportCache();
      return Response.json(result, { status: 201 });
    }

    const student = await studentService.createStudent(body);
    invalidateAdminReportCache();
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
    // Invalidate because student details (year, gender, active status) may change
    invalidateAdminReportCache();
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

    // Invalidate because students are removed
    invalidateAdminReportCache();
    return Response.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("[DELETE /api/admin/student]", err);
    return errorResponse(err.message);
  }
}