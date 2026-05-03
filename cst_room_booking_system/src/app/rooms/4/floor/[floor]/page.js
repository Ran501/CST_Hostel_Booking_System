"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import ConfirmationDialog from "../../../../confirmation";
import SpecialBlock from "../../../../room/components/SpecialBlock";

import {
  HA_NAME,
  haLeftRoomsForFloor,
  haRightRoomsForFloor,
} from "../../../data/ha";

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 3;
}

export default function HaFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  // Simple States
  const [selectedRoom, setSelectedRoom] = useState(null);
  // To hold backend data
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(true);

  useEffect(() => {
        async function fetchRooms() {
          try {
            setLoading(true);
            // Replace with your actual API endpoint
            const res = await fetch(`/api/rooms?floor=${floorNum}&building=HA`);
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
        const fullRoomId = `${HA_NAME}-${roomNo}`;
        return roomsData.find((r) => String(r.roomNumber) === fullRoomId);
      };

  // Simple redirect logic
  useEffect(() => {
    if (!isValid) router.replace("/rooms/4/floor/1");
  }, [isValid, router]);

 
  // --- GENDER VALIDATION LOGIC ---
  const validateGender = (roomNo) => {
    return true;
  };

  // --- BOOKING LOGIC ---
  function handleConfirmBooking() {
    if (selectedRoom === null) return;
    
    // Simple confirmation dialog logic - no API calls
    alert(`Room ${HA_NAME}-${selectedRoom} booking confirmed! (UI Only - No Backend)`);
    setSelectedRoom(null);
  }

  // --- SPATIAL DATA ---
  const leftRooms = useMemo(
    () => haLeftRoomsForFloor(floorNum),
    [floorNum]
  );
  const rightRooms = useMemo(
    () => haRightRoomsForFloor(floorNum),
    [floorNum]
  );

  const filteredRightRooms = useMemo(() => {
    if (floorNum === 1) return rightRooms.filter((r) => r !== 109);
    return rightRooms;
  }, [floorNum, rightRooms]);

  // Simple Room Block component - no API calls
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
        className={`group relative rounded-xl border shadow-sm transition-all duration-200 w-full h-full flex flex-col items-center justify-center p-1 border-slate-300 bg-white hover:border-slate-300 text-slate-800 ${
          isSelected ? "ring-2 ring-emerald-300" : ""
        }`}
        onClick={() => setSelectedRoom(room)}
      >
        <span className="text-[11px] font-bold tracking-tight">
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
      </button>
    );
  };

  const leftTopRooms =
    floorNum === 1 ? leftRooms.slice(0, 4) : leftRooms.slice(0, 3);
  const leftBottomRooms =
    floorNum === 1 ? leftRooms.slice(4) : leftRooms.slice(3);
  const rightTopRooms =
    floorNum === 1
      ? [109, ...filteredRightRooms.slice(0, 2)]
      : filteredRightRooms.slice(0, 3);
  const rightBottomRooms =
    floorNum === 1
      ? filteredRightRooms.slice(2, 4)
      : filteredRightRooms.slice(3, 5);

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="mb-4 flex items-center text-slate-500">
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

        <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide uppercase">
            {HA_NAME} {floorLabel(floorNum)} floor
          </h1>
        </div>

        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/4/floor"
                floors={[1, 2, 3]}
              />
            </div>

            <div className="flex-1 min-w-0">
              <section className="relative rounded-2xl border border-slate-200 bg-white/80 p-4 md:p-6 shadow-lg backdrop-blur overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 pt-10 pb-12">
                  <div className="flex flex-col items-center gap-3">
                    {leftTopRooms.map((r) => (
                      <div
                        key={r}
                        className="w-full max-w-[140px] h-[40px] md:h-[46px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    {floorNum === 1 && (
                      <div className="my-4 text-xs text-slate-400 hidden md:block italic">
                        Main Entrance
                      </div>
                    )}
                    {leftBottomRooms.map((r) => (
                      <div
                        key={r}
                        className="w-full max-w-[140px] h-[40px] md:h-[46px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200" />
                  </div>

                  <div className="flex flex-col items-center gap-3">
                    <SpecialBlock text="🚿 Washroom" type="washroom" />
                    {rightTopRooms.map((r) => (
                      <div
                        key={r}
                        className="w-full max-w-[140px] h-[40px] md:h-[46px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    {floorNum === 1 ? (
                      <div className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
                        Stairs
                      </div>
                    ) : (
                      <div className="h-4" />
                    )}
                    {rightBottomRooms.map((r) => (
                      <div
                        key={r}
                        className="w-full max-w-[140px] h-[40px] md:h-[46px]"
                      >
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    <SpecialBlock text="🚿 Restroom" type="washroom" />
                  </div>
                </div>
              </section>
              <div className="mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Would you like to reserve one bed in Room ${HA_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}