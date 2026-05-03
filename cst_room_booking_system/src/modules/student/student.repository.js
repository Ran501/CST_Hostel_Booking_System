// src/modules/student/student.repository.js
import { prisma } from "../../app/lib/prisma";

export const studentRepository = {
  /**
   * Cursor-based pagination: returns `limit` users after the given cursor.
   * @param {object} params
   * @param {string|null} params.cursor  - last seen `id` from previous page (null for first page)
   * @param {number}      params.limit   - number of records per page (default 50)
   * @param {string}      params.search  - search by name / email / studentNumber
   * @param {string}      params.department - filter by department ("" = all)
   * @param {string|number} params.year  - filter by year ("" = all)
   */
  async findAll({ cursor = null, limit = 50, search = "", department = "", year = "" }) {
    const take = Math.min(Number(limit) || 50, 100); // cap at 100

    const where = {
      role: "user",
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { studentNumber: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(department && { department }),
      ...(year !== "" && year !== "All" && { year: Number(year) }),
    };

    const queryArgs = {
      where,
      take: take + 1, // fetch one extra to determine if there's a next page
      orderBy: { id: "desc" },
    };

    if (cursor) {
      queryArgs.cursor = { id: cursor };
      queryArgs.skip = 1; // skip the cursor itself
    }

    const students = await prisma.user.findMany(queryArgs);

    const hasNextPage = students.length > take;
    const data = hasNextPage ? students.slice(0, take) : students;
    const nextCursor = hasNextPage ? data[data.length - 1].id : null;

    const total = await prisma.user.count({ where });

    return { data, nextCursor, hasNextPage, total };
  },

  async create(data) {
    return prisma.user.create({ data });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data });
  },

  async deleteOne(id) {
    return prisma.user.delete({ where: { id } });
  },

  async deleteMany(ids) {
    return prisma.user.deleteMany({ where: { id: { in: ids } } });
  },

  async createMany(data) {
    return prisma.user.createMany({ data, skipDuplicates: true });
  },

  async findAllForExport({ department = "", year = "" } = {}) {
    return prisma.user.findMany({
      where: {
        role: "user",
        ...(department && { department }),
        ...(year !== "" && year !== "All" && { year: Number(year) }),
      },
      orderBy: [{ department: "asc" }, { name: "asc" }],
    });
  },
};