"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FloorSidebar from "../../../components/FloorSidebar";
import FloorBookingsView from "../../../components/FloorBookingsView";
import ConfirmationDialog from "../../../../confirmation";
import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";

import {
  RKA_NAME,
  leftColumnRoomsForFloor,
  rightColumnRoomsForFloor,
} from "../../../data/rka";

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

export default function RkaFloorPage({ params }) {
  const router = useRouter();
  const { floor } = use(params);
  const rawFloor = Number(floor);
  const isValid = Number.isFinite(rawFloor) && isValidFloor(rawFloor);
  const floorNum = isValid ? rawFloor : 1;

  const [isBooking, setIsBooking] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState("error");
  const [currentUser, setCurrentUser] = useState(null);       
  const [sessionLoaded, setSessionLoaded] = useState(false);  
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
  console.log("DEBUG: currentUser changed:", currentUser);
  console.log("DEBUG: studentNumber:", currentUser?.studentNumber);
  console.log("DEBUG: floorNum:", floorNum);
}, [currentUser, floorNum]);



  // Fetch rooms
  // Fetch rooms and find user booking in one go (NO double fetching)
useEffect(() => {
  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch rooms data
      const roomsRes = await fetch(`/api/rooms?floor=${floorNum}&building=RKA`);
      const roomsData = await roomsRes.json();
      
      if (roomsData.success) {
        setRoomsData(roomsData.rooms || []);
      }
      
      // Fetch user's booking using floor-bookings API (this has booking details)
      if (currentUser) {
        const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;
        
        if (studentNumber) {
          const params = new URLSearchParams({
            building: RKA_NAME,
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
            }
          }
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }
  
  if (isValid) fetchData();
}, [floorNum, isValid, currentUser?.studentNumber, currentUser?.phoneNumber, currentUser?.stdNo]);


  const getRoomInfo = (roomNo) => {
    const fullRoomId = `${RKA_NAME}-${roomNo}`;
    return roomsData.find((r) => {
      const roomNumber = String(r.roomNumber);
      return roomNumber === fullRoomId || getNumericRoomNumber(roomNumber) === roomNo;
    });
  };


  const configuredLeftRooms = useMemo(() => leftColumnRoomsForFloor(floorNum), [floorNum]);
  const configuredRightRooms = useMemo(() => rightColumnRoomsForFloor(floorNum), [floorNum]);
  const fetchedRoomNumbers = useMemo(
    () =>
      roomsData
        .map((room) => getNumericRoomNumber(room.roomNumber))
        .filter((roomNo) => Number.isInteger(roomNo))
        .sort((a, b) => a - b),
    [roomsData]
  );
  const visibleRooms = fetchedRoomNumbers.length
    ? fetchedRoomNumbers
    : [...configuredLeftRooms, ...configuredRightRooms];
  const splitAt = Math.ceil(visibleRooms.length / 2);
  const leftRooms = visibleRooms.slice(0, splitAt);
  const rightRooms = visibleRooms.slice(splitAt);
  const totalRooms = visibleRooms.length;
  const totalBeds = roomsData.length
    ? roomsData.reduce((sum, room) => sum + (Number(room.capacity) || 0), 0)
    : totalRooms * 3;

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
      // You'll need an endpoint that returns the allowed year for this floor
      const res = await fetch(`/api/floor-allocation?building=RKA&floor=${floorNum}`);
      const data = await res.json();

      if (data.success) {
        // Compare the floor's allocated year with the user's year
        // Using == for flexible string/number comparison
        if (data.allocatedYear && data.allocatedYear != currentUser.year) {
          showToast(`Access Denied: This floor is reserved for Year ${data.allocatedYear} students.`);
          return false;
        }
      }
      return true;
    } catch (err) {
      console.error("Floor validation error:", err);
      return true; // Fallback or handle as error
    }
  };


  const validateGender = (roomNo) => {
    const roomInfo = getRoomInfo(roomNo);

    if (!roomInfo) return true;
    if (!currentUser) {
      setToast("Please log in to book a room.");
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

    // 2. NEW: Floor Allocation Check
  const isCorrectYear = await validateFloorYear();
  if (!isCorrectYear) return; 

  // 3. Existing Gender Check (Refactored to be used here if needed)
  const isCorrectGender = validateGender(selectedRoom);
  if (!isCorrectGender) return;

    // FIX 5: check which field your session actually uses
    const studentNumber = currentUser.studentNumber ?? currentUser.phoneNumber ?? currentUser.stdNo;

    if (!studentNumber) {
      showToast("Student number not found in session. Please log in again.");
      return;
    }

    const fullRoomId = `${RKA_NAME}-${selectedRoom}`;

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
        showToast(`Room ${fullRoomId} reserved successfully! Details sent to your email.`, "success");

        const updatedUser = { ...currentUser, hasBooked: true, bookedRoomNumber: fullRoomId};
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

  const RoomBlock = ({ room }) => {
  const roomInfo = getRoomInfo(room);

  if (!roomInfo) {
    return (
      <div className="w-full h-full rounded-xl border border-slate-200 bg-slate-50 animate-pulse flex items-center justify-center">
        <span className="text-[10px] text-slate-400">Loading...</span>
      </div>
    );
  }

  const { colorClasses, textColorClass, statusText, isDisabled } = getRoomColors(
    roomInfo,      // room information from API
    selectedRoom,  // currently selected room
    currentUser,   // logged in user data
    RKA_NAME,      // building name (RKA)
    room           // room number
  );
  
  return (
    <button
      disabled={isDisabled || loading}
      className={`cursor-pointer group relative rounded-xl border shadow-sm transition-all duration-200 w-full h-full disabled:opacity-60 disabled:shadow-none ${colorClasses}`}
      onClick={() => setSelectedRoom(room)}
    >
      <div className="flex h-full flex-col items-center justify-center leading-tight px-1 sm:px-2">
        <span className="text-sm xs:text-base sm:text-lg font-semibold tracking-wider">
          {room}
        </span>
        <span className={`text-[9px] xs:text-[10px] sm:text-[11px] whitespace-nowrap ${textColorClass}`}>
          {statusText}
        </span>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-gray-300/60" />
    </button>
  );
};

  return (
    <main className="min-h-screen bg-zinc-100 py-4 sm:py-6 md:py-8 text-slate-900 overflow-x-hidden">
      <div className="mx-auto w-full max-w-full px-3 xs:px-4 sm:px-6 lg:max-w-7xl lg:px-8">

        {/* FIX 7: Toast notification - was never rendered before */}
        {toast && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] ${toastType === "success" ? "bg-green-800" : "bg-red-600"} text-white px-5 py-3 rounded-xl shadow-xl text-sm text-center max-w-sm w-[90%]`}>
            {toast}
          </div>
        )}

        
        <FloorBookingsView
          building={RKA_NAME}
          floor={floorNum}
          currentUser={currentUser}
          onDenied={(message) => showToast(message)}
        />
{/* Mobile header */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <div className="flex items-center text-slate-500">
            <Link href="/" className="inline-flex items-center hover:text-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
              </svg>
            </Link>
          </div>
          <h1 className="text-center text-base xs:text-lg font-semibold tracking-wide flex-1">
            {RKA_NAME} {floorLabel(floorNum)} floor
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="cursor-pointer px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-0.5 text-xs"
            >
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
              <FloorSidebar currentFloor={floorNum} baseHref="/rooms/1/floor" floors={[1, 2, 3, 4]} />
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
            <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-wide">
              {RKA_NAME} {floorLabel(floorNum)} floor
            </h1>
            <div className="text-sm text-slate-600 flex justify-center gap-4 sm:gap-6 mt-1">
              <span className="hidden sm:inline"><span className="font-medium">Total Rooms:</span> {totalRooms}</span>
              <span className="hidden sm:inline"><span className="font-medium">Total Beds:</span> {totalBeds}</span>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-col md:flex-row gap-4 lg:gap-6">
            <div className="hidden md:block w-48 lg:w-56 flex-shrink-0">
              <FloorSidebar currentFloor={floorNum} baseHref="/rooms/1/floor" floors={[1, 2, 3, 4]} />
            </div>

            <div className="flex-1 min-w-0">
              <section className="relative rounded-xl sm:rounded-2xl border border-slate-200 bg-white/80 p-3 sm:p-4 md:p-6 shadow-lg lg:shadow-xl backdrop-blur overflow-hidden w-full">
                <div className="absolute left-1/2 top-3 sm:top-4 md:top-6 -translate-x-1/2 w-[240px] xs:w-[280px] sm:w-[320px] md:w-[360px] lg:w-80">
                  <div className="grid w-full grid-cols-2 rounded-lg border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700 shadow">
                    <div className="flex items-center justify-center gap-1 p-1.5 sm:p-2">
                      <span className="text-sm">🚿</span>
                      <span className="text-[12px] xs:text-xs">Bathroom</span>
                    </div>
                    <div className="border-l border-slate-200 flex items-center justify-center gap-1 p-1.5 sm:p-2">
                      <span className="text-sm">🚽</span>
                      <span className="text-[12px] xs:text-xs">Toilet</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-6 pt-16 xs:pt-18 sm:pt-20 md:pt-24">
                  <div className="flex flex-col items-center gap-2 xs:gap-3 md:gap-4">
                    {leftRooms.map((r) => (
                      <div key={r} className="w-[70px] xs:w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] h-[50px] xs:h-[56px] md:h-[64px]">
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
                      <div key={r} className="w-[70px] xs:w-[80px] sm:w-[90px] md:w-[100px] lg:w-[110px] h-[50px] xs:h-[56px] md:h-[64px]">
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

        {/* FIX 8: pass isBooking to isLoading */}
        {selectedRoom !== null && (
          <ConfirmationDialog
            message={`Do you want to book one bed from Room ${RKA_NAME}-${selectedRoom}?`}
            isLoading={isBooking}
            onCancel={() => !isBooking && setSelectedRoom(null)}
            onConfirm={handleConfirmBooking}
          />
        )}
      </div>
    </main>
  );
}
