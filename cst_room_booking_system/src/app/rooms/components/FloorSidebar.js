"use client";

import Link from "next/link";

export default function FloorSidebar({ 
  currentFloor = 1, 
  maxFloors = 4, 
  baseUrl = "/rooms/1/floor",
  baseHref = "/rooms/1/floor",
  floors = null,
  onClose = () => {} 
}) {
  // Use floors array if provided, otherwise generate from maxFloors
  const floorList = floors || Array.from({ length: maxFloors }, (_, i) => i + 1);
  // Use baseHref if provided, otherwise fall back to baseUrl
  const linkBase = baseHref || baseUrl;

  return (
    <div className="w-full bg-white border-t border-slate-200">
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-sm text-slate-700 mb-3">Select Floor</h3>
        {floorList.map((floor) => (
          <Link
            key={floor}
            href={`${linkBase}/${floor}`}
            onClick={onClose}
            className={`block w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentFloor === floor
                ? "bg-blue-100 text-blue-700 border border-blue-200"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            Floor {floor}
          </Link>
        ))}
      </div>
    </div>
  );
}
