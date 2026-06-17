"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import FloorBookingsView from "../../../components/FloorBookingsView";
import ConfirmationDialog from "../../../../confirmation";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";
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

export default function HaFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomsData, setRoomsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentUser, setCurrentUser] = useState(getStoredSession);
  const sessionLoaded = true;

  const [isUnbooking, setIsUnbooking] = useState(false);
  const [showUnbookConfirm, setShowUnbookConfirm] = useState(false);
  const [bookingPeriod, setBookingPeriod] = useState(null);

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
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
          building: HA_NAME,
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
    if (currentUser && isValid) fetchUserBooking();
  }, [currentUser?.studentNumber, currentUser?.phoneNumber, currentUser?.stdNo, floorNum, isValid]);

  const getRoomInfo = (roomNo) => {
    const fullRoomId = `${HA_NAME}-${roomNo}`;
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return roomNumber === fullRoomId || getNumericRoomNumber(roomNumber) === roomNo;
    });
  };

  // Redirect if invalid floor
  useEffect(() => {
    if (!isValid) router.replace("/rooms/4/floor/1");
  }, [isValid, router]);

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
    const fullRoomId = `${HA_NAME}-${selectedRoom}`;
    try {
      setIsBooking(true);
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomNumber: fullRoomId,
          studentNumber: String(studentNumber),
          email: currentUser.email,
          checkIn: new Date().toISOString(),
          checkOut: new Date(
            new Date().setMonth(new Date().getMonth() + 6),
          ).toISOString(),
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
            r.roomNumber === fullRoomId
              ? { ...r, occupied: (r.occupied || 0) + 1 }
              : r,
          ),
        );
      } else {
        showToast("Error: " + (result.error || "Could not book"));
      }
    } catch (err) {
      console.error("Booking error:", err);
      showToast("Connection failed.");
    } finally {
      setIsBooking(false);
      setSelectedRoom(null);
    }
  }

  // Room Block component using getRoomColors
  const RoomBlock = ({ room }) => {
    const roomInfo = getRoomInfo(room);
    const isSelected = selectedRoom === room;
    
    if (!roomInfo) {
      return (
        <div className="w-full h-full rounded-xl border border-slate-200 bg-slate-50 animate-pulse flex items-center justify-center">
          <span className="text-[10px] text-slate-400">Loading...</span>
        </div>
      );
    }

    const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(
      roomInfo, selectedRoom, currentUser, HA_NAME, room
    );

    const isYourBooking = currentUser?.bookedRoomNumber === `${HA_NAME}-${room}`;

    return (
      <button
        disabled={isDisabled || loading}
        className={`group relative rounded-xl border shadow-sm transition-all duration-200 w-full h-full flex flex-col items-center justify-center p-1 disabled:shadow-none ${colorClasses} ${
          isSelected ? "ring-2 ring-emerald-300" : ""
        }`}
        onClick={() => {
          if (isYourBooking && canUnbook) {
            setShowUnbookConfirm(true);
          } else if (isYourBooking && !canUnbook) {
            showToast("Unbooking is not allowed at this time.");
          } else {
            setSelectedRoom(room);
          }
        }}
      >
        <span className="text-[11px] font-bold tracking-tight">
          {room}
        </span>
        <span className={`text-[9px] xs:text-[10px] sm:text-[11px] whitespace-nowrap ${textColorClass}`}>
          {isYourBooking ? (canUnbook ? "Your Room" : "Your Room") : statusText}
        </span>
      </button>
    );
  };

  // SPATIAL DATA
  const leftRooms = useMemo(() => haLeftRoomsForFloor(floorNum), [floorNum]);
  const rightRooms = useMemo(() => haRightRoomsForFloor(floorNum), [floorNum]);

  const filteredRightRooms = useMemo(() => {
    if (floorNum === 1) return rightRooms.filter((r) => r !== 109);
    return rightRooms;
  }, [floorNum, rightRooms]);

  const leftTopRooms = floorNum === 1 ? leftRooms.slice(0, 4) : leftRooms.slice(0, 3);
  const leftBottomRooms = floorNum === 1 ? leftRooms.slice(4) : leftRooms.slice(3);
  const rightTopRooms = floorNum === 1 ? [109, ...filteredRightRooms.slice(0, 2)] : filteredRightRooms.slice(0, 3);
  const rightBottomRooms = floorNum === 1 ? filteredRightRooms.slice(2, 4) : filteredRightRooms.slice(3, 5);

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
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

          <FloorBookingsView
          building={HA_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />

          <h1 className="text-center text-base xs:text-lg font-semibold tracking-wide flex-1">
            {HA_NAME} {floorLabel(floorNum)} floor
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
          <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
            <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-4" onClick={(e) => e.stopPropagation()}>
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/4/floor"
                floors={[1, 2, 3]}
              />
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide uppercase">
              {HA_NAME} {floorLabel(floorNum)} floor
            </h1>

            
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span className="hidden sm:inline">
                <span className="font-medium">Total Rooms:</span> {leftRooms.length + rightRooms.length}
              </span>
              <span className="hidden sm:inline">
                <span className="font-medium">Total Beds:</span> {(leftRooms.length + rightRooms.length) * 2}
              </span>
            </div>
          </div>

          <FloorBookingsView
          building={HA_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />
        </div>

        {/* Main Layout */}
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
                  {/* LEFT COLUMN */}
                  <div className="flex flex-col items-center gap-3">
                    {leftTopRooms.map((r) => (
                      <div key={r} className="w-full max-w-[140px] h-[40px] md:h-[46px]">
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    {floorNum === 1 && (
                      <div className="my-4 text-xs text-slate-400 italic">
                        Main Entrance
                      </div>
                    )}
                    {leftBottomRooms.map((r) => (
                      <div key={r} className="w-full max-w-[140px] h-[40px] md:h-[46px]">
                        <RoomBlock room={r} />
                      </div>
                    ))}
                  </div>

                  {/* CORRIDOR */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200" />
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="flex flex-col items-center gap-3">
                    <SpecialBlock text="🚻 Restroom" type="washroom" />
                    {rightTopRooms.map((r) => (
                      <div key={r} className="w-full max-w-[140px] h-[40px] md:h-[46px]">
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    
                    <div className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
    Stairs
  </div>

                    {rightBottomRooms.map((r) => (
                      <div key={r} className="w-full max-w-[140px] h-[40px] md:h-[46px]">
                        <RoomBlock room={r} />
                      </div>
                    ))}
                    <SpecialBlock text="🚻 Restroom" type="washroom" />
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