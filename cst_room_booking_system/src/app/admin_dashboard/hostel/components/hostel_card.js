"use client";

import { Building2, Users, Layers } from "lucide-react";

export default function HostelCard({
  hostelName,
  gender,
  status,
  roomCount   = 0,
  capacity    = 0,
  numberOfFloor = 0,
  onClick,
}) {
  const isActive = status === "active";

  return (
    <div
      onClick={onClick}
      className={`relative h-64 w-full rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
        !isActive ? "opacity-70 grayscale" : ""
      }`}
      style={{
        backgroundImage: `url(/rkahostel.jpeg)`,
        backgroundSize:     "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Top badges */}
      <div className="absolute top-2 right-2 z-20 flex gap-2">
        <span
          className={`text-white text-xs px-2 py-1 rounded-full ${
            isActive ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>

        {gender && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full capitalize">
            {gender}
          </span>
        )}
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <h3 className="text-lg font-semibold leading-tight">{hostelName}</h3>

        <p className="text-sm mt-1 text-gray-200">
          {roomCount} room{roomCount !== 1 ? "s" : ""} • {capacity} beds
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-300">
          <span className="flex items-center gap-1">
            <Building2 size={13} />
            {roomCount} rooms
          </span>
          <span className="flex items-center gap-1">
            <Layers size={13} />
            {numberOfFloor} floor{numberOfFloor !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users size={13} />
            {capacity} cap
          </span>
        </div>
      </div>
    </div>
  );
}