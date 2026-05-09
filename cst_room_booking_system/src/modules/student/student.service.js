// src/modules/student/student.service.js
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { studentRepository } from "./student.repository";

// ── Constants ──────────────────────────────────────────────────────────────
const SALT_ROUNDS = 10;

/**
 * CSV column definitions — order matters for export headers.
 * `field`      → Prisma/DB field name
 * `header`     → canonical CSV column label (used for export)
 * `aliases`    → alternative header spellings accepted on import (all lowercased)
 * `required`   → must be present on import
 */
const CSV_COLUMNS = [
  {
    field: "studentNumber", header: "Student Number", required: true,
    aliases: ["studentnumber", "student_number", "student no", "student id", "studentid", "id"],
  },
  {
    field: "name", header: "Name", required: true,
    aliases: ["full name", "fullname", "student name", "studentname"],
  },
  {
    field: "email", header: "Email", required: true,
    aliases: ["email address", "emailaddress", "e-mail", "mail"],
  },
  {
    field: "password", header: "Password", required: false,
    aliases: ["pass", "pwd"],
  },
  {
    field: "year", header: "Year", required: true,
    aliases: ["yr", "year level", "yearlevel", "academic year"],
  },
  {
    field: "gender", header: "Gender", required: true,
    aliases: ["sex"],
  },
  {
    field: "phoneNumber", header: "Phone Number", required: true,
    aliases: ["phone", "phonenumber", "phone_number", "mobile", "contact", "contact number", "contactnumber"],
  },
  {
    field: "department", header: "Department", required: true,
    aliases: ["dept", "department name", "program", "course"],
  },
  {
    // role is fully optional — missing column OR blank value → "student"
    field: "role", header: "Role", required: false,
    aliases: ["user role", "userrole", "type"],
  },
  {
    // isActive is fully optional — missing column OR blank value → false (disabled)
    field: "isActive", header: "Active", required: false,
    aliases: ["status", "is_active", "isactive", "active", "enabled"],
  },
];

const REQUIRED_FIELDS = CSV_COLUMNS.filter((c) => c.required).map((c) => c.field);

/**
 * Build a lookup map: every alias (and the canonical header) → field name.
 * All keys are lowercased so matching is always case-insensitive.
 */
const HEADER_TO_FIELD = (() => {
  const map = {};
  for (const col of CSV_COLUMNS) {
    map[col.header.toLowerCase()] = col.field;
    map[col.field.toLowerCase()]  = col.field; // accept camelCase field name directly
    for (const alias of (col.aliases ?? [])) {
      map[alias.toLowerCase()] = col.field;
    }
  }
  return map;
})();

// ── Helpers ────────────────────────────────────────────────────────────────
function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

/**
 * Coerce any representation of a boolean coming from CSV / JSON body
 * to a real JS boolean.
 * Handles: true/false, 1/0, "1"/"0", "true"/"false", "yes"/"no", "True"/"False"
 */
function parseBoolean(val, defaultValue = true) {
  if (val === undefined || val === null || val === "") return defaultValue;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  const str = String(val).trim().toLowerCase();
  return ["1", "true", "yes"].includes(str);
}

/**
 * Validate a raw student object and return a clean version ready for the DB.
 * • role    → optional; defaults to "student" when blank/missing
 * • isActive → optional; defaults to false (disabled) when blank/missing
 * Throws a descriptive error on the first validation problem found.
 */
function validateStudentPayload(raw, rowLabel = "") {
  const prefix = rowLabel ? `[${rowLabel}] ` : "";

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!raw[field] && raw[field] !== 0) {
      throw new Error(`${prefix}Missing required field: "${field}"`);
    }
  }

  const year = Number(raw.year);
  if (!Number.isInteger(year) || year < 1 || year > 6) {
    throw new Error(`${prefix}Field "year" must be an integer between 1 and 6`);
  }

  // Gender: case-insensitive, accept "Male", "MALE", "male", etc.
  const validGenders = ["male", "female", "other"];
  const genderNorm   = raw.gender?.toString().trim().toLowerCase();
  if (!validGenders.includes(genderNorm)) {
    throw new Error(`${prefix}Field "gender" must be one of: ${validGenders.join(", ")}`);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.email)) {
    throw new Error(`${prefix}Field "email" is not a valid email address`);
  }

  // role: optional — blank/missing/unknown → "student"
  const rawRole     = raw.role?.toString().trim().toLowerCase();
  const validRoles  = ["student", "admin", "counselor"];
  const role        = validRoles.includes(rawRole) ? rawRole : "student";

  return {
    studentNumber: String(raw.studentNumber).trim(),
    name:          String(raw.name).trim(),
    email:         String(raw.email).trim().toLowerCase(),
    password:      raw.password ? String(raw.password) : "",
    year,
    gender:        genderNorm,
    phoneNumber:   String(raw.phoneNumber).trim(),
    department:    String(raw.department).trim(),
    role,
    // isActive: optional — blank/missing → false (disabled) by default on import
    isActive:      parseBoolean(raw.isActive, false),
  };
}

// ── Service ────────────────────────────────────────────────────────────────
export const studentService = {
  // ── List with cursor pagination + filters ────────────────────────────
  async getStudents({ cursor, limit, search, department, year }) {
    const rows = await studentRepository.findMany({ cursor, limit, search, department, year });

    const pageSize   = Number(limit);
    const hasNextPage = rows.length > pageSize;
    const items      = hasNextPage ? rows.slice(0, pageSize) : rows;
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
    if (payload.password) {
      payload.password = await hashPassword(payload.password);
    }
    return studentRepository.create(payload);
  },

  // ── Update a student ─────────────────────────────────────────────────
  async updateStudent({ id, ...fields }) {
    if (!id) throw new Error("Student id is required");

    // Hash new password if provided; strip the key otherwise so it's not
    // accidentally cleared in the DB
    if (fields.password) {
      fields.password = await hashPassword(fields.password);
    } else {
      delete fields.password;
    }

    if (fields.year     !== undefined) fields.year     = Number(fields.year);
    if (fields.email    !== undefined) fields.email    = fields.email.trim().toLowerCase();
    if (fields.role     !== undefined) fields.role     = fields.role.trim().toLowerCase();
    if (fields.gender   !== undefined) fields.gender   = fields.gender.trim().toLowerCase();

    // ← key fix: coerce isActive to a proper boolean so Prisma doesn't
    //   receive a string "true" / "false" or a number 0/1
    if (fields.isActive !== undefined) {
      fields.isActive = parseBoolean(fields.isActive);
    }

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

    const validated = await Promise.all(
      rawStudents.map(async (raw, i) => {
        const payload = validateStudentPayload(raw, `row ${i + 1}`);
        if (payload.password) {
          payload.password = await hashPassword(payload.password);
        }
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
   * Accepts CSV with:
   *   • Any case in headers: "Student Number", "studentnumber", "STUDENT NUMBER" all work.
   *   • Missing role column or blank role cell → defaults to "student".
   *   • Missing isActive/status column or blank cell → defaults to false (disabled).
   *   • Any case in values: "Male"/"MALE"/"male" all normalise correctly.
   *
   * @param {Buffer|string} csvData  Raw CSV content
   * @returns {{ total: number, created: number, skipped: number, errors: string[] }}
   */
  async importFromCsv(csvData) {
    let records;
    try {
      records = parse(csvData, {
        columns:          true,  // first row becomes header keys
        skip_empty_lines: true,
        trim:             true,
        relaxColumnCount: true,  // tolerate rows with fewer columns than headers
      });
    } catch (err) {
      throw new Error(`CSV parse error: ${err.message}`);
    }

    if (records.length === 0) throw new Error("CSV file is empty");

    const errors       = [];
    const validRecords = [];

    for (let i = 0; i < records.length; i++) {
      const row      = records[i];
      const rowLabel = `row ${i + 2}`; // +2: row 1 is the header

      // Normalise every key using HEADER_TO_FIELD (case-insensitive, aliases included).
      // Keys that don't match any known field are passed through as-is so
      // validateStudentPayload can ignore them silently.
      const normalised = {};
      for (const [key, value] of Object.entries(row)) {
        const mapped = HEADER_TO_FIELD[key.trim().toLowerCase()] ?? key;
        normalised[mapped] = value;
      }

      // role and isActive may simply not exist as columns — set safe defaults
      // before validation so validateStudentPayload never sees them as missing.
      if (normalised.role     === undefined) normalised.role     = "";   // → "student"
      if (normalised.isActive === undefined) normalised.isActive = "";   // → false

      try {
        const payload = validateStudentPayload(normalised, rowLabel);
        if (payload.password) {
          payload.password = await hashPassword(payload.password);
        }
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
      skipped: skipped + errors.length,
      errors,
    };
  },

  // ── Export to CSV string ──────────────────────────────────────────────
  /**
   * @param {{ search?, department?, year? }} filters
   * @returns {string}  UTF-8 CSV string ready to send as a file download
   */
  async exportToCsv(filters = {}) {
    const students = await studentRepository.findAll(filters);

    // Never include passwords in an export
    const exportColumns = CSV_COLUMNS.filter((c) => c.field !== "password");

    const rows = students.map((s) =>
      Object.fromEntries(exportColumns.map((c) => [c.header, s[c.field] ?? ""]))
    );

    return stringify(rows, {
      header:  true,
      columns: exportColumns.map((c) => c.header),
    });
  },
};