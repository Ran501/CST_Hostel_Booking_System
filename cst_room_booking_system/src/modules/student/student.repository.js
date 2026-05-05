// src/modules/student/student.repository.js
import { prisma } from "../../app/lib/prisma";

/**
 * Build a reusable Prisma `where` clause from filter params.
 */
function buildWhere({ search = "", department = "", year = "" }) {
  const where = {};

  if (department) where.department = department;
  if (year) where.year = Number(year);

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { studentNumber: { contains: search, mode: "insensitive" } },
      { phoneNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  return where;
}

export const studentRepository = {
  // ── Cursor-based pagination ────────────────────────────────────────────
  /**
   * Returns `limit + 1` rows so the caller can detect whether another page
   * exists. The extra row is stripped before returning to the client.
   */
  async findMany({ cursor = null, limit = 50, search, department, year }) {
    const take = Number(limit) + 1; // fetch one extra to detect next page
    const where = buildWhere({ search, department, year });

    const query = {
      where,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true,
        role: true,
        year: true,
        gender: true,
        phoneNumber: true,
        department: true,
        createdAt: true,
        // never expose password
      },
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1; // skip the cursor row itself
    }

    return prisma.user.findMany(query);
  },

  // ── Export (no pagination) ─────────────────────────────────────────────
  async findAll({ search, department, year }) {
    return prisma.user.findMany({
      where: buildWhere({ search, department, year }),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true,
        role: true,
        year: true,
        gender: true,
        phoneNumber: true,
        department: true,
        createdAt: true,
      },
    });
  },

  // ── Single lookup ──────────────────────────────────────────────────────
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true,
        role: true,
        year: true,
        gender: true,
        phoneNumber: true,
        department: true,
        createdAt: true,
      },
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
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true,
        role: true,
        year: true,
        gender: true,
        phoneNumber: true,
        department: true,
        createdAt: true,
      },
    });
  },

  /**
   * Bulk upsert: insert new students; skip (or update) on conflict.
   * Uses createMany with skipDuplicates for simplicity. Switch to
   * individual upserts if you need per-row update-on-conflict semantics.
   */
  async createMany(records) {
    return prisma.user.createMany({
      data: records,
      skipDuplicates: true,
    });
  },

  // ── Update ─────────────────────────────────────────────────────────────
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        studentNumber: true,
        role: true,
        year: true,
        gender: true,
        phoneNumber: true,
        department: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // ── Delete ─────────────────────────────────────────────────────────────
  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  async deleteMany(ids) {
    return prisma.user.deleteMany({ where: { id: { in: ids } } });
  },
};