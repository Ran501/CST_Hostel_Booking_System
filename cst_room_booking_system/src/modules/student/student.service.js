// src/modules/student/student.service.js
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { studentRepository } from "./student.repository";

// ── Constants ──────────────────────────────────────────────────────────────
const SALT_ROUNDS = 10;

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
    field: "phoneNumber", header: "Phone Number", required: false,
    aliases: ["phone", "phonenumber", "phone_number", "mobile", "contact", "contact number", "contactnumber"],
  },
  {
    field: "department", header: "Department", required: true,
    aliases: ["dept", "department name", "program", "course"],
  },
  {
    field: "role", header: "Role", required: false,
    aliases: ["user role", "userrole", "type"],
  },
  {
    field: "isActive", header: "Active", required: false,
    aliases: ["status", "is_active", "isactive", "active", "enabled"],
  },
];

const REQUIRED_FIELDS = CSV_COLUMNS.filter((c) => c.required).map((c) => c.field);

const HEADER_TO_FIELD = (() => {
  const map = {};
  for (const col of CSV_COLUMNS) {
    map[col.header.toLowerCase()] = col.field;
    map[col.field.toLowerCase()]  = col.field;
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

function parseBoolean(val, defaultValue = true) {
  if (val === undefined || val === null || val === "") return defaultValue;
  if (typeof val === "boolean") return val;
  if (typeof val === "number") return val !== 0;
  const str = String(val).trim().toLowerCase();
  return ["1", "true", "yes"].includes(str);
}

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
  const genderNorm   = raw.gender?.toString().trim().toLowerCase();
  if (!validGenders.includes(genderNorm)) {
    throw new Error(`${prefix}Field "gender" must be one of: ${validGenders.join(", ")}`);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.email)) {
    throw new Error(`${prefix}Field "email" is not a valid email address`);
  }

  const rawRole    = raw.role?.toString().trim().toLowerCase();
  const validRoles = ["student", "admin", "counselor"];
  const role       = validRoles.includes(rawRole) ? rawRole : "student";

  return {
    studentNumber: String(raw.studentNumber).trim(),
    name:          String(raw.name).trim(),
    email:         String(raw.email).trim().toLowerCase(),
    password:      raw.password ? String(raw.password) : "",
    year,
    gender:        genderNorm,
    // Phone is optional — store null when blank so records import without one.
    phoneNumber:   raw.phoneNumber != null && String(raw.phoneNumber).trim() !== ""
      ? String(raw.phoneNumber).trim()
      : null,
    department:    String(raw.department).trim(),
    role,
    isActive:      parseBoolean(raw.isActive, false),
  };
}

// ── Prisma error → friendly message ───────────────────────────────────────
/**
 * Prisma unique-constraint violations come back as a PrismaClientKnownRequestError
 * with code "P2002". The `meta.target` array tells us which field(s) caused it.
 * We map those to human-readable labels here so the frontend never has to
 * parse raw Prisma messages.
 */
function friendlyPrismaError(err) {
  // P2002 = Unique constraint violation
  if (err.code === "P2002") {
    const targets = err.meta?.target ?? [];

    // Map DB column names → readable labels
    const FIELD_LABELS = {
      studentNumber: "student number",
      email:         "email address",
      phoneNumber:   "phone number",
    };

    const fields = targets
      .map((t) => FIELD_LABELS[t] ?? t)
      .join(" and ");

    if (fields) {
      return `A student with this ${fields} already exists. Please use a different value.`;
    }
    return "A student with one of these details already exists. Please check student number, email, and phone number.";
  }

  // P2025 = Record not found (e.g. update/delete on missing ID)
  if (err.code === "P2025") {
    return "Student not found. They may have already been deleted.";
  }

  // P2003 = Foreign key constraint (e.g. related record missing)
  if (err.code === "P2003") {
    return "A related record was not found. Please refresh and try again.";
  }

  // Fall back to the original message for anything else
  return err.message;
}

/**
 * Wraps any async repository call and converts known Prisma errors
 * into friendly Error objects before re-throwing.
 */
async function withFriendlyErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    // Prisma known request errors always have a numeric `code` starting with "P"
    if (err.code?.startsWith?.("P")) {
      throw new Error(friendlyPrismaError(err));
    }
    throw err; // unknown errors bubble up unchanged
  }
}

// ── Service ────────────────────────────────────────────────────────────────
export const studentService = {
  async getStudents({ cursor, limit, search, department, year }) {
    const rows = await studentRepository.findMany({ cursor, limit, search, department, year });

    const pageSize    = Number(limit);
    const hasNextPage = rows.length > pageSize;
    const items       = hasNextPage ? rows.slice(0, pageSize) : rows;
    const nextCursor  = hasNextPage ? items[items.length - 1].id : null;

    return { data: items, nextCursor, hasNextPage };
  },

  async exportStudents({ search, department, year }) {
    return studentRepository.findAll({ search, department, year });
  },

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
    // Wrap in friendlyErrors so duplicate student number/email/phone
    // shows a clean message instead of a raw Prisma stack trace
    return withFriendlyErrors(() => studentRepository.create(payload));
  },

  // ── Update a student ─────────────────────────────────────────────────
  async updateStudent({ id, ...fields }) {
    if (!id) throw new Error("Student id is required");

    if (fields.password) {
      fields.password = await hashPassword(fields.password);
    } else {
      delete fields.password;
    }

    if (fields.year     !== undefined) fields.year     = Number(fields.year);
    if (fields.phoneNumber !== undefined) {
      const phone = String(fields.phoneNumber).trim();
      fields.phoneNumber = phone === "" ? null : phone;
    }
    if (fields.email    !== undefined) fields.email    = fields.email.trim().toLowerCase();
    if (fields.role     !== undefined) fields.role     = fields.role.trim().toLowerCase();
    if (fields.gender   !== undefined) fields.gender   = fields.gender.trim().toLowerCase();
    if (fields.isActive !== undefined) fields.isActive = parseBoolean(fields.isActive);

    return withFriendlyErrors(() => studentRepository.update(id, fields));
  },

  // ── Bulk year promote/demote ─────────────────────────────────────────
  // Server-authoritative version of the client's getMaxYear().
  async bulkUpdateYear({ ids, action }) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new Error("No students selected");
    }
    if (action !== "promote" && action !== "demote") {
      throw new Error("Invalid action — expected 'promote' or 'demote'");
    }

    const maxYearFor = (department) => (department === "Architecture" ? 5 : 4);

    const students = await studentRepository.findYearInfoByIds(ids);

    // Group ids by their computed target year; skip anyone already at the limit.
    const groups = new Map();
    let skipped = 0;
    for (const s of students) {
      const current = Number(s.year) || 1;
      const target =
        action === "promote"
          ? Math.min(current + 1, maxYearFor(s.department))
          : Math.max(current - 1, 1);

      if (target === current) {
        skipped++;
        continue;
      }
      if (!groups.has(target)) groups.set(target, []);
      groups.get(target).push(s.id);
    }

    const updated = await withFriendlyErrors(() =>
      studentRepository.setYearsByGroups(groups)
    );

    return { updated, skipped, total: students.length };
  },

  // ── Delete ───────────────────────────────────────────────────────────
  async deleteStudent(id) {
    if (!id) throw new Error("Student id is required");
    return withFriendlyErrors(() => studentRepository.delete(id));
  },

  async deleteStudents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) throw new Error("No ids provided");
    return withFriendlyErrors(() => studentRepository.deleteMany(ids));
  },

  // ── Bulk create (JSON) ────────────────────────────────────────────────
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

    const result = await withFriendlyErrors(() => studentRepository.createMany(validated));
    return {
      created: result.count,
      skipped: rawStudents.length - result.count,
    };
  },

  // ── Import from CSV ───────────────────────────────────────────────────
  async importFromCsv(csvData) {
    let records;
    try {
      records = parse(csvData, {
        columns:          true,
        skip_empty_lines: true,
        trim:             true,
        relaxColumnCount: true,
      });
    } catch (err) {
      throw new Error(`CSV parse error: ${err.message}`);
    }

    if (records.length === 0) throw new Error("CSV file is empty");

    const errors       = [];
    const validRecords = [];

    for (let i = 0; i < records.length; i++) {
      const row      = records[i];
      const rowLabel = `row ${i + 2}`;

      const normalised = {};
      for (const [key, value] of Object.entries(row)) {
        const mapped = HEADER_TO_FIELD[key.trim().toLowerCase()] ?? key;
        normalised[mapped] = value;
      }

      if (normalised.role     === undefined) normalised.role     = "";
      if (normalised.isActive === undefined) normalised.isActive = "";

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
      // createMany with skipDuplicates won't throw on duplicates — it just skips them.
      // No need for withFriendlyErrors here, but wrap anyway for safety.
      const result = await withFriendlyErrors(() => studentRepository.createMany(validRecords));
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

  async exportToCsv(filters = {}) {
    const students = await studentRepository.findAll(filters);
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