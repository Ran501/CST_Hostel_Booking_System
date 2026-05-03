"use client";

import HostelCard from "./hostel_card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export default function HostelPage() {
  const router = useRouter();

  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedHostel, setSelectedHostel] = useState(null);

  // ✅ Dummy Data Load
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const dummyHostels = [
          { id: "1", name: "A", total: 50, occupied: 35, isActive: true },
          { id: "2", name: "B", total: 40, occupied: 20, isActive: true },
          { id: "3", name: "C", total: 60, occupied: 50, isActive: false },
          { id: "4", name: "D", total: 30, occupied: 10, isActive: true },
          { id: "5", name: "E", total: 45, occupied: 25, isActive: true },
          { id: "6", name: "F", total: 70, occupied: 65, isActive: false },
          { id: "7", name: "G", total: 55, occupied: 40, isActive: true },
        ];

        const transformed = dummyHostels.map((h) => ({
          id: h.id,
          name: h.name,
          total: h.total,
          occupied: h.occupied,
          isActive: h.isActive,
        }));

        setHostels(transformed);
      } catch (err) {
        setError("Failed to load hostels");
      } finally {
        setLoading(false);
      }
    }, 800);

    return () => clearTimeout(timer);
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

      {/* GRID (ALL HOSTELS SHOWN) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {hostels.map((hostel) => (
          <HostelCard
            key={hostel.id}
            name={hostel.name}
            total={hostel.total}
            occupied={hostel.occupied}
            isActive={hostel.isActive}
            onClick={() => setSelectedHostel(hostel)}
          />
        ))}
      </div>

      {/* ---------------- MODAL ---------------- */}
        {selectedHostel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl bg-white">

            {/* 🔵 HEADER */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-8 text-center">

                {/* Close Button */}
                <button
                onClick={() => setSelectedHostel(null)}
                className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                <X size={20} />
                </button>

                <h2 className="text-xl font-semibold">
                Hostel {selectedHostel.name}
                </h2>

                <p className="text-sm text-blue-100 mt-1">
                Manage hostel details and status
                </p>

                {/* Badge */}
                <div className="mt-4 inline-block bg-white/20 text-white text-sm px-4 py-1 rounded-full backdrop-blur">
                ID: {selectedHostel.id}
                </div>
            </div>

            {/* ⚪ BODY */}
            <div className="bg-gray-100 px-6 py-6 space-y-5">
                {/* INFO GRID */}
                    <div className="grid grid-cols-3 gap-3 text-sm text-gray-700">

                    <div className="bg-white rounded-xl p-4 border border-blue-100 aspect-square flex flex-col justify-center items-center text-center">
                        <p className="text-gray-500 text-xs">Total Rooms</p>
                        <p className="text-2xl font-bold text-gray-800">
                        {selectedHostel.total}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-blue-100 aspect-square flex flex-col justify-center items-center text-center">
                        <p className="text-gray-500 text-xs">Occupied</p>
                        <p className="text-2xl font-bold text-gray-800">
                        {selectedHostel.occupied}
                        </p>
                    </div>

                    <div className="bg-white rounded-xl p-4 border border-blue-100 aspect-square flex flex-col justify-center items-center text-center">
                        <p className="text-gray-500 text-xs">Occupancy</p>
                        <p className="text-2xl font-bold text-gray-800">
                        {Math.round(
                            (selectedHostel.occupied / selectedHostel.total) * 100
                        )}
                        %
                        </p>
                    </div>

                    </div>

                {/* ⚙️ GENDER DROPDOWN (replaces Edit button) */}
                <div className="bg-white rounded-xl p-4 border border-blue-100">
                <label className="block text-gray-600 mb-2 font-medium">
                    Gender
                </label>

                <select
                    value={selectedHostel.gender || ""}
                    onChange={(e) =>
                    setSelectedHostel((prev) => ({
                        ...prev,
                        gender: e.target.value,
                    }))
                    }
                    className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-white text-gray-700 focus:ring-2 focus:ring-blue-300 outline-none"
                >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                </div>

                {/* 🔘 STATUS TOGGLE */}
                <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-blue-100">
                <span className="text-gray-700 font-medium">Active Status</span>

                <button
                    onClick={() => {
                    setHostels((prev) =>
                        prev.map((h) =>
                        h.id === selectedHostel.id
                            ? { ...h, isActive: !h.isActive }
                            : h
                        )
                    );

                    setSelectedHostel((prev) => ({
                        ...prev,
                        isActive: !prev.isActive,
                    }));
                    }}
                    className={`relative w-14 h-7 flex items-center rounded-full transition ${
                    selectedHostel.isActive ? "bg-green-500" : "bg-red-500"
                    }`}
                >
                    <span
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition ${
                        selectedHostel.isActive ? "translate-x-7" : "translate-x-1"
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
}