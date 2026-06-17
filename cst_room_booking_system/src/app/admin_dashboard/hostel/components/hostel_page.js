"use client";

import HostelCard from "./hostel_card";
import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useConfirmation } from "../../components/useConfirmation";

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

// ─────────────────────────────────────────────────────────────────────────────
export default function HostelPage() {
  const { user, loading: userLoading } = useUser();
  const isAdmin    = user?.role === "admin";
  const isCounselor = user?.role === "counselor";
  const canEdit    = isAdmin; // only admins can edit

  const [hostels,         setHostels]         = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [selectedHostel,  setSelectedHostel]  = useState(null);
  const { confirm, confirmationDialog } = useConfirmation();

  // ── Fetch hostels ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res  = await fetch("/api/admin/hostel");
        const json = await res.json();

        const list = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : Array.isArray(json.hostels)
          ? json.hostels
          : [];

        setHostels(list);
      } catch (err) {
        setError("Failed to load hostels");
      } finally {
        setLoading(false);
      }
    };
    fetchHostels();
  }, []);

  // ── Update hostel (gender / status) ────────────────────────────────────────
  async function updateHostel(updatedHostel) {
    const res = await fetch("/api/admin/hostel", {
      method:  "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id:     updatedHostel.id,
        gender: updatedHostel.gender,
        status: updatedHostel.status,   // "active" | "inactive"
      }),
    });

    if (!res.ok) throw new Error("Update failed");

    setHostels((prev) =>
      prev.map((h) => (h.id === updatedHostel.id ? updatedHostel : h))
    );
    setSelectedHostel(updatedHostel);
  }

  function requestHostelUpdate(updatedHostel, message) {
    if (!selectedHostel || updatedHostel.id !== selectedHostel.id) return;
    if (!canEdit) return; // counselors cannot edit

    confirm({
      message,
      confirmText: "Update",
      onConfirm: () => updateHostel(updatedHostel),
    });
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading || userLoading) {
    return (
      <section className="p-4 min-h-screen bg-white">
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="h-32 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 w-5/6 bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-8 w-20 bg-gray-200 rounded-lg" />
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <section className="p-4 min-h-screen bg-white">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  const activeCount = hostels.filter((h) => h.status === "active").length;

  // ── Handle card click ──────────────────────────────────────────────────────
  const handleCardClick = (hostel) => {
    // Only admins can open the detail modal
    if (canEdit) {
      setSelectedHostel(hostel);
    }
    // Counselors: do nothing (card is already non-interactive)
  };

  return (
    <section className="p-4 min-h-screen bg-white">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-black font-semibold">Hostels Management</h2>
        <span className="text-sm text-gray-600">
          {hostels.length} hostels • {activeCount} active
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hostels.map((hostel) => (
          <HostelCard
            key={hostel.id}
            hostelName={hostel.hostelName}
            gender={hostel.gender}
            status={hostel.status}
            roomCount={hostel.roomCount}
            capacity={hostel.capacity}
            numberOfFloor={hostel.numberOfFloor}
            onClick={() => handleCardClick(hostel)}
            isClickable={canEdit}   // ← counselors get false
          />
        ))}
      </div>

      {/* Detail modal – only for admins */}
      {canEdit && selectedHostel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-3 sm:px-4 py-4">
          
          <div className="
            w-full 
            max-w-lg 
            sm:max-w-xl 
            md:max-w-2xl 
            max-h-[90vh] 
            overflow-hidden 
            rounded-2xl 
            shadow-2xl 
            bg-white 
            text-black
            flex 
            flex-col
          ">

            {/* Header */}
            <div className="relative bg-blue-600 text-white px-4 sm:px-6 py-5 text-center">
              <button
                onClick={() => setSelectedHostel(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>

              <h2 className="text-lg sm:text-xl font-semibold">
                {selectedHostel.hostelName}
              </h2>

              <p className="text-xs sm:text-sm text-blue-100 mt-1">
                Manage hostel details
              </p>
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 bg-gray-50">

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
                {[
                  { label: "Total Rooms", value: selectedHostel.roomCount ?? 0 },
                  { label: "Capacity", value: selectedHostel.capacity ?? 0 },
                  { label: "Floors", value: selectedHostel.numberOfFloor ?? 0 },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="text-xl sm:text-2xl font-bold text-black">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Floor allocations */}
              {selectedHostel.floorAllocations?.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-medium text-black mb-3">
                    Floor Allocations
                  </p>

                  <div className="space-y-2">
                    {selectedHostel.floorAllocations.map((fa) => (
                      <div
                        key={fa.id}
                        className="flex justify-between items-center text-sm text-gray-700 border-b border-gray-100 pb-1 last:border-0 last:pb-0"
                      >
                        <span>Floor {fa.floor}</span>
                        <span className="text-blue-600 font-medium">
                          Year {fa.studentYear}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <label className="block mb-2 font-medium text-black">
                  Gender
                </label>

                <select
                  value={selectedHostel.gender ?? ""}
                  onChange={(e) => {
                    const nextGender = e.target.value;
                    if (nextGender === (selectedHostel.gender ?? "")) return;

                    requestHostelUpdate(
                      { ...selectedHostel, gender: nextGender },
                      `Change ${selectedHostel.hostelName}'s gender restriction to "${nextGender || "not set"}"?`
                    );
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm">

                {/* Left content */}
                <div className="min-w-0">
                  <span className="text-black font-medium">Active Status</span>

                  <p className="text-xs text-gray-500 mt-0.5 break-words">
                    {selectedHostel.status === "active"
                      ? "Hostel is currently active"
                      : "Hostel is inactive"}
                  </p>
                </div>

                {/* Right toggle (ALWAYS RIGHT) */}
                <button
                  onClick={() => {
                    const nextStatus =
                      selectedHostel.status === "active" ? "inactive" : "active";

                    requestHostelUpdate(
                      {
                        ...selectedHostel,
                        status: nextStatus,
                      },
                      `${nextStatus === "active" ? "Activate" : "Deactivate"} ${selectedHostel.hostelName}?`
                    );
                  }}
                  className={`relative flex-shrink-0 inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    selectedHostel.status === "active"
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      selectedHostel.status === "active"
                        ? "translate-x-7"
                        : "translate-x-1"
                    }`}
                  />
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {confirmationDialog}
    </section>
  );
}