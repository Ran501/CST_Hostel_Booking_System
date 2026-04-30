export default function RoomLegend() {
  return (
    <div className="mt-3 xs:mt-4 sm:mt-5 lg:mt-6">
          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm md:text-base text-slate-700">
            <div className="flex items-center gap-1 xs:gap-2">
              <div className="h-2 xs:h-3 w-2 xs:w-3 rounded-full bg-white border border-slate-300 ring-1 ring-slate-200" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1 xs:gap-2">
              <div className="h-2 xs:h-3 w-2 xs:w-3 rounded-full bg-amber-50 border border-amber-300 ring-1 ring-amber-200" />
              <span>Partially Booked</span>
            </div>
            <div className="flex items-center gap-1 xs:gap-2">
              <div className="h-2 xs:h-3 w-2 xs:w-3 rounded-full bg-red-50 border border-red-300 ring-1 ring-red-200" />
              <span>Fully Booked</span>
            </div>
          </div>
        </div>
  );
}
