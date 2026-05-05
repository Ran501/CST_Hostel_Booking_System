// src/modules/student/student.service.js
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { studentRepository } from "./student.repository";

// ── Constants ──────────────────────────────────────────────────────────────
const SALT_ROUNDS = 10;

/**
 * CSV column definitions — order matters for export headers.
 * `field`  → Prisma/DB field name
 * `header` → CSV column label
 * `required` → must be present on import
 */
const CSV_COLUMNS = [
  { field: "studentNumber", header: "Student Number", required: true },
  { field: "name",          header: "Name",           required: true },
  { field: "email",         header: "Email",           required: true },
  { field: "password",      header: "Password",        required: true }, // plain-text on import; hashed before save
  { field: "year",          header: "Year",            required: true },
  { field: "gender",        header: "Gender",          required: true },
  { field: "phoneNumber",   header: "Phone Number",    required: true },
  { field: "department",    header: "Department",       required: true },
  { field: "role",          header: "Role",            required: false },
];

const REQUIRED_FIELDS = CSV_COLUMNS.filter((c) => c.required).map((c) => c.field);

// ── Helpers ────────────────────────────────────────────────────────────────
function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Validate a raw student object and return a clean version.
 * Throws a descriptive error on the first problem found.
 */
function validateStudentPayload(raw, rowLabel = "") {
  const prefix = rowLabel ? `[${rowLabel}] ` : "";

  for (const field of REQUIRED_FIELDS) {
    if (!raw[field] && raw[field] !== 0) {
      throw new Error(`${prefix}Missing required field: "${field}"`);
    }
  }

  const year = Number(raw.year);
  if (!Number.isInteger(year) || year < 1 || year > 6) {
    throw new Error(`${prefix}Field "year" must be an integer between 1 and 6`);
  }

  const validGenders = ["male", "female", "other"];
  if (!validGenders.includes(raw.gender?.toLowerCase())) {
    throw new Error(`${prefix}Field "gender" must be one of: ${validGenders.join(", ")}`);
  }

  // Basic e-mail format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.email)) {
    throw new Error(`${prefix}Field "email" is not a valid email address`);
  }

  return {
    studentNumber: String(raw.studentNumber).trim(),
    name:          String(raw.name).trim(),
    email:         String(raw.email).trim().toLowerCase(),
    password:      String(raw.password), // will be hashed later
    year,
    gender:        String(raw.gender).trim().toLowerCase(),
    phoneNumber:   String(raw.phoneNumber).trim(),
    department:    String(raw.department).trim(),
    role:          raw.role ? String(raw.role).trim() : "user",
  };
}

// ── Service ────────────────────────────────────────────────────────────────
export const studentService = {
  // ── List with cursor pagination + filters ────────────────────────────
  async getStudents({ cursor, limit, search, department, year }) {
    const rows = await studentRepository.findMany({ cursor, limit, search, department, year });

    const pageSize = Number(limit);
    const hasNextPage = rows.length > pageSize;
    const items = hasNextPage ? rows.slice(0, pageSize) : rows;
    const nextCursor = hasNextPage ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasNextPage };
  },

  // ── Export all matching students (for CSV download) ──────────────────
  async exportStudents({ search, department, year }) {
    return studentRepository.findAll({ search, department, year });
  },

  // ── Single student ───────────────────────────────────────────────────
  async getStudentById(id) {
    const student = await studentRepository.findById(id);
    if (!student) throw new Error("Student not found");
    return student;
  },

  // ── Create one student ───────────────────────────────────────────────
  async createStudent(raw) {
    const payload = validateStudentPayload(raw);
    payload.password = await hashPassword(payload.password);
    return studentRepository.create(payload);
  },

  // ── Update a student ─────────────────────────────────────────────────
  async updateStudent({ id, ...fields }) {
    if (!id) throw new Error("Student id is required");

    // If a new password is provided, hash it; otherwise strip the key
    if (fields.password) {
      fields.password = await hashPassword(fields.password);
    } else {
      delete fields.password;
    }

    if (fields.year !== undefined) fields.year = Number(fields.year);
    if (fields.email)  fields.email = fields.email.trim().toLowerCase();

    return studentRepository.update(id, fields);
  },

  // ── Delete one student ───────────────────────────────────────────────
  async deleteStudent(id) {
    if (!id) throw new Error("Student id is required");
    await studentRepository.delete(id);
  },

  // ── Delete many students ─────────────────────────────────────────────
  async deleteStudents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) throw new Error("No ids provided");
    await studentRepository.deleteMany(ids);
  },

  // ── Bulk create (JSON array from the API body) ────────────────────────
  async bulkCreateStudents(rawStudents) {
    if (!Array.isArray(rawStudents) || rawStudents.length === 0) {
      throw new Error("No students provided");
    }

    // Validate and hash passwords in parallel
    const validated = await Promise.all(
      rawStudents.map(async (raw, i) => {
        const payload = validateStudentPayload(raw, `row ${i + 1}`);
        payload.password = await hashPassword(payload.password);
        return payload;
      })
    );

    const result = await studentRepository.createMany(validated);
    return {
      created: result.count,
      skipped: rawStudents.length - result.count,
    };
  },

  // ── Import from CSV buffer / string ──────────────────────────────────
  /**
   * @param {Buffer|string} csvData  Raw CSV content
   * @returns {{ created: number, skipped: number, errors: string[] }}
   *
   * Usage (in a route handler):
   *   const formData = await req.formData();
   *   const file = formData.get("file");
   *   const buffer = Buffer.from(await file.arrayBuffer());
   *   const result = await studentService.importFromCsv(buffer);
   */
  async importFromCsv(csvData) {
    let records;
    try {
      records = parse(csvData, {
        columns: true,          // use first row as header keys
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new Error(`CSV parse error: ${err.message}`);
    }

    if (records.length === 0) throw new Error("CSV file is empty");

    // Map CSV headers → field names
    const headerToField = Object.fromEntries(
      CSV_COLUMNS.map((c) => [c.header.toLowerCase(), c.field])
    );

    const errors = [];
    const validRecords = [];

    for (let i = 0; i < records.length; i++) {
      const row = records[i];
      const rowLabel = `row ${i + 2}`; // +2 because row 1 is the header

      // Normalise keys: accept both "Student Number" and "studentNumber"
      const normalised = {};
      for (const [key, value] of Object.entries(row)) {
        const mapped = headerToField[key.toLowerCase()] ?? key;
        normalised[mapped] = value;
      }

      try {
        const payload = validateStudentPayload(normalised, rowLabel);
        payload.password = await hashPassword(payload.password);
        validRecords.push(payload);
      } catch (err) {
        errors.push(err.message);
      }
    }

    let created = 0;
    let skipped = 0;

    if (validRecords.length > 0) {
      const result = await studentRepository.createMany(validRecords);
      created = result.count;
      skipped = validRecords.length - result.count;
    }

    return {
      total:   records.length,
      created,
      skipped: skipped + errors.length, // DB-level duplicates + validation failures
      errors,
    };
  },

  // ── Export to CSV string ──────────────────────────────────────────────
  /**
   * @param {{ search?, department?, year? }} filters
   * @returns {string}  UTF-8 CSV string ready to send as a file download
   *
   * Usage (in a route handler):
   *   const csv = await studentService.exportToCsv({ department: 'CS' });
   *   return new Response(csv, {
   *     headers: {
   *       'Content-Type': 'text/csv',
   *       'Content-Disposition': 'attachment; filename="students.csv"',
   *     },
   *   });
   */
  async exportToCsv(filters = {}) {
    const students = await studentRepository.findAll(filters);

    // Never include passwords in an export
    const exportColumns = CSV_COLUMNS.filter((c) => c.field !== "password");

    const rows = students.map((s) =>
      Object.fromEntries(exportColumns.map((c) => [c.header, s[c.field] ?? ""]))
    );

    return stringify(rows, {
      header: true,
      columns: exportColumns.map((c) => c.header),
    });
  },
};