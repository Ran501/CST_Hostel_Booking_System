"use client";

export default function RoomLegend() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
      <h3 className="font-semibold text-sm text-slate-700 mb-3">Legend</h3>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-slate-200 bg-white"></div>
          <span className="text-xs text-slate-600">Available</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-amber-200 bg-amber-50"></div>
          <span className="text-xs text-slate-600">Partially Occupied</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-red-200 bg-red-50"></div>
          <span className="text-xs text-slate-600">Fully Booked</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded border border-slate-200 bg-slate-100"></div>
          <span className="text-xs text-slate-600">Inactive</span>
        </div>
      </div>
    </div>
  );
}
