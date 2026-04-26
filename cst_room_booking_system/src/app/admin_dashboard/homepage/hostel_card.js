"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Building, Users, Bed, Loader2 } from "lucide-react";
//import { HOSTEL_IMAGE_BY_ID } from "../../hostel/hostelImages";

export default function HostelCard({
  name,
  total,
  occupied,
}) {
  const [hostelStats, setHostelStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);

  const getFormattedHostelName = (hostelName) => {
    if (hostelName.toLowerCase().includes("hostel")) {
      return hostelName;
    }
    return `Hostel ${hostelName}`;
  };

  const fetchBookingsCount = async (hostelName) => {
    try {
      const response = await fetch(
        `/api/admin/booking?hostel=${encodeURIComponent(hostelName)}`
      );

      if (response.ok) {
        const data = await response.json();

        if (data.success && data.bookings) {
          return data.bookings.length;
        }

        if (data.count !== undefined) {
          return data.count;
        }

        if (data.totalBookings !== undefined) {
          return data.totalBookings;
        }
      }
    } catch (error) {
      console.error(`Error fetching bookings for ${hostelName}:`, error);
    }

    return 0;
  };

  useEffect(() => {
    const fetchHostelStats = async () => {
      try {
        setLoading(true);

        const bookings = await fetchBookingsCount(name);
        setBookingsCount(bookings);

        try {
          const hostelResponse = await fetch(`/api/admin/hostel-management`);

          if (hostelResponse.ok) {
            const hostelsData = await hostelResponse.json();

            if (hostelsData.success && hostelsData.hostels) {
              const hostel = hostelsData.hostels.find(
                (h) => h.name === name
              );

              if (hostel) {
                const totalRooms =
                  hostel.total || hostel.totalRooms || total;

                const occupiedRooms =
                  hostel.occupied || occupied;

                const availableRooms = Math.max(
                  0,
                  totalRooms - occupiedRooms
                );

                const occupancyRate =
                  totalRooms > 0
                    ? (occupiedRooms / totalRooms) * 100
                    : 0;

                const capacityPerRoom = 2;

                const totalBeds =
                  hostel.capacity ||
                  totalRooms * capacityPerRoom;

                setHostelStats({
                  totalRooms,
                  occupiedRooms,
                  availableRooms,
                  occupancyRate,
                  isActive: hostel.isActive !== false,
                  totalFloors: hostel.totalFloors,
                  capacity: hostel.capacity,
                  totalBeds,
                  totalBookings: bookings,
                  image:
                    HOSTEL_IMAGE_BY_ID[hostel.id] ||
                    "/rkahostel.jpeg",
                });

                setLoading(false);
                return;
              }
            }
          }
        } catch (hostelMgmtError) {
          console.log(
            "Hostel management API failed:",
            hostelMgmtError
          );
        }

        try {
          const roomsResponse = await fetch("/api/admin/room");

          if (roomsResponse.ok) {
            const roomsData = await roomsResponse.json();

            if (roomsData.success && roomsData.rooms) {
              const hostelRooms = roomsData.rooms.filter(
                (room) => room.hostel?.name === name
              );

              if (hostelRooms.length > 0) {
                const totalRooms = hostelRooms.length;

                const occupiedRooms = hostelRooms.filter(
                  (room) => room.isOccupied === true
                ).length;

                const availableRooms = Math.max(
                  0,
                  totalRooms - occupiedRooms
                );

                const occupancyRate =
                  totalRooms > 0
                    ? (occupiedRooms / totalRooms) * 100
                    : 0;

                const firstRoom = hostelRooms[0];
                const capacityPerRoom =
                  firstRoom.parsedCapacity || 2;

                const totalBeds =
                  firstRoom.hostel?.capacity ||
                  totalRooms * capacityPerRoom;

                setHostelStats({
                  totalRooms,
                  occupiedRooms,
                  availableRooms,
                  occupancyRate,
                  isActive:
                    firstRoom.hostel?.isActive !== false,
                  totalFloors:
                    firstRoom.hostel?.totalFloors,
                  capacity:
                    firstRoom.hostel?.capacity,
                  totalBeds,
                  totalBookings: bookings,
                  image:
                    HOSTEL_IMAGE_BY_ID[
                      firstRoom.hostel?.id
                    ] || "/rkahostel.jpeg",
                });

                setLoading(false);
                return;
              }
            }
          }
        } catch (roomError) {
          console.log("Room API failed:", roomError);
        }

        const availableRooms = Math.max(
          0,
          total - occupied
        );

        const occupancyRate =
          total > 0
            ? (occupied / total) * 100
            : 0;

        const totalBeds = total * 2;

        setHostelStats({
          totalRooms: total,
          occupiedRooms: occupied,
          availableRooms,
          occupancyRate,
          isActive: false,
          totalBeds,
          totalBookings: bookings,
          image:
            HOSTEL_IMAGE_BY_ID.default ||
            "/rkahostel.jpeg",
        });

      } catch (error) {
        console.error(
          `Error fetching stats for hostel ${name}:`,
          error
        );

        const availableRooms = Math.max(
          0,
          total - occupied
        );

        const occupancyRate =
          total > 0
            ? (occupied / total) * 100
            : 0;

        const totalBeds = total * 2;

        setHostelStats({
          totalRooms: total,
          occupiedRooms: occupied,
          availableRooms,
          occupancyRate,
          isActive: false,
          totalBeds,
          totalBookings: 0,
          image:
            HOSTEL_IMAGE_BY_ID.default ||
            "/rkahostel.jpeg",
        });

      } finally {
        setLoading(false);
      }
    };

    if (mounted && name) {
      fetchHostelStats();
    }
  }, [name, total, occupied, mounted]);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

  const handleClick = () => {
    const formattedName =
      getFormattedHostelName(name);

    if (hostelStats) {
      toast(
        <div className="text-left">
          <div className="font-bold text-gray-800">
            {formattedName}
          </div>

          <div className="text-sm text-gray-600 mt-1">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Total Rooms: {hostelStats.totalRooms}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Bed className="w-4 h-4" />
              Total Beds:{" "}
              {hostelStats.totalBeds ||
                hostelStats.totalRooms * 2}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Users className="w-4 h-4" />
              Total Bookings:{" "}
              {hostelStats.totalBookings ||
                bookingsCount ||
                0}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <Bed className="w-4 h-4" />
              Available Rooms:{" "}
              {hostelStats.availableRooms}
            </div>

            <div className="mt-2 text-xs">
              Occupancy:{" "}
              {hostelStats.occupancyRate.toFixed(1)}%
              {hostelStats.totalFloors &&
                ` • Floors: ${hostelStats.totalFloors}`}
              {hostelStats.capacity &&
                ` • Capacity: ${hostelStats.capacity} beds`}
            </div>
          </div>
        </div>,
        {
          icon: "🏨",
          style: {
            background: "#fff",
            color: "#2563EB",
            fontWeight: "bold",
            padding: "16px",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.1)",
          },
          position: "top-center",
        }
      );
    } else {
      const occupancy =
        total > 0
          ? Math.round(
              (occupied / total) * 100
            )
          : 0;

      toast(
        `${formattedName}: ${bookingsCount} bookings, ${occupied} occupied rooms of ${total} total (${occupancy}% full)`,
        {
          icon: "ℹ️",
          style: {
            background: "#fff",
            color: "#2563EB",
            fontWeight: "bold",
            padding: "16px",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.1)",
          },
          position: "top-center",
        }
      );
    }
  };

  const displayTotal = hostelStats
    ? hostelStats.totalRooms
    : total;

  const displayOccupied = hostelStats
    ? hostelStats.occupiedRooms
    : occupied;

  const displayBookings = hostelStats
    ? hostelStats.totalBookings
    : bookingsCount;

  const displayTotalBeds = hostelStats
    ? hostelStats.totalBeds
    : total * 2;

  const displayOccupancyRate = hostelStats
    ? hostelStats.occupancyRate
    : total > 0
    ? (occupied / total) * 100
    : 0;

  const occupancy = Math.round(
    displayOccupancyRate
  );

  const getOccupancyColor = (percent) => {
    if (percent >= 80) return "bg-red-600";
    if (percent >= 60) return "bg-orange-500";
    if (percent >= 40) return "bg-yellow-500";
    if (percent >= 20) return "bg-blue-500";
    return "bg-green-500";
  };

  if (!mounted) return null;

  const displayName =
    getFormattedHostelName(name);

  return (
    <div
      onClick={handleClick}
      className="relative h-64 w-full rounded-xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
      style={{
        backgroundImage: `url(${hostelStats?.image || "/rkahostel.jpeg"})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20">
          <Loader2 className="w-6 h-6 text-white animate-spin mb-2" />
          <span className="text-white text-xs">
            Updating data...
          </span>
        </div>
      )}

      {hostelStats && (
        <div
          className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold z-10 ${
            hostelStats.isActive
              ? "bg-green-500/90 text-white"
              : "bg-red-500/90 text-white"
          }`}
        >
          {hostelStats.isActive
            ? "Active"
            : "Inactive"}
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/90 via-black/70 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {displayName}
            </h3>

            {hostelStats?.totalFloors && (
              <p className="text-xs text-green-400 mt-0.5">
                {hostelStats.totalFloors} floor
                {hostelStats.totalFloors > 1
                  ? "s"
                  : ""}
              </p>
            )}
          </div>

          <div className={`px-2 py-1 rounded-md text-sm font-bold`}>
            {occupancy}%
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="bg-black/40 rounded-lg p-2">
            <div className="text-xs text-gray-300">
              Total Rooms
            </div>
            <div className="text-sm font-bold">
              {displayTotal}
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-2">
            <div className="text-xs text-gray-300">
              Beds occupied
            </div>
            <div className="text-sm font-bold text-red-300">
              {displayBookings}
            </div>
          </div>

          <div className="bg-black/40 rounded-lg p-2">
            <div className="text-xs text-gray-300">
              Total Beds
            </div>
            <div className="text-sm font-bold text-blue-300">
              {displayTotalBeds}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">
              Occupancy Rate
            </span>
            <span className="font-semibold">
              {occupancy}%
            </span>
          </div>

          <div className="w-full h-2 bg-gray-300/30 rounded-full overflow-hidden">
            <div
              className={`h-2 rounded-full ${getOccupancyColor(
                occupancy
              )}`}
              style={{
                width: `${occupancy}%`,
              }}
            />
          </div>

          <p className="text-xs text-gray-300 mt-1">
            {displayOccupied} occupied rooms /
            {displayTotal} total rooms •{" "}
            {displayBookings} bookings
          </p>
        </div>
      </div>
    </div>
  );
}