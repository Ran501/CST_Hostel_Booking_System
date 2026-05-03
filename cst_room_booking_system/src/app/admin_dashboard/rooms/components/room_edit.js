"use client";

import { useState } from "react";
import { X, ChevronDown } from "lucide-react";

export default function EditRoomsModal({
  isOpen,
  onClose,
  selectedCount = 7,
  onSave,
}) {
  const [capacity, setCapacity] = useState("");
  const [year, setYear] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* 🔵 HEADER */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-8 text-center">

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold">
            Edit Selected Rooms
          </h2>

          <p className="text-sm text-blue-100 mt-1">
            Update capacity and allocation for selected rooms
          </p>

          {/* Badge */}
          <div className="mt-4 inline-block bg-white/20 text-white text-sm px-4 py-1 rounded-full backdrop-blur">
            {selectedCount} Rooms Selected
          </div>
        </div>

        {/* ⚪ BODY */}
        <div className="bg-gray-100 px-6 py-6 space-y-5">

          {/* Room Capacity */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Room Capacity
            </label>

            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Enter room capacity"
              className="w-full px-4 py-3 rounded-xl border-2 border-blue-400 outline-none bg-white text-gray-700 placeholder:text-blue-300 focus:ring-2 focus:ring-blue-300 transition"
            />
          </div>

          {/* Allowed Year */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Allowed Year
            </label>

            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 bg-white text-gray-600 appearance-none focus:ring-2 focus:ring-blue-300 outline-none"
              >
                <option value="">Select allowed years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">Final Year</option>
              </select>

              {/* Chevron */}
              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 my-4"></div>

          {/* Actions */}
          <div className="flex justify-end gap-3">

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              Cancel
            </button>

            <button
              onClick={() => onSave({ capacity, year })}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-md"
            >
              Save Changes
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}