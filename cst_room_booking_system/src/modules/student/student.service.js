// src/modules/student/student.service.js
import { studentRepository } from "./student.repository";

// Fields to expose publicly (never expose password)
const SAFE_FIELDS = (s) => ({
  id: s.id,
  name: s.name,
  studentId: s.studentNumber,
  email: s.email,
  phone: s.phoneNumber,
  gender: s.gender,
  year: s.year,
  department: s.department,
  createdAt: s.createdAt,
});

export const studentService = {
  // ── READ (cursor-based) ──────────────────────────────────────────────────
  async getStudents({ cursor, limit, search, department, year }) {
    const result = await studentRepository.findAll({
      cursor: cursor || null,
      limit: Number(limit) || 50,
      search: search || "",
      department: department || "",
      year: year || "",
    });

    return {
      data: result.data.map(SAFE_FIELDS),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
      total: result.total,
    };
  },

  // ── CREATE ───────────────────────────────────────────────────────────────
  async createStudent(body) {
    const { name, email, studentId, phone, gender, year, department } = body;

    if (!name?.trim()) throw new Error("Name is required");
    if (!email?.trim()) throw new Error("Email is required");
    if (!studentId?.trim()) throw new Error("Student ID is required");

    const student = await studentRepository.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      studentNumber: studentId.trim(),
      phoneNumber: phone?.trim() || "",
      gender: gender || "Male",
      year: Number(year) || 1,
      department: department?.trim() || "",
      role: "user",
      password: "default123", // should be hashed in production
    });

    return SAFE_FIELDS(student);
  },

  // ── UPDATE ───────────────────────────────────────────────────────────────
  async updateStudent(body) {
    const { id, name, email, phone, gender, year, department } = body;
    if (!id) throw new Error("Student ID required");

    const updated = await studentRepository.update(id, {
      ...(name && { name: name.trim() }),
      ...(email && { email: email.trim().toLowerCase() }),
      ...(phone !== undefined && { phoneNumber: phone.trim() }),
      ...(gender && { gender }),
      ...(year && { year: Number(year) }),
      ...(department !== undefined && { department: department.trim() }),
    });

    return SAFE_FIELDS(updated);
  },

  // ── DELETE ONE ───────────────────────────────────────────────────────────
  async deleteStudent(id) {
    if (!id) throw new Error("ID required");
    return studentRepository.deleteOne(id);
  },

  // ── DELETE MANY ──────────────────────────────────────────────────────────
  async deleteStudents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No students selected");
    }
    return studentRepository.deleteMany(ids);
  },

  // ── BULK CREATE (CSV import) ─────────────────────────────────────────────
  async bulkCreateStudents(students) {
    if (!Array.isArray(students) || students.length === 0) {
      throw new Error("No student data provided");
    }

    const formatted = students
      .filter((s) => s.name?.trim() && s.email?.trim() && s.studentId?.trim())
      .map((s) => ({
        name: s.name.trim(),
        email: s.email.trim().toLowerCase(),
        studentNumber: s.studentId.trim(),
        phoneNumber: s.phone?.trim() || "",
        gender: s.gender?.trim() || "Male",
        year: Number(s.year) || 1,
        department: s.department?.trim() || "",
        role: "user",
        password: "default123",
      }));

    if (formatted.length === 0) {
      throw new Error("No valid student records found in CSV");
    }

    const result = await studentRepository.createMany(formatted);
    return { count: result.count, skipped: students.length - formatted.length };
  },

  // ── EXPORT (all students grouped by department) ──────────────────────────
  async exportStudents({ department, year } = {}) {
    const students = await studentRepository.findAllForExport({ department, year });
    return students.map(SAFE_FIELDS);
  },
};