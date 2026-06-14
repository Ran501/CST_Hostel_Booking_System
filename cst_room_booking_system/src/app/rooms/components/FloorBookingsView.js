"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";

export default function FloorBookingsView({ building, floor, currentUser, onDenied }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  const showMessage = (message) => {
    setError(message);
    if (onDenied) onDenied(message);
  };

  const loadBookings = async () => {
    const studentNumber =
      currentUser?.studentNumber ?? currentUser?.phoneNumber ?? currentUser?.stdNo;

    if (!studentNumber) {
      showMessage("Please log in to view room bookings.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        building,
        floor: String(floor),
        studentNumber: String(studentNumber),
      });
      const res = await fetch(`/api/floor-bookings?${params.toString()}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        showMessage(data.error || "Could not load room bookings.");
        return;
      }

      setRooms(data.rooms || []);
      setOpen(true);
    } catch (err) {
      console.error("View bookings error:", err);
      showMessage("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={loadBookings}
        disabled={loading}
        className="cursor-pointer fixed right-4 top-4 z-40 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Eye className="h-4 w-4" />
        <span>{loading ? "Loading" : "View"}</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-6" onClick={() => setOpen(false)}>
          <div
            className="mx-auto mt-12 flex max-h-[82vh] w-full max-w-4xl flex-col rounded-xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {building} Floor {floor} Bookings
                </h2>
                <p className="text-xs text-slate-500">Active room bookings only</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close bookings table"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="overflow-auto p-4">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Room</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Student Number</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Student Name</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Department</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                        No rooms found for this floor.
                      </td>
                    </tr>
                  ) : (
                    rooms.flatMap((room) => {
                      if (!room.students?.length) {
                        return [
                          <tr key={`${room.roomNumber}-empty`}>
                            <td className="px-3 py-2 font-medium text-slate-900">{room.roomNumber}</td>
                            <td className="px-3 py-2 text-slate-400" colSpan={4}>
                              No active booking
                            </td>
                          </tr>,
                        ];
                      }

                      return room.students.map((student) => (
                        <tr key={student.bookingId}>
                          <td className="px-3 py-2 font-medium text-slate-900">{room.roomNumber}</td>
                          <td className="px-3 py-2 text-slate-700">{student.studentNumber || "-"}</td>
                          <td className="px-3 py-2 text-slate-700">{student.name}</td>
                          <td className="px-3 py-2 text-slate-700">{student.department || "-"}</td>
                          <td className="px-3 py-2 text-slate-700">{student.year || "-"}</td>
                        </tr>
                      ));
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
