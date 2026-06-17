// src/modules/student/student.service.js
import bcrypt from "bcryptjs";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import { studentRepository } from "./student.repository";
import { cache } from "../../app/lib/cache";

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
    field: "phoneNumber", header: "Phone Number", required: true,
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

// normalise CSV active field
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
    phoneNumber:   String(raw.phoneNumber).trim(),
    department:    String(raw.department).trim(),
    role,
    isActive:      parseBoolean(raw.isActive, false),
  };
}

// ── Prisma error → friendly message ───────────────────────────────────────
function friendlyPrismaError(err) {
  if (err.code === "P2002") {
    const targets = err.meta?.target ?? [];

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

  if (err.code === "P2025") {
    return "Student not found. They may have already been deleted.";
  }

  if (err.code === "P2003") {
    return "A related record was not found. Please refresh and try again.";
  }

  return err.message;
}

async function withFriendlyErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    if (err.code?.startsWith?.("P")) {
      throw new Error(friendlyPrismaError(err));
    }
    throw err;
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
    const result = await withFriendlyErrors(() => studentRepository.create(payload));
    
    // Invalidate reports cache
    cache.del("reports:admin");
    
    return result;
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
    if (fields.email    !== undefined) fields.email    = fields.email.trim().toLowerCase();
    if (fields.role     !== undefined) fields.role     = fields.role.trim().toLowerCase();
    if (fields.gender   !== undefined) fields.gender   = fields.gender.trim().toLowerCase();
    if (fields.isActive !== undefined) fields.isActive = parseBoolean(fields.isActive);

    const result = await withFriendlyErrors(() => studentRepository.update(id, fields));
    
    // Invalidate reports cache
    cache.del("reports:admin");

    return result;
  },

  // ── Delete ───────────────────────────────────────────────────────────
  async deleteStudent(id) {
    if (!id) throw new Error("Student id is required");
    const result = await withFriendlyErrors(() => studentRepository.delete(id));
    
    // Invalidate reports cache
    cache.del("reports:admin");

    return result;
  },

  async deleteStudents(ids) {
    if (!Array.isArray(ids) || ids.length === 0) throw new Error("No ids provided");
    const result = await withFriendlyErrors(() => studentRepository.deleteMany(ids));
    
    // Invalidate reports cache
    cache.del("reports:admin");

    return result;
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
    
    // Invalidate reports cache
    cache.del("reports:admin");

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
      const result = await withFriendlyErrors(() => studentRepository.createMany(validRecords));
      created = result.count;
      skipped = validRecords.length - result.count;
    }

    // Invalidate reports cache
    cache.del("reports:admin");

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