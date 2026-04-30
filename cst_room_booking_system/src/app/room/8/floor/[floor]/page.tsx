"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import ConfirmationDialog from "../../../../admin_dashboard/confirmation";
import SpecialBlock from "@/app/room/components/SpecialBlock";

import {
  HF_NAME,
  getFloorConfig,
  getTotalRoomsForFloor,
  getTotalBedsForFloor,
  getBedsForRoom,
} from "../../../data/hf";

interface RoomData {
  roomNumber: string;
  occupied: number;
  capacity: number;
  floor: number;
  forGender?: string;
  isActive?: boolean | string | null;
  is_active?: boolean | string | null;
  disabledReason?: string | null;
}

interface UserSession {
  phoneNumber: string;
  email: string;
  name: string;
  role: string;
  gender: string;
  hasBooked?: boolean; // Track booking status in session
}

function floorLabel(n: number) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n: number) {
  return n >= 1 && n <= 3;
}

export default function HfFloorPage({
  params,
}: {
  params: Promise<{ floor: string }>;
}) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  // --- STATE ---
  const [roomsData, setRoomsData] = useState<RoomData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 1. Retrieve User Session from LocalStorage
  useEffect(() => {
    const session = localStorage.getItem("session");
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (err) {
        console.error("Failed to parse user session:", err);
      }
    }
  }, []);

  // --- FETCH DATA ---
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=HF`);
        const data = await res.json();
        if (data.success) {
          setRoomsData(data.rooms || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    if (isValid) fetchRooms();
  }, [floorNum, isValid]);

  useEffect(() => {
    if (!isValid) {
      router.replace("/room/8/floor/1");
    }
  }, [isValid, router]);

  const getRoomInfo = (roomNo: number) => {
    const fullRoomId = `${HF_NAME}-${roomNo}`;
    return roomsData.find((r) => String(r.roomNumber) === fullRoomId);
  };

  // --- GENDER VALIDATION LOGIC ---
  const validateGender = (roomNo: number) => {
    const roomInfo = getRoomInfo(roomNo);
    if (!roomInfo) return true;

    if (!currentUser) {
      setToast("Please log in to book a room.");
      return false;
    }

    const roomGender = (roomInfo.forGender || "").toLowerCase().trim();
    const userGender = (currentUser.gender || "").toLowerCase().trim();

    if (roomGender && userGender && roomGender !== userGender) {
      setToast(
        `Room ${roomNo} is for ${
          roomGender.charAt(0).toUpperCase() + roomGender.slice(1)
        } only.`,
      );
      setTimeout(() => setToast(null), 4000);
      return false;
    }
    return true;
  };

  // --- BOOKING ACTION ---
  async function handleConfirmBooking() {
    if (selectedRoom === null || !currentUser) return;

    const fullRoomId = `${HF_NAME}-${selectedRoom}`;

    try {
      setIsBooking(true);
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: fullRoomId,
          userId: currentUser.phoneNumber,
          email: currentUser.email,
          userName: currentUser.name,
          checkIn: new Date().toISOString(),
          checkOut: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ).toISOString(),
        }),
      });

      const result = await res.json();
      if (result.success) {
        setToast(
          `${fullRoomId} reserved successfully! Room details sent to your email.`,
        );

        // --- UPDATE SESSION STATE ON SUCCESS ---
        const updatedUser = { ...currentUser, hasBooked: true };
        setCurrentUser(updatedUser);
        localStorage.setItem("session", JSON.stringify(updatedUser));

        setRoomsData((prev) =>
          prev.map((r) =>
            r.roomNumber === fullRoomId
              ? { ...r, occupied: r.occupied + 1 }
              : r,
          ),
        );
      } else {
        setToast("Booking failed: " + (result.error || "Room full"));
      }
    } catch (err) {
      setToast("Server error. Please try again.");
    } finally {
      setIsBooking(false);
      setSelectedRoom(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const floorConfig = useMemo(
    () => getFloorConfig(floorNum as 1 | 2 | 3),
    [floorNum],
  );
  const totalRooms = useMemo(
    () => getTotalRoomsForFloor(floorNum as 1 | 2 | 3),
    [floorNum],
  );
  const totalBeds = useMemo(
    () => getTotalBedsForFloor(floorNum as 1 | 2 | 3),
    [floorNum],
  );

  // --- UI COMPONENTS ---
  const RoomBlock = ({ room }: { room: number }) => {
    const info = getRoomInfo(room);
    const fullRoomId = `${HF_NAME}-${room}`;
    const staticBeds = getBedsForRoom(room);

    if (!info && loading) {
      return (
        <div className="w-full h-full rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
      );
    }

    const occupied = info?.occupied || 0;
    const capacity = info?.capacity || staticBeds;
    const dbActive = info?.isActive ?? info?.is_active;
    const isRoomActive =
      dbActive !== false && String(dbActive).toUpperCase() !== "FALSE";

    const isFully = occupied >= capacity;
    const isSelected = selectedRoom === room;
    const isPartial = occupied > 0 && occupied < capacity;
    const isLuggage = staticBeds === 0;

    let borderColor = "border-slate-300";
    let textColor = "text-slate-800";

    if (isLuggage) {
      borderColor = "border-gray-400";
      textColor = "text-gray-600";
    } else if (isFully) {
      borderColor = "border-red-400";
      textColor = "text-red-600";
    } else if (occupied > 0) {
      borderColor = "border-amber-400";
    }

    const selectedRing =
      isSelected && !isFully && isRoomActive ? "ring-2 ring-emerald-300" : "";

    return (
      <button
        aria-label={`Room ${room}${
          isLuggage
            ? " luggage room"
            : isFully
              ? " fully booked"
              : isPartial
                ? " partially booked"
                : " available"
        }`}
        className={`
          cursor-pointer group relative rounded-xl border bg-white text-slate-800 shadow-sm 
          transition-all duration-200 disabled:opacity-60 disabled:shadow-none 
          hover:-translate-y-0.5 hover:shadow-md
          w-full h-full
          ${borderColor} ${textColor} ${selectedRing}
          ${!isRoomActive ? "cursor-not-allowed" : ""}
        `}
        disabled={isFully || !isRoomActive || loading || isBooking}
        onClick={() => {
          // --- ONE ROOM PER USER CHECK ---
          if (currentUser?.hasBooked) {
            setToast(
              "You have already booked a room. Only one room per person is allowed.",
            );
            setTimeout(() => setToast(null), 3000);
            return;
          }

          if (validateGender(room)) {
            setSelectedRoom(room);
          }
        }}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight px-2">
          <span className="text-sm xs:text-base sm:text-base font-semibold tracking-wide">
            {room}
          </span>
          <span className="text-[9px] xs:text-[10px] font-bold whitespace-nowrap">
            {!isRoomActive
              ? info?.disabledReason || null
              : isFully
                ? "Fully Booked"
                : `${occupied}/${capacity} Occupied`}
          </span>
          {/* Gender indicator REMOVED */}
        </div>
        <div
          className={
            "pointer-events-none absolute inset-0 rounded-xl ring-0 transition " +
            (isFully || !isRoomActive
              ? ""
              : "group-hover:ring-1 group-hover:ring-slate-300/60")
          }
        />
      </button>
    );
  };

  const isFirstFloor = floorNum === 1;

  /* ================= UPDATED LAYOUT ================= */

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {/* Mobile hamburger menu button */}
        <div className="cursor-pointer md:hidden flex items-center justify-between mb-4">
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
            {HF_NAME} {floorLabel(floorNum)} floor
          </h1>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="text-xs font-semibold bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
                <span className="text-emerald-600">{currentUser.name}</span>
              </div>
            )}

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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
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
                currentFloor={floorNum as 1 | 2 | 3}
                baseHref="/room/8/floor"
                floors={[1, 2, 3]}
              />
            </div>
          </div>
        )}

        {/* Desktop header - ADD 'hidden md:flex' */}
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
              {HF_NAME} {floorLabel(floorNum)} floor
            </h1>
            {/* ADDED: Total Rooms & Beds info */}
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span className="hidden sm:inline">
                <span className="font-medium">Total Rooms:</span> {totalRooms}
              </span>
              <span className="hidden sm:inline">
                <span className="font-medium">Total Beds:</span> {totalBeds}
              </span>
            </div>
          </div>

          {currentUser && (
            <div className="text-sm font-semibold bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              Booking as:{" "}
              <span className="text-emerald-600">{currentUser.name}</span>
            </div>
          )}
        </div>

        {/* Main Layout */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Sidebar */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum as 1 | 2 | 3}
                baseHref="/room/8/floor"
                floors={[1, 2, 3]}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                {/* TOP WASHROOM - CENTERED */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <SpecialBlock text="🚻  Restroom" type="washroom" />
                </div>

                {/* TWO COLUMNS */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                  {/* LEFT COLUMN */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {isFirstFloor ? (
                      // FLOOR 1 LEFT COLUMN
                      <>
                        {/* Top Left - 6 rooms */}
                        {(floorConfig.topLeft || []).map((room) => (
                          <div
                            key={room}
                            className="w-full flex justify-center"
                          >
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        {/* Enter Label - Visible on ALL screens */}
                        <div className="my-2 sm:my-3 md:my-4 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>Enter →</span>
                        </div>

                        {/* Bottom Left - 6 rooms */}
                        {(floorConfig.bottomLeft || []).map((room) => (
                          <div
                            key={room}
                            className="w-full flex justify-center"
                          >
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      // FLOORS 2 & 3 LEFT COLUMN
                      <>
                        {/* Top Left - 3 rooms */}
                        {(floorConfig.topLeft || []).map((room) => (
                          <div
                            key={room}
                            className="w-full flex justify-center"
                          >
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        {/* Balcony Label */}
                        <div className="my-2 sm:my-3 md:my-4 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>Balcony</span>
                        </div>

                        {/* Middle Left - 5 rooms */}
                        {(floorConfig.middleLeft || []).map((room) => (
                          <div
                            key={room}
                            className="w-full flex justify-center"
                          >
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        {/* Balcony Label */}
                        <div className="my-2 sm:my-3 md:my-4 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>Balcony</span>
                        </div>

                        {/* Bottom Left - 3 rooms */}
                        {(floorConfig.bottomLeft || []).map((room) => (
                          <div
                            key={room}
                            className="w-full flex justify-center"
                          >
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {/* Top Right - 6 rooms (all floors) */}
                    {(floorConfig.topRight || []).map((room) => (
                      <div key={room} className="w-full flex justify-center">
                        <div
                          className="
                          w-[100px] xs:w-[110px] sm:w-[120px] 
                          md:w-[130px] lg:w-[140px]
                          h-[36px] xs:h-[38px] sm:h-[40px] 
                          md:h-[42px] lg:h-[46px]
                        "
                        >
                          <RoomBlock room={room} />
                        </div>
                      </div>
                    ))}

                    {/* Steps Label - Updated for 2nd and 3rd floors: Stair → becomes ← Enter */}
                    <div className="my-2 sm:my-3 md:my-4 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                      {floorNum === 1 ? (
                        <span>Stairs →</span>
                      ) : (
                        <span>← Enter</span>
                      )}
                    </div>

                    {/* Bottom Right - 6 rooms (all floors) */}
                    {(floorConfig.bottomRight || []).map((room) => (
                      <div key={room} className="w-full flex justify-center">
                        <div
                          className="
                          w-[100px] xs:w-[110px] sm:w-[120px] 
                          md:w-[130px] lg:w-[140px]
                          h-[36px] xs:h-[38px] sm:h-[40px] 
                          md:h-[42px] lg:h-[46px]
                        "
                        >
                          <RoomBlock room={room} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* BOTTOM WASHROOM - CENTERED */}
                <div className="flex justify-center mt-4 sm:mt-6">
                  <SpecialBlock text="🚻  Restroom" type="washroom" />
                </div>
              </section>

              {/* Legend */}
              <div className="mt-4 sm:mt-5 lg:mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Confirm booking for Room ${HF_NAME}-${selectedRoom}?`}
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}

        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed bottom-8 left-1/2 z-[60] -translate-x-1/2 rounded-xl px-6 py-3 text-white shadow-2xl flex items-center gap-3 border animate-in fade-in slide-in-from-bottom-4 duration-300 ${
              /* Logic: If it contains 'already booked', 'Error', or 'Denied', show Red. Else Green. */
              toast.toLowerCase().includes("already booked") ||
              toast.toLowerCase().includes("error") ||
              toast.toLowerCase().includes("denied") ||
              toast.toLowerCase().includes("only")
                ? "bg-red-600 border-red-500"
                : "bg-emerald-600 border-emerald-500"
            }`}
          >
            <span className="text-lg">
              {toast.toLowerCase().includes("already booked") ||
              toast.toLowerCase().includes("error") ||
              toast.toLowerCase().includes("denied") ||
              toast.toLowerCase().includes("only")
                ? "⚠️"
                : "✅"}
            </span>
            <span className="text-sm font-medium">{toast}</span>
          </div>
        )}
      </div>
    </main>
  );
}
