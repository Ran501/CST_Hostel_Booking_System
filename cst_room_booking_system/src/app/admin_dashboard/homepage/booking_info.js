"use client";

import { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { animated, useSpring, useSpringRef } from "@react-spring/web";

import TopCards from "./topcard_overview";

// ── Single fetch from /api/admin/stats ────────────────────────────────────────
async function fetchStats() {
  const res  = await fetch("/api/admin/stats");
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Failed to load statistics");
  return json.data;  // { totalCapacity, occupiedBeds, availableBeds, totalHostels, activeHostels, maleBookings, femaleBookings }
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BookingInfo() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [mounted, setMounted] = useState(false);

  // Mount guard — avoids SSR / hydration mismatch with react-spring
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Fetch once mounted
  useEffect(() => {
    if (!mounted) return;
    setLoading(true);
    fetchStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [mounted]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const totalBeds     = stats?.totalCapacity ?? 0;
  const occupiedBeds  = stats?.occupiedBeds  ?? 0;
  const availableBeds = stats?.availableBeds ?? 0;
  const male          = stats?.maleBookings   ?? 0;
  const female        = stats?.femaleBookings ?? 0;

  const availabilityPct = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
  const occupancyPct    = totalBeds > 0 ? (occupiedBeds  / totalBeds) * 100 : 0;
  const totalGender     = male + female;
  const malePct         = totalGender > 0 ? (male   / totalGender) * 100 : 0;
  const femalePct       = totalGender > 0 ? (female / totalGender) * 100 : 0;

  // ── Animations ───────────────────────────────────────────────────────────────
  const [availValue, setAvailValue] = useState(0);

  const availRef = useSpringRef();
  const maleRef  = useSpringRef();
  const femaleRef = useSpringRef();

  useSpring({
    ref: availRef,
    from: { value: 0 },
    to:   { value: availabilityPct },
    config: { duration: 1000 },
    onChange: (r) => setAvailValue(r.value.value),
  });

  const maleSpring   = useSpring({ ref: maleRef,   from: { width: "0%" }, to: { width: `${malePct}%`   }, config: { duration: 1000 } });
  const femaleSpring = useSpring({ ref: femaleRef, from: { width: "0%" }, to: { width: `${femalePct}%` }, config: { duration: 1000 } });

  useEffect(() => {
    if (mounted && !loading) {
      availRef.start();
      maleRef.start();
      femaleRef.start();
    }
  }, [mounted, loading, availRef, maleRef, femaleRef]);

  // ── Skeleton while loading ────────────────────────────────────────────────────
  if (!mounted || loading) {
    return (
      <section className="w-full bg-white p-4">
        <h2 className="font-semibold text-gray-700 mb-6 text-lg">System Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-lg shadow p-5 h-40" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white p-4">
      <h2 className="font-semibold text-gray-700 mb-6 text-lg">System Overview</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">

        {/* ── Top Cards ──────────────────────────────────────────────────────── */}
        <TopCards stats={stats} />

        {/* ── Availability circular ──────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-5 flex flex-col items-center text-center transition hover:scale-105 hover:shadow-xl cursor-pointer">
          <p className="text-black text-sm mb-1">Availability</p>
          <p className="text-xs text-gray-500 mb-3">Across all hostels</p>

          <div className="w-24 h-24">
            <CircularProgressbar
              value={availValue}
              maxValue={100}
              text={`${availValue.toFixed(1)}%`}
              styles={buildStyles({
                textSize:  "12px",
                pathColor: "#4ADE80",
                textColor: "#4ADE80",
                trailColor: "#E5E7EB",
              })}
            />
          </div>

          <div className="mt-3 text-sm">
            <span className="text-green-600 font-medium">{availableBeds}</span>
            {" / "}
            <span className="text-blue-600 font-medium">{totalBeds}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Available / Total beds</p>
          <p className="text-xs text-gray-500 mt-1">
            Occupied: {occupiedBeds} beds ({occupancyPct.toFixed(1)}% rate)
          </p>
        </div>

        {/* ── Gender split bar ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow p-5 transition hover:scale-105 hover:shadow-xl cursor-pointer">
          <p className="text-black text-sm mb-1">Gender Split</p>
          <p className="text-xs text-gray-500 mb-3">Active bookings by student gender</p>

          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative">
            <animated.div className="h-full bg-blue-500 absolute left-0"   style={maleSpring} />
            <animated.div className="h-full bg-pink-500 absolute right-0"  style={femaleSpring} />
          </div>

          <div className="flex justify-between text-sm mt-2 text-gray-700">
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />
              Male: <strong>{male}</strong>
            </span>
            <span>
              <span className="inline-block w-2 h-2 rounded-full bg-pink-500 mr-1" />
              Female: <strong>{female}</strong>
            </span>
          </div>

          {totalGender > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              From {totalGender} active booking{totalGender !== 1 ? "s" : ""}
            </p>
          )}

          {totalGender === 0 && (
            <p className="text-xs text-gray-400 mt-2 italic">No active bookings yet</p>
          )}
        </div>

      </div>
    </section>
  );
}