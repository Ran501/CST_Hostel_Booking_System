"use client";

import HostelCard from "./hostel_card";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function HostelPage() {
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);
  

  // ✅ FETCH REAL DATA
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await fetch("/api/admin/hostel");
        const data = await res.json();

        setHostels(
          Array.isArray(data)
            ? data
            : Array.isArray(data.hostels)
            ? data.hostels
            : []
        );
      } catch (err) {
        setError("Failed to load hostels");
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <section className="p-4 min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-b-2 border-blue-600 rounded-full" />
      </section>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <section className="p-4 min-h-screen bg-white">
        <p className="text-red-600">{error}</p>
      </section>
    );
  }

  return (
    <section className="p-4 min-h-screen bg-white">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-black font-semibold">Hostels Management</h2>

        <span className="text-sm text-gray-600">
          {hostels.length} hostels •{" "}
          {hostels.filter((h) => h.isActive).length} active
        </span>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hostels.map((hostel) => (
          <HostelCard
            key={hostel.id}
            {...hostel}
            onClick={() => setSelectedHostel(hostel)}
          />
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
{selectedHostel && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white text-black">

      {/* HEADER */}
      <div className="relative bg-blue-600 text-white px-6 py-6 text-center">

        <button
          onClick={() => setSelectedHostel(null)}
          className="absolute top-4 right-4 text-white/80 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold">
          Hostel {selectedHostel.name}
        </h2>

        <p className="text-sm text-blue-100 mt-1">
          Manage hostel details
        </p>
      </div>

      {/* BODY */}
      <div className="px-6 py-6 space-y-5 bg-gray-50 text-black">

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 text-center">

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Total Rooms</p>
            <p className="text-2xl font-bold text-black">
              {selectedHostel.total}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Occupied</p>
            <p className="text-2xl font-bold text-black">
              {selectedHostel.occupied}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-gray-500">Occupancy</p>
            <p className="text-2xl font-bold text-black">
              {selectedHostel.total > 0
                ? Math.round(
                    (selectedHostel.occupied / selectedHostel.total) * 100
                  )
                : 0}
              %
            </p>
          </div>

        </div>

        {/* GENDER */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="block mb-2 font-medium text-black">
            Gender
          </label>

          <select
            value={selectedHostel.gender || ""}
            onChange={async (e) => {
              const newGender = e.target.value;

              await updateHostel({
                ...selectedHostel,
                gender: newGender,
              });
            }}
            className="w-full px-4 py-2 rounded-lg border border-blue-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        {/* STATUS */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
          <span className="text-black font-medium">
            Active Status
          </span>

          <button
            onClick={async () => {
              await updateHostel({
                ...selectedHostel,
                isActive: !selectedHostel.isActive,
              });
            }}
            className={`relative w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${
              selectedHostel.isActive ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            {/* Toggle Knob */}
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                selectedHostel.isActive ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  </div>
)}

    </section>
  );

  // 🔥 UPDATE FUNCTION (centralized)
  async function updateHostel(updatedHostel) {
    try {
      await fetch("/api/admin/hostel", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: updatedHostel.id,
          gender: updatedHostel.gender,
          isActive: updatedHostel.isActive,
        }),
      });

      // update UI
      setHostels((prev) =>
        prev.map((h) =>
          h.id === updatedHostel.id ? updatedHostel : h
        )
      );

      setSelectedHostel(updatedHostel);

    } catch (err) {
      alert("Update failed");
    }
  }
}