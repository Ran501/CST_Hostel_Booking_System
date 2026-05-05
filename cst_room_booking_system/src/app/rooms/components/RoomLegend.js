"use client";

export default function RoomLegend() {
  return (
    <div className="mt-3 xs:mt-4 sm:mt-5 lg:mt-6">
      <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm md:text-base text-slate-700">

        {/* Available */}
        <div className="flex items-center gap-1 xs:gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500 border border-white shadow-sm" />
          <span>Available</span>
        </div>

        {/* Partially Booked */}
        <div className="flex items-center gap-1 xs:gap-2">
          <div className="h-3 w-3 rounded-full bg-amber-400 border border-white shadow-sm" />
          <span>Partially Booked</span>
        </div>

        {/* Fully Booked */}
        <div className="flex items-center gap-1 xs:gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500 border border-white shadow-sm" />
          <span>Fully Booked</span>
        </div>

        {/* Inactive */}
        <div className="flex items-center gap-1 xs:gap-2">
          <div className="h-3 w-3 rounded-full bg-gray-400 border border-white shadow-sm" />
          <span>Inactive</span>
        </div>

      </div>
    </div>
  );
}