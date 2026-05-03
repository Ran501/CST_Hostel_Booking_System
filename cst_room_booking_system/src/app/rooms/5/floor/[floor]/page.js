"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import ConfirmationDialog from "../../../../confirmation";
import SpecialBlock from "../../../../room/components/SpecialBlock";

import {
  HB_NAME,
  hbLeftRoomsForFloor,
  hbRightRoomsForFloor,
} from "../../../data/hb";

/* ================= HELPERS ================= */

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 3;
}

/* ================= PAGE ================= */

export default function HbFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  /* ================= STATE ================= */

  // Simple States
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simple redirect logic
  useEffect(() => {
    if (!isValid) router.replace("/rooms/5/floor/1");
  }, [isValid, router]);

  /* ================= DATA ================= */

  const leftRooms = useMemo(
    () => hbLeftRoomsForFloor(floorNum),
    [floorNum]
  );
  const rightRooms = useMemo(
    () => hbRightRoomsForFloor(floorNum),
    [floorNum]
  );

  const allRooms = [...leftRooms, ...rightRooms];
  const totalRooms = allRooms.length;
  const totalBeds = totalRooms * 2;

  // Simple booking action - no API calls
  function handleConfirmBooking() {
    if (selectedRoom === null) return;
    
    // Simple confirmation dialog logic - no API calls
    alert(`Room ${HB_NAME}-${selectedRoom} booking confirmed! (UI Only - No Backend)`);
    setSelectedRoom(null);
  }

  // Simple Room Block component - no API calls
  const RoomBlock = ({ room }) => {
    const isSelected = selectedRoom === room;

    return (
      <button
        onClick={() => setSelectedRoom(room)}
        className={`
          group relative rounded-xl border bg-white text-slate-800 shadow-sm 
          transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
          w-full h-full border-slate-300
          ${isSelected ? "ring-2 ring-emerald-300" : ""}
        `}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight px-2">
          <span className="text-sm xs:text-base sm:text-base font-semibold tracking-wide">
            {room}
          </span>
          <span className="text-[9px] xs:text-[10px] font-bold uppercase whitespace-nowrap text-green-600">
            Available
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/60" />
      </button>
    );
  };

  /* ================= UPDATED LAYOUT (FROM 2ND FILE) ================= */

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Mobile hamburger menu button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg bg-white border border-slate-200 shadow-sm"
            aria-label="Toggle floor menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <span
                className={`w-6 h-0.5 bg-slate-700 transition-transform ${
                  sidebarOpen ? "rotate-45 translate-y-1.5" : ""
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-slate-700 transition-opacity ${
                  sidebarOpen ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`w-6 h-0.5 bg-slate-700 transition-transform ${
                  sidebarOpen ? "-rotate-45 -translate-y-1.5" : ""
                }`}
              />
            </div>
          </button>

          <div className="text-sm text-slate-600 flex gap-4">
            <span className="hidden xs:inline">
              <span className="font-medium">Rooms:</span> {totalRooms}
            </span>
            <span>
              <span className="font-medium">Beds:</span> {totalBeds}
            </span>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="md:hidden fixed inset-0 z-50 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          >
            <div
              className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/5/floor"
                floors={[1, 2, 3]}
              />
            </div>
          </div>
        )}

        <div className="mb-4 flex items-center text-slate-500">
          <Link
            href="/"
            aria-label="Go back"
            className="inline-flex items-center hover:text-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 12H5m7-7l-7 7 7 7"
              />
            </svg>
          </Link>
        </div>

        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide">
            {HB_NAME} {floorLabel(floorNum)} floor
          </h1>
          <div className="text-sm text-slate-600 flex gap-4 sm:gap-6">
            <span className="hidden sm:inline">
              <span className="font-medium">Total Rooms:</span> {totalRooms}
            </span>
            <span className="hidden sm:inline">
              <span className="font-medium">Total Beds:</span> {totalBeds}
            </span>
          </div>
        </div>

        {/* Tablet and Desktop Layout - Now visible on ALL screens */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Sidebar - hidden on mobile, visible on tablet and up */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/5/floor"
                floors={[1, 2, 3]}
              />
            </div>

            {/* Main content area with responsive scaling - ALWAYS visible */}
            <div className="flex-1 min-w-0">
              {/* Spatial layout container with responsive padding and sizing */}
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                {/* Main grid layout - responsive spacing */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12">
                  {/* Left column - Original rightRooms from your code */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {floorNum === 1 ? (
                      <>
                        {/* Top washroom */}
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚿 Washroom" type="washroom" />
                        </div>

                        {/* Rooms 1-3 */}
                        {rightRooms.slice(0, 3).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        {/* Spacing */}
                        <div className="h-6 sm:h-7 md:h-8" />

                        {/* Rooms 4-5 */}
                        {rightRooms.slice(3, 5).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        {/* Bottom washroom */}
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚿 Washroom" type="washroom" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Top washroom for floors 2 & 3 */}
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚿 Washroom" type="washroom" />
                        </div>

                        {/* Rooms 1-3 for floors 2 & 3 */}
                        {rightRooms.slice(0, 3).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        {/* Enter sign for floors 2 & 3 - CHANGED: Removed 'hidden md:flex' */}
                        <div className="my-3 sm:my-4 md:my-6 h-6 w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600 flex">
                          <span>Enter → </span>
                        </div>

                        {/* Rooms 4-5 for floors 2 & 3 */}
                        {rightRooms.slice(3, 5).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        {/* Bottom washroom for floors 2 & 3 */}
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚿 Washroom" type="washroom" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Corridor */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] xs:w-[2px] bg-slate-300/60" />
                  </div>

                  {/* Right column - Original leftRooms from your code */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {floorNum === 1 ? (
                      <>
                        {/* Rooms 1-4 for floor 1 */}
                        {leftRooms.slice(0, 4).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        {/* Enter sign for floor 1 - CHANGED: Removed 'hidden md:flex' */}
                        <div className="my-3 sm:my-4 md:my-6 h-6 w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600 flex">
                          <span>← Enter</span>
                        </div>

                        {/* Rooms 5-7 for floor 1 */}
                        {leftRooms.slice(4).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* All rooms for floors 2 & 3 */}
                        {leftRooms.map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </section>

              {/* Legend with responsive spacing - ALWAYS visible */}
              <div className="mt-4 sm:mt-5 lg:mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {selectedRoom && (
          <ConfirmationDialog
            message={`Reserve one bed in Room ${HB_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
        
      </div>
    </main>
  );
}