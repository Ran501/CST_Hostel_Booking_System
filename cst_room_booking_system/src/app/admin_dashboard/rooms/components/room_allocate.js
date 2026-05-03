"use client";

import { useState } from "react";
import { X, Search, ChevronDown } from "lucide-react";

export default function AllocateStudents({
  isOpen,
  onClose,
  onNext,
  rooms = [],
}) {
  const [search, setSearch] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* 🔵 HEADER */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-10 text-center rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold">
            Allocate Room
          </h2>

          <p className="text-blue-100 text-sm mt-2">
            Search and assign students to a room
          </p>
        </div>

        {/* ⚪ BODY */}
        <div className="bg-gray-100 px-6 py-8 space-y-6">

          {/* 🔍 Search Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or ID"
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-300 bg-white text-gray-700 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-300 outline-none transition"
              />
            </div>

            <button
              className="px-6 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
            >
              Search
            </button>
          </div>

          {/* 🏠 Select Room */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Select Room
            </label>

            <div className="relative">
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 bg-white text-gray-600 appearance-none focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="">Choose a room</option>
                {rooms.map((room, index) => (
                    <option key={room.id ?? index} value={room.id}>
                        {room.name}
                    </option>
                    ))}
              </select>

              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
              />
            </div>
          </div>

          {/* ⚡ ACTIONS */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            <button
              onClick={() => onNext({ search, selectedRoom })}
              disabled={!selectedRoom}
              className={`px-6 py-2 rounded-xl text-white transition shadow-md ${
                selectedRoom
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}