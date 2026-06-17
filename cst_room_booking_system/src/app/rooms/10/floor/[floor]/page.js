"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import FloorBookingsView from "../../../components/FloorBookingsView";
import ConfirmationDialog from "../../../../confirmation";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";
import {
  LHAWANG_HOSTEL_NAME, 
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

// ─────────────────────────────────────────────────────────────────────────────
// Room Block - Consistent with HA
// ─────────────────────────────────────────────────────────────────────────────

function RoomBlock({ room, onClick, roomInfo, selectedRoom, currentUser, buildingName, isLoading }) {
  const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(
    roomInfo,
    selectedRoom,
    currentUser,
    buildingName,
    room
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
        {statusText}
      </span>
    </button>
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
      <span className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
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

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR 1 — two rooms: 102 | Stairs | 101
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// FLOOR 1 — two rooms: 102 | Stairs | 101
// ─────────────────────────────────────────────────────────────────────────────
function Floor1Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
  const leftRoom  = floor1LeftRoom();
  const rightRoom = floor1RightRoom();
  const TH = "h-[40px]";
  const RW = "w-[110px] sm:w-[140px] md:w-[160px]";

  return (
    <div className="flex items-center justify-center gap-8 sm:gap-16 md:gap-24 w-full">
      <div className={`${RW} ${TH} flex-shrink-0`}>
        <RoomBlock
          room={leftRoom}
          roomInfo={getRoomInfo(leftRoom)}
          selectedRoom={selectedRoom}
          currentUser={currentUser}
          buildingName={buildingName}
          isLoading={isLoading}
          onClick={() => onRoomClick(leftRoom)}
        />
      </div>
      <StairsIndicator />
      <div className={`${RW} ${TH} flex-shrink-0`}>
        <RoomBlock
          room={rightRoom}
          roomInfo={getRoomInfo(rightRoom)}
          selectedRoom={selectedRoom}
          currentUser={currentUser}
          buildingName={buildingName}
          isLoading={isLoading}
          onClick={() => onRoomClick(rightRoom)}
        />
      </div>
    </div>
  );
}

/** FLOOR 2 — Kitchen 1 + rooms 203/202/201 left | 204→205, 206, Stairs+207 right */
function Floor2Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName,kitchenRoom }) {
  const leftRooms = floor2LeftColumn();                                  // [203, 202, 201]
  const { connectedPair, standaloneRoom, stairsRoom } = floor2RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[2];
  const TH = "h-[40px] sm:h-[46px]";
  const RW = "w-[100px] sm:w-[130px] md:w-[150px]";

  return (
    <div className="flex flex-row justify-between w-full gap-4">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}>
          <RoomBlock 
            room={kitchenRoom}
            roomInfo={getRoomInfo(kitchenRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(kitchenRoom)}
          />
        </div>
        {leftRooms.map((r) => (
          <div key={r} className={`${RW} ${TH}`}>
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
        ))}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-start gap-3 flex-shrink-0">
        {/* 204 → 205 */}
        <div className="flex items-center gap-2">
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={connectedPair[0]}
              roomInfo={getRoomInfo(connectedPair[0])}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(connectedPair[0])}
            />
          </div>
          <RightArrow />
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={connectedPair[1]}
              roomInfo={getRoomInfo(connectedPair[1])}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(connectedPair[1])}
            />
          </div>
        </div>

        <div className="h-1" />

        {/* 206 — aligned to the right of pair */}
        <div className={`${RW} ${TH} self-end`}>
          <RoomBlock
            room={standaloneRoom}
            roomInfo={getRoomInfo(standaloneRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(standaloneRoom)}
          />
        </div>

        {/* Stairs + 207 */}
        <div className="flex items-center gap-2">
          <StairsIndicator />
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={stairsRoom}
              roomInfo={getRoomInfo(stairsRoom)}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(stairsRoom)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** FLOOR 3 — Kitchen 2 + rooms 304–301 left | Enter, 305→306, 307, 308, Stairs+309 right */
function Floor3Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName,kitchenRoom }) {
  const leftRooms = floor3LeftColumn();                                              // [304, 303, 302, 301]
  const { connectedPair, stackedRooms, stairsRoom } = floor3RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[3];
  const TH = "h-[40px] sm:h-[46px]";
  const RW = "w-[100px] sm:w-[130px] md:w-[150px]";

  const stackedRoomsArray = Array.isArray(stackedRooms) ? stackedRooms : [stackedRooms];
  const stairsRoomArray   = Array.isArray(stairsRoom)   ? stairsRoom   : [stairsRoom];

  return (
    <div className="flex flex-row justify-between w-full gap-4">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}>
          <RoomBlock 
            room={kitchenRoom}
            roomInfo={getRoomInfo(kitchenRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(kitchenRoom)}
          />
        </div>
        {leftRooms.map((r) => (
          <div key={r} className={`${RW} ${TH}`}>
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
        ))}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-start gap-3 flex-shrink-0">
        {/* 306 → 305 */}
        <div className="flex items-center gap-2">
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={connectedPair[0]}
              roomInfo={getRoomInfo(connectedPair[0])}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(connectedPair[0])}
            />
          </div>
          <RightArrow />
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={connectedPair[1]}
              roomInfo={getRoomInfo(connectedPair[1])}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(connectedPair[1])}
            />
          </div>
        </div>

        {/* Stacked rooms (307) */}
        {stackedRoomsArray.map((r) => (
          <div key={r} className={`${RW} ${TH}`}>
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
        ))}

        {/* Stairs */}
        <StairsIndicator />

        {/* 308, 309 */}
        <div className="flex items-center gap-3">
          {stairsRoomArray.map((r) => (
            <div key={r} className={`${RW} ${TH}`}>
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
          ))}
        </div>
      </div>
    </div>
  );
}

/** FLOOR 4 — Kitchen 3 + rooms 403–401 left | Enter, 405→out, 407, Stairs+408 right */
function Floor4Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName,kitchenRoom }) {
  const leftRooms = floor4LeftColumn();                                               // [403, 402, 401]
  const { entranceRoom, standaloneRoom, stairsRoom } = floor4RightSection();
  const kitchenLabel = LHAWANG_KITCHEN_LABELS[4];
  const TH = "h-[40px] sm:h-[46px]";
  const RW = "w-[100px] sm:w-[130px] md:w-[150px]";

  const stairsRoomArray = Array.isArray(stairsRoom) ? stairsRoom : [stairsRoom];

  return (
    <div className="flex flex-row justify-between w-full gap-4">

      {/* Left column */}
      <div className="flex flex-col gap-3">
        <div className={TH}>
          <RoomBlock 
            room={kitchenRoom}
            roomInfo={getRoomInfo(kitchenRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(kitchenRoom)}
          />
        </div>

        {leftRooms.map((r) => (
          <div key={r} className={`${RW} ${TH}`}>
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
        ))}
      </div>

      {/* Right column */}
      <div className="flex flex-col items-start gap-3 flex-shrink-0">
        {/* 404 entrance */}
        <div className="flex items-center gap-2">
          <div className={`${RW} ${TH}`}>
            <RoomBlock
              room={entranceRoom}
              roomInfo={getRoomInfo(entranceRoom)}
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              buildingName={buildingName}
              isLoading={isLoading}
              onClick={() => onRoomClick(entranceRoom)}
            />
          </div>
          <div className="w-6" />
        </div>

        {/* 405 */}
        <div className={`${RW} ${TH}`}>
          <RoomBlock
            room={standaloneRoom}
            roomInfo={getRoomInfo(standaloneRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(standaloneRoom)}
          />
        </div>

        {/* Stairs */}
        <StairsIndicator />

        {/* 406, 407 */}
        <div className="flex items-center gap-3">
          {stairsRoomArray.map((r) => (
            <div key={r} className={`${RW} ${TH}`}>
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
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOOR 5 — two rooms: 502 (left) | 501 (right) with stairs below each
// ─────────────────────────────────────────────────────────────────────────────
function Floor5Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
  const leftRoom  = floor5LeftRoom();
  const rightRoom = floor5RightRoom();
  const TH = "h-[40px] sm:h-[46px]";
  const RW = "w-[110px] sm:w-[140px] md:w-[160px]";

  return (
    <div className="flex flex-row justify-between w-full gap-4">
      {/* Left: room + stairs below */}
      <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <div className={`${RW} ${TH}`}>
          <RoomBlock
            room={leftRoom}
            roomInfo={getRoomInfo(leftRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(leftRoom)}
          />
        </div>
        <StairsIndicator />
      </div>

      {/* Right: room + stairs below */}
      <div className="flex flex-col items-center gap-3 flex-shrink-0">
        <div className={`${RW} ${TH}`}>
          <RoomBlock
            room={rightRoom}
            roomInfo={getRoomInfo(rightRoom)}
            selectedRoom={selectedRoom}
            currentUser={currentUser}
            buildingName={buildingName}
            isLoading={isLoading}
            onClick={() => onRoomClick(rightRoom)}
          />
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
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentUser, setCurrentUser] = useState(getStoredSession);
  const sessionLoaded = true;

  const [canUnbook, setCanUnbook] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);
  const [showUnbookConfirm, setShowUnbookConfirm] = useState(false);

  const meta = LHAWANG_FLOOR_META[floorNum] ?? LHAWANG_FLOOR_META[1];

  const kitchenRoom = LHAWANG_KITCHEN_LABELS[floorNum]

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=${LHAWANG_HOSTEL_NAME}`);
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
    async function fetchBookingPeriod() {
      try {
        const res = await fetch("/api/booking-period");
        const data = await res.json();
        if (data.success) {
          setCanUnbook(data.period);
        }
      } catch (err) {
        console.error("Error fetching booking period:", err);
      }
    }
    fetchBookingPeriod();
  }, []);

  // Fetch user's booking using floor-bookings API
  useEffect(() => {
    async function fetchUserBooking() {
      if (!currentUser) return;
      const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
      if (!studentNumber) return;
      try {
        const params = new URLSearchParams({
          building: LHAWANG_HOSTEL_NAME,
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
  

  function getRoomInfo(roomNo) {
    const fullRoomId = `${LHAWANG_NAME}-${roomNo}`;
    // Check if roomNo is purely numeric (e.g., "201")
    const isNumeric = /^\d+$/.test(String(roomNo));
    const roomDigits = isNumeric ? getNumericRoomNumber(roomNo) : null;

    return roomsData.find((r) => {
      const rn = String(r.roomNumber);
      // 1) Exact match on full ID (e.g., "LH-K201")
      if (rn === fullRoomId) return true;

      // 2) Numeric match only for numeric rooms (prevents "K201" from matching "LH-201")
      if (isNumeric && roomDigits !== null) {
        const rDigits = getNumericRoomNumber(rn);
        if (rDigits === roomDigits) return true;
      }

      // 3) Suffix match (after the hyphen) for rooms like K201
      const suffix = rn.includes('-') ? rn.split('-').pop() : rn;
      if (suffix === roomNo) return true;

      return false;
    }) || { roomNumber: fullRoomId, isActive: true, occupied: 0, capacity: 3 };
  }

  function handleRoomClick(room) {
      const fullRoomId = `${LHAWANG_NAME}-${room}`;
      const isYourBooking = 
        currentUser?.bookedRoomNumber === room || 
        currentUser?.bookedRoomNumber === fullRoomId;

      if (isYourBooking) {
        if (canUnbook) {
          setShowUnbookConfirm(true);          // ✅ only set the unbook flag
          // Do NOT set selectedRoom – we'll use currentUser.bookedRoomNumber for unbooking
        } else {
          showToast("Unbooking is not allowed at this time.", "error");
        }
      } else {
        // Standard booking toggle
        setSelectedRoom((prev) => (prev === room ? null : room));
      }
    }

  function showToast(msg, type = "error") {
    setSelectedRoom(null);
    setToastType(type);
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  const validateFloorYear = (roomNo) => {
    if (!currentUser?.year) {
      showToast("Student year not found. Please log in again.");
      return false;
    }

    const roomInfo = getRoomInfo(roomNo);
    if (!roomInfo) return true; // no room info, allow

    // Convert to numbers for safe comparison
    const roomYear = Number(roomInfo.year);
    const userYear = Number(currentUser.year);

    // If room is for year 4, allow 4th, 5th, and 6th year students
    if (roomYear === 4) {
      if (userYear < 4) {
        showToast(`Access Denied: This room is reserved for Year 4+ students.`);
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

    if (!sessionLoaded) {
      showToast("Session is still loading, please wait.");
      return;
    }

    if (!currentUser) {
      showToast("You must be logged in to book a room.");
      router.push("/login");
      return;
    }

    const isCorrectYear = validateFloorYear(selectedRoom);
    if (!isCorrectYear) return;

    const isCorrectGender = validateGender(selectedRoom);
    if (!isCorrectGender) return;

    const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;

    if (!studentNumber) {
      showToast("Student number not found in session. Please log in again.");
      return;
    }

    const roomInfo = getRoomInfo(selectedRoom);
    const fullRoomId = roomInfo?.roomNumber ?? `${LHAWANG_NAME}-${selectedRoom}`;

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

  async function handleUnbook() {
    const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
    if (!studentNumber) {
      showToast("Student context not found. Please log in again.", "error");
      return;
    }

    // Use the room number already stored in the user session
    const bookedRoom = currentUser.bookedRoomNumber;
    if (!bookedRoom) {
      showToast("No active booking found.", "error");
      return;
    }

    try {
      setIsUnbooking(true);
      const res = await fetch("/api/booking", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentNumber: String(studentNumber) }),
      });

      const result = await res.json();
      if (result.success) {
        showToast(`Your booking for Room ${bookedRoom} has been cancelled.`, "success");

        // Reset user state
        const updatedUser = { ...currentUser, hasBooked: false, bookedRoomNumber: null };
        setCurrentUser(updatedUser);
        localStorage.setItem("session", JSON.stringify(updatedUser));

        // Decrease occupied count for that room
        setRoomsData((prev) =>
          prev.map((r) =>
            r.roomNumber === bookedRoom
              ? { ...r, occupied: Math.max((r.occupied || 1) - 1, 0) }
              : r
          )
        );
      } else {
        showToast("Error: " + (result.error || "Could not cancel booking."));
      }
    } catch (err) {
      console.error("Unbooking error:", err);
      showToast("Connection failed. Please try again.", "error");
    } finally {
      setIsUnbooking(false);
      setShowUnbookConfirm(false);
    }
  }

  const floorPlanProps = { 
    getRoomInfo, 
    selectedRoom, 
    currentUser, 
    onRoomClick: handleRoomClick, 
    isLoading: loading || isBooking,
    buildingName: LHAWANG_NAME,
    kitchenRoom
  };

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
        {/* ── Mobile header ── */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <BackArrow />

        <FloorBookingsView
          building={LHAWANG_HOSTEL_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />

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
          <FloorBookingsView
          building={LHAWANG_HOSTEL_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />

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
        {selectedRoom !== null && !showUnbookConfirm && (
          <ConfirmationDialog
            message={`Do you want to book a bed from Room ${LHAWANG_NAME}-${selectedRoom}?`}
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}

        {/* Unbooking confirmation – uses the stored booked room number */}
        {showUnbookConfirm && (
          <ConfirmationDialog
            message={`Are you sure you want to unbook Room ${currentUser?.bookedRoomNumber ?? ''}?`}
            isLoading={isUnbooking}
            onCancel={() => !isUnbooking && setShowUnbookConfirm(false)}
            onConfirm={handleUnbook}
          />
        )}
      </div>
    </main>
  );
}

