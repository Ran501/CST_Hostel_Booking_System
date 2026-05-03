"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ArrowLeft, Eye, Download, FileSpreadsheet} from "lucide-react";
import { useRouter } from "next/navigation";
import RoomCard from "./room_card";
import EditRoomsModal from "./room_edit";
import AllocateStudents from "./room_allocate";
import DeallocateStudents from "./room_deallocate";

const rooms = [
  { room: "HF-101", status: "full", capacity: 3, occupants: ["Alice", "Bob", "Charlie"] },
  { room: "HF-102", status: "partial", capacity: 3, occupants: ["David"] },
  { room: "HF-103", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-104", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-105", status: "partial", capacity: 3, occupants: ["Emma", "Frank"] },
  { room: "HF-106", status: "full", capacity: 3, occupants: ["Grace", "Henry", "Ivy"] },
  { room: "HF-107", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-108", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-109", status: "full", capacity: 3, occupants: ["Alice", "Bob", "Charlie"] },
  { room: "HF-110", status: "partial", capacity: 3, occupants: ["David"] },
  { room: "HF-111", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-112", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-113", status: "partial", capacity: 3, occupants: ["Emma", "Frank"] },
  { room: "HF-114", status: "full", capacity: 3, occupants: ["Grace", "Henry", "Ivy"] },
  { room: "HF-115", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-116", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-117", status: "full", capacity: 3, occupants: ["Alice", "Bob", "Charlie"] },
  { room: "HF-118", status: "partial", capacity: 3, occupants: ["David"] },
  { room: "HF-119", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-120", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-121", status: "partial", capacity: 3, occupants: ["Emma", "Frank"] },
  { room: "HF-122", status: "full", capacity: 3, occupants: ["Grace", "Henry", "Ivy"] },
  { room: "HF-123", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-124", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-125", status: "full", capacity: 3, occupants: ["Alice", "Bob", "Charlie"] },
  { room: "HF-126", status: "partial", capacity: 3, occupants: ["David"] },
  { room: "HF-127", status: "empty", capacity: 3, occupants: [] },
  { room: "HF-128", status: "disabled", capacity: 3, occupants: [] },
  { room: "HF-129", status: "partial", capacity: 3, occupants: ["Emma", "Frank"] },
  { room: "HF-130", status: "full", capacity: 3, occupants: ["Grace", "Henry", "Ivy"] },
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
  const [disableOpen, setDisableOpen] = useState(false);
  const [roomAction, setRoomAction] = useState("Disable");

  const router = useRouter();

  const [actionMode, setActionMode] = useState(null);
 // null | "edit" | "allocate" | "deallocate" | "enable" | "disable"

  const [hostelOpen, setHostelOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);

  const [hostel, setHostel] = useState("HF");
  const [floor, setFloor] = useState("Floor 1");

  const [disableReasonOpen, setDisableReasonOpen] = useState(false);
  // const [selectedRoom, setSelectedRoom] = useState(null);
  const [reason, setReason] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [allocateStudentsOpen, setAllocateStudentsOpen] = useState(false);
  const [deallocateStudentsOpen, setDeallocateStudentsOpen] = useState(false);
  const [allocateRoom, setAllocateRoom] = useState(null);
  const isSelectionMode =
  actionMode === "edit" ||
  actionMode === "deallocate" ||
  actionMode === "disable" ||
  actionMode === "enable";

const isAllocateMode = actionMode === "allocate";


 const handleActionClick = (mode) => {
  setSelectedRooms([]);

  if (mode === "allocate") {
    setActionMode((prev) => (prev === "allocate" ? null : "allocate"));
    return;
  }

  setActionMode((prev) => (prev === mode ? null : mode));
};

  const [selectedRooms, setSelectedRooms] = useState([]);
  const hasSelection = selectedRooms.length > 0;

  const allRoomIds = rooms.map((r) => r.room);

const selectableRoomIds = rooms
  .filter(room => room.status !== "disabled")
  .map(room => room.room);

const isAllSelected =
  selectedRooms.length > 0 &&
  selectedRooms.length === selectableRoomIds.length;

const handleSelectAll = () => {
  if (isAllSelected) {
    setSelectedRooms([]);
  } else {
    setSelectedRooms(selectableRoomIds);
  }
};

 const toggleRoomSelection = (roomId) => {
  if (isAllocateMode) return; // ❗ block selection system

  setSelectedRooms((prev) =>
    prev.includes(roomId)
      ? prev.filter((id) => id !== roomId)
      : [...prev, roomId]
  );
};

const enableRooms = () => {
  setRooms((prev) =>
    prev.map((room) =>
      selectedRooms.includes(room.id)
        ? { ...room, isActive: true }
        : room
    ) 
  );

  setSelectedRooms([]);
  setActionMode(null);
};

const startDisableFlow = () => {
  if (!hasSelection) return;
  setDisableReasonOpen(true);
};

const confirmDisable = () => {
  setRooms((prev) =>
    prev.map((room) =>
      selectedRooms.includes(room.id)
        ? {
            ...room,
            isActive: false,
            disableReason: reason,
          }
        : room
    )
  );

  setSelectedRooms([]);
  setReason("");
  setDisableReasonOpen(false);
  setActionMode(null);
};


const handleConfirmAction = () => {
  if (!actionMode || selectedRooms.length === 0) return;

  const query = selectedRooms.join(",");

  switch (actionMode) {
    case "edit":
      setEditModalOpen(true);
      break;

    // case "allocate":
    //   setAllocateStudentsOpen(true);
    //   break;

    case "deallocate":
      setDeallocateStudentsOpen(true);
      break;

    case "disable":
      setActionMode("disable");
      setDisableReasonOpen(true); // open reason UI ONLY if needed in same step OR later
      break;

    case "enable":
      setActionMode("enable");
      setSelectedRooms(query); // just select
      break;

    default:
      break;
  }
};

const students = rooms.flatMap((roomObj) =>
  (roomObj.occupants || []).map((name, index) => ({
    id: `${roomObj.room}-${index}`, // generate unique id
    name: name,
    room: roomObj.room,
    year: "N/A", // you don’t have this data yet
  }))
);

useEffect(() => {
  const handleClickOutside = () => {
    setHostelOpen(false);
    setFloorOpen(false);
    setDisableOpen(false);
  };

  window.addEventListener("click", handleClickOutside);

  return () => window.removeEventListener("click", handleClickOutside);
}, []);
  
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
                  {isSelectionMode && (
                      <button
                        onClick={handleSelectAll}
                        className="text-blue-600 font-medium hover:underline"
                      >
                        {isAllSelected ? "Unselect All" : "Select All"}
                      </button>
                    )}
                  {isSelectionMode && hasSelection && (
                      <button
                        onClick={handleConfirmAction}
                        className={`hover:text-blue-600 transition ${
                          actionMode ? "text-blue-600 font-semibold" : ""
                        }`}
                      >
                        OK
                      </button>
                    )}

                  <button
                      onClick={() => handleActionClick("edit")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "edit" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleActionClick("allocate")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "allocate" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Allocate
                    </button>

                    <button
                      onClick={() => handleActionClick("deallocate")}
                      className={`hover:text-blue-600 transition ${
                        actionMode === "deallocate" ? "text-blue-600 font-semibold" : ""
                      }`}
                    >
                      Deallocate
                    </button>

                  <div className="relative flex items-center gap-1">

                    {/* Main Action Button (JUST SELECT MODE) */}
                    <button
                      onClick={() => handleActionClick(roomAction.toLowerCase())}
                      className={`hover:text-blue-600 transition ${
                        actionMode === roomAction.toLowerCase()
                          ? "text-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      {roomAction}
                    </button>

                    {/* Chevron toggle */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisableOpen((prev) => !prev);
                      }}
                      className="hover:text-blue-600 transition"
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          disableOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Dropdown */}
                    {disableOpen && (
                      <div className="absolute right-0 top-full mt-2 w-36 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">

                        {/* 🔴 DISABLE (ONLY SELECT MODE) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setRoomAction("Disable");
                            setDisableOpen(false);

                            // only select mode + selection
                            handleActionClick("disable");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Disable
                        </button>

                        {/* 🟢 ENABLE (ONLY SELECT MODE) */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();

                            setRoomAction("Enable");
                            setDisableOpen(false);

                            // only select mode + selection
                            handleActionClick("enable");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 text-green-600"
                        >
                          Enable
                        </button>

                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="px-4 sm:px-6 md:px-10 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {rooms.map((r) => (
              <RoomCard
                key={r.room}
                room={r.room}
                status={r.status}
                capacity={r.capacity}
                occupants={r.occupants}
                selectionMode={isSelectionMode}
                selected={selectedRooms.includes(r.room)}
                onSelect={toggleRoomSelection}
                onClickRoom={() => {
                  if (actionMode === "allocate") {
                    setAllocateRoom(r.room);
                    setAllocateStudentsOpen(true);
                  } else {
                    toggleRoomSelection(r.room);
                  }
                }}
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
        onSave={(data) => {
          console.log("Edited:", data);

          // 👉 apply changes to rooms here
          setEditModalOpen(false);
          setSelectedRooms([]);
          setActionMode(null);
        }}
      />

      {/* Allocate */}
      <AllocateStudents
        isOpen={allocateStudentsOpen}
        onClose={() => setAllocateStudentsOpen(false)}
        rooms={rooms.filter(r => r.room === allocateRoom)}
        selectedRooms={[allocateRoom]}
        onNext={(data) => {
          console.log("Allocate:", data);
          setAllocateStudentsOpen(false);
          setAllocateRoom(null);
          setActionMode(null);
        }}
      />

      {/* Deallocate */}
      <DeallocateStudents
        isOpen={deallocateStudentsOpen}
        onClose={() => setDeallocateStudentsOpen(false)}
        students={students}
        onConfirm={(selectedIds) => {
          console.log("Deallocate:", selectedIds);
          setDeallocateStudentsOpen(false);
        }}
      />
    </div>
  );
}