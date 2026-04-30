"use client";

import { useState } from "react";

export default function DeallocateStudents({
  isOpen,
  onClose,
  students = [],
  onConfirm,
}) {
  const [selected, setSelected] = useState([]);

  if (!isOpen) return null;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white text-center py-8 px-4">
          <h1 className="text-2xl font-semibold">
            Deallocate Students
          </h1>
          <p className="text-sm opacity-90 mt-1">
            Select students to remove from assigned rooms
          </p>

          <div className="mt-4 inline-block bg-blue-400/30 px-4 py-1 rounded-full text-sm">
            {selected.length} Selected
          </div>
        </div>

        {/* Student List */}
        <div className="p-4 max-h-[400px] overflow-y-auto space-y-4">
          {students.map((student) => {
            const isSelected = selected.includes(student.id);

            return (
              <div
                key={student.id}
                onClick={() => toggleSelect(student.id)}
                className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all
                  ${isSelected
                    ? "border-blue-500 shadow-md bg-white"
                    : "border-gray-200 bg-gray-100 hover:bg-gray-200"
                  }`}
              >
                {/* Checkbox */}
                <div
                  className={`w-6 h-6 flex items-center justify-center rounded-full border
                    ${isSelected
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "border-gray-400"
                    }`}
                >
                  {isSelected && "✓"}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-800">
                    {student.name}
                  </h2>

                  <div className="text-sm text-gray-500 flex flex-wrap gap-2 mt-1">
                    <span>ID: {student.id}</span>
                    <span className="text-blue-600 font-medium">
                      Room: {student.room}
                    </span>
                    <span>{student.year}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">

          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-gray-300 text-gray-700"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm(selected);
              setSelected([]);
            }}
            className="flex-1 sm:flex-none px-6 py-2 rounded-xl bg-red-500 text-white shadow-lg hover:bg-red-600 transition"
          >
            Confirm Deallocation
          </button>
        </div>
      </div>
    </div>
  );
}