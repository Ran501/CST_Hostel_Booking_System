"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import ConfirmationDialog from "../../../../confirmation";
import SpecialBlock from "../../../../room/components/SpecialBlock";

import {
  HD_NAME,
  hdLeftRoomsForFloor,
  hdRightRoomsForFloor,
} from "../../../data/hd";

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 3;
}

export default function HdFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  // --- STATE ---
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // To hold backend data
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
              async function fetchRooms() {
                try {
                  setLoading(true);
                  // Replace with your actual API endpoint
                  const res = await fetch(`/api/rooms?floor=${floorNum}&building=HD`);
                  const data = await res.json();
                  if (data.success) setRoomsData(data.rooms || []);
                } catch (err) {
                  console.error("Fetch error:", err);
                } finally {
                  setLoading(false);
                }
              }
              if (isValid) fetchRooms();
            }, [floorNum, isValid]);
          
            const getRoomInfo = (roomNo) => {
              const fullRoomId = `${HD_NAME}-${roomNo}`;
              return roomsData.find((r) => String(r.roomNumber) === fullRoomId);
            };

  useEffect(() => {
    if (!isValid) {
      router.replace("/rooms/7/floor/1");
    }
  }, [isValid, router]);

  // --- SIMPLE BOOKING ACTION ---
  function handleConfirmBooking() {
    if (selectedRoom === null) return;
    
    // Simple confirmation dialog logic - no API calls
    alert(`Room ${HD_NAME}-${selectedRoom} booking confirmed! (UI Only - No Backend)`);
    setSelectedRoom(null);
  }

  const leftRooms = useMemo(
    () => hdLeftRoomsForFloor(floorNum),
    [floorNum]
  );
  const rightRooms = useMemo(
    () => hdRightRoomsForFloor(floorNum),
    [floorNum]
  );
  const totalRooms = leftRooms.length + rightRooms.length;
  const totalBeds = totalRooms * 2;

  // --- SIMPLE ROOM BLOCK COMPONENT ---
  const RoomBlock = ({ room }) => {
    const isSelected = selectedRoom === room;
    const roomInfo = getRoomInfo(room);
    if (!roomInfo) {
        return (
          <div className="w-full h-full rounded-xl border border-slate-200 bg-slate-50 animate-pulse flex items-center justify-center">
            <span className="text-[10px] text-slate-400">Loading...</span>
          </div>
        );
      }
  
  // 2. Extract database values
      const dbValue = roomInfo.isActive ?? roomInfo.is_active;
      const isRoomActive = dbValue !== false && String(dbValue).toUpperCase().trim() !== "FALSE";
      const occupied = roomInfo.occupied || 0;
      const capacity = roomInfo.capacity || 3;
  
      // 3. Calculate states
      const isFully = occupied >= capacity;
      const isPartial = occupied > 0 && occupied < capacity;
  
      // 4. Assign dynamic CSS colors
      const colors = !isRoomActive
        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
        : isFully
          ? "border-red-200 bg-red-50 text-red-700 cursor-not-allowed ring-1 ring-red-300/70"
          : isSelected
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300/70"
            : isPartial
              ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300/80 hover:bg-amber-50/80 hover:-translate-y-0.5 hover:shadow-md"
              : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md";


    return (
      <button
        className={`
          cursor-pointer group relative rounded-xl border bg-white text-slate-800 shadow-sm 
          transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
          w-full h-full border-slate-300
          ${isSelected ? "ring-2 ring-emerald-300" : ""}
        `}
        onClick={() => setSelectedRoom(room)}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight px-2">
          <span className="text-sm xs:text-base sm:text-base font-semibold tracking-wide">
            {room}
          </span>
          <span className="text-[9px] xs:text-[10px] sm:text-[11px] text-slate-700 whitespace-nowrap">
            {!isRoomActive
              ? roomInfo.disabledReason || "Inactive"
              : isFully
                ? "Fully Booked"
                : isPartial
                  ? `${occupied}/${capacity} Occupied`
                  : `0/${capacity} Available`}
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/60"
        />
      </button>
    );
  };

  /* ================= UPDATED LAYOUT ================= */

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Mobile hamburger menu button */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-500">
            <Link
              href="/"
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

          <h1 className="text-center text-base xs:text-lg font-semibold tracking-wide flex-1">
            {HD_NAME} {floorLabel(floorNum)} floor
          </h1>

          <div className="flex items-center gap-2">
            
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5 text-xs"
              aria-label="Toggle floor menu"
            >
              <span className="font-small text-cstcolor font-bold">Floor</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-3 w-3 text-slate-700 transition-transform ${sidebarOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
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
                baseHref="/rooms/7/floor"
                floors={[1, 2, 3]}
              />
            </div>
          </div>
        )}

        {/* Desktop header */}
        <div className="hidden md:flex items-center mb-4 sm:mb-5 lg:mb-6">
          <div className="flex items-center text-slate-500">
            <Link
              href="/"
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

          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide">
              {HD_NAME} {floorLabel(floorNum)} floor
            </h1>
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span className="hidden sm:inline">
                <span className="font-medium">Total Rooms:</span> {totalRooms}
              </span>
              <span className="hidden sm:inline">
                <span className="font-medium">Total Beds:</span> {totalBeds}
              </span>
            </div>
          </div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Sidebar */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/7/floor"
                floors={[1, 2, 3]}
              />
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12">
                  {/* Left column rooms */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {floorNum === 1 ? (
                      <>
                        {/* Top left rooms for floor 1 (first 4) */}
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

                        {/* Enter sign for floor 1 */}
                        <div className="my-3 sm:my-4 md:my-6 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>Enter →</span>
                        </div>

                        {/* Bottom left rooms for floor 1 (last 3) */}
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
                        {/* All left rooms for floors 2 & 3 */}
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

                  {/* Corridor */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] xs:w-[2px] bg-slate-300/60" />
                  </div>

                  {/* Right column rooms */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {/* Top washroom */}
                    <div className="w-full flex justify-center">
                      <SpecialBlock text="🚻  Washroom" type="washroom" />
                    </div>

                    {floorNum === 2 || floorNum === 3 ? (
                      <>
                        {/* Floors 2 & 3: Top stack */}
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

                        {/* Spacing between stacks */}
                        <div className="my-3 sm:my-4 md:my-6 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>← Enter </span>
                        </div>

                        {/* Bottom stack: Rooms + Washroom */}
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
                          <SpecialBlock text="🚻  Washroom" type="washroom" />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Floor 1 rendering */}
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

                        {/* Stairs indicator */}
                        <div className="h-6 sm:h-7 md:h-8 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-slate-600">
                            Stairs →
                          </span>
                        </div>

                        {/* Bottom stack for floor 1 */}
                        <div className="flex flex-col items-center mt-0 gap-2 xs:gap-3 sm:gap-3 md:gap-4">
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

                          {/* Bottom washroom for floor 1 */}
                          <div className="w-full flex justify-center">
                            <SpecialBlock text="🚻  Washroom" type="washroom" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </section>

              <div className="mt-4 sm:mt-5 lg:mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Do you want to book a bed in Room ${HD_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}