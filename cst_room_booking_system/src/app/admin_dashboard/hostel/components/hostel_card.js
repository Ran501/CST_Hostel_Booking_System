"use client";

import { Building, Users, Bed } from "lucide-react";

export default function HostelCard({
  name,
  total = 0,
  occupied = 0,
  isActive,
  gender,
  onClick,
}) {

  // Format name
  const getFormattedHostelName = (hostelName) => {
    if (hostelName?.toLowerCase().includes("hostel")) {
      return hostelName;
    }
    return `Hostel ${hostelName}`;
  };

  // Derived values (REAL)
  const available = Math.max(0, total - occupied);
  const occupancy =
    total > 0 ? Math.round((occupied / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className={`relative h-64 w-full rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        !isActive ? "opacity-70 grayscale" : ""
      }`}
      style={{
        backgroundImage: `url(/rkahostel.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 🔥 Overlay gradient */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* 🔥 Top badges */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        {/* Status */}
        {isActive ? (
          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            Active
          </span>
        ) : (
          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            Inactive
          </span>
        )}

        {/* Gender (optional) */}
        {gender && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
            {gender}
          </span>
        )}
      </div>

      {/* 🔥 Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <h3 className="text-lg font-semibold">
          {getFormattedHostelName(name)}
        </h3>

        <p className="text-sm mt-1">
          {occupied}/{total} rooms • {occupancy}%
        </p>

        {/* 🔥 Extra info row */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-200">
          <span className="flex items-center gap-1">
            <Bed size={14} /> {total}
          </span>

          <span className="flex items-center gap-1">
            <Users size={14} /> {occupied}
          </span>

          <span className="flex items-center gap-1">
            <Building size={14} /> {available} free
          </span>
        </div>
      </div>
    </div>
  );
}