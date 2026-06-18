// scripts/loadtest-booking.mjs
//
// Realistic load test for POST /api/booking using UNIQUE students per request
// (a naive autocannon run only measures the "already booked" rejection path).
//
// It seeds isolated test data, fires concurrent bookings at your RUNNING server,
// prints latency percentiles + a status breakdown, then deletes everything it
// created. All test data is namespaced with a "LOADTEST" prefix so cleanup is safe.
//
// PREREQUISITES
//   1. Build + start the server in another terminal (same DATABASE_URL):
//        npm run build
//        EMAIL_USER= EMAIL_PASS= npm run start     # email disabled so it doesn't skew results
//   2. Then run this script from the project root:
//        node scripts/loadtest-booking.mjs
//
// CONFIG via env vars:
//   TOTAL=500 CONCURRENCY=100 BASE_URL=http://localhost:3000 node scripts/loadtest-booking.mjs
//   CLEANUP_ONLY=1 node scripts/loadtest-booking.mjs        # just remove leftover test data

import 'dotenv/config';
import { createRequire } from 'node:module';
import { PrismaPg } from '@prisma/adapter-pg';

const require = createRequire(import.meta.url);
const { PrismaClient } = require('../src/generated/prisma');

// ---- config -------------------------------------------------------------
const TOTAL = Number(process.env.TOTAL ?? 500);          // total bookings to attempt
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 100); // requests in flight at once
const BASE_URL = (process.env.BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const CLEANUP_ONLY = process.env.CLEANUP_ONLY === '1';

const PREFIX = 'LOADTEST';
const HOSTEL_NAME = `${PREFIX}_HOSTEL`;
const PERIOD_YEAR = 9999;       // marker to find/delete the test booking period
const ROOM_CAPACITY = 3;
const pad = (n) => String(n).padStart(5, '0');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ---- cleanup (safe: only touches PREFIX-namespaced rows) -----------------
async function cleanup() {
  await prisma.booking.deleteMany({ where: { studentNumber: { startsWith: PREFIX } } });
  await prisma.user.deleteMany({ where: { studentNumber: { startsWith: PREFIX } } });
  // Deleting the hostel cascades its rooms (and any of their bookings).
  await prisma.hostel.deleteMany({ where: { hostelName: HOSTEL_NAME } });
  await prisma.bookingPeriod.deleteMany({ where: { year: PERIOD_YEAR } });
}

// ---- seed isolated, valid test data --------------------------------------
async function seed() {
  const numRooms = Math.ceil(TOTAL / ROOM_CAPACITY);

  // An active period so bookings are allowed (coexists fine with any real one).
  await prisma.bookingPeriod.create({
    data: {
      startDate: new Date(Date.now() - 86_400_000),
      endDate: new Date(Date.now() + 30 * 86_400_000),
      isActive: true,
      year: PERIOD_YEAR,
    },
  });

  // gender "any" => skips the gender check; year 1 matches the test users.
  const hostel = await prisma.hostel.create({
    data: {
      hostelName: HOSTEL_NAME,
      numberOfFloor: 1,
      gender: 'any',
      status: 'active',
      year: 1,
      capacity: numRooms * ROOM_CAPACITY,
      rooms: {
        create: Array.from({ length: numRooms }, (_, i) => ({
          roomNumber: `${PREFIX}-R-${pad(i)}`,
          floor: 1,
          capacity: ROOM_CAPACITY,
          status: 'available',
          year: 1,
        })),
      },
    },
  });

  // One user per booking attempt.
  const users = Array.from({ length: TOTAL }, (_, i) => ({
    email: `${PREFIX.toLowerCase()}-${pad(i)}@example.invalid`,
    studentNumber: `${PREFIX}-${pad(i)}`,
    name: `Load Test ${pad(i)}`,
    role: 'user',
    year: 1,
    gender: 'male',
    phoneNumber: `${PREFIX}-PH-${pad(i)}`,
    department: 'LOADTEST',
  }));
  await prisma.user.createMany({ data: users });

  // Map each student to a room (chunks of ROOM_CAPACITY => natural lock contention).
  const jobs = Array.from({ length: TOTAL }, (_, i) => ({
    studentNumber: `${PREFIX}-${pad(i)}`,
    roomNumber: `${PREFIX}-R-${pad(Math.floor(i / ROOM_CAPACITY))}`,
  }));
  return { hostel, jobs };
}

// ---- the load run --------------------------------------------------------
async function bookOne(job) {
  const start = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomNumber: job.roomNumber,
        studentNumber: job.studentNumber,
        checkIn: new Date().toISOString(),
        checkOut: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      }),
    });
    await res.text(); // drain body
    return { status: res.status, ms: performance.now() - start };
  } catch (err) {
    return { status: 0, ms: performance.now() - start, error: err.message };
  }
}

async function runPool(jobs, concurrency, worker) {
  const results = new Array(jobs.length);
  let idx = 0;
  async function lane() {
    while (idx < jobs.length) {
      const i = idx++;
      results[i] = await worker(jobs[i]);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, lane));
  return results;
}

function percentile(sortedMs, p) {
  if (!sortedMs.length) return 0;
  const i = Math.min(sortedMs.length - 1, Math.floor((p / 100) * sortedMs.length));
  return sortedMs[i];
}

async function main() {
  console.log('Cleaning up any leftover test data...');
  await cleanup();
  if (CLEANUP_ONLY) {
    console.log('Cleanup-only mode done.');
    return;
  }

  console.log(`Seeding ${TOTAL} test users + rooms...`);
  const { jobs } = await seed();

  console.log(
    `\nRunning: ${TOTAL} bookings @ concurrency ${CONCURRENCY} -> ${BASE_URL}/api/booking\n`
  );
  const t0 = performance.now();
  const results = await runPool(jobs, CONCURRENCY, bookOne);
  const wallSec = (performance.now() - t0) / 1000;

  // aggregate
  const byStatus = {};
  const latencies = [];
  for (const r of results) {
    byStatus[r.status] = (byStatus[r.status] || 0) + 1;
    latencies.push(r.ms);
  }
  latencies.sort((a, b) => a - b);

  const ok = byStatus[200] || 0;
  console.log('--- Results ---------------------------------------------');
  console.log(`Wall time:        ${wallSec.toFixed(2)} s`);
  console.log(`Throughput:       ${(TOTAL / wallSec).toFixed(1)} req/s`);
  console.log(`Latency p50:      ${percentile(latencies, 50).toFixed(0)} ms`);
  console.log(`Latency p95:      ${percentile(latencies, 95).toFixed(0)} ms`);
  console.log(`Latency p99:      ${percentile(latencies, 99).toFixed(0)} ms`);
  console.log(`Latency max:      ${latencies[latencies.length - 1].toFixed(0)} ms`);
  console.log('Status breakdown:');
  for (const [code, n] of Object.entries(byStatus).sort()) {
    const label = code === '200' ? 'booked'
      : code === '409' ? 'conflict (full / dup)'
      : code === '403' ? 'forbidden (rules)'
      : code === '0' ? 'NETWORK ERROR / timeout'
      : 'other';
    console.log(`  ${code} ${label}: ${n}`);
  }
  console.log(`\nSuccessful bookings: ${ok}/${TOTAL}`);
  if (byStatus[0]) {
    console.log('⚠️  Network errors/timeouts present — you hit a ceiling (pool/CPU). Investigate.');
  }
  console.log('---------------------------------------------------------');

  console.log('\nCleaning up test data...');
  await cleanup();
  console.log('Done.');
}

main()
  .catch((err) => {
    console.error('Load test failed:', err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());