"use client";

import { useState } from "react";
import { ChevronDown, ArrowLeft, Eye, Download, FileSpreadsheet} from "lucide-react";
import RoomCard from "./room_card";

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

export default function HostelFloorPage() {
  const [disableOpen, setDisableOpen] = useState(false);
  const [roomAction, setRoomAction] = useState("Disable");

  const [actionMode, setActionMode] = useState(null);
 // null | "edit" | "allocate" | "deallocate" | "enable" | "disable"

 const handleActionClick = (mode) => {
  setSelectedRooms([]);

  setActionMode((prev) => (prev === mode ? null : mode));
};

  const [selectedRooms, setSelectedRooms] = useState([]);
  const selectedSet = new Set(selectedRooms);

  const toggleRoomSelection = (roomId) => {
  setSelectedRooms((prev) =>
    prev.includes(roomId)
      ? prev.filter((id) => id !== roomId)
      : [...prev, roomId]
  );
};
  
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

                <button className="flex items-center text-[#2b7cff] text-[20px] md:text-[22px]">
                  HF
                  <ChevronDown size={16} className="ml-1" />
                </button>

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
                  <button className="text-[#2b7cff] flex items-center gap-1">
                    Floor 1
                    <ChevronDown size={16} />
                  </button>

                  <span>18/18 Occupied</span>
                  <span>•</span>
                  <span>6 disabled rooms</span>
                </div>

                <div className="flex flex-wrap gap-4 text-[18px] md:text-[20px]">
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

                    {/* Main Action Button */}
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
                      onClick={() => setDisableOpen((prev) => !prev)}
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

                        <button
                          onClick={() => {
                            setRoomAction("Disable");
                            setDisableOpen(false);
                            handleActionClick("disable");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Disable
                        </button>

                        <button
                          onClick={() => {
                            setRoomAction("Enable");
                            setDisableOpen(false);
                            handleActionClick("enable");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
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
                selectionMode={actionMode}
                selected={selectedRooms.includes(r.room)}
                onSelect={toggleRoomSelection}
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
    </div>
  );
}