"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ArrowLeft, Eye, Download, X, AlertTriangle } from "lucide-react";
import RoomCard from "./room_card";
import EditRoomsModal from "./room_edit";
import AllocateStudents from "./room_allocate";
import DeallocateStudents from "./room_deallocate";

function Badge({ children, color }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm md:text-base ${color}`}>
      {children}
    </span>
  );
}

// ── Preview Modal ─────────────────────────────────────────────────────────────
function PreviewModal({ isOpen, onClose, hostelId, hostelName }) {
  const [groups,  setGroups]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !hostelId) return;

    const load = async () => {
      setLoading(true);
      try {
        const res   = await fetch(`/api/admin/room?hostelId=${hostelId}`);
        const json  = await res.json();
        const rooms = (json.data ?? [])
          .filter((r) => r.status !== "disabled" && (r.occupants?.length ?? 0) > 0)
          .sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));

        const studentNumbers = rooms
          .flatMap((r) => r.occupants ?? [])
          .map((o) => o.studentNumber)
          .filter(Boolean);

        let phoneMap = {};
        if (studentNumbers.length > 0) {
          try {
            const sRes  = await fetch(`/api/admin/student?studentNumbers=${studentNumbers.join(",")}`);
            const sJson = await sRes.json();
            const list  = Array.isArray(sJson.data) ? sJson.data
                        : Array.isArray(sJson.students) ? sJson.students : [];
            list.forEach((s) => { phoneMap[s.studentNumber] = s.phoneNumber ?? ""; });
          } catch (_) {}
        }

        setGroups(rooms.map((r) => ({
          roomNumber: r.room,
          students:   (r.occupants ?? []).map((o) => ({
            studentNumber: o.studentNumber ?? "",
            name:          o.name          ?? "",
            phone:         phoneMap[o.studentNumber] ?? "",
          })),
        })));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen, hostelId]);

  if (!isOpen) return null;

  const totalStudents = groups.reduce((s, g) => s + g.students.length, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{hostelName} — Student Allocation</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading…" : `${totalStudents} student(s) allocated`}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-40 text-gray-400">Loading…</div>
          ) : groups.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400">No students allocated yet.</div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-gray-50 border-b border-gray-200 z-10">
                <tr>
                  {["Room No.", "Student No.", "Student Name", "Phone Number"].map((h) => (
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) =>
                  group.students.map((student, si) => (
                    <tr key={`${group.roomNumber}-${si}`} className="hover:bg-gray-50 border-b border-gray-100">
                      {si === 0 && (
                        <td rowSpan={group.students.length} className="px-5 py-3 font-semibold text-gray-900 align-top border-r border-gray-100">
                          {group.roomNumber}
                        </td>
                      )}
                      <td className="px-5 py-3 text-gray-600">{student.studentNumber}</td>
                      <td className="px-5 py-3 text-gray-900">{student.name}</td>
                      <td className="px-5 py-3 text-gray-600">{student.phone}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Disable Guard Modal ───────────────────────────────────────────────────────
// Shown when user tries to disable rooms that are occupied or already disabled.
function DisableGuardModal({ isOpen, onClose, occupiedRooms, alreadyDisabledRooms }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-white">
        <div className="bg-amber-500 px-6 py-5 text-center">
          <AlertTriangle size={28} className="mx-auto mb-2 text-white" />
          <h2 className="text-xl font-bold text-white">Cannot Disable Rooms</h2>
        </div>
        <div className="px-6 py-5 space-y-3">
          {occupiedRooms.length > 0 && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm font-semibold text-red-700 mb-1">
                Rooms with occupants — deallocate students first:
              </p>
              <p className="text-sm text-red-600 font-mono">
                {occupiedRooms.join(", ")}
              </p>
            </div>
          )}
          {alreadyDisabledRooms.length > 0 && (
            <div className="rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">
                Already disabled:
              </p>
              <p className="text-sm text-gray-500 font-mono">
                {alreadyDisabledRooms.join(", ")}
              </p>
            </div>
          )}
          <p className="text-sm text-gray-500 pt-1">
            Please resolve the above before disabling.
          </p>
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Hostel key for sessionStorage ─────────────────────────────────────────────
const SESSION_KEY = "room_mgmt_hostel_id";

// ── Main Component ────────────────────────────────────────────────────────────
export default function RoomManagement() {

  const [hostelOpen, setHostelOpen] = useState(false);
  const [floorOpen,  setFloorOpen]  = useState(false);

  const [hostels, setHostels] = useState([]);
  const [hostel,  setHostel]  = useState(null);
  const [floorIndex, setFloorIndex] = useState(1);

  const [rooms,   setRooms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);

  const [editModalOpen,     setEditModalOpen]     = useState(false);
  const [deallocateOpen,    setDeallocateOpen]    = useState(false);
  const [allocateOpen,      setAllocateOpen]      = useState(false);
  const [disableReasonOpen, setDisableReasonOpen] = useState(false);
  const [disableGuardOpen,  setDisableGuardOpen]  = useState(false);
  const [previewOpen,       setPreviewOpen]       = useState(false);

  // Rooms that failed the disable guard check
  const [guardOccupied,  setGuardOccupied]  = useState([]);
  const [guardDisabled,  setGuardDisabled]  = useState([]);

  const [allocateRoom, setAllocateRoom] = useState(null);
  const [reason,       setReason]       = useState("");
  const [downloading,  setDownloading]  = useState(false);

  // ── Derived ───────────────────────────────────────────────────────────────
  const hostelId       = hostel?.id;
  const hostelGender   = hostel?.gender ?? "";
  const numberOfFloors = hostel?.numberOfFloor ?? 0;
  const floorLabels    = Array.from({ length: numberOfFloors }, (_, i) => i + 1);
  const floorAllocations  = hostel?.floorAllocations ?? [];
  const currentFloorAlloc = floorAllocations.find((fa) => fa.floor === floorIndex);
  const allowedYear       = currentFloorAlloc?.studentYear ?? null;

  const students = rooms.flatMap((r) =>
    (r.occupants ?? []).map((occ) => ({
      bookingId:     occ.bookingId     ?? null,
      studentNumber: occ.studentNumber ?? "",
      name:          occ.name          ?? "Unknown",
      id:            occ.bookingId     ?? occ.studentNumber,
      room:          r.room,
      roomId:        r.id,
      year:          "N/A",
    }))
  );

  const selectableRoomIds = rooms.filter((r) => r.status !== "disabled").map((r) => r.id);
  const isAllSelected     = selectedRooms.length > 0 && selectedRooms.length === selectableRoomIds.length;

  const totalRooms    = rooms.length;
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupiedBeds  = rooms.reduce((s, r) => s + (r.occupants?.length ?? 0), 0);
  const disabledCount = rooms.filter((r) => r.status === "disabled").length;

  // ── FIX 3: Persist selected hostel in sessionStorage ─────────────────────
  // On mount: load hostels, then restore last-selected hostel from session.
  useEffect(() => {
    const load = async () => {
      try {
        const res  = await fetch("/api/admin/hostel");
        const json = await res.json();
        const list = Array.isArray(json)         ? json
                   : Array.isArray(json.data)    ? json.data
                   : Array.isArray(json.hostels) ? json.hostels
                   : [];

        setHostels(list);

        if (list.length === 0) return;

        // Restore previously selected hostel from sessionStorage
        const savedId   = sessionStorage.getItem(SESSION_KEY);
        const restored  = savedId ? list.find((h) => h.id === savedId) : null;

        // Fall back to first hostel if nothing saved or saved hostel no longer exists
        setHostel(restored ?? list[0]);
      } catch (err) {
        console.error("Failed to load hostels:", err);
      }
    };
    load();
  }, []);

  // Whenever the user picks a different hostel, save it to sessionStorage
  const handleSetHostel = (item) => {
    setHostel(item);
    setFloorIndex(1);
    setHostelOpen(false);
    sessionStorage.setItem(SESSION_KEY, item.id);
  };

  // ── Fetch rooms ───────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ hostelId, floor: floorIndex });
      const res    = await fetch(`/api/admin/room?${params}`);
      const json   = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load rooms");
      setRooms(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hostelId, floorIndex]);

  useEffect(() => {
    fetchRooms();
    setSelectedRooms([]);
    setSelectionMode(false);
  }, [fetchRooms]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setHostelOpen(false);
        setFloorOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ── API helper ────────────────────────────────────────────────────────────
  async function callAction(body) {
    const res  = await fetch("/api/admin/room", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Action failed");
    return json.data;
  }

  // ── Selection ─────────────────────────────────────────────────────────────
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) { setSelectedRooms([]); setSelectionMode(false); }
    else { setSelectionMode(true); setSelectedRooms(selectableRoomIds); }
  }, [isAllSelected, selectableRoomIds]);

  const toggleRoomSelection = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  // ── FIX 4: Disable guard — check before opening disable modal ────────────
  const handleBulkAction = (type) => {
    if (selectedRooms.length === 0) return;

    if (type === "disable") {
      const selected = rooms.filter((r) => selectedRooms.includes(r.id));

      // Rooms that are already disabled
      const alreadyDisabled = selected
        .filter((r) => r.status === "disabled")
        .map((r) => r.room);

      // Rooms that have occupants (occupied / partial / full all have occupants)
      const occupied = selected
        .filter((r) => r.status !== "disabled" && (r.occupants?.length ?? 0) > 0)
        .map((r) => r.room);

      if (alreadyDisabled.length > 0 || occupied.length > 0) {
        setGuardOccupied(occupied);
        setGuardDisabled(alreadyDisabled);
        setDisableGuardOpen(true);
        return;
      }

      // All clear — open the reason modal
      setDisableReasonOpen(true);
      return;
    }

    if (type === "edit")       setEditModalOpen(true);
    if (type === "deallocate") setDeallocateOpen(true);
  };

  // ── Room card click ───────────────────────────────────────────────────────
  const handleRoomClickWrapper = (roomId) => {
    if (selectionMode) { toggleRoomSelection(roomId); return; }
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (room.status === "disabled") handleEnableRoom(roomId);
    else { setAllocateRoom(roomId); setAllocateOpen(true); }
  };

  const handleEnableRoom = async (roomId) => {
    setRooms((prev) => prev.map((r) => r.id === roomId ? { ...r, status: "empty" } : r));
    try { await callAction({ action: "enable", roomIds: [roomId] }); }
    catch (err) { console.error(err); fetchRooms(); }
  };

  const confirmDisable = async () => {
    const ids = [...selectedRooms];
    setRooms((prev) => prev.map((r) => ids.includes(r.id) ? { ...r, status: "disabled" } : r));
    setDisableReasonOpen(false);
    setSelectedRooms([]);
    setReason("");
    try { await callAction({ action: "disable", roomIds: ids, reason }); }
    catch (err) { console.error(err); fetchRooms(); }
  };

  // ── FIX 1: Edit — also send year so it's persisted ───────────────────────
  const handleEditSave = async (data) => {
    setEditModalOpen(false);
    try {
      await callAction({
        action:   "edit",
        roomIds:  selectedRooms,
        // Pass both fields; service ignores undefined ones
        ...(data.capacity !== undefined && { capacity: data.capacity }),
        ...(data.year     !== undefined && { year:     data.year     }),
      });
      setSelectedRooms([]);
      fetchRooms();
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };

  const handleAllocateSave = async (data) => {
    setAllocateOpen(false);
    try {
      await callAction({
        action:         "allocate",
        roomId:         allocateRoom,
        studentNumbers: data.studentNumbers,
        checkIn:        data.checkIn,
        checkOut:       data.checkOut,
      });
      setAllocateRoom(null);
      fetchRooms();
    } catch (err) { console.error(err); }
  };

  const handleDeallocateConfirm = async (selectedBookingIds) => {
    setDeallocateOpen(false);
    try {
      if (selectedBookingIds?.length)
        await callAction({ action: "deallocate", bookingIds: selectedBookingIds });
      else
        await callAction({ action: "deallocate", roomIds: selectedRooms });
      setSelectedRooms([]);
      fetchRooms();
    } catch (err) { console.error(err); }
  };

  // ── Download ──────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!hostelId) return;
    setDownloading(true);
    try {
      const roomRes  = await fetch(`/api/admin/room?hostelId=${hostelId}`);
      const roomJson = await roomRes.json();
      const allRooms = (roomJson.data ?? [])
        .filter((r) => r.status !== "disabled" && (r.occupants?.length ?? 0) > 0)
        .sort((a, b) => a.room.localeCompare(b.room, undefined, { numeric: true }));

      const studentNumbers = allRooms
        .flatMap((r) => r.occupants ?? [])
        .map((o) => o.studentNumber)
        .filter(Boolean);

      let phoneMap = {};
      if (studentNumbers.length > 0) {
        try {
          const sRes  = await fetch(`/api/admin/student?studentNumbers=${studentNumbers.join(",")}`);
          const sJson = await sRes.json();
          const list  = Array.isArray(sJson.data) ? sJson.data
                      : Array.isArray(sJson.students) ? sJson.students : [];
          list.forEach((s) => { phoneMap[s.studentNumber] = s.phoneNumber ?? ""; });
        } catch (_) {}
      }

      const csvRows = [["Room No.", "Student No.", "Student Name", "Phone Number"]];
      allRooms.forEach((room) => {
        (room.occupants ?? []).forEach((occ, idx) => {
          csvRows.push([
            idx === 0 ? room.room : "",
            occ.studentNumber ?? "",
            occ.name          ?? "",
            phoneMap[occ.studentNumber] ?? "",
          ]);
        });
      });

      const csv  = csvRows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `${hostel?.hostelName ?? "hostel"}_allocation.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // ── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault(); handleSelectAll();
      }
      if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        setSelectionMode((prev) => { if (prev) setSelectedRooms([]); return !prev; });
      }
      if (e.ctrlKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        const disabledIds = rooms.filter((r) => r.status === "disabled").map((r) => r.id);
        if (!disabledIds.length) return;
        setRooms((prev) => prev.map((r) => r.status === "disabled" ? { ...r, status: "empty" } : r));
        callAction({ action: "enable", roomIds: disabledIds }).catch(() => fetchRooms());
        setSelectedRooms([]); setSelectionMode(false);
      }
      if (selectionMode && e.key === "Tab") {
        e.preventDefault();
        const selectable = rooms.filter((r) => r.status !== "disabled");
        if (!selectable.length) return;
        const idx  = selectable.findIndex((r) => selectedRooms.includes(r.id));
        const next = idx === -1 || idx === selectable.length - 1 ? 0 : idx + 1;
        setSelectedRooms([selectable[next].id]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rooms, selectedRooms, selectionMode, handleSelectAll]);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#ececec]">
      <div className="w-full bg-[#ececec] text-[#1e1e1e]">

        {/* Sticky header */}
        <div className="sticky top-16 z-40 bg-[#ececec] border-b border-gray-300 shadow-sm">
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-4">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[18px] md:text-[20px]">
                <button className="mr-1"><ArrowLeft className="w-6 h-6" /></button>

                {/* Hostel dropdown */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setHostelOpen((p) => !p)}
                    className="flex items-center text-[#2b7cff] text-[20px] md:text-[22px]"
                  >
                    {hostel?.hostelName ?? hostel?.name ?? "Select Hostel"}
                    <ChevronDown size={16} className="ml-1" />
                  </button>
                  {hostelOpen && (
                    <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {hostels.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSetHostel(item)}
                          className={`w-full text-left px-4 py-2.5 text-base hover:bg-blue-50 transition-colors ${
                            item.id === hostelId ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
                          }`}
                        >
                          {item.hostelName ?? item.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge color={hostel?.status === "active" ? "bg-[#56d154] text-white" : "bg-gray-400 text-white"}>
                    {hostel?.status === "active" ? "Active" : hostel?.status ?? "—"}
                  </Badge>
                  {hostelGender && (
                    <Badge color="bg-[#9957f6] text-white">
                      {hostelGender.charAt(0).toUpperCase() + hostelGender.slice(1)} only
                    </Badge>
                  )}
                  <Badge color="bg-[#d9d9d9]">{numberOfFloors} Floor{numberOfFloors !== 1 ? "s" : ""}</Badge>
                  <Badge color="bg-[#d9d9d9]">{totalRooms} Rooms</Badge>
                  <Badge color="bg-[#d9d9d9]">{totalCapacity} Capacity</Badge>
                  <Badge color="bg-[#d9d9d9]">{occupiedBeds} Occupied</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setPreviewOpen(true)}
                  disabled={!hostelId}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition text-base disabled:opacity-50"
                >
                  <Eye size={18} /><span>Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading || !hostelId}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition text-base disabled:opacity-60"
                >
                  <Download size={18} />
                  <span>{downloading ? "Downloading…" : "Download"}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-[18px] md:text-[20px]">
                {/* Floor dropdown */}
                <div className="relative" data-dropdown>
                  <button
                    onClick={() => setFloorOpen((p) => !p)}
                    className="text-[#2b7cff] flex items-center gap-1"
                  >
                    Floor {floorIndex}<ChevronDown size={16} />
                  </button>
                  {floorOpen && (
                    <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {floorLabels.map((num) => {
                        const alloc = floorAllocations.find((fa) => fa.floor === num);
                        return (
                          <button
                            key={num}
                            onClick={() => { setFloorIndex(num); setFloorOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between ${
                              num === floorIndex ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"
                            }`}
                          >
                            <span>Floor {num}</span>
                            {alloc && (
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                Yr {alloc.studentYear}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span>{occupiedBeds}/{totalCapacity} Occupied</span>
                <span className="text-gray-400">•</span>
                <span>{disabledCount} disabled room{disabledCount !== 1 ? "s" : ""}</span>

                {selectionMode && selectedRooms.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-blue-600 font-medium text-base">
                      {selectedRooms.length} selected
                    </span>
                    <button
                      onClick={() => { setSelectedRooms([]); setSelectionMode(false); }}
                      className="text-sm text-gray-400 hover:text-gray-600 underline transition"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-[18px] md:text-[20px]">
                <button
                  onClick={() => handleBulkAction("edit")}
                  className={`transition ${selectedRooms.length > 0 ? "text-blue-600 hover:text-blue-800" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleBulkAction("deallocate")}
                  className={`transition ${selectedRooms.length > 0 ? "text-blue-600 hover:text-blue-800" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Deallocate
                </button>
                <button
                  onClick={() => handleBulkAction("disable")}
                  className={`transition ${selectedRooms.length > 0 ? "text-red-500 hover:text-red-700" : "text-gray-400 hover:text-gray-600"}`}
                >
                  Disable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Room grid */}
        <div className="px-4 sm:px-6 md:px-10 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchRooms} className="underline font-medium ml-4">Retry</button>
            </div>
          )}

          <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 ${selectionMode ? "cursor-default" : "cursor-pointer"}`}>
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <RoomCard key={i} loading={true} />)
              : rooms.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r.room}
                    status={r.status}
                    capacity={r.capacity}
                    occupants={r.occupants?.map((o) => `${o.studentNumber}  ${o.name}`)}
                    selectionMode={selectionMode}
                    selected={selectedRooms.includes(r.id)}
                    onSelect={() => toggleRoomSelection(r.id)}
                    onClickRoom={() => handleRoomClickWrapper(r.id)}
                  />
                ))}
          </div>

          <div className="mt-6 inline-flex flex-wrap gap-4 bg-[#f3f3f3] px-3 py-3 border rounded-sm text-[18px] text-gray-600">
            {[
              { color: "bg-green-500",  label: "Available" },
              { color: "bg-orange-400", label: "Partially Occupied" },
              { color: "bg-red-500",    label: "Full" },
              { color: "bg-gray-500",   label: "Disabled" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full ${color}`} />{label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disable reason modal */}
      {disableReasonOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-center">
              <h2 className="text-xl font-bold text-white">Disable Rooms</h2>
              <p className="text-sm text-blue-100 mt-1">Provide a reason for disabling selected rooms</p>
              <div className="mt-3 inline-block px-3 py-1 text-xs rounded-full bg-white/20 text-white">
                {selectedRooms.length} room(s) selected
              </div>
            </div>
            <div className="bg-white px-6 py-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for disabling rooms…"
                className="w-full rounded-xl border border-blue-200 bg-blue-50 p-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                rows={4}
              />
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setDisableReasonOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm">Cancel</button>
                <button onClick={confirmDisable} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition shadow-sm text-sm">Confirm Disable</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Disable guard modal */}
      <DisableGuardModal
        isOpen={disableGuardOpen}
        onClose={() => setDisableGuardOpen(false)}
        occupiedRooms={guardOccupied}
        alreadyDisabledRooms={guardDisabled}
      />

      <EditRoomsModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        selectedCount={selectedRooms.length}
        rooms={rooms.filter((r) => selectedRooms.includes(r.id))}
        onSave={handleEditSave}
      />

      <AllocateStudents
        isOpen={allocateOpen}
        onClose={() => { setAllocateOpen(false); setAllocateRoom(null); }}
        rooms={rooms.filter((r) => r.id === allocateRoom)}
        hostel={{ id: hostelId, gender: hostelGender, allowedYears: allowedYear ? [allowedYear] : [] }}
        selectedRooms={[allocateRoom]}
        onNext={handleAllocateSave}
      />

      <DeallocateStudents
        isOpen={deallocateOpen}
        onClose={() => setDeallocateOpen(false)}
        students={students.filter((s) => selectedRooms.includes(s.roomId))}
        onConfirm={handleDeallocateConfirm}
      />

      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        hostelId={hostelId}
        hostelName={hostel?.hostelName ?? hostel?.name ?? "Hostel"}
      />
    </div>
  );
}