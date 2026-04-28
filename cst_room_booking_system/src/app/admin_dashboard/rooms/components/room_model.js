"use client";

import { ChevronDown, ArrowLeft } from "lucide-react";
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
];

function Badge({ children, color }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm md:text-base ${color}`}>
      {children}
    </span>
  );
}

export default function HostelFloorPage() {
  return (
    <div className="min-h-screen bg-[#ececec] overflow-y-auto">
      <div className="w-full min-h-full bg-[#ececec] text-[#1e1e1e] px-4 sm:px-6 md:px-10 py-5">

        {/* Header */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 text-[18px] md:text-[20px]">
          <button className="mr-1">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <span className="flex items-center text-[#2b7cff] text-[20px] md:text-[22px] font-normal">
            HF <ChevronDown size={16} className="ml-1" />
          </span>
          <div className="flex flex-wrap gap-2">
            <Badge color="bg-[#56d154] text-white">Active</Badge>
            <Badge color="bg-[#9957f6] text-white">Female only</Badge>
            <Badge color="bg-[#d9d9d9]">3 Floors</Badge>
            <Badge color="bg-[#d9d9d9]">70 Rooms</Badge>
            <Badge color="bg-[#d9d9d9]">140 Capacity</Badge>
            <Badge color="bg-[#d9d9d9]">110 Occupied</Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4 text-[18px] md:text-[20px]">
            <button className="text-[#2b7cff] flex items-center gap-1">
              Floor 1 <ChevronDown size={16}/>
            </button>
            <span>18/18 Occupied</span>
            <span>•</span>
            <span>6 disabled rooms</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[18px] md:text-[20px]">
            <button>Allocate</button>
            <button>Deallocate</button>
            <button className="flex items-center gap-1">
              Disable <ChevronDown size={16}/>
            </button>
          </div>
        </div>

        {/* Rooms */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {rooms.map((r)=>(
            <RoomCard
              key={r.room}
              room={r.room}
              status={r.status}
              capacity={r.capacity}
              occupants={r.occupants}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 inline-flex flex-wrap gap-4 bg-[#f3f3f3] px-3 py-3 border rounded-sm text-[18px] text-gray-600">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-blue-500"/> Available</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-orange-500"/> Partially Occupied</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-pink-600"/> Full</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-red-500"/> Disabled</div>
        </div>
      </div>
    </div>
  );
}
