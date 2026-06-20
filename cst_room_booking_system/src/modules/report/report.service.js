// src/modules/report/report.service.js
import {
  getStudentAggregates,
  getHostelsWithFloors,
  getRoomAggregatesByHostel,
  getRoomAggregatesByHostelAndFloor,
  getActiveBookingsForYearBreakdown,
} from "../../modules/report/report.repository";
import { cache } from "../../app/lib/cache"; // corrected path

const REPORT_CACHE_KEY = "admin:reports";
const REPORT_CACHE_TTL = 120; // seconds

// ─── stampede guard ──────────────────────────────────────────────────────────
let pendingReportPromise = null;

// ─── helpers ────────────────────────────────────────────────────────────────

function indexBy(rows, keyFn, valueFn) {
  const map = new Map();
  for (const row of rows) {
    map.set(keyFn(row), valueFn(row));
  }
  return map;
}

// ─── student stats ───────────────────────────────────────────────────────────

function buildStudentStats({ activeBreakdown, genderBreakdown, yearBreakdown }) {
  let active = 0, inactive = 0, total = 0;
  for (const row of activeBreakdown) {
    const n = row._count.id;
    total += n;
    if (row.isActive) active += n;
    else inactive += n;
  }

  let male = 0, female = 0;
  for (const row of genderBreakdown) {
    const g = (row.gender ?? "").toLowerCase();
    if (g === "male") male += row._count.id;
    else if (g === "female") female += row._count.id;
  }

  const byYear = yearBreakdown.map((row) => ({
    year:  row.year,
    count: row._count.id,
  }));

  return { total, active, inactive, male, female, byYear };
}

// ─── hostel summaries ────────────────────────────────────────────────────────

function buildHostelSummaries({ hostels, roomByHostel, roomByHostelAndFloor, bookingByRoom }) {
  return hostels.map((hostel) => {
    const roomAgg   = roomByHostel.get(hostel.id);
    const capacity  = roomAgg?._sum?.capacity ?? 0;
    const roomCount = roomAgg?._count?.id     ?? 0;

    let occupiedBeds = 0;
    const floors = hostel.floorAllocations.map((fa) => {
      const floorAgg = roomByHostelAndFloor.get(`${hostel.id}::${fa.floor}`);
      const floorCap = floorAgg?._sum?.capacity ?? 0;
      const floorOcc = bookingByRoom.floorOccupancy.get(`${hostel.id}::${fa.floor}`) ?? 0;
      occupiedBeds  += floorOcc;

      return {
        floor:         fa.floor,
        studentYear:   fa.studentYear,
        roomCount:     floorAgg?._count?.id ?? 0,
        capacity:      floorCap,
        occupiedBeds:  floorOcc,
        availableBeds: Math.max(0, floorCap - floorOcc),
      };
    });

    const hostelTotalOcc = bookingByRoom.hostelOccupancy.get(hostel.id) ?? 0;
    const finalOccupied  = Math.max(occupiedBeds, hostelTotalOcc);

    return {
      id:            hostel.id,
      hostelName:    hostel.hostelName,
      gender:        hostel.gender,
      status:        hostel.status,
      numberOfFloor: hostel.numberOfFloor,
      roomCount,
      capacity,
      occupiedBeds:  finalOccupied,
      availableBeds: Math.max(0, capacity - finalOccupied),
      occupancyPct:  capacity > 0 ? Math.round((finalOccupied / capacity) * 100) : 0,
      floors,
    };
  });
}

// ─── year breakdown ──────────────────────────────────────────────────────────

function buildYearBreakdown({ studentStats, activeBookings, hostels }) {
  const hostelNameById = new Map(hostels.map((h) => [h.id, h.hostelName]));
  const residentByYear = new Map();

  for (const b of activeBookings) {
    const year       = b.user?.year ?? "Unknown";
    const hostelName = hostelNameById.get(b.room?.hostel_id) ?? "Unknown";

    if (!residentByYear.has(year)) {
      residentByYear.set(year, { total: 0, byHostel: new Map() });
    }
    const entry = residentByYear.get(year);
    entry.total++;
    entry.byHostel.set(hostelName, (entry.byHostel.get(hostelName) ?? 0) + 1);
  }

  return studentStats.byYear.map(({ year, count }) => {
    const entry    = residentByYear.get(year);
    const residing = entry?.total ?? 0;
    const byHostel = entry?.byHostel ?? new Map();

    return {
      year,
      totalStudents: count,
      residing,
      notResiding:   count - residing,
      hostels: [...byHostel.entries()]
        .map(([hostelName, c]) => ({ hostelName, count: c }))
        .sort((a, b) => b.count - a.count),
    };
  });
}

// ─── booking occupancy index builder ─────────────────────────────────────────

function buildOccupancyIndexes(activeBookings) {
  const hostelOccupancy = new Map();
  const floorOccupancy  = new Map();

  for (const b of activeBookings) {
    const hostelId = b.room?.hostel_id;
    const floor    = b.room?.floor;   // now available

    if (hostelId != null) {
      hostelOccupancy.set(hostelId, (hostelOccupancy.get(hostelId) ?? 0) + 1);
    }
    if (hostelId != null && floor != null) {
      const key = `${hostelId}::${floor}`;
      floorOccupancy.set(key, (floorOccupancy.get(key) ?? 0) + 1);
    }
  }

  return { hostelOccupancy, floorOccupancy };
}

// ─── public API ──────────────────────────────────────────────────────────────

export function invalidateAdminReportCache() {
  cache.del(REPORT_CACHE_KEY);
  // Optionally, if you want to abort a pending computation, you could set
  // pendingReportPromise = null; but then the ongoing request will still finish
  // and write to cache, which is acceptable. We leave it as is.
}

export async function getAdminReportData() {
  // 1. Check cache
  const hit = cache.get(REPORT_CACHE_KEY);
  if (hit) {
    return { ...hit, cached: true };
  }

  // 2. If a computation is already in flight, wait for it
  if (pendingReportPromise) {
    return pendingReportPromise;
  }

  // 3. Start new computation – guard against concurrent runs
  pendingReportPromise = (async () => {
    try {
      // Fire all DB queries in parallel
      const [
        studentAggregates,
        hostels,
        roomByHostelRaw,
        roomByHostelAndFloorRaw,
        activeBookings,
      ] = await Promise.all([
        getStudentAggregates(),
        getHostelsWithFloors(),
        getRoomAggregatesByHostel(),
        getRoomAggregatesByHostelAndFloor(),
        getActiveBookingsForYearBreakdown(),
      ]);

      // Build lookup maps
      const roomByHostel = indexBy(
        roomByHostelRaw,
        (r) => r.hostel_id,
        (r) => ({ _sum: r._sum, _count: r._count })
      );
      const roomByHostelAndFloor = indexBy(
        roomByHostelAndFloorRaw,
        (r) => `${r.hostel_id}::${r.floor}`,
        (r) => ({ _sum: r._sum, _count: r._count })
      );
      const bookingByRoom = buildOccupancyIndexes(activeBookings);

      // Assemble report sections
      const studentStats    = buildStudentStats(studentAggregates);
      const hostelSummaries = buildHostelSummaries({
        hostels,
        roomByHostel,
        roomByHostelAndFloor,
        bookingByRoom,
      });
      const yearBreakdown = buildYearBreakdown({
        studentStats,
        activeBookings,
        hostels,
      });

      const data = {
        students:      studentStats,
        hostels:       hostelSummaries,
        yearBreakdown,
      };

      // Store in cache (with TTL)
      cache.set(REPORT_CACHE_KEY, data, REPORT_CACHE_TTL);

      return { ...data, cached: false };
    } finally {
      // Clear the pending promise regardless of success or failure
      pendingReportPromise = null;
    }
  })();

  return pendingReportPromise;
}