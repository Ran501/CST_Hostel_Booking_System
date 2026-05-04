"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowLeft, Eye, Download, FileSpreadsheet} from "lucide-react";
import { useRouter } from "next/navigation";
import RoomCard from "./room_card";
import EditRoomsModal from "./room_edit";
import AllocateStudents from "./room_allocate";
import DeallocateStudents from "./room_deallocate";

const initialRooms = [
  { room: "HF-101", status: "full", capacity: 3, occupants: ["02230122  Alice", "1234567  Bob", "1010101  Charlie"] },
  { room: "HF-102", status: "partial", capacity: 3, occupants: ["02230122  David"] },
  { room: "HF-103", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-104", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-105", status: "partial", capacity: 3, occupants: ["02230122  Emma", "1234567  Frank"] },
  { room: "HF-106", status: "full", capacity: 3, occupants: ["02230122  Grace", "1234567  Henry", "1010101  Ivy"] },
  { room: "HF-107", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-108", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-109", status: "full", capacity: 3, occupants: ["02230122  Alice", "1234567  Bob", "1010101  Charlie"] },
  { room: "HF-110", status: "partial", capacity: 3, occupants: ["02230122  David"] },
  { room: "HF-111", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-112", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-113", status: "partial", capacity: 3, occupants: ["02230122  Emma", "1234567  Frank"] },
  { room: "HF-114", status: "full", capacity: 3, occupants: ["02230122  Grace", "1234567  Henry", "1010101  Ivy"] },
  { room: "HF-115", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-116", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-117", status: "full", capacity: 3, occupants: ["02230122  Alice", "1234567  Bob", "1010101  Charlie"] },
  { room: "HF-118", status: "partial", capacity: 3, occupants: ["02230122  David"] },
  { room: "HF-119", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-120", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-121", status: "partial", capacity: 3, occupants: ["02230122  Emma", "1234567  Frank"] },
  { room: "HF-122", status: "full", capacity: 3, occupants: ["02230122  Grace", "1234567  Henry", "1010101  Ivy"] },
  { room: "HF-123", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-124", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-125", status: "full", capacity: 3, occupants: ["0344343  Alice", "0932483276  Bob", "02395743892  Charlie"] },
  { room: "HF-126", status: "partial", capacity: 3, occupants: ["02230122  David"] },
  { room: "HF-127", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-128", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-129", status: "partial", capacity: 3, occupants: ["02230122  Emma", "1234567  Frank"] },
  { room: "HF-130", status: "full", capacity: 3, occupants: ["02230122  Grace", "1234567  Henry", "1010101  Ivy"] },
  { room: "HF-131", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-132", status: "disabled", capacity: 3, occupants: [] },
];


function Badge({ children, color }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm md:text-base ${color}`}>
      {children}
    </span>
  );
}

export default function RoomManagement() {
  const [hostelOpen, setHostelOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);
  const [disableOpen, setDisableOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deallocateStudentsOpen, setDeallocateStudentsOpen] = useState(false);
  const [disableReasonOpen, setDisableReasonOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [hostel, setHostel] = useState("HF");
  const [floor, setFloor] = useState("Floor 1");

  const [rooms, setRooms] = useState(initialRooms);

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [allocateRoom, setAllocateRoom] = useState(null);
  const [allocateStudentsOpen, setAllocateStudentsOpen] = useState(false);
  const [actionMode, setActionMode] = useState(null);
  // "edit" | "deallocate" | "disable" | null

  const [roomAction, setRoomAction] = useState("Disable");
  const [selectionMode, setSelectionMode] = useState(false);

  const students = rooms.flatMap((roomObj) =>
  (roomObj.occupants || []).map((name, index) => ({
    id: `${roomObj.room}-${index}`,
    name,
    room: roomObj.room,
    year: "N/A",
  }))
);

const confirmDisable = () => {
  setRooms((prev) =>
    prev.map((r) =>
      selectedRooms.includes(r.room)
        ? { ...r, status: "disabled" }
        : r
    )
  );

  setDisableReasonOpen(false);
  setReason("");
  setSelectedRooms([]);
};

  const selectableRoomIds = rooms
    .filter((room) => room.status !== "disabled")
    .map((room) => room.room);

  const isAllSelected =
    selectedRooms.length > 0 &&
    selectedRooms.length === selectableRoomIds.length;

   const handleSelectAll = () => {

    setSelectionMode(true);
    if (isAllSelected) {
      setSelectedRooms([]);
      setSelectionMode(false);
    } else {
      setSelectedRooms(selectableRoomIds);
    }
  };

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId)
        ? prev.filter((id) => id !== roomId)
        : [...prev, roomId]
    );
  };

  const handleBulkAction = (type) => {
  if (selectedRooms.length === 0) return;

  if (type === "edit") {
    setEditModalOpen(true);
  }

  if (type === "deallocate") {
    setDeallocateStudentsOpen(true);
  }

  if (type === "disable") {
    setDisableReasonOpen(true);
  }
};

const handleRoomClickWrapper = (roomId) => {
  if (selectionMode) {
    toggleRoomSelection(roomId);
    return;
  }

  const roomData = rooms.find((r) => r.room === roomId);
  if (roomData) handleRoomClick(roomId, roomData.status);
};

   // ✅ NEW CLICK LOGIC
  const handleRoomClick = (roomId, status) => {
  if (selectionMode) return; // 🔒 safety guard

  if (status === "disabled") {
    setRooms((prev) =>
      prev.map((r) =>
        r.room === roomId ? { ...r, status: "empty" } : r
      )
    );
  } else {
    setAllocateRoom(roomId);
    setAllocateStudentsOpen(true);
  }
};

   // ✅ KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + A
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setSelectionMode(true);
        handleSelectAll();
      }

      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();

      setSelectionMode((prev) => {
        const next = !prev;
        if (!next) setSelectedRooms([]);
        return next;
      });
      return;
      }

      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();

        setRooms((prev) =>
          prev.map((r) =>
            r.status === "disabled"
              ? { ...r, status: "empty" }
              : r
          )
        );

        // optional: clear selection after bulk enable
        setSelectedRooms([]);
        setSelectionMode(false);
      }

      if (!selectionMode) return;

      // Tab navigation
      if (e.key === "Tab") {
        e.preventDefault();

        const selectable = rooms.filter((r) => r.status !== "disabled");
        if (selectable.length === 0) return;

        const currentIndex = selectable.findIndex((r) =>
          selectedRooms.includes(r.room)
        );

  const nextIndex =
            currentIndex === -1 || currentIndex === selectable.length - 1
              ? 0
              : currentIndex + 1;

          setSelectedRooms([selectable[nextIndex].room]);
        }
      };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [rooms, selectedRooms, selectionMode]);
  
  return (
    <div className="min-h-screen bg-[#ececec]">
      <div className="w-full bg-[#ececec] text-[#1e1e1e]">

        {/* Sticky sub-header below navbar */}
        <div className="sticky top-16 z-40 bg-[#ececec] border-b border-gray-300 shadow-sm">
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-4">

            {/* Top Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">

              {/* Left Side */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[18px] md:text-[20px]">
                <button className="mr-1">
                  <ArrowLeft className="w-6 h-6" />
                </button>

                <div className="relative">
                  <button
                    onClick={(e) => {
                          e.stopPropagation();
                          setHostelOpen((prev) => !prev);
                        }}
                    className="flex items-center text-[#2b7cff] text-[20px] md:text-[22px]"
                  >
                    {hostel}
                    <ChevronDown size={16} className="ml-1" />
                  </button>

                  {hostelOpen && (
                    <div className="absolute top-full mt-2 left-0 w-32 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                      {["HF", "RKA", "RKB","NK"].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setHostel(item);
                            setHostelOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge color="bg-[#56d154] text-white">Active</Badge>
                  <Badge color="bg-[#9957f6] text-white">Female only</Badge>
                  <Badge color="bg-[#d9d9d9]">3 Floors</Badge>
                  <Badge color="bg-[#d9d9d9]">70 Rooms</Badge>
                  <Badge color="bg-[#d9d9d9]">140 Capacity</Badge>
                  <Badge color="bg-[#d9d9d9]">110 Occupied</Badge>
                </div>
              </div>

              {/* Right Side Buttons */}
              <div className="flex items-center gap-4 ml-auto">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition">
                  <Eye size={18} />
                  <span>View</span>
                </button>

                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition">
                  <Download size={18} />
                  <span>Download</span>
                </button>
              </div>

            </div>

            {/* Action + Controls Section */}
            <div className="flex flex-col gap-4">

              {/* Floor + Management Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-[18px] md:text-[20px]">
                  <div className="relative">
                    <button
                      onClick={(e) => {
                            e.stopPropagation();
                            setFloorOpen((prev) => !prev);
                          }}
                      className="text-[#2b7cff] flex items-center gap-1"
                    >
                      {floor}
                      <ChevronDown size={16} />
                    </button>

                    {floorOpen && (
                      <div className="absolute top-full mt-2 left-0 w-32 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                        {["Floor 1", "Floor 2", "Floor 3","Floor 4"].map((item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setFloor(item);
                              setFloorOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <span>18/18 Occupied</span>
                  <span>•</span>
                  <span>6 disabled rooms</span>
                </div>

                <div className="flex flex-wrap gap-4 text-[18px] md:text-[20px]">
                  <button
                      onClick={() => handleBulkAction("edit")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "edit" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleBulkAction("deallocate")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "deallocate" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Deallocate
                    </button>

                  {/* 🔴 DISABLE BUTTON ONLY */}
                    <button
                      onClick={() => handleBulkAction("disable")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "deallocate" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Disable
                    </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-4 sm:px-6 md:px-10 py-6">
          <div
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 ${
                selectionMode ? "cursor-default" : "cursor-pointer"
              }`}
            >
            {rooms.map((r) => (
            <RoomCard
              key={r.room}
              room={r.room}
              status={r.status}
              capacity={r.capacity}
              occupants={r.occupants}
              selectionMode={selectionMode}
              selected={selectedRooms.includes(r.room)}
              onSelect={toggleRoomSelection}
              onClickRoom={() => handleRoomClickWrapper(r.room)}
            />
          ))}
          </div> 

          {/* Legend */}
          <div className="mt-6 inline-flex flex-wrap gap-4 bg-[#f3f3f3] px-3 py-3 border rounded-sm text-[18px] text-gray-600">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-green-500" />
              Available
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-orange-400" />
              Partially Occupied
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-500" />
              Full
            </div>

            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-gray-500" />
              Disabled
            </div>
          </div>
        </div>

      </div>
      {disableReasonOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

          <div className="w-[90%] max-w-md rounded-2xl overflow-hidden shadow-2xl">

            {/* 🔵 HEADER */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-center">
              <h2 className="text-xl font-bold text-white">
                Disable Rooms
              </h2>
              <p className="text-sm text-blue-100 mt-1">
                Provide a reason for disabling selected rooms
              </p>

              {/* Selected Count Badge */}
              <div className="mt-3 inline-block px-3 py-1 text-xs rounded-full bg-white/20 text-white">
                {selectedRooms.length} room(s) selected
              </div>
            </div>

            {/* ⚪ BODY */}
            <div className="bg-white px-6 py-5">

              {/* Label */}
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>

              {/* Textarea */}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for disabling rooms..."
                className="w-full rounded-xl border border-blue-200 bg-blue-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={4}
              />

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">

                {/* Cancel */}
                <button
                  onClick={() => setDisableReasonOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                {/* Confirm */}
                <button
                  onClick={confirmDisable}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm"
                >
                  Confirm Disable
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      <EditRoomsModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        selectedCount={selectedRooms.length}
        rooms={rooms.filter((r) => selectedRooms.includes(r.room))}
        onSave={(data) => {
          console.log("Edited:", data);
          setEditModalOpen(false);
          setSelectedRooms([]);
        }}
      />

      {/* Allocate */}
       <AllocateStudents
        isOpen={allocateStudentsOpen}
        onClose={() => setAllocateStudentsOpen(false)}
        rooms={rooms.filter((r) => r.room === allocateRoom)}
        selectedRooms={[allocateRoom]}
        onNext={(data) => {
          console.log("Allocate:", data);
          setAllocateStudentsOpen(false);
          setAllocateRoom(null);
        }}
      />

      {/* Deallocate */}
      <DeallocateStudents
        isOpen={deallocateStudentsOpen}
        onClose={() => setDeallocateStudentsOpen(false)}
        students={students.filter((s) =>
          selectedRooms.includes(s.room)
        )}
        onConfirm={(selectedIds) => {
          console.log("Deallocate:", selectedIds);
          setDeallocateStudentsOpen(false);
          setSelectedRooms([]);
        }}
      />
    </div>
  );
}