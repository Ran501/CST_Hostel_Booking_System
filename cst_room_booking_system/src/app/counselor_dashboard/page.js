"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LogOut, Building2, Users, BedDouble, CheckCircle } from "lucide-react";

export default function CounselorDashboard() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [hostel, setHostel] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("session");
    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setSession(parsed);

      const hostelId = parsed?.counselor?.hostelId;
      if (!hostelId) {
        setError("You have not been assigned to a hostel yet. Please contact the admin.");
        setLoading(false);
        return;
      }

      fetch(`/api/counselor/hostel?hostelId=${hostelId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setHostel(data.hostel);
            setBookings(data.bookings);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to load hostel data.");
          setLoading(false);
        });
    } catch {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = async () => {
    localStorage.removeItem("session");
    await fetch("/api/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalRooms = hostel?.rooms?.length ?? 0;
  const occupiedRooms = hostel?.rooms?.filter((r) => r.status === "occupied").length ?? 0;
  const availableRooms = totalRooms - occupiedRooms;
  const occupancyPct = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Group rooms by floor
  const roomsByFloor = hostel?.rooms?.reduce((acc, room) => {
    if (!acc[room.floor]) acc[room.floor] = [];
    acc[room.floor].push(room);
    return acc;
  }, {}) ?? {};

  // ── Loading / error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar session={session} onLogout={handleLogout} />
        <div className="max-w-xl mx-auto mt-24 p-6 bg-white rounded-xl shadow text-center">
          <p className="text-red-600 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center gap-3 mb-1">
            <Building2 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">{hostel.hostelName}</h1>
            <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
              hostel.gender === "female"
                ? "bg-pink-100 text-pink-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {hostel.gender === "female" ? "Female" : "Male"}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {hostel.numberOfFloor} floors &nbsp;·&nbsp; Capacity: {hostel.capacity} students
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Counselor: <span className="text-gray-600 font-medium">{session?.name}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={<BedDouble className="w-5 h-5 text-blue-500" />} label="Total Rooms" value={totalRooms} bg="bg-blue-50" />
          <StatCard icon={<Users className="w-5 h-5 text-red-500" />} label="Occupied" value={occupiedRooms} bg="bg-red-50" />
          <StatCard icon={<CheckCircle className="w-5 h-5 text-green-500" />} label="Available" value={availableRooms} bg="bg-green-50" />
          <StatCard icon={<Building2 className="w-5 h-5 text-purple-500" />} label="Occupancy" value={`${occupancyPct}%`} bg="bg-purple-50" />
        </div>

        {/* Rooms by floor */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Rooms by Floor</h2>
          <div className="space-y-4">
            {Object.keys(roomsByFloor)
              .sort((a, b) => Number(a) - Number(b))
              .map((floor) => {
                const rooms = roomsByFloor[floor];
                const occ = rooms.filter((r) => r.status === "occupied").length;
                const pct = Math.round((occ / rooms.length) * 100);
                return (
                  <div key={floor}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Floor {floor}</span>
                      <span className="text-xs text-gray-500">{occ}/{rooms.length} occupied</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${
                          pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-yellow-400" : "bg-green-400"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {rooms.map((room) => (
                        <span
                          key={room.id}
                          title={`Room ${room.roomNumber} — ${room.status}`}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            room.status === "occupied"
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {room.roomNumber}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Student bookings */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Current Student Bookings
            <span className="ml-2 text-sm font-normal text-gray-400">({bookings.length})</span>
          </h2>

          {bookings.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No active bookings in this hostel.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-4 font-medium">Student</th>
                    <th className="pb-2 pr-4 font-medium">Student No.</th>
                    <th className="pb-2 pr-4 font-medium">Department</th>
                    <th className="pb-2 pr-4 font-medium">Year</th>
                    <th className="pb-2 pr-4 font-medium">Room</th>
                    <th className="pb-2 font-medium">Floor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium text-gray-800">{b.user.name}</td>
                      <td className="py-2 pr-4 text-gray-600">{b.user.studentNumber}</td>
                      <td className="py-2 pr-4 text-gray-600">{b.user.department}</td>
                      <td className="py-2 pr-4 text-gray-600">Year {b.user.year}</td>
                      <td className="py-2 pr-4 text-gray-600">{b.room.roomNumber}</td>
                      <td className="py-2 text-gray-600">Floor {b.room.floor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ icon, label, value, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 flex flex-col gap-2`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-gray-600">{label}</span>
      </div>
      <span className="text-2xl font-bold text-gray-800">{value}</span>
    </div>
  );
}

function Navbar({ session, onLogout }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center gap-3">
          <Image src="/cstlogo.png" alt="CST Logo" width={40} height={40} priority />
          <span className="font-bold text-lg text-gray-800">CST Room Booking System</span>
          <span className="hidden sm:inline text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            Counselor
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-gray-800">{session?.name}</p>
            <p className="text-xs text-gray-500">{session?.email}</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 overflow-hidden">
            <img
              src={session?.gender === "female" ? "/woman2.png" : "/man2.png"}
              className="h-full w-full object-cover"
              alt="avatar"
            />
          </div>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
