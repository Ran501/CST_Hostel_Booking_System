"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "../../../../confirmation";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";
import FloorBookingsView from "../../../components/FloorBookingsView";
import FloorSidebar from "../../../components/FloorSidebar";

import {
  NK_NAME,
  nkLeftRoomsForFloor,
  nkRightRoomsForFloor,
  LEFT_KITCHEN,
  RIGHT_KITCHEN,
} from "../../../data/nk";

// Add this custom hook for responsive layout
function useResponsiveLayout() {
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  useEffect(() => {
    setIsClient(true);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const width = isClient ? windowWidth : 1024;

  return {
    isMobile: width < 640,
    isMid: width >= 640 && width < 1024,
    isDesktop: width >= 1024,
    windowWidth: width,
  };
}

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth"][n - 1] || String(n);
}

function isValidFloor(n) {
  return n >= 1 && n <= 4;
}

function getNumericRoomNumber(roomNumber) {
  const match = String(roomNumber ?? "").match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function getStoredSession() {
  if (typeof window === "undefined") return null;
  const session = window.localStorage.getItem("session");
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    console.error("Invalid session data");
    return null;
  }
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

// EnterArrow component
function EnterArrow({ roomNumber, top, left, roomCardHeight = 60, size = "desktop" }) {
  const isLeftArrow = roomNumber % 100 === 4;
  const isRightArrow = roomNumber % 100 === 5;
  if (!isLeftArrow && !isRightArrow) return null;
  const arrowTop = `calc(${top} + ${size === "mobile" ? 45 : roomCardHeight}px)`;
  return (
    <div className="mt-8 absolute flex items-center justify-center text-slate-500 font-semibold pointer-events-none" style={{ top: arrowTop, left: left, transform: 'translate(-50%, -50%)' }}>
      {isLeftArrow ? (
        <><span className={size === "mobile" ? "text-base" : "text-lg"}>←</span><span className={`${size === "mobile" ? "text-[10px]" : "text-xs"} ml-1`}>Enter</span></>
      ) : (
        <><span className={`${size === "mobile" ? "text-[10px]" : "text-xs"} mr-1`}>Enter</span><span className={size === "mobile" ? "text-base" : "text-lg"}>→</span></>
      )}
    </div>
  );
}

export default function NkFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;
  const totalRooms = 8;
  const totalBeds = totalRooms * 2;

  const { isMobile, isMid, isDesktop } = useResponsiveLayout();

  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileCarouselPage, setMobileCarouselPage] = useState(1);
  const [currentUser, setCurrentUser] = useState(getStoredSession);
  const sessionLoaded = true;

  const kitchenLeftLabel = `Kitchen`;
  const kitchenRightLabel = `Kitchen`;

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
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

  // Redirect if invalid floor
  useEffect(() => {
    if (!isValid) router.replace("/rooms/3/floor/1");
  }, [isValid]);

  // Fetch user's booking
  useEffect(() => {
    async function fetchUserBooking() {
      if (!currentUser) return;
      const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
      if (!studentNumber) return;
      try {
        const params = new URLSearchParams({
          building: NK_NAME,
          floor: String(floorNum),
          studentNumber: String(studentNumber),
        });
        const bookingsRes = await fetch(`/api/floor-bookings?${params.toString()}`);
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success && bookingsData.rooms) {
          let userBookedRoom = null;
          for (const room of bookingsData.rooms) {
            if (room.students && room.students.length > 0) {
              const hasUserBooking = room.students.some(student => student.studentNumber === studentNumber);
              if (hasUserBooking) {
                userBookedRoom = room.roomNumber;
                break;
              }
            }
          }
          if (userBookedRoom) {
            setCurrentUser(prev => ({ ...prev, bookedRoomNumber: userBookedRoom, hasBooked: true }));
          } else if (currentUser?.bookedRoomNumber) {
            setCurrentUser(prev => ({ ...prev, bookedRoomNumber: null, hasBooked: false }));
            const updatedUser = { ...currentUser, bookedRoomNumber: null, hasBooked: false };
            localStorage.setItem("session", JSON.stringify(updatedUser));
          }
        }
      } catch (err) {
        console.error("Error fetching user booking:", err);
      }
    }
    if (currentUser && isValid) fetchUserBooking();
  }, [currentUser?.studentNumber, currentUser?.phoneNumber, currentUser?.stdNo, floorNum, isValid]);

  const getRoomInfo = (roomNo) => {
    const fullRoomId = `${NK_NAME}-${roomNo}`;
    const found = roomsData.find((r) => {
      return String(r.roomNumber) === fullRoomId ||
        String(r.roomNumber) === String(roomNo) ||
        getNumericRoomNumber(r.roomNumber) === roomNo;
    });
    return found || { roomNumber: fullRoomId, isActive: true, occupied: 0, capacity: 3 };
  };

  function showToast(msg, type = "error") {
    setSelectedRoom(null);
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const validateFloorYear = async () => {
    if (!currentUser?.year) {
      showToast("Student year not found. Please log in again.");
      return false;
    }
    try {
      const res = await fetch(`/api/floor-allocation?building=NK&floor=${floorNum}`);
      const data = await res.json();
      if (data.success && data.allocatedYear && data.allocatedYear != currentUser.year) {
        showToast(`Access Denied: This floor is reserved for Year ${data.allocatedYear} students.`);
        return false;
      }
      return true;
    } catch (err) {
      console.error("Floor validation error:", err);
      return true;
    }
  };

  const validateGender = (roomNo) => {
    const roomInfo = getRoomInfo(roomNo);
    if (!roomInfo) return true;
    if (!currentUser) {
      showToast("Please log in to book a room.");
      return false;
    }
    const roomGender = (roomInfo.forGender || "").toLowerCase().trim();
    const userGender = (currentUser.gender || "").toLowerCase().trim();
    if (roomGender && userGender && roomGender !== userGender) {
      showToast(`Access Denied: This room is for ${roomGender.charAt(0).toUpperCase() + roomGender.slice(1)} only!`);
      return false;
    }
    return true;
  };

  async function handleConfirmBooking() {
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
    const isCorrectYear = await validateFloorYear();
    if (!isCorrectYear) return;
    const isCorrectGender = validateGender(selectedRoom);
    if (!isCorrectGender) return;
    const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
    if (!studentNumber) {
      showToast("Student number not found in session. Please log in again.");
      return;
    }
    const fullRoomId = `${NK_NAME}-${selectedRoom}`;
    try {
      setIsBooking(true);
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: fullRoomId,
          studentNumber: String(studentNumber),
          checkIn: new Date().toISOString(),
          checkOut: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
        }),
      });
      const result = await res.json();
      if (result.success) {
        showToast(`Room ${fullRoomId} reserved successfully!`, "success");
        const updatedUser = { ...currentUser, hasBooked: true, bookedRoomNumber: fullRoomId };
        setCurrentUser(updatedUser);
        localStorage.setItem("session", JSON.stringify(updatedUser));
        setRoomsData((prev) =>
          prev.map((r) => r.roomNumber === fullRoomId ? { ...r, occupied: (r.occupied || 0) + 1 } : r)
        );
      } else {
        showToast("Error: " + (result.error || "Could not book"));
      }
    } catch (err) {
      showToast("Connection failed.");
    } finally {
      setIsBooking(false);
      setSelectedRoom(null);
    }
  }

  // Room Card component
  function RoomCard({ room, top, left }) {
    const roomInfo = getRoomInfo(room);
    if (!roomInfo) {
      return (
        <div className="absolute flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" style={{ top, left, transform: "translate(-50%, -50%)", width: "65px", height: "65px" }}>
          <span className="text-xs font-semibold text-slate-400">{room}</span>
        </div>
      );
    }
    const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(roomInfo, selectedRoom, currentUser, NK_NAME, room);
    const isSelected = selectedRoom === room;
    const ringColor = isSelected ? "ring-emerald-300" : "ring-slate-200";
    return (
      <button
        onClick={() => setSelectedRoom(room)}
        disabled={isDisabled || loading || isBooking}
        className={`cursor-pointer group absolute rounded-2xl border shadow-sm transition-all duration-200 w-[65px] h-[65px] xs:w-[70px] xs:h-[70px] sm:w-[75px] sm:h-[75px] md:w-[85px] md:h-[85px] lg:w-[95px] lg:h-[95px] xl:w-[105px] xl:h-[105px] disabled:shadow-none ${colorClasses} ${isSelected ? "ring-2 ring-emerald-300" : `ring-1 ${ringColor}`}`}
        style={{ top, left, transform: "translate(-50%, -50%)" }}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight p-1 sm:p-2">
          <span className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold">{room}</span>
          <span className={`text-[9px] xs:text-[10px] sm:text-[11px] whitespace-nowrap ${textColorClass}`}>{statusText}</span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/50" />
      </button>
    );
  }

  const leftRooms = useMemo(() => nkLeftRoomsForFloor(floorNum), [floorNum]);
  const rightRooms = useMemo(() => nkRightRoomsForFloor(floorNum), [floorNum]);
  
  const allRooms = useMemo(() => {
    const l = nkLeftRoomsForFloor(floorNum);
    const r = nkRightRoomsForFloor(floorNum);
    return [...l,  ...r];
  }, [floorNum]);

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 lg:py-10 text-slate-900 overflow-x-hidden">
      <div className="mx-auto max-w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8">
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] ${toastType === "success" ? "bg-green-800" : "bg-red-600"} text-white px-5 py-3 rounded-xl shadow-xl text-sm text-center max-w-sm w-[90%]`}>
            {toast}
          </div>
        )}

        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-500">
            <Link href="/" className="inline-flex items-center hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </Link>
          </div>
          <FloorBookingsView building={NK_NAME} floor={floorNum} currentUser={currentUser} onDenied={(message) => showToast(message)} />
          <h1 className="text-center text-base xs:text-lg font-semibold tracking-wide flex-1">{NK_NAME} {floorLabel(floorNum)} floor</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="cursor-pointer px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5 text-xs">
              <span className="font-small text-cstcolor font-bold">Floor</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 text-slate-700 transition-transform ${sidebarOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-56 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
              <FloorSidebar currentFloor={floorNum} baseHref="/rooms/3/floor" />
            </div>
          </div>
        )}

        {/* Desktop header */}
        <div className="hidden md:flex items-center mb-4 sm:mb-5 lg:mb-6">
          <div className="flex items-center text-slate-500">
            <Link href="/" className="inline-flex items-center hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </Link>
          </div>
          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide">{NK_NAME} {floorLabel(floorNum)} floor</h1>
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span className="hidden sm:inline"><span className="font-medium">Total Rooms:</span> {totalRooms}</span>
              <span className="hidden sm:inline"><span className="font-medium">Total Beds:</span> {totalBeds}</span>
            </div>
          </div>
          <FloorBookingsView building={NK_NAME} floor={floorNum} currentUser={currentUser} onDenied={(message) => showToast(message)} />
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden">
          <div className="relative rounded-xl border border-slate-200 bg-white/80 p-3 xs:p-4 shadow-lg backdrop-blur">
            <div className="flex justify-between items-center mb-3 xs:mb-4">
              <button onClick={() => setMobileCarouselPage(1)} className={`cursor-pointer flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-colors ${mobileCarouselPage === 1 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:text-slate-700'}`}>
                <span className="text-base xs:text-lg">←</span>
                <span className="text-xs xs:text-sm font-medium">Left Wing</span>
              </button>
              <div className="flex gap-1 xs:gap-2">
                <div className={`h-1.5 xs:h-2 w-1.5 xs:w-2 rounded-full ${mobileCarouselPage === 1 ? "bg-blue-500" : "bg-slate-300"}`} />
                <div className={`h-1.5 xs:h-2 w-1.5 xs:w-2 rounded-full ${mobileCarouselPage === 2 ? "bg-blue-500" : "bg-slate-300"}`} />
              </div>
              <button onClick={() => setMobileCarouselPage(2)} className={`cursor-pointer flex items-center gap-1 xs:gap-2 px-2 xs:px-3 py-1.5 xs:py-2 rounded-lg transition-colors ${mobileCarouselPage === 2 ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-slate-500 hover:text-slate-700'}`}>
                <span className="text-xs xs:text-sm font-medium">Right Wing</span>
                <span className="text-base xs:text-lg">→</span>
              </button>
            </div>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-slate-100 bg-white">
              {mobileCarouselPage === 1 && (
                <>
                  <div className="absolute flex items-center justify-center rounded-lg sm:rounded-xl shadow px-2 py-1 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700" style={mobileLayout.leftWashroom}>
                    <span className="text-lg">🚻</span>
                  </div>
                  {/* Bookable Kitchen Room - Left */}
                  <RoomCard room={LEFT_KITCHEN} top={mobileLayout.leftKitchen.top} left={mobileLayout.leftKitchen.left} />
                  {leftRooms.map((room, index) => (
                    <RoomCard key={room} room={room} top={mobileLayout.rooms.left[index].top} left={mobileLayout.rooms.left[index].left} />
                  ))}
                  </>
              )}
              {mobileCarouselPage === 2 && (
                <>
                  <div className="absolute flex items-center justify-center rounded-lg sm:rounded-xl shadow px-2 py-1 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700" style={mobileLayout.rightWashroom}>
                    <span className="text-lg">🚻</span>
                  </div>
                  {/* Bookable Kitchen Room - Right */}
                  <RoomCard room={RIGHT_KITCHEN} top={mobileLayout.rightKitchen.top} left={mobileLayout.rightKitchen.left} />
                  {rightRooms.map((room, index) => (
                    <RoomCard key={room} room={room} top={mobileLayout.rooms.right[index + 1]?.top || "31%"} left={mobileLayout.rooms.right[index + 1]?.left || "35%"} />
                  ))}</>
              )}
            </div>
            <div className="mt-3 xs:mt-4 text-center text-[10px] xs:text-xs text-slate-500">
              {mobileCarouselPage === 1 ? "Showing: Rooms 101-104 with facilities" : "Showing: Rooms 105-108 with facilities"}
            </div>
          </div>
        </div>

        {/* Tablet and Desktop Layout */}
        <div className="hidden md:block">
          <div className="flex gap-2 lg:gap-3 xl:gap-4">
            <div className="w-36 lg:w-40 xl:w-44 flex-shrink-0">
              <FloorSidebar currentFloor={floorNum} baseHref="/rooms/3/floor" />
            </div>
            <div className="flex-1 min-w-0">
              <section className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-white/80 pt-1 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 pb-3 sm:pb-4 md:pb-6 lg:pb-8 shadow-sm">
                <div className="relative aspect-[16/7] w-full">
                  {/* Washrooms */}
                  <div className="pointer-events-none absolute flex flex-col items-center justify-center rounded-lg sm:rounded-xl shadow px-2 py-1 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700" style={{ ...(isMid ? midLayout.washroomLeft : desktopLayout.washroomLeft), height: isMid ? "56px" : "64px", width: isMid ? "56px" : "64px" }}>
                    <span className="text-sm sm:text-base md:text-lg">🚻</span>
                    <span className="text-[10px] sm:text-xs font-medium">Restroom</span>
                  </div>
                  <div className="pointer-events-none absolute flex flex-col items-center justify-center rounded-lg sm:rounded-xl shadow px-2 py-1 border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700" style={{ ...(isMid ? midLayout.washroomRight : desktopLayout.washroomRight), height: isMid ? "56px" : "64px", width: isMid ? "56px" : "64px" }}>
                    <span className="text-sm sm:text-base md:text-lg">🚻</span>
                    <span className="text-[10px] sm:text-xs font-medium">Restroom</span>
                  </div>
                  {/* Bookable Kitchen Rooms */}
                  <RoomCard room={LEFT_KITCHEN} top={isMid ? midLayout.kitchenLeft.top : desktopLayout.kitchenLeft.top} left={isMid ? midLayout.kitchenLeft.left : desktopLayout.kitchenLeft.left} />
                  <RoomCard room={RIGHT_KITCHEN} top={isMid ? midLayout.kitchenRight.top : desktopLayout.kitchenRight.top} left={isMid ? midLayout.kitchenRight.left : desktopLayout.kitchenRight.left} />
                  {/* Rooms */}
                  {allRooms.map((room, index) => {
                    const pos = isMid ? midLayout.rooms[index] : desktopLayout.rooms[index];
                    return <RoomCard key={room} room={room} top={pos.top} left={pos.left} />;
                  })}
                  {/* Arrows under middle rooms */}
                </div>
              </section>
            </div>
          </div>
        </div>
        
        <div className="mt-3 xs:mt-4 sm:mt-5 lg:mt-6">
          <RoomLegend />
        </div>

        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Would you like to reserve one bed in Room ${NK_NAME}-${selectedRoom}?`}
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}