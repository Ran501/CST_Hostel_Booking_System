 "use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import ConfirmationDialog from "../../../../confirmation";
import {
  RKB_NAME,
  leftColumnRoomsForFloor,
  rightColumnRoomsForFloor,
} from "../../../data/rkb";

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 4;
}

export default function RkbFloorPage({ params }) {
    const router = useRouter();
    const { floor } = use(params);
    const rawFloor = Number(floor);
    const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
    const floorNum = isValid ? rawFloor : 1;
  
    const [isBooking, setIsBooking] = useState(false);
    const [toast, setToast] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);       // FIX 1: null not undefined
    const [sessionLoaded, setSessionLoaded] = useState(false);  // FIX 2: track session load
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Load session from localStorage
    useEffect(() => {
      const session = localStorage.getItem("session");
      if (session) {
        try {
          const parsed = JSON.parse(session);
          setCurrentUser(parsed);
        } catch {
          console.error("Invalid session data");
        }
      }
      setSessionLoaded(true); // FIX 3: mark session as loaded regardless
    }, []);

  
    useEffect(() => {
      async function fetchRooms() {
        try {
          setLoading(true);
          // Replace with your actual API endpoint
          const res = await fetch(`/api/rooms?floor=${floorNum}&building=RKB`);
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
      const fullRoomId = `${RKB_NAME}-${roomNo}`;
      return roomsData.find((r) => String(r.roomNumber) === fullRoomId);
    };
  
    const totalRooms = 12;
    const totalBeds = totalRooms * 2;
  
    const leftRooms = useMemo(
      () => leftColumnRoomsForFloor(floorNum),
      [floorNum]
    );
    const rightRooms = useMemo(
      () => rightColumnRoomsForFloor(floorNum),
      [floorNum]
    );
  
    function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }
  
    // Simple booking action - no API calls
  async function handleConfirmBooking() {
      // FIX 4: proper guards with user feedback
      if (selectedRoom === null) return;
  
      if (!sessionLoaded) {
        showToast("Session is still loading, please wait.");
        return;
      }
  
      if (!currentUser) {
        showToast("You must be logged in to book a room.");
        router.push("/login");
        return;
      }
  
      // FIX 5: check which field your session actually uses
      const studentNumber = currentUser.studentNumber;
  
      if (!studentNumber) {
        showToast("Student number not found in session. Please log in again.");
        return;
      }
  
      const fullRoomId = `${RKB_NAME}-${selectedRoom}`;
  
      try {
        setIsBooking(true);
  
        const res = await fetch("/api/booking", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomNumber: fullRoomId,
            studentNumber: String(studentNumber),
            checkIn: new Date().toISOString(),
            checkOut: new Date(
              new Date().setMonth(new Date().getMonth() + 6)
            ).toISOString(),
          }),
        });
  
        // FIX 6: handle non-JSON responses gracefully
        let result;
        try {
          result = await res.json();
        } catch {
          showToast("Server returned an unexpected response.");
          return;
        }
  
        if (result.success) {
          showToast(`Room ${fullRoomId} reserved successfully! Details sent to your email.`);
  
          const updatedUser = { ...currentUser, hasBooked: true };
          setCurrentUser(updatedUser);
          localStorage.setItem("session", JSON.stringify(updatedUser));
  
          // Update room occupancy locally
          setRoomsData((prev) =>
            prev.map((r) =>
              r.roomNumber === fullRoomId
                ? { ...r, occupied: (r.occupied || 0) + 1 }
                : r
            )
          );
        } else {
          showToast("Error: " + (result.error || "Could not complete booking."));
        }
      } catch (err) {
        console.error("Booking error:", err);
        showToast("Connection failed. Please try again.");
      } finally {
        setIsBooking(false);
        setSelectedRoom(null);
      }
    }
  
    // Simple Room Block component - no API calls
    const RoomBlock = ({ room }) => {
      const roomInfo = getRoomInfo(room);
      // 1. Fallback for when data is loading
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
      const isSelected = selectedRoom === room;
  
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
        disabled={!isRoomActive || isFully || loading}
        className={`cursor-pointer group relative rounded-xl border shadow-sm transition-all duration-200 w-full h-full disabled:opacity-60 disabled:shadow-none ${colors}`}
        onClick={() => setSelectedRoom(room)}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight px-1 sm:px-2">
          <span className="text-sm xs:text-base sm:text-lg font-semibold tracking-wider">
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

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
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
            {RKB_NAME} {floorLabel(floorNum)} floor
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
              className="absolute left-0 top-0 h-full w-56 bg-white shadow-xl p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/2/floor"
              />
            </div>
          </div>
        )}

        {/* Desktop Header */}
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
              {RKB_NAME} {floorLabel(floorNum)} floor
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

        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/2/floor"
              />
            </div>

            <div className="flex-1 min-w-0">
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                <div className="absolute left-1/2 top-3 sm:top-4 md:top-6 -translate-x-1/2 w-[240px] xs:w-[280px] sm:w-[320px] md:w-[360px] lg:w-80">
                  <div className="grid w-full grid-cols-2 rounded-lg 
                      border-2 border-dashed border-blue-400 
                      bg-blue-50 text-blue-700 shadow">
                    <div className="flex items-center justify-center gap-1 p-1.5 sm:p-2">
                      <span className="text-sm">🚿</span>{" "}
                      <span className="text-[12px] xs:text-xs">Bathroom</span>
                    </div>
                    <div className="border-l border-slate-200 flex items-center justify-center gap-1 p-1.5 sm:p-2">
                      <span className="text-sm">🚽</span>{" "}
                      <span className="text-[12px] xs:text-xs">Toilet</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-16 xs:pt-18 sm:pt-20 md:pt-24">
                  <div className="flex flex-col items-center gap-2 xs:gap-3 md:gap-4">
                    {leftRooms.map((r) => (
                      <div
                        key={r}
                        className="w-[70px] xs:w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] h-[50px] xs:h-[56px] md:h-[64px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                  </div>
                  <div className="relative px-1 xs:px-2 sm:px-3 md:px-4">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] xs:w-[2px] bg-slate-300/60" />
                    <div className="mx-auto mt-6 h-6 w-12 sm:w-16 md:w-20 rounded-full bg-slate-300/50" />
                  </div>
                  <div className="flex flex-col items-center gap-2 xs:gap-3 md:gap-4">
                    {rightRooms.map((r) => (
                      <div
                        key={r}
                        className="w-[70px] xs:w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] h-[50px] xs:h-[56px] md:h-[64px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <div className="mt-4 sm:mt-5 lg:mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Do you want to book one bed from Room ${RKB_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}