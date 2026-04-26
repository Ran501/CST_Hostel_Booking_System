"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { animated, useSpring, useSpringRef } from "@react-spring/web";

import TopCards from "./topcard_overview";

export default function BookingInfo() {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        setLoading(true);
        setError(null);

        let totalCapacity = 0;
        let occupiedCapacity = 0;
        let availableCapacity = 0;
        let totalHostels = 0;
        let maleBookings = 0;
        let femaleBookings = 0;
        let activeBookings = 0;
        let totalBookings = 0;

        try {
          const roomStatsResponse = await fetch("/api/admin/room?stats=true");

          if (roomStatsResponse.ok) {
            const roomStatsData = await roomStatsResponse.json();

            if (roomStatsData.success && roomStatsData.statistics) {
              const stats = roomStatsData.statistics;

              totalCapacity = stats.totalCapacity || 0;
              totalHostels = stats.activeHostels || 0;

              occupiedCapacity = stats.occupancy?.occupiedCapacity || 0;
              availableCapacity = stats.occupancy?.availableCapacity || 0;

              maleBookings = stats.genderSplit?.male || 0;
              femaleBookings = stats.genderSplit?.female || 0;

              activeBookings = stats.occupancy?.totalBookings || 0;
              totalBookings = activeBookings;
            }
          } else {
            console.log("Room stats API failed, trying alternative endpoints");

            const [capacityRes, occupancyRes, hostelsRes] =
              await Promise.allSettled([
                fetch("/api/admin/room?capacity=true"),
                fetch("/api/admin/room?occupancy=true"),
                fetch("/api/admin/hostel-management"),
              ]);

            if (capacityRes.status === "fulfilled" && capacityRes.value.ok) {
              const capacityData = await capacityRes.value.json();
              if (capacityData.success && capacityData.capacityData) {
                totalCapacity =
                  capacityData.capacityData.totalSystemCapacity || 0;
              }
            }

            if (occupancyRes.status === "fulfilled" && occupancyRes.value.ok) {
              const occupancyData = await occupancyRes.value.json();
              if (occupancyData.success && occupancyData.occupancy) {
                occupiedCapacity =
                  occupancyData.occupancy.systemTotals?.occupiedCapacity || 0;
                availableCapacity =
                  occupancyData.occupancy.systemTotals?.availableCapacity || 0;
              }
            }

            if (hostelsRes.status === "fulfilled" && hostelsRes.value.ok) {
              const hostelsData = await hostelsRes.value.json();
              if (hostelsData.success && hostelsData.hostels) {
                const activeHostels = hostelsData.hostels.filter(
                  (h) => h.isActive === true
                );
                totalHostels = activeHostels.length;
              }
            }

            try {
              const bookingsResponse = await fetch(
                "/api/admin/bookings?stats=true"
              );

              if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();

                if (bookingsData.success && bookingsData.statistics) {
                  const bookingStats = bookingsData.statistics;

                  activeBookings = bookingStats.active || 0;
                  totalBookings = bookingStats.total || 0;

                  maleBookings = bookingStats.byGender?.Male || 0;
                  femaleBookings = bookingStats.byGender?.Female || 0;

                  if (occupiedCapacity === 0) {
                    occupiedCapacity = activeBookings;
                    availableCapacity = Math.max(
                      0,
                      totalCapacity - occupiedCapacity
                    );
                  }
                }
              } else {
                console.warn("Bookings API unavailable, using room data only");
              }
            } catch (bookingsError) {
              console.warn(
                "Bookings API error, using room data only:",
                bookingsError
              );
            }
          }
        } catch (error) {
          console.error("Error in main fetch block:", error);
          setError("Failed to fetch some data. Showing partial information.");
        }

        if (
          availableCapacity === 0 &&
          totalCapacity > 0 &&
          occupiedCapacity > 0
        ) {
          availableCapacity = Math.max(0, totalCapacity - occupiedCapacity);
        }

        if (occupiedCapacity === 0 && activeBookings > 0) {
          occupiedCapacity = activeBookings;
          availableCapacity = Math.max(0, totalCapacity - occupiedCapacity);
        }

        setStatistics({
          totalCapacity,
          occupiedCapacity,
          availableCapacity,
          totalHostels,
          maleBookings,
          femaleBookings,
          activeBookings,
          totalBookings,
          occupiedRooms: occupiedCapacity,
          availableRooms: availableCapacity,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        setError("Failed to load dashboard statistics");

        setStatistics({
          totalCapacity: 0,
          occupiedCapacity: 0,
          availableCapacity: 0,
          totalHostels: 0,
          maleBookings: 0,
          femaleBookings: 0,
          activeBookings: 0,
          totalBookings: 0,
          occupiedRooms: 0,
          availableRooms: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchStatistics();
    }
  }, [mounted]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const totalCapacity = statistics?.totalCapacity || 0;
  const occupiedCapacity = statistics?.occupiedCapacity || 0;
  const availableCapacity = statistics?.availableCapacity || 0;

  const male = statistics?.maleBookings || 0;
  const female = statistics?.femaleBookings || 0;

  const totalBeds = totalCapacity;
  const occupiedBeds = occupiedCapacity;
  const availableBeds = availableCapacity;

  const availabilityPercentage =
    totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;

  const occupancyPercentage =
    totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

  const totalGender = male + female;

  const malePercentage =
    totalGender > 0 ? (male / totalGender) * 100 : 0;

  const femalePercentage =
    totalGender > 0 ? (female / totalGender) * 100 : 0;

  const availabilityRef = useSpringRef();
  const totalRef = useSpringRef();
  const maleRef = useSpringRef();
  const femaleRef = useSpringRef();

  const [availabilityValue, setAvailabilityValue] = useState(0);

  const availabilitySpring = useSpring({
    ref: availabilityRef,
    from: { value: 0 },
    to: { value: availabilityPercentage },
    config: { duration: 1000 },
    onChange: (result) => setAvailabilityValue(result.value.value),
  });

  const totalSpring = useSpring({
    ref: totalRef,
    from: { number: 0 },
    to: { number: totalBeds },
    config: { duration: 1000 },
  });

  const maleSpring = useSpring({
    ref: maleRef,
    from: { width: "0%" },
    to: { width: `${malePercentage}%` },
    config: { duration: 1000 },
  });

  const femaleSpring = useSpring({
    ref: femaleRef,
    from: { width: "0%" },
    to: { width: `${femalePercentage}%` },
    config: { duration: 1000 },
  });

  useEffect(() => {
    if (mounted && !loading) {
      availabilityRef.start();
      totalRef.start();
      maleRef.start();
      femaleRef.start();
    }
  }, [availabilityRef, totalRef, maleRef, femaleRef, mounted, loading]);

  if (!mounted || loading) {
    return (
      <section className="w-full bg-white p-4">
        <h2 className="font-semibold text-gray-700 mb-6 text-lg">
          System Overview
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="animate-pulse bg-gray-200 rounded-lg shadow p-5 h-40"></div>
          <div className="animate-pulse bg-gray-200 rounded-lg shadow p-5 h-40"></div>
          <div className="animate-pulse bg-gray-200 rounded-lg shadow p-5 h-40"></div>
        </div>
      </section>
    );
  }

  if (!mounted) return null;

  return (
    <section className="w-full bg-white p-4">
      <h2 className="font-semibold text-gray-700 mb-6 text-lg">
        System Overview
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <TopCards
          totalCapacity={totalBeds}
          occupied={occupiedBeds}
          available={availableBeds}
          totalHostels={statistics?.totalHostels || 0}
          statistics={statistics}
        />

        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center transform transition hover:scale-105 hover:shadow-xl cursor-pointer">
          <div className="text-black text-sm mb-3">Availability</div>
          <div className="text-xs text-gray-500 mb-1">(Active Hostels)</div>

          <div className="w-24 h-24">
            <CircularProgressbar
              value={availabilityValue}
              maxValue={100}
              text={`${availabilityValue.toFixed(1)}%`}
              styles={buildStyles({
                textSize: "12px",
                pathColor: "#4ADE80",
                textColor: "#4ADE80",
                trailColor: "#E5E7EB",
              })}
            />
          </div>

          <div className="mt-2 text-sm">
            <span className="text-green-600 font-medium">
              {availableBeds}
            </span>{" "}
            /
            <span className="text-blue-600 font-medium">
              {totalBeds}
            </span>
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Available beds (Capacity)
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Occupied: {occupiedBeds} beds ({statistics?.activeBookings || 0} bookings)
          </div>

          <div className="text-xs text-gray-500 mt-1">
            Occupancy Rate: {occupancyPercentage.toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-5 transform transition hover:scale-105 hover:shadow-xl cursor-pointer">
          <div className="text-black text-sm mb-3">Gender Split</div>
          <div className="text-xs text-gray-500 mb-1">(Active Hostels)</div>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <animated.div
              className="h-full bg-blue-500 absolute left-0"
              style={maleSpring}
            />
            <animated.div
              className="h-full bg-orange-500 absolute right-0"
              style={femaleSpring}
            />
          </div>

          <div className="flex justify-between text-gray-700 text-sm mt-1">
            <span>Male: {male}</span>
            <span>Female: {female}</span>
          </div>

          {totalGender > 0 && (
            <div className="text-xs text-gray-500 mt-2">
              From {totalGender} active bookings
            </div>
          )}
        </div>
      </div>
    </section>
  );
}