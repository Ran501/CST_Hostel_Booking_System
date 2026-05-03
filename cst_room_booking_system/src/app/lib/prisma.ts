import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Create the adapter with your DATABASE_URL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!, // must be defined
});

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ["query"], // now this works
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
