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
  HC_NAME,
  hcLeftRoomsForFloor,
  hcRightRoomsForFloor,
} from "../../../data/hc";

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

export default function HcFloorPage({ params }) {
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
        const res = await fetch(`/api/rooms?floor=${floorNum}&building=HC`);
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
          building: HC_NAME,
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
    const fullRoomId = `${HC_NAME}-${roomNo}`;
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return roomNumber === fullRoomId || getNumericRoomNumber(roomNumber) === roomNo;
    });
  };

  // Redirect if invalid floor
  useEffect(() => {
    if (!isValid) {
      router.replace("/rooms/6/floor/1");
    }
  }, [isValid, router]);

  const leftRooms = useMemo(
    () => hcLeftRoomsForFloor(floorNum),
    [floorNum]
  );
  const rightRooms = useMemo(
    () => hcRightRoomsForFloor(floorNum),
    [floorNum]
  );
  const totalRooms = leftRooms.length + rightRooms.length;
  const totalBeds = totalRooms * 2;

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

  const validateFloorYear = async () => {
    if (!currentUser?.year) {
      showToast("Student year not found. Please log in again.");
      return false;
    }

    try {
      const res = await fetch(`/api/floor-allocation?building=HC&floor=${floorNum}`);
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

    const fullRoomId = `${HC_NAME}-${selectedRoom}`;

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
      roomInfo, selectedRoom, currentUser, HC_NAME, room
    );

    const isYourBooking = currentUser?.bookedRoomNumber === `${HC_NAME}-${room}`;

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
            {isYourBooking ? (canUnbook ? "Tap to Unbook" : "Your Booking") : statusText}
          </span>
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/60" />
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] ${toastType === "success" ? "bg-green-800" : "bg-red-600"} text-white px-5 py-3 rounded-xl shadow-xl text-sm text-center max-w-sm w-[90%]`}>
            {toast}
          </div>
        )}

        <FloorBookingsView
          building={HC_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />

        {/* Mobile header */}
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
            {HC_NAME} {floorLabel(floorNum)} floor
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
                baseHref="/rooms/6/floor"
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
              {HC_NAME} {floorLabel(floorNum)} floor
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

        {/* Tablet and Desktop Layout */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            {/* Sidebar */}
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar
                currentFloor={floorNum}
                baseHref="/rooms/6/floor"
                floors={[1, 2, 3]}
              />
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0">
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-5 lg:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-8 sm:pt-10 md:pt-12 pb-10 sm:pb-12">
                  {/* Left column */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {floorNum === 1 ? (
                      <>
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚻  Washroom" type="washroom" />
                        </div>

                        {rightRooms.slice(0, 3).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        <div className="h-6 sm:h-7 md:h-8 flex items-center justify-center">
                          <span className="text-xs sm:text-sm text-slate-600">
                            ← Stairs
                          </span>
                        </div>

                        <div className="h-6 sm:h-7 md:h-8" />

                        {rightRooms.slice(3, 5).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚻  Washroom" type="washroom" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚻  Washroom" type="washroom" />
                        </div>

                        {rightRooms.slice(0, 3).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        <div className="my-3 sm:my-4 md:my-6 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>Enter →</span>
                        </div>

                        {rightRooms.slice(3, 5).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        <div className="w-full flex justify-center">
                          <SpecialBlock text="🚻  Washroom" type="washroom" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Corridor */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[1px] xs:w-[2px] bg-slate-300/60" />
                  </div>

                  {/* Right column */}
                  <div className="flex flex-col items-center gap-2 xs:gap-3 sm:gap-3 md:gap-4">
                    {floorNum === 1 ? (
                      <>
                        {leftRooms.slice(0, 4).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}

                        <div className="my-3 sm:my-4 md:my-6 h-5 w-14 xs:h-6 xs:w-16 sm:h-7 sm:w-18 md:h-8 md:w-20 flex items-center justify-center rounded-full bg-transparent text-xs sm:text-sm text-slate-600">
                          <span>← Enter</span>
                        </div>

                        {leftRooms.slice(4).map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {leftRooms.map((r) => (
                          <div key={r} className="w-full flex justify-center">
                            <div
                              className="
                              w-[100px] xs:w-[110px] sm:w-[120px] 
                              md:w-[130px] lg:w-[140px]
                              h-[36px] xs:h-[38px] sm:h-[40px] 
                              md:h-[42px] lg:h-[46px]
                            "
                            >
                              <RoomBlock room={r} />
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </section>

              <div className="mt-4 sm:mt-5 lg:mt-6">
                <RoomLegend />
              </div>
            </div>
          </div>
        </div>

        {/* Confirmation Dialog */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Reserve a bed in ${HC_NAME}-${selectedRoom}?`}
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