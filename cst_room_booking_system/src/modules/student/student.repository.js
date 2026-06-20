// src/modules/student/student.repository.js
import { prisma } from "../../app/lib/prisma";

/**
 * Build a reusable Prisma `where` clause from filter params.
 */
function buildWhere({ search = "", department = "", year = "" }) {
  const where = {};

  // Case-insensitive department filter — "civil engineering" matches "Civil Engineering"
  if (department) {
    where.department = { equals: department, mode: "insensitive" };
  }

  // Only apply the year filter when it's a real integer. A non-numeric value
  // (e.g. an "all" option) would make Number(year) === NaN, which Prisma
  // rejects with "Argument `year` is missing".
  if (year !== undefined && year !== null && String(year).trim() !== "") {
    const yearNum = Number(year);
    if (Number.isInteger(yearNum)) where.year = yearNum;
  }

  if (search) {
    where.OR = [
      { name:          { contains: search, mode: "insensitive" } },
      { email:         { contains: search, mode: "insensitive" } },
      { studentNumber: { contains: search, mode: "insensitive" } },
      { phoneNumber:   { contains: search, mode: "insensitive" } },
      { department:    { contains: search, mode: "insensitive" } },
      { role:          { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

/** Fields returned to the client on every query — password is always excluded. */
const USER_SELECT = {
  id:            true,
  name:          true,
  email:         true,
  studentNumber: true,
  role:          true,
  year:          true,
  gender:        true,
  phoneNumber:   true,
  department:    true,
  isActive:      true,   // ← was missing everywhere; toggle now works
  // createdAt: true,
};

export const studentRepository = {
  // ── Cursor-based pagination ────────────────────────────────────────────
  /**
   * Returns `limit + 1` rows so the caller can detect whether another page
   * exists. The extra row is stripped before returning to the client.
   */
  async findMany({ cursor = null, limit = 50, search, department, year }) {
    const take  = Number(limit) + 1;
    const where = buildWhere({ search, department, year });

    const query = {
      where,
      take,
      orderBy: { id: "desc" },
      select:  USER_SELECT,
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip   = 1; // skip the cursor row itself
    }

    return prisma.user.findMany(query);
  },

  // ── Export (no pagination) ─────────────────────────────────────────────
  async findAll({ search, department, year }) {
    return prisma.user.findMany({
      where:   buildWhere({ search, department, year }),
      orderBy: { id: "desc" },
      select:  USER_SELECT,
    });
  },

  // ── Single lookup ──────────────────────────────────────────────────────
  async findById(id) {
    return prisma.user.findUnique({
      where:  { id },
      select: USER_SELECT,
    });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findByStudentNumber(studentNumber) {
    return prisma.user.findUnique({ where: { studentNumber } });
  },

  // ── Create ─────────────────────────────────────────────────────────────
  async create(data) {
    return prisma.user.create({
      data,
      select: USER_SELECT,
    });
  },

  /**
   * Bulk upsert: insert new students; skip (or update) on conflict.
   * Uses createMany with skipDuplicates for simplicity.
   */
  async createMany(records) {
    return prisma.user.createMany({
      data:           records,
      skipDuplicates: true,
    });
  },

  // ── Update ─────────────────────────────────────────────────────────────
  async update(id, data) {
    return prisma.user.update({
      where:  { id },
      data,
      select: USER_SELECT,
    });
  },

  // ── Delete ─────────────────────────────────────────────────────────────
  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  async deleteMany(ids) {
    return prisma.user.deleteMany({ where: { id: { in: ids } } });
  },

  // ── Bulk year promote/demote ───────────────────────────────────────────
  /** Minimal fields needed to compute a new year for each selected student. */
  async findYearInfoByIds(ids) {
    return prisma.user.findMany({
      where:  { id: { in: ids } },
      select: { id: true, department: true, year: true },
    });
  },

  /**
   * Apply new years in bulk. `groups` is a Map<newYear, ids[]> — typically only
   * a handful of distinct target years, so this is a few `updateMany`s run
   * together in one transaction, regardless of how many students were selected.
   */
  async setYearsByGroups(groups) {
    const entries = [...groups.entries()];
    if (entries.length === 0) return 0;

    const results = await prisma.$transaction(
      entries.map(([year, ids]) =>
        prisma.user.updateMany({ where: { id: { in: ids } }, data: { year } })
      )
    );
    return results.reduce((sum, r) => sum + r.count, 0);
  },
};