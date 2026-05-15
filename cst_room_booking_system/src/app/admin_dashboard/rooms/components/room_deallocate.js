"use client";

import { useState, useEffect } from "react";
import { X, UserMinus } from "lucide-react";

export default function DeallocateStudents({
  isOpen,
  onClose,
  students = [],   // [{ id, bookingId, name, studentNumber, room, roomId, year }]
  onConfirm,       // (bookingIds: string[]) => void
}) {
  const [selected, setSelected] = useState([]);

  // Reset selection when modal opens or student list changes
  useEffect(() => {
    if (isOpen) setSelected([]);
  }, [isOpen, students]);

  if (!isOpen) return null;

  const toggleSelect = (bookingId) => {
    setSelected((prev) =>
      prev.includes(bookingId)
        ? prev.filter((id) => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  const toggleAll = () => {
    const allBookingIds = students
      .map((s) => s.bookingId)
      .filter(Boolean);

    if (selected.length === allBookingIds.length) {
      setSelected([]);
    } else {
      setSelected(allBookingIds);
    }
  };

  const allSelected =
    students.length > 0 &&
    selected.length === students.filter((s) => s.bookingId).length;

  // Group students by room for a cleaner display
  const byRoom = students.reduce((acc, student) => {
    const key = student.room ?? "Unknown Room";
    if (!acc[key]) acc[key] = [];
    acc[key].push(student);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-8 px-6 flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition"
          >
            <X size={20} />
          </button>

          <div className="flex items-center justify-center gap-2 mb-1">
            <UserMinus size={22} />
            <h1 className="text-2xl font-semibold">Deallocate Students</h1>
          </div>

          <p className="text-sm text-blue-100 mt-1">
            Select students to remove from their assigned rooms
          </p>

          <div className="mt-4 inline-block bg-white/20 px-4 py-1 rounded-full text-sm">
            {selected.length} of {students.length} selected
          </div>
        </div>

        {/* Select All bar */}
        {students.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <span className="text-sm text-gray-600 font-medium">
              {students.length} student{students.length !== 1 ? "s" : ""} in selected rooms
            </span>
            <button
              onClick={toggleAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          </div>
        )}

        {/* Student list */}
        <div className="overflow-y-auto flex-1 p-4 space-y-5">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <UserMinus size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">No students in selected rooms</p>
              <p className="text-sm mt-1">
                Select rooms with occupants to deallocate.
              </p>
            </div>
          ) : (
            Object.entries(byRoom).map(([roomNumber, roomStudents]) => (
              <div key={roomNumber}>
                {/* Room label */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">
                  Room {roomNumber}
                </p>

                <div className="space-y-2">
                  {roomStudents.map((student) => {
                    const key        = student.bookingId ?? student.id;
                    const isSelected = selected.includes(student.bookingId);
                    const hasBooking = !!student.bookingId;

                    return (
                      <div
                        key={key}
                        onClick={() => hasBooking && toggleSelect(student.bookingId)}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all
                          ${!hasBooking
                            ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                            : isSelected
                            ? "border-blue-500 bg-blue-50 shadow-sm cursor-pointer"
                            : "border-gray-200 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                          }`}
                      >
                        {/* Checkbox */}
                        <div
                          className={`w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full border-2 transition-colors
                            ${isSelected
                              ? "bg-blue-500 border-blue-500 text-white"
                              : "border-gray-300 bg-white"
                            }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 12 12">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 truncate">
                            {student.name ?? "Unknown"}
                          </p>

                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-sm text-gray-500">
                            {student.studentNumber && (
                              <span>{student.studentNumber}</span>
                            )}
                            {student.year && student.year !== "N/A" && (
                              <span>Year {student.year}</span>
                            )}
                          </div>
                        </div>

                        {/* Room badge */}
                        <span
                          className={`flex-shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                            isSelected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {roomNumber}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-medium"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              const confirmed = await onConfirm(selected);
              if (confirmed !== false) setSelected([]);
            }}
            disabled={selected.length === 0}
            className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium transition shadow-sm ${
              selected.length > 0
                ? "bg-red-500 hover:bg-red-600"
                : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Remove {selected.length > 0 ? `(${selected.length})` : ""} Student{selected.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
