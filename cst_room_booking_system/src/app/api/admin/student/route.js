// src/app/api/admin/student/route.js
import { studentService } from "../../../../modules/student/student.service";

function errorResponse(message, status = 400) {
  return Response.json({ error: message }, { status });
}

// ── GET: list students (cursor-based pagination + filters) ────────────────
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // ?export=true → return all matching students for Excel export (no pagination)
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

// ── POST: create one student | bulk JSON import | CSV import ──────────────
export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // ── CSV import (sent as text/csv from the ImportModal) ────────────────
    if (contentType.includes("text/csv")) {
      const csvText = await req.text();
      if (!csvText.trim()) return errorResponse("CSV body is empty");

      const result = await studentService.importFromCsv(csvText);
      return Response.json(result, { status: 201 });
    }

    // ── JSON: bulk array or single student ────────────────────────────────
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

// ── PUT: update one student ────────────────────────────────────────────────
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

// ── DELETE: one or many ────────────────────────────────────────────────────
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