"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FloorBookingsView from "../../../components/FloorBookingsView";
import FloorSidebar from "../../../components/FloorSidebar";
import ConfirmationDialog from "../../../../confirmation";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";
import SpecialBlock from "../../../../room/components/SpecialBlock";
import {
  HE_NAME,
  HE_FLOORS,
  HE_FLOOR_META,
  floor1rightcolumn,
  floor1leftcolumn,
  floor2Toprightmid,
  floor2bottomright,
  floor2topleft,
  floor2leftmid,
  floor2Bottomleft,
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

// ─────────────────────────────────────────────────────────────────────────────
// Shared Primitive Components
// ─────────────────────────────────────────────────────────────────────────────

function RoomBlock({ room, onClick, roomInfo, selectedRoom, currentUser, buildingName, isLoading }) {
  const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(
    roomInfo, selectedRoom, currentUser, buildingName, room
  );

  const isYourBooking = currentUser?.bookedRoomNumber === `${buildingName}-${room}`;
  const clickable = !isDisabled;

  return (
    <button
      disabled={!clickable || isLoading}
      onClick={clickable ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center w-full h-full
        rounded-lg border-2 shadow-sm transition-all duration-200
        ${colorClasses}
        ${clickable && !isDisabled
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-not-allowed opacity-60"}
      `}
    >
      <span className="text-[11px] xs:text-sm sm:text-base font-semibold tracking-wider text-slate-700">
        {room}
      </span>
      <span className={`text-[8px] xs:text-[9px] sm:text-[10px] font-medium mt-0.5 ${textColorClass}`}>
        {isYourBooking ? "Your Room" : statusText}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR 1 Plan - Following HF spacing pattern
// ─────────────────────────────────────────────────────────────────────────────
function Floor1Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
  const rightColumn = floor1rightcolumn(); // [101, 102, 103, 104, 105, 106]
  const leftColumn  = floor1leftcolumn();  // [112, 111, 110, 109, 108, 107]

  const RoomCell = ({ r }) => (
    <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
      <RoomBlock
        room={r}
        roomInfo={getRoomInfo(r)}
        selectedRoom={selectedRoom}
        currentUser={currentUser}
        buildingName={buildingName}
        isLoading={isLoading}
        onClick={() => onRoomClick(r)}
      />
    </div>
  );

  return (
    <div className="flex flex-col w-full select-none">
      {/* MESS Area - Full width like HF washroom */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <SpecialBlock text="MESS Area" type="default" className="w-full max-w-2xl" />
      </div>

      {/* Entrance & Stair - Centered row */}
      <div className="flex items-stretch gap-3 sm:gap-4 md:gap-5 w-full mb-4 sm:mb-6">
        {/* Entrance above left column (112) */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider italic">MAIN ENTRANCE</span>
          </div>
        </div>

        {/* Stair above right column (101) */}
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider italic">Stairs</span>
          </div>
        </div>
      </div>

      {/* Room grid - 2 columns with proper spacing like HF */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {/* Left Column - 112 to 107 */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {leftColumn.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>

        {/* Right Column - 101 to 106 */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {rightColumn.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR 2 Plan - Following HF spacing pattern
// ─────────────────────────────────────────────────────────────────────────────
function Floor2Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
  const topLeft    = floor2topleft();      // [222, 221, 220, 219, 218]
  const topRight   = floor2Toprightmid(); // [223..233]
  const leftMid    = floor2leftmid();     // [217, 216, 215, 214, 213]
  const bottomLeft = floor2Bottomleft();  // [212, 211, 210, 209, 208, 207]
  const bottomRight= floor2bottomright(); // [201, 202, 203, 204, 205, 206]

  // Split topRight into two sections
  const topRightSection = topRight.slice(0, 6);  // 223-228
  const midRightSection = topRight.slice(6);     // 229-233

  const RoomCell = ({ r }) => (
    <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
      <RoomBlock
        room={r}
        roomInfo={getRoomInfo(r)}
        selectedRoom={selectedRoom}
        currentUser={currentUser}
        buildingName={buildingName}
        isLoading={isLoading}
        onClick={() => onRoomClick(r)}
      />
    </div>
  );

  return (
    <div className="flex flex-col w-full select-none">
      {/* SECTION 1 - Top section */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {topLeft.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {topRightSection.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>
      </div>

      {/* Balcony label - Left aligned like HF */}
      <div className="flex justify-start mt-3 mb-3 pl-2">
        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider italic">
          Balcony
        </span>
      </div>

      {/* SECTION 2 - Mid section */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {leftMid.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {midRightSection.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>
      </div>

      {/* Balcony (left) | Stairs (right) */}
      <div className="flex items-center justify-between mt-3 mb-3 px-2">
        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider italic">
          Balcony
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] xs:text-xs sm:text-sm text-slate-400 font-medium uppercase tracking-wider italic">
            Stairs
          </span>
        </div>
      </div>
        
      {/* SECTION 3 - Bottom section with Washroom */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
        {/* Left Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {bottomLeft.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
          {bottomRight.map((r) => (
            <div key={r} className="w-full flex justify-center">
              <RoomCell r={r} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function HeFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor  = Number(floor);
  const floorNum  = isValidFloor(rawFloor) ? rawFloor : 1;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentUser, setCurrentUser] = useState(getStoredSession);
  const sessionLoaded = true;

  const [isUnbooking, setIsUnbooking] = useState(false);
  const [showUnbookConfirm, setShowUnbookConfirm] = useState(false);
  const [bookingPeriod, setBookingPeriod] = useState(null);

  const meta = HE_FLOOR_META[floorNum] ?? HE_FLOOR_META[1];

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=HE`);
        const data = await res.json();
        if (data.success) setRoomsData(data.rooms || []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, [floorNum]);

  useEffect(() => {
    fetch("/api/booking-period")
      .then(res => res.json())
      .then(data => {
        if (data.success) setBookingPeriod(data.period);
      })
      .catch(err => console.error("Period fetch error:", err));
  }, []);

  // Fetch user's booking using floor-bookings API
  useEffect(() => {
    async function fetchUserBooking() {
      if (!currentUser) return;
      const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
      if (!studentNumber) return;
      try {
        const params = new URLSearchParams({
          building: HE_NAME,
          floor: String(floorNum),
          studentNumber: String(studentNumber),
        });
        const bookingsRes = await fetch(`/api/floor-bookings?${params.toString()}`);
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success && bookingsData.rooms) {
          let userBookedRoom = null;
          for (const room of bookingsData.rooms) {
            if (room.students && room.students.length > 0) {
              const hasUserBooking = room.students.some(student => 
                student.studentNumber === studentNumber
              );
              if (hasUserBooking) {
                userBookedRoom = room.roomNumber;
                break;
              }
            }
          }
          if (userBookedRoom) {
            setCurrentUser(prev => ({
              ...prev,
              bookedRoomNumber: userBookedRoom,
              hasBooked: true
            }));
          } else if (currentUser?.bookedRoomNumber) {
            setCurrentUser(prev => ({
              ...prev,
              bookedRoomNumber: null,
              hasBooked: false
            }));
            const updatedUser = { ...currentUser, bookedRoomNumber: null, hasBooked: false };
            localStorage.setItem("session", JSON.stringify(updatedUser));
          }
        }
      } catch (err) {
        console.error("Error fetching user booking:", err);
      }
    }
    if (currentUser) fetchUserBooking();
  }, [currentUser?.studentNumber, currentUser?.phoneNumber, currentUser?.stdNo, floorNum]);

  const getRoomInfo = (roomNo) => {
    const fullRoomId = `${HE_NAME}-${roomNo}`;
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return roomNumber === fullRoomId || getNumericRoomNumber(roomNumber) === roomNo;
    }) || { roomNumber: fullRoomId, isActive: true, occupied: 0, capacity: 3 };
  };

  function handleRoomClick(room) {
    const isYourBooking = currentUser?.bookedRoomNumber === `${HE_NAME}-${room}`;
    
    if (isYourBooking && canUnbook) {
      setShowUnbookConfirm(true);
    } else if (isYourBooking && !canUnbook) {
      showToast("Unbooking is not allowed at this time.");
    } else {
      setSelectedRoom((prev) => (prev === room ? null : room));
    }
  }

  function showToast(msg, type = "error") {
    setSelectedRoom(null);
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const canUnbook = bookingPeriod !== null && bookingPeriod.isActive === true;

    async function handleUnbook() {
      const studentNumber = currentUser?.studentNumber ?? currentUser?.phoneNumber ?? currentUser?.stdNo;
      if (!studentNumber) return;
      try {
        setIsUnbooking(true);
        const res = await fetch("/api/booking", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentNumber: String(studentNumber) }),
        });
        const result = await res.json();
        if (result.success) {
          showToast("Room unbooked successfully!", "success");
          const updatedUser = { ...currentUser, hasBooked: false, bookedRoomNumber: null };
          setCurrentUser(updatedUser);
          localStorage.setItem("session", JSON.stringify(updatedUser));
          setRoomsData((prev) =>
            prev.map((r) =>
              r.roomNumber === currentUser.bookedRoomNumber
                ? { ...r, occupied: Math.max((r.occupied || 1) - 1, 0) }
                : r
            )
          );
        } else {
          showToast(result.error || "Could not unbook.");
        }
      } catch (err) {
        showToast("Connection failed. Please try again.");
      } finally {
        setIsUnbooking(false);
        setShowUnbookConfirm(false);
      }
    }


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
        showToast(
          `Access Denied: This room is for ${
            roomGender.charAt(0).toUpperCase() + roomGender.slice(1)
          } only!`,
        );
        return false;
      }
      return true;
    } 

  const validateRoomYear = (roomNo) => {
    if (!currentUser?.year) {
      showToast("Student year not found. Please log in again.");
      return false;
    }

    const roomInfo = getRoomInfo(roomNo);
    if (!roomInfo) return true;

    const roomYear = Number(roomInfo.year);
    const userYear = Number(currentUser.year);

    // Special rule: year‑4 rooms allow 4th, 5th, and 6th year students
    if (roomYear === 4) {
      if (userYear < 4) {
        showToast("Access Denied: This room is reserved for Year 4+ students.");
        return false;
      }
      return true;
    }

    // For other years, require exact match
    if (roomYear !== userYear) {
      showToast(`Access Denied: This room is reserved for Year ${roomYear} students.`);
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

    // Year check
    const isCorrectYear = validateRoomYear(selectedRoom);
    if (!isCorrectYear) return;

    // Gender check
    const isCorrectGender = validateGender(selectedRoom);
    if (!isCorrectGender) return;

    const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
    if (!studentNumber) {
      showToast("Student number not found in session. Please log in again.");
      return;
    }

    const fullRoomId = `${HE_NAME}-${selectedRoom}`;

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
        showToast(`Room ${fullRoomId} reserved successfully! Details sent to your email.`, "success");
        const updatedUser = { ...currentUser, hasBooked: true, bookedRoomNumber: fullRoomId };
        setCurrentUser(updatedUser);
        localStorage.setItem("session", JSON.stringify(updatedUser));
        setRoomsData((prev) =>
          prev.map((r) =>
            r.roomNumber === fullRoomId ? { ...r, occupied: (r.occupied || 0) + 1 } : r,
          ),
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

  const floorPlanProps = { 
    getRoomInfo, 
    selectedRoom, 
    currentUser, 
    onRoomClick: handleRoomClick, 
    isLoading: loading || isBooking,
    buildingName: HE_NAME
  };

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
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] ${toastType === "success" ? "bg-green-800" : "bg-red-600"} text-white px-5 py-3 rounded-xl shadow-xl text-sm text-center max-w-sm w-[90%]`}>
            {toast}
          </div>
        )}

        {/* MOBILE HEADER */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <BackArrow />

          <FloorBookingsView
          building={HE_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />


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

        {/* MOBILE SIDEBAR DRAWER */}
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
                baseHref="/rooms/9/floor"
                floors={HE_FLOORS}
              />
            </div>
          </div>
        )}

        {/* DESKTOP HEADER */}
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
          <FloorBookingsView
          building={HE_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />

        </div>

        {/* BODY: SIDEBAR + FLOOR PLAN */}
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
          {/* Desktop sidebar */}
          <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
            <FloorSidebar
              currentFloor={floorNum}
              baseHref="/rooms/9/floor"
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
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}

        {showUnbookConfirm && (
          <ConfirmationDialog
            message={`Do you want to unbook Room ${currentUser?.bookedRoomNumber}?`}
            isLoading={isUnbooking}
            onCancel={() => !isUnbooking && setShowUnbookConfirm(false)}
            onConfirm={handleUnbook}
          />
        )}
      </div>
    </main>
  );
}
