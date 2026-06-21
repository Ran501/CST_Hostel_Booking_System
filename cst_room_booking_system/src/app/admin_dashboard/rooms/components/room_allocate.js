"use client";

import { useState, useEffect } from "react";
import { X, Search } from "lucide-react";

export default function AllocateStudents({
  isOpen,
  onClose,
  onNext,
  rooms  = [],
  hostel = null,   // { id, gender, allowedYears: number[] }
}) {
  const [search,           setSearch]           = useState("");
  const [students,         setStudents]         = useState([]);
  const [loading,          setLoading]          = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const room = rooms?.[0];

  // ── FIX 2: Derive the year filter ────────────────────────────────────────
  // Priority order:
  //  1. hostel.allowedYears (set from FloorAllocation in room_model.js)
  //  2. room.year (the year stamped on the room record itself)
  //  3. No year filter (show all eligible students)
  const yearFilter = (() => {
    if (hostel?.allowedYears?.length) return hostel.allowedYears;
    if (room?.year)                   return [room.year];
    return [];
  })();

  const availableBeds = room
    ? room.capacity - (room.occupants?.length ?? 0)
    : 0;

  const filterDescription = [
    hostel?.gender
      ? `${hostel.gender.charAt(0).toUpperCase() + hostel.gender.slice(1)} students`
      : null,
    yearFilter.length
      ? `Year ${yearFilter.join(", ")}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  // ── Fetch eligible students ───────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setSelectedStudents([]);

    const fetchStudents = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // Gender: must match hostel gender
        if (hostel?.gender) {
          params.append("gender", hostel.gender.toLowerCase());
        }

        // Year: from FloorAllocation or room.year — whichever is available
        if (yearFilter.length) {
          params.append("allowedYears", yearFilter.join(","));
        }

        // Exclude students already allocated elsewhere
        params.append("unallocated", "true");

        // Search keyword
        if (search.trim()) {
          params.append("search", search.trim());
        }

        const res  = await fetch(`/api/admin/student?${params}`);
        const json = await res.json();

        const list =
          Array.isArray(json.data)     ? json.data     :
          Array.isArray(json.students) ? json.students :
          [];

        setStudents(list);
      } catch (err) {
        console.error("Failed to fetch students:", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search input by 300 ms
    const timer = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timer);

  // Re-run when modal opens, search changes, or filters change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, search, hostel?.gender, yearFilter.join(",")]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setSelectedStudents([]);
    }
  }, [isOpen]);

  const toggleStudent = (studentNumber) => {
    setSelectedStudents((prev) =>
      prev.includes(studentNumber)
        ? prev.filter((id) => id !== studentNumber)
        : [...prev, studentNumber]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

        {/* Header */}
        <div className="relative bg-gradient-to-r from-cstcolor to-cstcolor2 text-white px-6 py-8 text-center flex-shrink-0">
          <button
            onClick={onClose}
            className="cursor-pointer absolute top-4 right-4 text-white/80 hover:text-white"
          >
            <X size={20} />
          </button>

          <h2 className="text-2xl font-semibold">Allocate Students</h2>

          <p className="text-blue-100 text-sm mt-1">
            {room
              ? `Room ${room.room} · ${availableBeds} bed(s) available`
              : "Select a room first"}
          </p>

          {filterDescription && (
            <div className="mt-3 inline-block px-3 py-1 text-xs rounded-full bg-white/20 text-white">
              Showing: {filterDescription}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-gray-100 px-6 py-6 space-y-5">

          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student number or name…"
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-blue-200 bg-white text-gray-700 focus:ring-2 focus:ring-cstcolor focus:border-cstcolor2 outline-none transition"
            />
          </div>

          {/* Student list */}
          <div className="text-black space-y-3 max-h-96 overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse border border-gray-200">
                  <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              ))
            ) : students.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p className="font-medium">No eligible students found</p>
                <p className="text-sm mt-1 text-gray-400">
                  {filterDescription
                    ? `Filters active: ${filterDescription}`
                    : "Try a different search term"}
                </p>
              </div>
            ) : (
              students.map((student) => {
                const studentNumber = student.studentNumber ?? student.id;
                const studentName   =
                  (student.name ??
                  `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim()) ||
                  "Unnamed";
                const isSelected = selectedStudents.includes(studentNumber);

                return (
                  <button
                    key={studentNumber}
                    onClick={() => toggleStudent(studentNumber)}
                    className={`w-full text-left rounded-2xl border p-4 transition-all ${
                      isSelected
                        ? "bg-cstcolor border-cstcolor text-white"
                        : "bg-white border-gray-200 hover:border-cstcolor hover:shadow-sm"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-base">{studentName}</p>
                        <p className={`text-sm ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                          {student.studentNumber}
                        </p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "bg-white border-white" : "border-gray-300"
                        }`}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cstcolor" />}
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {student.gender && (
                        <span className={`px-2 py-1 rounded-full ${isSelected ? "bg-cstcolor2 text-white" : "bg-gray-100 text-gray-600"}`}>
                          {student.gender}
                        </span>
                      )}
                      {student.year && (
                        <span className={`px-2 py-1 rounded-full ${isSelected ? "bg-cstcolor2 text-white" : "bg-gray-100 text-gray-600"}`}>
                          Year {student.year}
                        </span>
                      )}
                      {student.department && (
                        <span className={`px-2 py-1 rounded-full ${isSelected ? "bg-cstcolor2 text-white" : "bg-gray-100 text-gray-600"}`}>
                          {student.department}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between flex-shrink-0">
          <p className="text-sm text-gray-500">
            {selectedStudents.length} selected
            {availableBeds > 0 ? ` / ${availableBeds} available` : ""}
          </p>

          <div className="flex gap-3">
            <button
              onClick={() => onNext({ studentNumbers: selectedStudents })}
              disabled={selectedStudents.length === 0 || selectedStudents.length > availableBeds}
              className={`cursor-pointer px-5 py-2 rounded-xl text-white transition shadow-sm text-sm ${
                selectedStudents.length > 0 && selectedStudents.length <= availableBeds
                  ? "bg-cstcolor hover:bg-cstcolor2"
                  : "bg-blue-300 cursor-not-allowed"
              }`}
            >
              Allocate ({selectedStudents.length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}