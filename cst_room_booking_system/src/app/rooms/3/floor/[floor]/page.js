"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "../../../../confirmation";
import RoomLegend from "../../../components/RoomLegend";
import FloorSidebar from "../../../components/FloorSidebar";

import {
  NK_NAME,
  nkLeftRoomsForFloor,
  nkMiddleRoomsForFloor,
  nkRightRoomsForFloor,
} from "../../../data/nk";

// Add this custom hook for responsive layout
function useResponsiveLayout() {
  const [windowWidth, setWindowWidth] = useState(0);
    

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    isMobile: windowWidth < 640,
    isMid: windowWidth >= 640 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    windowWidth,
  };
}


function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 4;
}

// LAYOUT POSITION MAPS
const mobileLayout = {
  leftWashroom: { top: "80%", left: "15%" },
  rightWashroom: { top: "80%", right: "12%" },
  leftKitchen: { top: "75%", left: "35%" },
  rightKitchen: { top: "75%", right: "35%" },
  rooms: {
    left: [
      { top: "58%", left: "20%" },
      { top: "31%", left: "35%" },
      { top: "31%", left: "65%" },
      { top: "58%", left: "80%" },
    ],
    right: [
      { top: "58%", left: "20%" },
      { top: "31%", left: "35%" },
      { top: "31%", left: "65%" },
      { top: "58%", left: "80%" },
    ],
  },
};

const midLayout = {
  washroomLeft: { top: "70%", left: "8%" },
  washroomRight: { top: "70%", right: "6%" },
  kitchenLeft: { top: "78%", left: "20%" },
  kitchenRight: { top: "78%", right: "18%" },
  rooms: [
    { top: "56%", left: "8%" },
    { top: "40%", left: "20%" },
    { top: "40%", left: "32%" },
    { top: "56%", left: "45%" },
    { top: "56%", left: "58%" },
    { top: "40%", left: "70%" },
    { top: "40%", left: "82%" },
    { top: "56%", left: "94%" },
    { top: "56%", left: "8%" },
    { top: "40%", left: "20%" },
    { top: "40%", left: "32%" },
    { top: "56%", left: "45%" },
  ],
};

const desktopLayout = {
  washroomLeft: { top: "68%", left: "8%" },
  washroomRight: { top: "68%", right: "6%" },
  kitchenLeft: { top: "84%", left: "20%" },
  kitchenRight: { top: "84%", right: "18%" },
  rooms: [
    { top: "53%", left: "8%" },
    { top: "37%", left: "20%" },
    { top: "37%", left: "32%" },
    { top: "53%", left: "45%" },
    { top: "53%", left: "58%" },
    { top: "37%", left: "70%" },
    { top: "37%", left: "82%" },
    { top: "53%", left: "94%" },
    { top: "53%", left: "8%" },
    { top: "37%", left: "20%" },
    { top: "37%", left: "32%" },
    { top: "53%", left: "45%" },
  ],
};

// ADDED: EnterArrow component to display arrows under specific rooms
function EnterArrow({ 
  roomNumber, 
  top, 
  left, 
  roomCardHeight = 60, 
  size = "desktop" 
}) {
  const isLeftArrow = roomNumber % 100 === 4; // 104, 204, 304
  const isRightArrow = roomNumber % 100 === 5; // 105, 205, 305
  
  if (!isLeftArrow && !isRightArrow) return null;
  
  const arrowTop = `calc(${top} + ${size === "mobile" ? 45 : roomCardHeight}px)`;
  
  return (
    <div
      className="mt-8 absolute flex items-center justify-center text-slate-500 font-semibold pointer-events-none"
      style={{
        top: arrowTop,
        left: left,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {isLeftArrow ? (
        <>
          <span className={size === "mobile" ? "text-base" : "text-lg"}>←</span>
          <span className={`${size === "mobile" ? "text-[10px]" : "text-xs"} ml-1`}>
            Enter
          </span>
        </>
      ) : (
        <>
          <span className={`${size === "mobile" ? "text-[10px]" : "text-xs"} mr-1`}>
            Enter
          </span>
          <span className={size === "mobile" ? "text-base" : "text-lg"}>→</span>
        </>
      )}
    </div>
  );
}

export default function NkFloorPage({ 
  params 
}) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;
  const totalRooms = 8;
  const totalBeds = totalRooms * 2;

  // Use the responsive layout hook
  const { isMobile, isMid, isDesktop } = useResponsiveLayout();

  // Simple States
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCarouselPage, setMobileCarouselPage] = useState(1);

  // Simple States
  const [currentUser, setCurrentUser] = useState({
  phoneNumber: "17654321",
  email: "test@example.com",
  name: "Test User",
  role: "student",
  gender: "male",
  hasBooked: false,
});


  // Kitchen numbering per floor: (floor-1)*2 + 1 and +2
  const kitchenStart = (floorNum - 1) * 2 + 1;
  const kitchenLeftLabel = `Luggage Room `;
  const kitchenRightLabel = `Luggage Room`;

  // 1. Retrieve User Session
  // useEffect(() => {
  //   const session = localStorage.getItem("session");
  //   if (session) {
  //     try {
  //       setCurrentUser(JSON.parse(session));
  //     } catch (err) {
  //       console.error("Failed to parse user session:", err);
  //     }
  //   }
  // }, []);

  // Simple redirect logic
  useEffect(() => {
    if (!isValid) router.replace("/rooms/3/floor/1");
  }, [isValid]);

  // 2. Fetch Rooms
  useEffect(() => {
    async function fetchRooms() {
      console.log("FETCHING...");
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=NK`);
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
    
  const getRoomInfo = (roomNo) => {
    const fullRoomId = `${NK_NAME}-${roomNo}`;
    const found = roomsData.find((r) => String(r.roomNumber) === fullRoomId);
    
    // Add this:
    if (!found) console.log("NO MATCH:", fullRoomId, "vs DB:", roomsData.map(r => r.roomNumber));
    
    return found;
  };

  // Simple booking action - no API calls
  async function handleConfirmBooking() {
  if (selectedRoom === null || !currentUser) return;

  const fullRoomId = `${NK_NAME}-${selectedRoom}`;

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
          new Date().setMonth(new Date().getMonth() + 6),
        ).toISOString(),
      }),
    });

    const result = await res.json();
    if (result.success) {
      setToast(`Room ${fullRoomId} reserved successfully! Room details sent to your email.`);
      const updatedUser = { ...currentUser, hasBooked: true };
      setCurrentUser(updatedUser);
      localStorage.setItem("session", JSON.stringify(updatedUser));
      setRoomsData((prev) =>
        prev.map((r) =>
          r.roomNumber === fullRoomId
            ? { ...r, occupied: (r.occupied || 0) + 1 }
            : r,
        ),
      );
    } else {
      setToast("Error: " + (result.error || "Could not book"));
    }
  } catch (err) {
    setToast("Connection failed.");
  } finally {
    setIsBooking(false);
    setSelectedRoom(null);
    setTimeout(() => setToast(null), 3000);
  }
}

  

  // --- GENDER VALIDATION LOGIC --- (Backend Logic)
  const validateGender = (roomNo) => {
    return true;
  };
  

  // Simple Room Card component - no API calls
  function RoomCard({ room, top, left }) {
    const roomInfo = getRoomInfo(room);
    console.log(roomInfo)
    const fullRoomId = `${NK_NAME}-${room}`;
      // 1. Fallback for when data is loading
      if (!roomInfo) {
      return (
        <div
          className="absolute flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
          style={{
            top,
            left,
            transform: "translate(-50%, -50%)",
            width: "65px",
            height: "65px",
          }}
        >
          <span className="text-[10px] text-slate-400">Loading...</span>
        </div>
      );
    }

    const dbValue =  roomInfo.status;
    const isRoomActive =
      dbValue !== false && String(dbValue).toUpperCase() !== "FALSE";
    const occupied = roomInfo.occupied || 0;
    const capacity = roomInfo.capacity || 3;
    const isPartial = occupied > 0 && occupied < capacity;
    const isSelected = selectedRoom === room;
    const isFully = occupied >= capacity;
    
    const ringColor = !isRoomActive
      ? "ring-slate-200"
      : isFully
        ? "ring-red-300"
        : isPartial
          ? "ring-amber-300"
          : isSelected
            ? "ring-emerald-300"
            : "ring-slate-200";
    
      const colors = !isRoomActive
      ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
      : isFully
        ? "bg-red-50 text-red-700 border-red-200 cursor-not-allowed"
        : isPartial
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-50/80 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
          : isSelected
            ? "border-emerald-200 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300/70"
            : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]";


    return (
      <button
        onClick={() => setSelectedRoom(room)}
        disabled={!isRoomActive || isFully || loading || isBooking}
        className={`
          cursor-pointer group absolute rounded-2xl border bg-white text-slate-800 shadow-sm 
          transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
          w-[65px] h-[65px] xs:w-[70px] xs:h-[70px] sm:w-[75px] sm:h-[75px] 
          md:w-[85px] md:h-[85px] lg:w-[95px] lg:h-[95px] xl:w-[105px] xl:h-[105px]
          border-slate-300
          ${isSelected ? "ring-2 ring-emerald-300" : "ring-1 ring-slate-200"}
        `}
        style={{
          top,
          left,
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight p-1 sm:p-2">
          <span className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold">
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
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/50" />
      </button>
    );
  }

  const leftRooms = useMemo(
    () => nkLeftRoomsForFloor(floorNum),
    [floorNum]
  );
  const middleRooms = useMemo(
    () => nkMiddleRoomsForFloor(floorNum),
    [floorNum]
  );
  const rightRooms = useMemo(
    () => nkRightRoomsForFloor(floorNum),
    [floorNum]
  );
  const allRooms = useMemo(() => {
    const l = nkLeftRoomsForFloor(floorNum);
    const m = nkMiddleRoomsForFloor(floorNum);
    const r = nkRightRoomsForFloor(floorNum);
    return [...l, ...m, ...r];
  }, [floorNum]);

  // Determine which layout to use based on screen size
  const currentLayout = isMobile
    ? mobileLayout
    : isMid
      ? midLayout
      : desktopLayout;

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 lg:py-10 text-slate-900 overflow-x-hidden">
      <div className="mx-auto max-w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile hamburger menu button - UPDATED WITH BACK ARROW */}
        <div className="md:hidden flex items-center justify-between mb-4">
          {/* Back arrow for mobile - ADDED HERE */}
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
            {NK_NAME} {floorLabel(floorNum)} floor
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
                baseHref="/rooms/3/floor"
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
              {NK_NAME} {floorLabel(floorNum)} floor
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

        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <div className="relative rounded-xl border border-slate-200 bg-white/80 p-3 xs:p-4 shadow-lg backdrop-blur">
            {/* Carousel Navigation */}
            <div className="flex justify-between items-center mb-3 xs:mb-4">
              <button
                onClick={() => setMobileCarouselPage(1)}
                className={`cursor-pointer flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-colors ${mobileCarouselPage === 1 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="text-base xs:text-lg">←</span>
                <span className="text-xs xs:text-sm font-medium">
                  Left Wing
                </span>
              </button>

              <div className="flex gap-1 xs:gap-2">
                <div
                  className={`h-1.5 xs:h-2 w-1.5 xs:w-2 rounded-full ${mobileCarouselPage === 1 ? "bg-blue-500" : "bg-slate-300"}`}
                />
                <div
                  className={`h-1.5 xs:h-2 w-1.5 xs:w-2 rounded-full ${mobileCarouselPage === 2 ? "bg-blue-500" : "bg-slate-300"}`}
                />
              </div>

              <button
                onClick={() => setMobileCarouselPage(2)}
                className={`cursor-pointer flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-colors ${mobileCarouselPage === 2 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <span className="text-xs xs:text-sm font-medium">
                  Right Wing
                </span>
                <span className="text-base xs:text-lg">→</span>
              </button>
            </div>

            {/* Mobile Layout Container with aspect ratio */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-100 bg-white">
              {/* Carousel Page 1: Left Side (Rooms 101-104 + Left Washroom) */}
              {mobileCarouselPage === 1 && (
                <>
                  {/* Left Washroom */}
                  <div
                    className="absolute flex items-center justify-center 
                            rounded-lg sm:rounded-xl shadow px-2 py-1
                            border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700"
                    style={mobileLayout.leftWashroom}
                  >
                    <span className="text-lg">🚻</span>
                  </div>

                  {/* Left Kitchen */}
                  <div
                    className="absolute flex h-12 w-20 xs:h-14 xs:w-24 sm:h-16 sm:w-28 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
                    style={mobileLayout.leftKitchen}
                  >
                    <span className="text-[10px] xs:text-xs">
                      {kitchenLeftLabel}
                    </span>
                  </div>

                  {/* Rooms 101-104 */}
                  {leftRooms.map((room, index) => (
                    <RoomCard
                      key={room}
                      room={room}
                      top={mobileLayout.rooms.left[index].top}
                      left={mobileLayout.rooms.left[index].left}
                    />
                  ))}
                  <RoomCard
                    key={middleRooms[0]}
                    room={middleRooms[0]}
                    top={mobileLayout.rooms.left[3].top}
                    left={mobileLayout.rooms.left[3].left}
                  />

                  {/* ADDED: Arrow under room 104 */}
                  <EnterArrow
                    roomNumber={middleRooms[0]}
                    top={mobileLayout.rooms.left[3].top}
                    left={mobileLayout.rooms.left[3].left}
                    size="mobile"
                  />
                </>
              )}

              {/* Carousel Page 2: Right Side (Rooms 105-108 + Right Washroom + Right Kitchen) */}
              {mobileCarouselPage === 2 && (
                <>
                  {/* Right Washroom */}
                  <div
                    className="absolute flex items-center justify-center 
                            rounded-lg sm:rounded-xl shadow px-2 py-1
                            border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700"
                    style={mobileLayout.rightWashroom}
                  >
                    <span className="text-lg">🚻</span>
                  </div>

                  {/* Right Kitchen */}
                  <div
                    className="absolute flex h-12 w-20 xs:h-14 xs:w-24 sm:h-16 sm:w-28 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm"
                    style={mobileLayout.rightKitchen}
                  >
                    <span className="text-[10px] xs:text-xs">
                      {kitchenRightLabel}
                    </span>
                  </div>

                  {/* Rooms 105-108 */}
                  <RoomCard
                    key={middleRooms[1]}
                    room={middleRooms[1]}
                    top={mobileLayout.rooms.right[0].top}
                    left={mobileLayout.rooms.right[0].left}
                  />
                  {rightRooms.map((room, index) => (
                    <RoomCard
                      key={room}
                      room={room}
                      top={mobileLayout.rooms.right[index + 1]?.top || "31%"}
                      left={mobileLayout.rooms.right[index + 1]?.left || "35%"}
                    />
                  ))}

                  {/* ADDED: Arrow under room 105 */}
                  <EnterArrow
                    roomNumber={middleRooms[1]}
                    top={mobileLayout.rooms.right[0].top}
                    left={mobileLayout.rooms.right[0].left}
                    size="mobile"
                  />
                </>
              )}
            </div>

            {/* Carousel indicators */}
            <div className="mt-3 xs:mt-4 text-center text-[10px] xs:text-xs text-slate-500">
              {mobileCarouselPage === 1
                ? "Showing: Rooms 101-104 with facilities"
                : "Showing: Rooms 105-108 with facilities"}
            </div>
          </div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex gap-2 lg:gap-3 xl:gap-4">
            {/* Sidebar */}
            <div className="w-36 lg:w-40 xl:w-44 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/3/floor"
              />
            </div>

            {/* Main layout container with FIXED ASPECT RATIO */}
            <div className="flex-1 min-w-0">
              <section className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-white/80 pt-1 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 pb-3 sm:pb-4 md:pb-6 lg:pb-8 shadow-sm">
                {/* Container with locked aspect ratio */}
                <div className="relative aspect-[16/7] w-full">
                  {/* Facilities: washrooms */}
                  <div
                    className="pointer-events-none absolute flex flex-col items-center justify-center 
                            rounded-lg sm:rounded-xl shadow px-2 py-1 
                            border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700"
                    style={{
                      ...(isMid ? midLayout.washroomRight : desktopLayout.washroomLeft),
                      height: isMid ? "56px" : "64px",
                      width: isMid ? "56px" : "64px",
                    }}
                  >
                    <span className="text-sm sm:text-base md:text-lg">🚻</span>
                    <span className="text-[10px] sm:text-xs font-medium">Restroom</span>
                  </div>

                  <div
                    className="pointer-events-none absolute flex flex-col items-center justify-center 
             rounded-lg sm:rounded-xl shadow px-2 py-1 
             border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700"
                    style={{
                      ...(isMid ? midLayout.washroomRight : desktopLayout.washroomRight),
                      height: isMid ? "56px" : "64px",
                      width: isMid ? "56px" : "64px",
                    }}
                  >
                    <span className="text-sm sm:text-base md:text-lg">🚻</span>
                    <span className="text-[10px] sm:text-xs font-medium">Restroom</span>
                  </div>

                  {/* Kitchens */}
                  <div
                    className="pointer-events-none absolute flex items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                    style={{
                      ...(isMid
                        ? midLayout.kitchenLeft
                        : desktopLayout.kitchenLeft),
                      height: isMid ? "72px" : "80px",
                      width: isMid ? "128px" : "144px",
                    }}
                  >
                    <span className="text-sm sm:text-base md:text-lg"></span>
                    <span className="text-xs sm:text-sm md:text-base">
                      {kitchenLeftLabel}
                    </span>
                  </div>

                  <div
                    className="pointer-events-none absolute flex items-center justify-center gap-1 sm:gap-2 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm"
                    style={{
                      ...(isMid
                        ? midLayout.kitchenRight
                        : desktopLayout.kitchenRight),
                      height: isMid ? "72px" : "80px",
                      width: isMid ? "128px" : "144px",
                    }}
                  >
                    <span className="text-sm sm:text-base md:text-lg"></span>
                    <span className="text-xs sm:text-sm md:text-base">
                      {kitchenRightLabel}
                    </span>
                  </div>

                  {/* Rooms with dynamic positioning based on screen size */}
                  {allRooms.map((room, index) => {
                    const pos = isMid
                      ? midLayout.rooms[index]
                      : desktopLayout.rooms[index];
                    return (
                      <RoomCard
                        key={room}
                        room={room}
                        top={pos.top}
                        left={pos.left}
                      />
                    );
                  })}

                  {/* ADDED: Arrows under middle rooms 104 and 105 */}
                  {middleRooms.map((room, index) => {
                    if (room % 100 === 4 || room % 100 === 5) {
                      const pos = isMid 
                        ? midLayout.rooms[index + 3] 
                        : desktopLayout.rooms[index + 3];
                      
                      return (
                        <EnterArrow
                          key={`arrow-${room}`}
                          roomNumber={room}
                          top={pos.top}
                          left={pos.left}
                          roomCardHeight={isMid ? 65 : 70}
                          size="desktop"
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
        <div className="mt-3 xs:mt-4 sm:mt-5 lg:mt-6">
          <RoomLegend />
        </div>

        {/* Confirmation Dialog */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Would you like to reserve one bed in Room ${NK_NAME}-${selectedRoom}?`}
            isLoading={false}
            onCancel={() => setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}