"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import RoomLegend from "../../../components/RoomLegend";
import FloorBookingsView from "../../../components/FloorBookingsView";
import ConfirmationDialog from "../../../../confirmation";
import {
  LHAWANG_NAME,
  LHAWANG_FLOOR_META,
  LHAWANG_KITCHEN_LABELS,
  floor1LeftRoom,
  floor1RightRoom,
  floor2LeftColumn,
  floor2RightSection,
  floor3LeftColumn,
  floor3RightSection,
  floor4LeftColumn,
  floor4RightSection,
  floor5LeftRoom,
  floor5RightRoom,
} from "../../../data/lhawang";

const FLOORS = [1, 2, 3, 4, 5];

const STATUS = {
  AVAILABLE: "available",
  BOOKED: "booked",
  SELECTED: "selected",
};

function floorLabel(n) {
  return ["First", "Second", "Third", "Fourth", "Fifth"][n - 1] ?? String(n);
}

function isValidFloor(n) {
  return Number.isFinite(n) && n >= 1 && n <= 5;
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

const STATUS_STYLES = {
  [STATUS.AVAILABLE]: {
    border: "border-green-700",
    bg:     "bg-green-700",
    text:   "text-white",
    ring:   "",
    label:  "Available",
  },
  [STATUS.BOOKED]: {
    border: "border-slate-300",
    bg:     "bg-slate-100",
    text:   "text-slate-500",
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

function SmallRoom({ room, status, label, onClick }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[STATUS.AVAILABLE];
  const clickable = status !== STATUS.BOOKED;
  return (
    <button
      disabled={!clickable}
      onClick={clickable ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center w-full h-full
        rounded-lg border-2 shadow-sm transition-all duration-200
        ${s.border} ${s.bg} ${s.ring}
        ${clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-not-allowed opacity-60"}
      `}
    >
      <span className="text-sm xs:text-base sm:text-lg font-semibold tracking-wider text-slate-700">
        {room}
      </span>
      <span className={`text-[9px] xs:text-[10px] sm:text-[11px] font-medium mt-0.5 ${s.text}`}>
        {label ?? s.label}
      </span>
    </button>
  );
}

function LargeRoom({ room, status, label, onClick }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES[STATUS.AVAILABLE];
  const clickable = status !== STATUS.BOOKED;
  return (
    <button
      disabled={!clickable}
      onClick={clickable ? onClick : undefined}
      className={`
        relative flex flex-col items-center justify-center w-full h-full
        rounded-xl border-2 shadow-sm transition-all duration-200
        ${s.border} ${s.bg} ${s.ring}
        ${clickable
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md"
          : "cursor-not-allowed opacity-60"}
      `}
    >
      <span className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wider text-slate-700">
        {room}
      </span>
      <span className={`text-xs sm:text-sm font-medium mt-1 ${s.text}`}>
        {label ?? s.label}
      </span>
    </button>
  );
}

function KitchenBlock({ label }) {
  return (
    <div className="flex items-center justify-center w-full h-full rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
      <span className="text-xs xs:text-sm sm:text-base text-slate-400 font-medium px-2 text-center">
        {label}
      </span>
    </div>
  );
}

function StairsIndicator() {
  return (
    <div className="flex flex-col items-center gap-0.5 select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 sm:h-6 sm:w-6 text-slate-500"
        fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
      </svg>
      <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium">
        Stairs
      </span>
    </div>
  );
}

function RightArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 sm:h-6 sm:w-6 text-slate-600 flex-shrink-0"
      fill="none" viewBox="0 0 24 24"
      stroke="currentColor" strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
/** FLOOR 1 — two large rooms: 102 | Stairs | 101 */
function Floor1Plan({ getStatus, getRoomLabel, onRoomClick }) {
  const leftRoom  = floor1LeftRoom();   // 102
  const rightRoom = floor1RightRoom();  // 101
  const RH = "h-[200px] xs:h-[240px] sm:h-[290px] md:h-[350px]";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 sm:gap-6 md:gap-10">
      <div className={RH}>
        <LargeRoom room={leftRoom} status={getStatus(leftRoom)} label={getRoomLabel(leftRoom)} onClick={() => onRoomClick(leftRoom)} />
      </div>
      <StairsIndicator />
      <div className={RH}>
        <LargeRoom room={rightRoom} status={getStatus(rightRoom)} label={getRoomLabel(rightRoom)} onClick={() => onRoomClick(rightRoom)} />
      </div>
    </div>
  );
}

/** FLOOR 2 — Kitchen 1 + rooms 203/202/201 left | 204→205, 206, Stairs+207 right */
function Floor2Plan({ getStatus, getRoomLabel, onRoomClick }) {
  const leftRooms = floor2LeftColumn();                                  // [203, 202, 201]
  const { connectedPair, standaloneRoom, stairsRoom } = floor2RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[2];
  const TH = "h-[44px] xs:h-[50px] sm:h-[56px] md:h-[62px]";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4 sm:gap-6 md:gap-8 items-start">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}><KitchenBlock label={kitchenLabel} /></div>
        {leftRooms.map((r) => (
          <div key={r} className={TH}>
            <SmallRoom room={r} status={getStatus(r)} label={getRoomLabel(r)} onClick={() => onRoomClick(r)} />
          </div>
        ))}
      </div>

      {/* Right section */}
      <div className="flex flex-col gap-3">
        {/* Connected pair: 204 → 205 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={connectedPair[0]} status={getStatus(connectedPair[0])} label={getRoomLabel(connectedPair[0])} onClick={() => onRoomClick(connectedPair[0])} />
          </div>
          <RightArrow />
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={connectedPair[1]} status={getStatus(connectedPair[1])} label={getRoomLabel(connectedPair[1])} onClick={() => onRoomClick(connectedPair[1])} />
          </div>
        </div>

        {/* Invisible spacer to match image positioning */}
        <div className={`${TH} invisible`} aria-hidden="true" />

        {/* 206 — right-aligned */}
        <div className={`w-[48%] self-end ${TH}`}>
          <SmallRoom room={standaloneRoom} status={getStatus(standaloneRoom)} label={getRoomLabel(standaloneRoom)} onClick={() => onRoomClick(standaloneRoom)} />
        </div>

        {/* Stairs + 207 */}
        <div className="flex items-center gap-3 sm:gap-4 pt-1">
          <StairsIndicator />
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={stairsRoom} status={getStatus(stairsRoom)} label={getRoomLabel(stairsRoom)} onClick={() => onRoomClick(stairsRoom)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** FLOOR 3 — Kitchen 2 + rooms 304–301 left | Enter, 305→306, 307, 308, Stairs+309 right */
function Floor3Plan({ getStatus, getRoomLabel, onRoomClick }) {
  const leftRooms = floor3LeftColumn();                                              // [304, 303, 302, 301]
  const { connectedPair, stackedRooms, stairsRoom } = floor3RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[3];
  const TH = "h-[44px] xs:h-[50px] sm:h-[56px] md:h-[62px]";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4 sm:gap-6 md:gap-8 items-start">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}><KitchenBlock label={kitchenLabel} /></div>
        {leftRooms.map((r) => (
          <div key={r} className={TH}>
            <SmallRoom room={r} status={getStatus(r)} label={getRoomLabel(r)} onClick={() => onRoomClick(r)} />
          </div>
        ))}
      </div>

      {/* Right section */}
      <div className="flex flex-col gap-3">
        {/* Enter label */}
        <p className="text-xs sm:text-sm font-semibold text-slate-500 text-right pr-1">
          Enter
        </p>

        {/* 305 → 306 */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={connectedPair[0]} status={getStatus(connectedPair[0])} label={getRoomLabel(connectedPair[0])} onClick={() => onRoomClick(connectedPair[0])} />
          </div>
          <RightArrow />
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={connectedPair[1]} status={getStatus(connectedPair[1])} label={getRoomLabel(connectedPair[1])} onClick={() => onRoomClick(connectedPair[1])} />
          </div>
        </div>

        {/* 307, 308 — left-aligned */}
        {stackedRooms.map((r) => (
          <div key={r} className={`w-[48%] self-start ${TH}`}>
            <SmallRoom room={r} status={getStatus(r)} label={getRoomLabel(r)} onClick={() => onRoomClick(r)} />
          </div>
        ))}

        {/* Stairs + 309 */}
        <div className="flex items-center gap-3 sm:gap-4 pt-1">
          <StairsIndicator />
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={stairsRoom} status={getStatus(stairsRoom)} label={getRoomLabel(stairsRoom)} onClick={() => onRoomClick(stairsRoom)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** FLOOR 4 — Kitchen 3 + rooms 403–401 left | Enter, 405→out, 407, Stairs+408 right */
function Floor4Plan({ getStatus, getRoomLabel, onRoomClick }) {
  const leftRooms = floor4LeftColumn();                                               // [403, 402, 401]
  const { entranceRoom, standaloneRoom, stairsRoom } = floor4RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[4];
  const TH = "h-[44px] xs:h-[50px] sm:h-[56px] md:h-[62px]";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr] gap-4 sm:gap-6 md:gap-8 items-start">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}><KitchenBlock label={kitchenLabel} /></div>
        {leftRooms.map((r) => (
          <div key={r} className={TH}>
            <SmallRoom room={r} status={getStatus(r)} label={getRoomLabel(r)} onClick={() => onRoomClick(r)} />
          </div>
        ))}
      </div>

      {/* Right section */}
      <div className="flex flex-col gap-3">
        {/* Enter label */}
        <p className="text-xs sm:text-sm font-semibold text-slate-500 text-right pr-1">
          Enter
        </p>

        {/* 405 → (outward entrance arrow, no room on right) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={entranceRoom} status={getStatus(entranceRoom)} label={getRoomLabel(entranceRoom)} onClick={() => onRoomClick(entranceRoom)} />
          </div>
          <RightArrow />
          <div className="w-8 sm:w-10 flex-shrink-0" /> {/* empty — arrow points outward */}
        </div>

        {/* 407 — right-aligned */}
        <div className={`w-[48%] self-end ${TH}`}>
          <SmallRoom room={standaloneRoom} status={getStatus(standaloneRoom)} label={getRoomLabel(standaloneRoom)} onClick={() => onRoomClick(standaloneRoom)} />
        </div>

        {/* Stairs + 408 */}
        <div className="flex items-center gap-3 sm:gap-4 pt-1">
          <StairsIndicator />
          <div className={`flex-1 ${TH}`}>
            <SmallRoom room={stairsRoom} status={getStatus(stairsRoom)} label={getRoomLabel(stairsRoom)} onClick={() => onRoomClick(stairsRoom)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** FLOOR 5 — two large rooms: 502 (left + stairs) | 501 (right + stairs) */
function Floor5Plan({ getStatus, getRoomLabel, onRoomClick }) {
  const leftRoom  = floor5LeftRoom();   // 502
  const rightRoom = floor5RightRoom();  // 501
  const RH = "h-[180px] xs:h-[220px] sm:h-[270px] md:h-[330px]";

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:gap-10">
      <div className="flex flex-col items-center gap-3">
        <div className={`w-full ${RH}`}>
          <LargeRoom room={leftRoom} status={getStatus(leftRoom)} label={getRoomLabel(leftRoom)} onClick={() => onRoomClick(leftRoom)} />
        </div>
        <StairsIndicator />
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-full ${RH}`}>
          <LargeRoom room={rightRoom} status={getStatus(rightRoom)} label={getRoomLabel(rightRoom)} onClick={() => onRoomClick(rightRoom)} />
        </div>
        <StairsIndicator />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────
export default function LhawangFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor  = Number(floor);
  const floorNum  = isValidFloor(rawFloor) ? rawFloor : 1;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  // Replace with real API data, e.g.: const [bookedRooms] = useState(new Set([201, 305]));
  const [bookedRooms] = useState(new Set());
  const [roomsData, setRoomsData] = useState([]);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentUser, setCurrentUser] = useState(getStoredSession);

  const meta = LHAWANG_FLOOR_META[floorNum] ?? LHAWANG_FLOOR_META[1];

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=Lhawang`);
        const data = await res.json();
        if (data.success) setRoomsData(data.rooms || []);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    fetchRooms();
  }, [floorNum]);

  const getRoomInfo = (roomNo) => {
    const fullRoomId = `LH-${roomNo}`;
    const roomDigits = getNumericRoomNumber(roomNo);
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return (
        roomNumber === fullRoomId ||
        getNumericRoomNumber(roomNumber) === roomNo ||
        (roomDigits !== null && getNumericRoomNumber(roomNumber) === roomDigits)
      );
    });
  };

  function getStatus(room) {
    if (room === selectedRoom)  return STATUS.SELECTED;
    if (bookedRooms.has(room))  return STATUS.BOOKED;
    const roomInfo = getRoomInfo(room);
    if (!roomInfo) return STATUS.AVAILABLE;
    if (!roomInfo.isActive || (roomInfo.occupied || 0) >= (roomInfo.capacity || 0)) {
      return STATUS.BOOKED;
    }
    return STATUS.AVAILABLE;
  }

  function getRoomLabel(room) {
    const status = getStatus(room);
    if (status === STATUS.SELECTED) return STATUS_STYLES[STATUS.SELECTED].label;

    const roomInfo = getRoomInfo(room);
    if (!roomInfo) return STATUS_STYLES[status]?.label ?? STATUS_STYLES[STATUS.AVAILABLE].label;
    if (!roomInfo.isActive) return roomInfo.disabledReason || "Inactive";

    const occupied = roomInfo.occupied || 0;
    const capacity = roomInfo.capacity || 0;
    if (!capacity) return STATUS_STYLES[status]?.label ?? STATUS_STYLES[STATUS.AVAILABLE].label;
    if (occupied >= capacity) return `${capacity}/${capacity} Booked`;
    if (occupied > 0) return `${occupied}/${capacity} Booked`;
    return `${capacity - occupied} Available`;
  }

  function handleRoomClick(room) {
    setSelectedRoom((prev) => (prev === room ? null : room));
  }

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
      const res = await fetch(`/api/floor-allocation?building=Lhawang&floor=${floorNum}`);
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
      showToast(
        `Access Denied: This room is for ${
          roomGender.charAt(0).toUpperCase() + roomGender.slice(1)
        } only!`,
      );
      return false;
    }

    return true;
  };

  async function handleConfirmBooking() {
    if (selectedRoom === null) return;

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

    const roomInfo = getRoomInfo(selectedRoom);
    const fullRoomId = roomInfo?.roomNumber ?? `LH-${selectedRoom}`;

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
        const updatedUser = { ...currentUser, hasBooked: true };
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

  const floorPlanProps = { getStatus, getRoomLabel, onRoomClick: handleRoomClick };

  const PLANS = {
    1: <Floor1Plan {...floorPlanProps} />,
    2: <Floor2Plan {...floorPlanProps} />,
    3: <Floor3Plan {...floorPlanProps} />,
    4: <Floor4Plan {...floorPlanProps} />,
    5: <Floor5Plan {...floorPlanProps} />,
  };

  const BackArrow = () => (
    <Link href="/" className="inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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

        
        <FloorBookingsView
          building={LHAWANG_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />
{/* ── Mobile header ── */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <BackArrow />
          <h1 className="flex-1 text-center text-base xs:text-lg font-semibold tracking-wide">
            {LHAWANG_NAME} {floorLabel(floorNum)} floor
          </h1>
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="pointer px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5 text-xs"
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

        {/* ── Mobile sidebar drawer ── */}
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
                floors={FLOORS}
              />
            </div>
          </div>
        )}

        {/* ── Desktop header ── */}
        <div className="hidden md:flex items-center mb-4 sm:mb-5 lg:mb-6">
          <BackArrow />
          <div className="text-center flex-1">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide">
              {LHAWANG_NAME} {floorLabel(floorNum)} floor
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

        {/* ── Body: sidebar + floor plan ── */}
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6">

          {/* Desktop sidebar */}
          <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
            <FloorSidebar
              currentFloor={floorNum}
              baseHref="/rooms/10/floor"
              floors={FLOORS}
            />
          </div>

          {/* Floor plan + legend */}
          <div className="flex-1 min-w-0">
            <section className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-4 sm:p-6 md:p-8 shadow-lg backdrop-blur w-full">
              {PLANS[floorNum]}
            </section>
            <div className="mt-4 sm:mt-5">
              <RoomLegend />
            </div>
          </div>
        </div>

        {/* ── Confirmation dialog ── */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Do you want to book a bed from Room ${LHAWANG_NAME}-${selectedRoom}?`}
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}
