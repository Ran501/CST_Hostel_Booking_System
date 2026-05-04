"use client";

import Link from "next/link";
import { use, useState } from "react";
import RoomLegend from "../../../components/RoomLegend";
import FloorSidebar from "../../../components/FloorSidebar";
import ConfirmationDialog from "../../../../confirmation";
import {
  HE_NAME,
  HE_FLOORS,
  HE_FLOOR_META,
  floor1TopRow,
  floor1BottomRow,
  floor2TopRowGroupA,
  floor2TopRowGroupB,
  floor2TopRowGroupC,
  floor2BottomRowGroupA,
  floor2BottomRowGroupB,
  floor2BottomRowGroupC,
} from "../../../data/he";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function floorLabel(n) {
  return ["First", "Second"][n - 1] ?? String(n);
}

function isValidFloor(n) {
  return Number.isFinite(n) && n >= 1 && n <= 2;
}

// ─────────────────────────────────────────────────────────────────────────────
// Room Status
// ─────────────────────────────────────────────────────────────────────────────
const STATUS = {
  AVAILABLE: "available",
  BOOKED:    "booked",
  SELECTED:  "selected",
};

const STATUS_STYLES = {
  [STATUS.AVAILABLE]: {
    border: "border-slate-200",
    bg:     "bg-white",
    text:   "text-slate-400",
    ring:   "",
    label:  "Available",
  },
  [STATUS.BOOKED]: {
    border: "border-red-300",
    bg:     "bg-red-50",
    text:   "text-red-400",
    ring:   "",
    label:  "Booked",
  },
  [STATUS.SELECTED]: {
    border: "border-emerald-400",
    bg:     "bg-emerald-50",
    text:   "text-emerald-600",
    ring:   "ring-2 ring-emerald-300",
    label:  "Selected",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared Primitive Components
// ─────────────────────────────────────────────────────────────────────────────

/** Standard room tile — portrait orientation matching the floor plan */
function RoomBlock({ room, status, onClick }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[STATUS.AVAILABLE];
  const clickable = status !== STATUS.BOOKED;
  return (
    <button
      disabled={!clickable}
      onClick={clickable ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center
        rounded-lg border-2 shadow-sm transition-all duration-200
        w-full h-full
        ${s.border} ${s.bg} ${s.ring}
        ${clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-not-allowed opacity-60"}
      `}
    >
      <span className="text-[11px] xs:text-sm sm:text-base font-semibold tracking-wider text-slate-700">
        {room}
      </span>
      <span className={`text-[8px] xs:text-[9px] sm:text-[10px] font-medium mt-0.5 ${s.text}`}>
        {s.label}
      </span>
    </button>
  );
}

/** Non-bookable utility block (Washroom, MESS, etc.) */
function UtilityBlock({ label, className = "" }) {
  const isWashroom = label.toLowerCase().includes("washroom");
  const baseClasses = "flex items-center justify-center rounded-lg border-2";
  const typeClasses = isWashroom
    ? "border-dashed border-blue-400 bg-blue-50 text-blue-700"
    : "border-slate-200 bg-slate-50 text-slate-500";

  return (
    <div className={`${baseClasses} ${typeClasses} ${className}`}>
      <span className="text-xs sm:text-sm font-medium px-2 text-center">
        {label}
      </span>
    </div>
  );
}

/** Stair indicator */
function StairLabel({ direction = "up", label = "Stair" }) {
  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      {direction === "up" && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500"
          fill="none" viewBox="0 0 24 24"
          stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      )}
      <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium">
        {label}
      </span>
    </div>
  );
}
// FLOOR 1 Plan
function Floor1Plan({ getStatus, onRoomClick }) {
  const topRow    = floor1TopRow();    // [101..106]
  const bottomRow = floor1BottomRow(); // [112..107]

  // Room tile dimensions — portrait blocks
  const RH = "h-[70px] xs:h-[80px] sm:h-[90px] md:h-[100px]";
  const RW = "w-[46px] xs:w-[54px] sm:w-[62px] md:w-[72px]";

  return (
    <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* MESS Area */}
        <div className="flex-shrink-0 w-[160px] md:w-[220px] lg:w-[260px]">
          <UtilityBlock
            label="MESS Area"
            className="w-full h-[240px] sm:h-[240px] md:h-[300px] text-base sm:text-lg font-semibold border-slate-300"
          />
        </div>

        {/* Room section */}
        <div className="flex-1 flex flex-col gap-3 sm:gap-4">
          {/* Washroom */}
          <div className="w-full max-w-[380px] sm:max-w-none self-end">
            <UtilityBlock label="Washroom" className="h-[36px] sm:h-[40px] md:h-[44px] w-full" />
          </div>

          {/* Stair + Top row */}
          <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
            <div className="pt-1">
              <StairLabel label="Stair" />
            </div>
            <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
              {topRow.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
          </div>

          {/* Gap between rows */}
          <div className="h-2 sm:h-3" />

          {/* Bottom row */}
          <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pl-8 xs:pl-9 sm:pl-10">
            {bottomRow.map((r) => (
              <div key={r} className={`${RW} ${RH}`}>
                <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
              </div>
            ))}
          </div>

          {/* Entrance */}
          <div className="self-start -ml-4 pl-0">
            <StairLabel direction="up" label="Entrance" />
          </div>
        </div>
      </div>

      {/* Mobile: Vertical layout */}
      <div className="sm:hidden flex flex-col gap-3">
        {/* MESS Area */}
        <UtilityBlock label="MESS Area" className="w-full h-[70px] text-sm font-semibold border-slate-300" />
        
        {/* Two vertical columns */}
        <div className="flex gap-3">
          {/* Left column - 6 rooms */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-center text-xs font-medium text-slate-600 mb-1">Left Side</div>
            {topRow.map((r) => (
              <div key={r} className={`${RW} ${RH}`}>
                <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
              </div>
            ))}
          </div>

          {/* Right column - 6 rooms */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-center text-xs font-medium text-slate-600 mb-1">Right Side</div>
            {bottomRow.map((r) => (
              <div key={r} className={`${RW} ${RH}`}>
                <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
// FLOOR 2 Plan
function Floor2Plan({ getStatus, onRoomClick }) {
  const topA    = floor2TopRowGroupA();    // [224..228]
  const topB    = floor2TopRowGroupB();    // [229..233]
  const topC    = floor2TopRowGroupC();    // [201..206]
  const botA    = floor2BottomRowGroupA(); // [222..218]
  const botB    = floor2BottomRowGroupB(); // [217..213]
  const botC    = floor2BottomRowGroupC(); // [212..207]

  const RH = "h-[64px] xs:h-[74px] sm:h-[84px] md:h-[96px]";
  const RW = "w-[40px] xs:w-[48px] sm:w-[56px] md:w-[66px]";

  /** Renders a horizontal group of room tiles */
  const RoomGroup = ({ rooms }) => (
    <div className="flex gap-1 xs:gap-1.5 sm:gap-2">
      {rooms.map((r) => (
        <div key={r} className={`${RW} ${RH}`}>
          <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-5 overflow-x-auto pb-1">

      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex flex-col gap-4 sm:gap-5">
        {/* ── TOP ROW ── */}
        <div className="flex items-end gap-2 sm:gap-3 md:gap-4 min-w-max">

          {/* Group A */}
          <RoomGroup rooms={topA} />

          {/* Gap */}
          <div className="w-2 sm:w-3 md:w-4 flex-shrink-0" />

          {/* Group B */}
          <RoomGroup rooms={topB} />

          {/* Stairs */}
          <div className="flex-shrink-0 pb-1 px-1">
            <StairLabel label="Stairs" direction="up" />
          </div>

          {/* Group C */}
          <RoomGroup rooms={topC} />

          {/* Washroom — top right */}
          <div className="flex-shrink-0 self-start">
            <UtilityBlock
              label="Washroom"
              className="h-[36px] sm:h-[40px] md:h-[44px] w-[90px] sm:w-[110px] md:w-[130px]"
            />
          </div>
        </div>

        {/* ── BOTTOM ROW ── */}
        <div className="flex items-start gap-2 sm:gap-3 md:gap-4 min-w-max">

          {/* Group A */}
          <div className="flex flex-col gap-1">
            <RoomGroup rooms={botA} />
          </div>

          {/* Gap */}
          <div className="w-2 sm:w-3 md:w-4 flex-shrink-0" />

          {/* Group B + Balcony label */}
          <div className="flex flex-col items-center gap-1">
            <RoomGroup rooms={botB} />
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Balcony
            </span>
          </div>

          {/* Spacer aligned with Stairs above */}
          <div className="flex-shrink-0 px-1 w-[40px] sm:w-[50px]" />

          {/* Group C + Balcony label */}
          <div className="flex flex-col items-center gap-1">
            <RoomGroup rooms={botC} />
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Balcony
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: Vertical layout */}
      <div className="sm:hidden flex flex-col gap-4">
        {/* Washroom at top */}
        <div className="w-full">
          <UtilityBlock
            label="Washroom"
            className="h-[36px] w-full text-sm border-blue-400 bg-blue-50 text-blue-700"
          />
        </div>

        {/* Stairs */}
        <div className="flex justify-center">
          <StairLabel label="Stairs" direction="up" />
        </div>

        {/* All rooms in vertical columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Left column - Top groups */}
          <div className="flex flex-col gap-2">
            <div className="text-center text-xs font-medium text-slate-600 mb-1">Top A</div>
            <div className="flex flex-col gap-1">
              {topA.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
            
            <div className="text-center text-xs font-medium text-slate-600 mb-1 mt-2">Bottom A</div>
            <div className="flex flex-col gap-1">
              {botA.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Top groups */}
          <div className="flex flex-col gap-2">
            <div className="text-center text-xs font-medium text-slate-600 mb-1">Top B</div>
            <div className="flex flex-col gap-1">
              {topB.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
            
            <div className="text-center text-xs font-medium text-slate-600 mb-1 mt-2">Bottom B</div>
            <div className="flex flex-col gap-1">
              {botB.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Third row - Top C and Bottom C */}
        <div className="flex flex-col gap-2">
          <div className="text-center text-xs font-medium text-slate-600 mb-1">Top C & Bottom C</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              {topC.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {botC.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
                  <RoomBlock room={r} status={getStatus(r)} onClick={() => onRoomClick(r)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Balcony labels */}
        <div className="flex justify-around text-xs text-slate-500 font-medium">
          <span>Balcony A</span>
          <span>Balcony B</span>
          <span>Balcony C</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HeFloorPage({ params }) {
  const { floor } = use(params);
  const rawFloor  = Number(floor);
  const floorNum  = isValidFloor(rawFloor) ? rawFloor : 1;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  // Swap with real API data: e.g. const [bookedRooms] = useState(new Set([101, 205]));
  const [bookedRooms] = useState(new Set());

  const meta = HE_FLOOR_META[floorNum] ?? HE_FLOOR_META[1];

  function getStatus(room) {
    if (room === selectedRoom)  return STATUS.SELECTED;
    if (bookedRooms.has(room))  return STATUS.BOOKED;
    return STATUS.AVAILABLE;
  }

  function handleRoomClick(room) {
    setSelectedRoom((prev) => (prev === room ? null : room));
  }

  function handleConfirmBooking() {
    if (selectedRoom === null) return;
    alert(`Room ${HE_NAME}-${selectedRoom} booked! (UI only — connect your API)`);
    setSelectedRoom(null);
  }

  const floorPlanProps = { getStatus, onRoomClick: handleRoomClick };

  const PLANS = {
    1: <Floor1Plan {...floorPlanProps} />,
    2: <Floor2Plan {...floorPlanProps} />,
  };

  const BackArrow = () => (
    <Link
      href="/"
      className="inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
      </svg>
    </Link>
  );

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">

        {/* ══════════════════════════════════════════════
            MOBILE HEADER
        ══════════════════════════════════════════════ */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <BackArrow />

          <h1 className="flex-1 text-center text-base xs:text-lg font-semibold tracking-wide">
            {HE_NAME} {floorLabel(floorNum)} floor
          </h1>

          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="cursor-pointer px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5 text-xs"
            aria-label="Toggle floor menu"
          >
            <span className="font-bold text-slate-700">Floor</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-3 w-3 text-slate-700 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ══════════════════════════════════════════════
            MOBILE SIDEBAR DRAWER
        ══════════════════════════════════════════════ */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-56 bg-white shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/10/floor"
                floors={HE_FLOORS}
              />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            DESKTOP HEADER
        ══════════════════════════════════════════════ */}
        <div className="hidden md:flex items-center mb-4 sm:mb-5 lg:mb-6">
          <BackArrow />
          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide">
              {HE_NAME} {floorLabel(floorNum)} floor
            </h1>
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span>
                <span className="font-medium">Total Rooms:</span> {meta.totalRooms}
              </span>
              <span>
                <span className="font-medium">Total Beds:</span> {meta.totalBeds}
              </span>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            BODY: SIDEBAR + FLOOR PLAN
        ══════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">

          {/* Desktop sidebar */}
          <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
            <FloorSidebar
              currentFloor={floorNum}
              baseHref="/rooms/10/floor"
              floors={HE_FLOORS}
            />
          </div>

          {/* Floor plan + legend */}
          <div className="flex-1 min-w-0">
            <section className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur w-full overflow-x-auto">
              {PLANS[floorNum]}
            </section>

            <div className="mt-4 sm:mt-5">
              <RoomLegend />
            </div>
          </div>
        </div>
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Do you want to book a bed from Room ${HE_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}