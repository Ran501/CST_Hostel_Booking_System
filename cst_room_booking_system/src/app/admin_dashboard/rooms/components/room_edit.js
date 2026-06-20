"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";

export default function EditRoomsModal({
  isOpen,
  onClose,
  selectedCount = 0,
  rooms = [],
  onSave,
}) {
  const [capacity, setCapacity] = useState("");
  const [year, setYear] = useState("");
  const [errors, setErrors] = useState({});

  // ── Extract unique values ───────────────────────────────────────
  const capacities = useMemo(
    () => [...new Set(rooms.map((r) => r.capacity).filter(Boolean))],
    [rooms]
  );

  const years = useMemo(
    () => [...new Set(rooms.map((r) => r.year).filter(Boolean))],
    [rooms]
  );

  // ── Prefill values ─────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setCapacity(capacities.length === 1 ? String(capacities[0]) : "");
    setYear(years.length === 1 ? String(years[0]) : "");

    setErrors({});
  }, [isOpen, capacities, years]);

  if (!isOpen) return null;

  // ── Validation ────────────────────────────────────────────────
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

  // ── Save Handler ──────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return;

    const payload = {};

    if (capacity !== "") payload.capacity = parseInt(capacity, 10);
    if (year !== "") payload.year = parseInt(year, 10);

    if (Object.keys(payload).length === 0) {
      setErrors({ general: "Please update at least one field" });
      return;
    }

    onSave(payload);
  };

  // ── Hints ─────────────────────────────────────────────────────
  const capacityHint =
    capacities.length > 1
      ? `Currently: ${capacities.join(", ")} (mixed)`
      : capacities.length === 1
      ? `Currently: ${capacities[0]}`
      : "";

  const yearHint =
    years.length > 1
      ? `Currently: ${years.join(", ")} (mixed)`
      : years.length === 1
      ? `Currently: ${years[0]}`
      : "";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-cstcolor to-cstcolor2 text-white px-6 py-8 text-center">
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-xl font-semibold">Edit Selected Rooms</h2>
          <p className="text-sm text-blue-100 mt-1">
            Update capacity and allocation
          </p>

          <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
            {selectedCount} Room{selectedCount !== 1 ? "s" : ""} Selected
          </div>
        </div>

        {/* Selected Rooms */}
        {rooms.length > 0 && (
          <div className="px-6 pt-5">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">
              Selected Rooms
            </p>

            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <span
                  key={r.id}
                  className="text-xs bg-blue-50 text-cstcolor border px-2.5 py-1 rounded-full"
                >
                  {r.room} · Cap {r.capacity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Error */}
          {errors.general && (
            <p className="text-sm text-red-500 bg-red-50 border px-3 py-2 rounded-lg">
              {errors.general}
            </p>
          )}

          {/* Capacity */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium bg-white text-gray-700">
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
                setErrors((p) => ({ ...p, capacity: undefined }));
              }}
              placeholder="Leave blank to keep unchanged"
              className={`w-full px-4 py-3 rounded-xl border-2 outline-none bg-white text-gray-900
  placeholder:text-gray-400 focus:ring-2 transition
  ${errors.capacity
    ? "border-red-400 focus:ring-red-200"
    : "border-cstcolor focus:ring-cstcolor focus:border-cstcolor"
  }`}
            />

            {errors.capacity && (
              <p className="text-xs text-red-500 mt-1">
                {errors.capacity}
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">
                Allowed Year
              </label>
              {yearHint && (
                <span className="text-xs text-gray-400">{yearHint}</span>
              )}
            </div>

            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="cursor-pointer w-full px-4 py-3 rounded-xl border-2 border-cstcolor bg-white text-gray-900
  appearance-none focus:ring-2 focus:ring-cstcolor focus:border-cstcolor outline-none transition"
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

          {/* Actions */}
          <div className="border-t pt-4 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 rounded-xl"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="cursor-pointer px-5 py-2.5 bg-cstcolor text-white rounded-xl"
            >
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}