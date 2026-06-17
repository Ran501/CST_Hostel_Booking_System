"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import FloorBookingsView from "../../../components/FloorBookingsView";
import ConfirmationDialog from "../../../../confirmation";
import SpecialBlock from "../../../../room/components/SpecialBlock";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";

import {
  HF_NAME,
  getFloorConfig,
  getTotalRoomsForFloor,
  getTotalBedsForFloor,
  getBedsForRoom,
} from "../../../data/hf";

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

export default function HfFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

  // Fetch rooms data
  useEffect(() => {
    async function fetchRooms() {
      try {
        setLoading(true);
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=HF`);
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
          building: HF_NAME,
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
    const fullRoomId = `${HF_NAME}-${roomNo}`;
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return roomNumber === fullRoomId || getNumericRoomNumber(roomNumber) === roomNo;
    });
  };

  useEffect(() => {
    if (!isValid) {
      router.replace("/rooms/8/floor/1");
    }
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
    if (!roomInfo) return true; // fallback if no specific information is stored

    // Safe string conversion comparison to avoid type mismatches (e.g., "2" vs 2)
    if (roomInfo.year && String(roomInfo.year).trim() !== String(currentUser.year).trim()) {
      showToast(`Access Denied: This room is reserved for Year ${roomInfo.year} students.`);
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

    const fullRoomId = `${HF_NAME}-${selectedRoom}`;

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

  const floorConfig = useMemo(
    () => getFloorConfig(floorNum),
    [floorNum]
  );
  const totalRooms = useMemo(
    () => getTotalRoomsForFloor(floorNum),
    [floorNum]
  );
  const totalBeds = useMemo(
    () => getTotalBedsForFloor(floorNum),
    [floorNum]
  );

  // Room Block component using getRoomColors
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

    const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(
      roomInfo, selectedRoom, currentUser, HF_NAME, room
    );

    const isYourBooking = currentUser?.bookedRoomNumber === `${HF_NAME}-${room}`;

    return (
      <button
        disabled={isDisabled || loading}
        onClick={() => {
          if (isYourBooking && canUnbook) {
            setShowUnbookConfirm(true);
          } else if (isYourBooking && !canUnbook) {
            showToast("Unbooking is not allowed at this time.");
          } else {
            setSelectedRoom(room);
          }
        }}
        className={`
          cursor-pointer group relative rounded-xl border shadow-sm transition-all duration-200
          w-full h-full disabled:shadow-none ${colorClasses}
          ${isSelected ? "ring-2 ring-emerald-300" : ""}
        `}
      >
        <div className="flex h-full flex-col items-center justify-center leading-tight px-2">
          <span className="text-sm xs:text-base sm:text-base font-semibold tracking-wide">
            {room}
          </span>
          <span className={`text-[9px] xs:text-[10px] sm:text-[11px] whitespace-nowrap ${textColorClass}`}>
            {isYourBooking ? (canUnbook ? "Your Room" : "Your Room") : statusText}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/60" />
      </button>
    );
  };

  const isFirstFloor = floorNum === 1;

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] ${toastType === "success" ? "bg-green-800" : "bg-red-600"} text-white px-5 py-3 rounded-xl shadow-xl text-sm text-center max-w-sm w-[90%]`}>
            {toast}
          </div>
        )}

        {/* Mobile header */}
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
            <FloorBookingsView
          building={HF_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />
          </div>

          <h1 className="text-center text-base xs:text-lg font-semibold tracking-wide flex-1">
            {HF_NAME} {floorLabel(floorNum)} floor
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
                baseHref="/rooms/8/floor"
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
              {HF_NAME} {floorLabel(floorNum)} floor
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
          <FloorBookingsView
          building={HF_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />
        </div>

        {/* Main Layout */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Sidebar */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/8/floor"
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
                      <>
                        {(floorConfig.topLeft || []).map((room) => (
                          <div key={room} className="w-full flex justify-center">
                            <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        <div className="my-4 text-xs text-slate-400 italic">
                        Main Entrance
                        </div>

                        {(floorConfig.bottomLeft || []).map((room) => (
                          <div key={room} className="w-full flex justify-center">
                            <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {(floorConfig.topLeft || []).map((room) => (
                          <div key={room} className="w-full flex justify-center">
                            <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        <div className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
                        Balcony
                      </div>

                        {(floorConfig.middleLeft || []).map((room) => (
                          <div key={room} className="w-full flex justify-center">
                            <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}

                        <div className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
                            Balcony
                          </div>

                        {(floorConfig.bottomLeft || []).map((room) => (
                          <div key={room} className="w-full flex justify-center">
                            <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                              <RoomBlock room={room} />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {(floorConfig.topRight || []).map((room) => (
                      <div key={room} className="w-full flex justify-center">
                        <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
                          <RoomBlock room={room} />
                        </div>
                      </div>
                    ))}

                    <div className="h-8 flex items-center text-[10px] text-slate-400 uppercase font-bold tracking-tighter italic">
                    Stairs
                    </div>

                    {(floorConfig.bottomRight || []).map((room) => (
                      <div key={room} className="w-full flex justify-center">
                        <div className="w-[100px] xs:w-[110px] sm:w-[120px] md:w-[130px] lg:w-[140px] h-[36px] xs:h-[38px] sm:h-[40px] md:h-[42px] lg:h-[46px]">
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