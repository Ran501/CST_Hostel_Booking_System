"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Building, Users, Bed, Loader2 } from "lucide-react";

export default function HostelCard({ name, total, occupied,  isActive, onClick }) {
  const [hostelStats, setHostelStats] = useState(null);
//   const [loading, setLoading] = useState(true); // ✅ start true

  const getFormattedHostelName = (hostelName) => {
    if (hostelName?.toLowerCase().includes("hostel")) {
      return hostelName;
    }
    return `Hostel ${hostelName}`;
  };

  // 🔥 Dummy Data
  useEffect(() => {
    const timer = setTimeout(() => {
      const totalRooms = total || 50;
      const occupiedRooms = occupied || 30;
      const availableRooms = Math.max(0, totalRooms - occupiedRooms);
      const occupancyRate =
        totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

      const totalBeds = totalRooms * 2;

      setHostelStats({
        totalRooms,
        occupiedRooms,
        availableRooms,
        occupancyRate,
        isActive: true,
        totalFloors: 3,
        capacity: totalBeds,
        totalBeds,
        image: "/rkahostel.jpeg",
      });

    //   setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [name, total, occupied]);

//   const handleClick = () => {
//     const formattedName = getFormattedHostelName(name);

//     if (hostelStats) {
//       toast(`${formattedName} • ${hostelStats.occupiedRooms}/${hostelStats.totalRooms} rooms`, {
//         icon: "🏨",
//       });
//     }
//   };

  // fallback values (so UI is never empty)
  const displayTotal = hostelStats?.totalRooms ?? total ?? 0;
  const displayOccupied = hostelStats?.occupiedRooms ?? occupied ?? 0;
  const occupancy =
    displayTotal > 0
      ? Math.round((displayOccupied / displayTotal) * 100)
      : 0;

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
      {/* 🔥 Loading overlay
      {loading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
          <span className="text-white text-xs">Loading...</span>
        </div>
      )} */}

      {/* 🔥 Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10 bg-green-500">
        <h3 className="text-lg font-semibold">
          {getFormattedHostelName(name)}
        </h3>

        {/* 👇 ADD THIS → so it doesn't look blank */}
        <p className="text-sm mt-1">
          {displayOccupied}/{displayTotal} rooms • {occupancy}%
        </p>

        <div className="absolute top-2 right-2 z-20">
        {isActive ? (
            <span className="bg-green-700 text-white text-xs px-2 py-1 rounded-full">
            Active
            </span>
        ) : (
            <div className="flex items-center gap-1 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
            Inactive
            </div>
        )}
        </div>
      </div>
    </div>
  );
}