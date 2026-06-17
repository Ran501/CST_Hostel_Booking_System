  "use client";

  import Link from "next/link";
  import { use, useEffect, useState } from "react";
  import { useRouter } from "next/navigation";
  import FloorBookingsView from "../../../components/FloorBookingsView";
  import FloorSidebar from "../../../components/FloorSidebar";
  import ConfirmationDialog from "../../../../confirmation";
  import { getRoomColors, RoomLegend } from "../../../../room/components/useColors";
  import {
    HE_NAME,
    HE_FLOORS,
    HE_FLOOR_META,
    floor1TopRow,
    floor1BottomRow,
    floor2TopRowGroupA,
    floor2TopRowGroupB,
    floor2TopRowGroupC,
    floor2BottomRowGroupA,
    floor2BottomRowGroupB,
    floor2BottomRowGroupC,
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

  /** Standard room tile — portrait orientation matching the floor plan */
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
          relative flex flex-col items-center justify-center
          rounded-lg border-2 shadow-sm transition-all duration-200
          w-full h-full
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
          {isYourBooking ? "Tap to Unbook" : statusText}
        </span>
      </button>
    );
  }

  /** Non-bookable utility block (Washroom, MESS, etc.) */
  function UtilityBlock({ label, className = "" }) {
    const isWashroom = label.toLowerCase().includes("washroom");
    const baseClasses = "flex items-center justify-center rounded-lg border-2";
    const typeClasses = isWashroom
      ? "border-dashed border-blue-400 bg-blue-50 text-blue-700"
      : "border-slate-200 bg-slate-50 text-slate-500";

    return (
      <div className={`${baseClasses} ${typeClasses} ${className}`}>
        <span className="text-xs sm:text-sm font-medium px-2 text-center">
          {label}
        </span>
      </div>
    );
  }

  /** Stair indicator */
  function StairLabel({ direction = "up", label = "Stair" }) {
    return (
      <div className="flex flex-col items-center gap-0.5 select-none">
        {direction === "up" && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500"
            fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        )}
        <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium">
          {label}
        </span>
      </div>
    );
  }

  // FLOOR 1 Plan
  function Floor1Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
    const topRow    = floor1TopRow();    // [101..106]
    const bottomRow = floor1BottomRow(); // [112..107]

    // Room tile dimensions — portrait blocks
    const RH = "h-[70px] xs:h-[80px] sm:h-[90px] md:h-[100px]";
    const RW = "w-[46px] xs:w-[54px] sm:w-[62px] md:w-[72px]";

    return (
      <div className="flex flex-col gap-4 sm:gap-5 md:gap-6">

        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* MESS Area */}
          <div className="flex-shrink-0 w-[160px] md:w-[220px] lg:w-[260px]">
            <UtilityBlock
              label="MESS Area"
              className="w-full h-[240px] sm:h-[240px] md:h-[300px] text-base sm:text-lg font-semibold border-slate-300"
            />
          </div>

          {/* Room section */}
          <div className="flex-1 flex flex-col gap-3 sm:gap-4">
            {/* Washroom */}
            <div className="w-full max-w-[380px] sm:max-w-none self-end">
              <UtilityBlock label="Washroom" className="h-[36px] sm:h-[40px] md:h-[44px] w-full" />
            </div>

            {/* Stair + Top row */}
            <div className="flex items-start gap-1.5 sm:gap-2 md:gap-3">
              <div className="pt-1">
                <StairLabel label="Stair" />
              </div>
              <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3">
                {topRow.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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

            {/* Gap between rows */}
            <div className="h-2 sm:h-3" />

            {/* Bottom row */}
            <div className="flex flex-wrap gap-1.5 xs:gap-2 sm:gap-2.5 md:gap-3 pl-8 xs:pl-9 sm:pl-10">
              {bottomRow.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
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

            {/* Entrance */}
            <div className="self-start -ml-4 pl-0">
              <StairLabel direction="up" label="Entrance" />
            </div>
          </div>
        </div>

        {/* Mobile: Vertical layout */}
        <div className="sm:hidden flex flex-col gap-3">
          {/* MESS Area */}
          <UtilityBlock label="MESS Area" className="w-full h-[70px] text-sm font-semibold border-slate-300" />
          
          {/* Two vertical columns */}
          <div className="flex gap-3">
            {/* Left column - 6 rooms */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-center text-xs font-medium text-slate-600 mb-1">Left Side</div>
              {topRow.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
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

            {/* Right column - 6 rooms */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-center text-xs font-medium text-slate-600 mb-1">Right Side</div>
              {bottomRow.map((r) => (
                <div key={r} className={`${RW} ${RH}`}>
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
      </div>
    );
  }

  // FLOOR 2 Plan
  function Floor2Plan({ getRoomInfo, selectedRoom, currentUser, onRoomClick, isLoading, buildingName }) {
    const topA    = floor2TopRowGroupA();    // [224..228]
    const topB    = floor2TopRowGroupB();    // [229..233]
    const topC    = floor2TopRowGroupC();    // [201..206]
    const botA    = floor2BottomRowGroupA(); // [222..218]
    const botB    = floor2BottomRowGroupB(); // [217..213]
    const botC    = floor2BottomRowGroupC(); // [212..207]

    const RH = "h-[64px] xs:h-[74px] sm:h-[84px] md:h-[96px]";
    const RW = "w-[40px] xs:w-[48px] sm:w-[56px] md:w-[66px]";

    /** Renders a horizontal group of room tiles */
    const RoomGroup = ({ rooms }) => (
      <div className="flex gap-1 xs:gap-1.5 sm:gap-2">
        {rooms.map((r) => (
          <div key={r} className={`${RW} ${RH}`}>
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
    );

    return (
      <div className="flex flex-col gap-4 sm:gap-5 overflow-x-auto pb-1">

        {/* Desktop: Horizontal layout */}
        <div className="hidden sm:flex flex-col gap-4 sm:gap-5">
          {/* ── TOP ROW ── */}
          <div className="flex items-end gap-2 sm:gap-3 md:gap-4 min-w-max">

            {/* Group A */}
            <RoomGroup rooms={topA} />

            {/* Gap */}
            <div className="w-2 sm:w-3 md:w-4 flex-shrink-0" />

            {/* Group B */}
            <RoomGroup rooms={topB} />

            {/* Stairs */}
            <div className="flex-shrink-0 pb-1 px-1">
              <StairLabel label="Stairs" direction="up" />
            </div>

            {/* Group C */}
            <RoomGroup rooms={topC} />

            {/* Washroom — top right */}
            <div className="flex-shrink-0 self-start">
              <UtilityBlock
                label="Washroom"
                className="h-[36px] sm:h-[40px] md:h-[44px] w-[90px] sm:w-[110px] md:w-[130px]"
              />
            </div>
          </div>

          {/* ── BOTTOM ROW ── */}
          <div className="flex items-start gap-2 sm:gap-3 md:gap-4 min-w-max">

            {/* Group A */}
            <div className="flex flex-col gap-1">
              <RoomGroup rooms={botA} />
            </div>

            {/* Gap */}
            <div className="w-2 sm:w-3 md:w-4 flex-shrink-0" />

            {/* Group B + Balcony label */}
            <div className="flex flex-col items-center gap-1">
              <RoomGroup rooms={botB} />
              <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Balcony
              </span>
            </div>

            {/* Spacer aligned with Stairs above */}
            <div className="flex-shrink-0 px-1 w-[40px] sm:w-[50px]" />

            {/* Group C + Balcony label */}
            <div className="flex flex-col items-center gap-1">
              <RoomGroup rooms={botC} />
              <span className="text-[10px] xs:text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Balcony
              </span>
            </div>
          </div>
        </div>

        {/* Mobile: Vertical layout */}
        <div className="sm:hidden flex flex-col gap-4">
          {/* Washroom at top */}
          <div className="w-full">
            <UtilityBlock
              label="Washroom"
              className="h-[36px] w-full text-sm border-blue-400 bg-blue-50 text-blue-700"
            />
          </div>

          {/* Stairs */}
          <div className="flex justify-center">
            <StairLabel label="Stairs" direction="up" />
          </div>

          {/* All rooms in vertical columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* Left column - Top groups */}
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-medium text-slate-600 mb-1">Top A</div>
              <div className="flex flex-col gap-1">
                {topA.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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
              
              <div className="text-center text-xs font-medium text-slate-600 mb-1 mt-2">Bottom A</div>
              <div className="flex flex-col gap-1">
                {botA.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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

            {/* Right column - Top groups */}
            <div className="flex flex-col gap-2">
              <div className="text-center text-xs font-medium text-slate-600 mb-1">Top B</div>
              <div className="flex flex-col gap-1">
                {topB.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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
              
              <div className="text-center text-xs font-medium text-slate-600 mb-1 mt-2">Bottom B</div>
              <div className="flex flex-col gap-1">
                {botB.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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

          {/* Third row - Top C and Bottom C */}
          <div className="flex flex-col gap-2">
            <div className="text-center text-xs font-medium text-slate-600 mb-1">Top C & Bottom C</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                {topC.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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
              <div className="flex flex-col gap-1">
                {botC.map((r) => (
                  <div key={r} className={`${RW} ${RH}`}>
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

          {/* Balcony labels */}
          <div className="flex justify-around text-xs text-slate-500 font-medium">
            <span>Balcony A</span>
            <span>Balcony B</span>
            <span>Balcony C</span>
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

    const validateFloorYear = async () => {
      if (!currentUser?.year) {
        showToast("Student year not found. Please log in again.");
        return false;
      }

      try {
        const res = await fetch(`/api/floor-allocation?building=HE&floor=${floorNum}`);
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

          <FloorBookingsView
            building={HE_NAME}
            floor={floorNum}
            currentUser={currentUser}
            onDenied={(message) => showToast(message)}
          />

          {/* MOBILE HEADER */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <BackArrow />
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