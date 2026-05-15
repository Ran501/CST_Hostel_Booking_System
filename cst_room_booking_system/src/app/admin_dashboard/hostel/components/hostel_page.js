"use client";

import HostelCard from "./hostel_card";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useConfirmation } from "../../components/useConfirmation";

export default function HostelPage() {
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

    confirm({
      message,
      confirmText: "Update",
      onConfirm: () => updateHostel(updatedHostel),
    });
  }

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
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
            onClick={() => setSelectedHostel(hostel)}
          />
        ))}
      </div>

      {/* Detail modal */}
      {selectedHostel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white text-black">

            {/* Modal header */}
            <div className="relative bg-blue-600 text-white px-6 py-6 text-center">
              <button
                onClick={() => setSelectedHostel(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
              >
                <X size={18} />
              </button>
              <h2 className="text-xl font-semibold">{selectedHostel.hostelName}</h2>
              <p className="text-sm text-blue-100 mt-1">Manage hostel details</p>
            </div>

            {/* Modal body */}
            <div className="px-6 py-6 space-y-5 bg-gray-50 text-black">

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-black">
                    {selectedHostel.roomCount ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Capacity</p>
                  <p className="text-2xl font-bold text-black">
                    {selectedHostel.capacity ?? 0}
                  </p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Floors</p>
                  <p className="text-2xl font-bold text-black">
                    {selectedHostel.numberOfFloor ?? 0}
                  </p>
                </div>
              </div>

              {/* Floor allocations */}
              {selectedHostel.floorAllocations?.length > 0 && (
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-medium text-black mb-3">Floor Allocations</p>
                  <div className="space-y-2">
                    {selectedHostel.floorAllocations.map((fa) => (
                      <div
                        key={fa.id}
                        className="flex justify-between items-center text-sm text-gray-700 border-b border-gray-100 pb-1 last:border-0 last:pb-0"
                      >
                        <span>Floor {fa.floor}</span>
                        <span className="text-blue-600 font-medium">Year {fa.studentYear}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gender */}
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <label className="block mb-2 font-medium text-black">Gender</label>
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

              {/* Active status toggle */}
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
                <div>
                  <span className="text-black font-medium">Active Status</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {selectedHostel.status === "active" ? "Hostel is currently active" : "Hostel is inactive"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const nextStatus = selectedHostel.status === "active" ? "inactive" : "active";
                    requestHostelUpdate(
                      {
                        ...selectedHostel,
                        status: nextStatus,
                      },
                      `${nextStatus === "active" ? "Activate" : "Deactivate"} ${selectedHostel.hostelName}?`
                    );
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                    selectedHostel.status === "active" ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform duration-200 ${
                      selectedHostel.status === "active" ? "translate-x-7" : "translate-x-0.5"
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
