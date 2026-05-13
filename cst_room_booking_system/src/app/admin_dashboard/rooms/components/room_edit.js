"use client";

import { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

export default function EditRoomsModal({
  isOpen,
  onClose,
  selectedCount = 0,
  rooms         = [],   // full room objects: [{ id, room, capacity, floor, status }]
  onSave,               // ({ capacity?: number, year?: number }) => void
}) {
  const [capacity, setCapacity] = useState("");
  const [year,     setYear]     = useState("");
  const [errors,   setErrors]   = useState({});

  // Pre-fill capacity if all selected rooms share the same value
  useEffect(() => {
    if (!isOpen) return;

    const capacities = [...new Set(rooms.map((r) => r.capacity).filter(Boolean))];
    setCapacity(capacities.length === 1 ? String(capacities[0]) : "");
    setYear("");
    setErrors({});
  }, [isOpen, rooms]);

  if (!isOpen) return null;

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (capacity !== "") {
      const num = parseInt(capacity, 10);
      if (isNaN(num) || num < 1) {
        errs.capacity = "Capacity must be a number ≥ 1";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    // Only send fields the admin actually filled in
    const payload = {};
    if (capacity !== "") payload.capacity = parseInt(capacity, 10);
    if (year     !== "") payload.year     = parseInt(year, 10);

    if (Object.keys(payload).length === 0) {
      setErrors({ general: "Please update at least one field" });
      return;
    }

    onSave(payload);
  };

  // ── Mixed-capacity label ──────────────────────────────────────────────────
  const capacities    = [...new Set(rooms.map((r) => r.capacity).filter(Boolean))];
  const capacityHint  = capacities.length > 1
    ? `Currently: ${capacities.join(", ")} (mixed)`
    : capacities.length === 1
    ? `Currently: ${capacities[0]}`
    : "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold">Edit Selected Rooms</h2>
          <p className="text-sm text-blue-100 mt-1">
            Update capacity and allocation for selected rooms
          </p>

          <div className="mt-4 inline-block bg-white/20 text-white text-sm px-4 py-1 rounded-full">
            {selectedCount} Room{selectedCount !== 1 ? "s" : ""} Selected
          </div>
        </div>

        {/* Selected rooms preview */}
        {rooms.length > 0 && (
          <div className="px-6 pt-5 pb-0">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Selected Rooms
            </p>
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <span
                  key={r.id}
                  className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium"
                >
                  {r.room}
                  <span className="text-blue-400">·</span>
                  <span className="text-blue-500">Cap {r.capacity}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="bg-white px-6 py-5 space-y-5">

          {/* General error */}
          {errors.general && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errors.general}
            </p>
          )}

          {/* Room Capacity */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Room Capacity
              </label>
              {capacityHint && (
                <span className="text-xs text-gray-400">{capacityHint}</span>
              )}
            </div>

            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => {
                setCapacity(e.target.value);
                setErrors((prev) => ({ ...prev, capacity: undefined }));
              }}
              placeholder="Leave blank to keep unchanged"
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none bg-white text-gray-700 
                placeholder:text-gray-300 focus:ring-2 transition
                ${errors.capacity
                  ? "border-red-400 focus:ring-red-200"
                  : "border-blue-300 focus:ring-blue-200 focus:border-blue-400"
                }`}
            />

            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Allowed Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Allowed Year
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>

            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-blue-300 bg-white text-gray-700
                  appearance-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition"
              >
                <option value="">Leave unchanged</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">Final Year</option>
              </select>

              <ChevronDown
                size={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}