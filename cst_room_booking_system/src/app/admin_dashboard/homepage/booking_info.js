"use client";

import { useEffect, useState, useCallback } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { animated, useSpring, useSpringRef } from "@react-spring/web";

import TopCards from "./topcard_overview";

// ─── Custom hook to read user from localStorage ────────────────────────────
function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const raw = localStorage.getItem("session");
    if (raw) {
      try {
        const session = JSON.parse(raw);
        setUser(session);
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();

    const handleStorage = (e) => {
      if (e.key === "session") {
        loadUser();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadUser]);

  return { user, loading };
}

// ── Single fetch from /api/admin/stats ──────────────────────────────────────
async function fetchStats() {
  const res  = await fetch("/api/admin/stats");
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Failed to load statistics");
  return json.data;
  // { totalCapacity, occupiedBeds, availableBeds, totalHostels, activeHostels,
  //   maleBookings, femaleBookings, bookingPeriod }
}

// ── Toggle booking period on/off ────────────────────────────────────────────
async function toggleBookingPeriod(currentlyActive) {
  const res  = await fetch("/api/admin/stats", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !currentlyActive }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Failed to update booking period");
  return json.data; // updated BookingPeriod row
}

// ─────────────────────────────────────────────────────────────────────────────
export default function BookingInfo() {
  const { user, loading: userLoading } = useUser();
  const isAdmin    = user?.role === "admin";
  const isCounselor = user?.role === "counselor";
  const canToggle  = isAdmin; // only admins can toggle

  const [stats,          setStats]          = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [mounted,        setMounted]        = useState(false);
  const [toggling,       setToggling]       = useState(false);
  const [toggleError,    setToggleError]    = useState(null);
  const [toggleSuccess,  setToggleSuccess]  = useState(null);

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

  // ── Derived values ──────────────────────────────────────────────────────────
  const totalBeds     = stats?.totalCapacity ?? 0;
  const occupiedBeds  = stats?.occupiedBeds  ?? 0;
  const availableBeds = stats?.availableBeds ?? 0;
  const male          = stats?.maleBookings   ?? 0;
  const female        = stats?.femaleBookings ?? 0;
  const bookingPeriod = stats?.bookingPeriod  ?? null;
  const isBookingOpen = bookingPeriod?.isActive ?? false;

  const availabilityPct = totalBeds > 0 ? (availableBeds / totalBeds) * 100 : 0;
  const occupancyPct    = totalBeds > 0 ? (occupiedBeds  / totalBeds) * 100 : 0;
  const totalGender     = male + female;
  const malePct         = totalGender > 0 ? (male   / totalGender) * 100 : 0;
  const femalePct       = totalGender > 0 ? (female / totalGender) * 100 : 0;

  // ── Animations ──────────────────────────────────────────────────────────────
  const [availValue, setAvailValue] = useState(0);

  const availRef  = useSpringRef();
  const maleRef   = useSpringRef();
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

  // ── Toggle handler ──────────────────────────────────────────────────────────
  const handleToggle = useCallback(async () => {
    if (toggling || !canToggle) return;
    setToggling(true);
    setToggleError(null);
    setToggleSuccess(null);

    try {
      const updated = await toggleBookingPeriod(isBookingOpen);
      // Optimistically update stats in state
      setStats((prev) => ({
        ...prev,
        bookingPeriod: updated,
      }));
      setToggleSuccess(
        updated.isActive
          ? "Booking period is now open."
          : "Booking period has been closed."
      );
      // Clear success message after 3 s
      setTimeout(() => setToggleSuccess(null), 3000);
    } catch (err) {
      setToggleError(err.message);
    } finally {
      setToggling(false);
    }
  }, [toggling, isBookingOpen, canToggle]);

  // ── Skeleton while loading ──────────────────────────────────────────────────
  if (!mounted || loading || userLoading) {
    return (
      <section className="w-full bg-white p-4">
        {/* Skeleton toggle bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse bg-gray-200 rounded h-6 w-40" />
          <div className="animate-pulse bg-gray-200 rounded-full h-8 w-36" />
        </div>
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

      {/* ── Booking Period Toggle ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-700">Booking Period</span>
          <span className="text-xs text-gray-500 mt-0.5">
            {isBookingOpen
              ? "Students can currently submit booking requests."
              : "Booking is closed — students cannot submit requests."}
          </span>

          {/* Inline feedback messages */}
          {toggleSuccess && (
            <span className="mt-1 text-xs font-medium text-green-600">{toggleSuccess}</span>
          )}
          {toggleError && (
            <span className="mt-1 text-xs font-medium text-red-600">{toggleError}</span>
          )}

          {/* Counselor view-only indicator */}
          {isCounselor && (
            <span className="mt-1 text-xs text-gray-400 italic">(View‑only – you are a counselor)</span>
          )}
        </div>

        {/* Toggle pill button — disabled for counselors */}
        <button
          onClick={handleToggle}
          disabled={toggling || !canToggle}
          aria-pressed={isBookingOpen}
          aria-label={isBookingOpen ? "Close booking period" : "Open booking period"}
          className={`
            relative inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium
            border transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-offset-2
            ${isBookingOpen
              ? "bg-green-50 border-green-300 text-green-700 hover:bg-green-100 focus:ring-green-400"
              : "bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 focus:ring-gray-400"
            }
            ${(toggling || !canToggle) ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          {/* Track + thumb */}
          <span
            className={`
              relative inline-block w-9 h-5 rounded-full transition-colors duration-200
              ${isBookingOpen ? "bg-green-500" : "bg-gray-300"}
            `}
          >
            <span
              className={`
                absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow
                transition-transform duration-200
                ${isBookingOpen ? "translate-x-4" : "translate-x-0"}
              `}
            />
          </span>

          {/* Label */}
          <span>
            {toggling
              ? "Updating…"
              : isBookingOpen
              ? "Bookings Open"
              : "Bookings Closed"
            }
          </span>

          {/* Status dot */}
          <span
            className={`w-2 h-2 rounded-full ${
              isBookingOpen ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
        </button>
      </div>

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
            <animated.div className="h-full bg-blue-500 absolute left-0"  style={maleSpring} />
            <animated.div className="h-full bg-pink-500 absolute right-0" style={femaleSpring} />
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