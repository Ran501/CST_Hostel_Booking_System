"use client";

import Link from "next/link";

// Hostel data
const hostels = [
  { id: 1, name: "RKA", fullName: "Hostel RKA (Azalea)", floors: 4, color: "from-blue-500 to-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", hoverBg: "hover:bg-blue-100" },
  { id: 2, name: "RKB", fullName: "Hostel RKB (Bougainvillea)", floors: 4, color: "from-green-500 to-green-600", bgColor: "bg-green-50", borderColor: "border-green-200", hoverBg: "hover:bg-green-100" },
  { id: 3, name: "NK", fullName: "Hostel NK (Neem Karoli)", floors: 4, color: "from-purple-500 to-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200", hoverBg: "hover:bg-purple-100" },
  { id: 4, name: "HA", fullName: "Hostel HA (Ashoka)", floors: 3, color: "from-yellow-500 to-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", hoverBg: "hover:bg-yellow-100" },
  { id: 5, name: "HB", fullName: "Hostel HB (Banyan)", floors: 3, color: "from-pink-500 to-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200", hoverBg: "hover:bg-pink-100" },
  { id: 6, name: "HC", fullName: "Hostel HC (Cedar)", floors: 3, color: "from-indigo-500 to-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200", hoverBg: "hover:bg-indigo-100" },
  { id: 7, name: "HD", fullName: "Hostel HD (Deodar)", floors: 3, color: "from-orange-500 to-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200", hoverBg: "hover:bg-orange-100" },
  { id: 8, name: "HF", fullName: "Hostel HF (Ficus)", floors: 3, color: "from-teal-500 to-teal-600", bgColor: "bg-teal-50", borderColor: "border-teal-200", hoverBg: "hover:bg-teal-100" },
  { id: 9, name: "HE", fullName: "Hostel HE (Original ID 10)", floors: 2, color: "from-red-500 to-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", hoverBg: "hover:bg-red-100" },
  { id: 10, name: "Lhawang", fullName: "Hostel Lhawang (Original ID 9)", floors: 5, color: "from-emerald-500 to-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", hoverBg: "hover:bg-emerald-100" },
];

export default function HostelLandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200 py-8 sm:py-12 md:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-block p-3 bg-white rounded-full shadow-lg mb-4">
            <span className="text-4xl">🏠</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-800 mb-3">
            RUB Hostel Booking System
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            Select a hostel to view available rooms, check bed occupancy, and make reservations
          </p>
        </div>

        {/* Hostel Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {hostels.map((hostel) => (
            <Link
              key={hostel.id}
              href={`/rooms/${hostel.id}/floor/1`}
              className={`group block p-5 sm:p-6 rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${hostel.bgColor} ${hostel.borderColor} ${hostel.hoverBg}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
                    {hostel.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">{hostel.fullName}</p>
                </div>
                <div className="bg-white/80 rounded-full px-2 py-1 text-xs font-semibold text-slate-600">
                  {hostel.floors} Floors
                </div>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex -space-x-1">
                  {[...Array(hostel.floors)].map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-sm font-medium text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1">
                  View Details 
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
              
              {/* Room stats */}
              <div className="mt-3 pt-3 border-t border-slate-200/50 text-xs text-slate-500">
                <span>✨ Modern amenities • 📍 Prime location • 🚿 Attached washroom</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center text-xs text-slate-500">
          <p>Select any hostel to view room layout, check availability, and book your stay</p>
          <p className="mt-2">Each room accommodates 2-3 students with common washroom facilities</p>
        </div>
      </div>
    </main>
  );
}