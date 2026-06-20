"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronDown, Eye, Download, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import RoomCard from "./room_card";
import EditRoomsModal from "./room_edit";
import AllocateStudents from "./room_allocate";
import DeallocateStudents from "./room_deallocate";
import { useConfirmation } from "../../components/useConfirmation";

// ─── Sub‑components ──────────────────────────────────────────────────────────

function Badge({ children, color }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-sm md:text-base ${color}`}>
      {children}
    </span>
  );
}

function PreviewModal({ isOpen, onClose, hostelId, hostelName }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !hostelId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/room?hostelId=${hostelId}`);
        const json = await res.json();
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
            const sRes = await fetch(`/api/admin/student?studentNumbers=${studentNumbers.join(",")}`);
            const sJson = await sRes.json();
            const list = Array.isArray(sJson.data) ? sJson.data
              : Array.isArray(sJson.students) ? sJson.students : [];
            list.forEach((s) => { phoneMap[s.studentNumber] = s.phoneNumber ?? ""; });
          } catch (_) {}
        }

        setGroups(
          rooms.map((r) => ({
            roomNumber: r.room,
            students: (r.occupants ?? []).map((o) => ({
              studentNumber: o.studentNumber ?? "",
              name: o.name ?? "",
              phone: phoneMap[o.studentNumber] ?? "",
            })),
          }))
        );
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
                    <th key={h} className="text-left px-5 py-3 font-semibold text-gray-600 border-b border-gray-200">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {groups.map((group) =>
                  group.students.map((student, si) => (
                    <tr key={`${group.roomNumber}-${si}`} className="hover:bg-gray-50 border-b border-gray-100">
                      {si === 0 && (
                        <td
                          rowSpan={group.students.length}
                          className="px-5 py-3 font-semibold text-gray-900 align-top border-r border-gray-100"
                        >
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

        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-end flex-shrink-0"></div>
      </div>
    </div>
  );
}

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
              <p className="text-sm text-red-600 font-mono">{occupiedRooms.join(", ")}</p>
            </div>
          )}
          {alreadyDisabledRooms.length > 0 && (
            <div className="rounded-xl bg-gray-100 border border-gray-200 px-4 py-3">
              <p className="text-sm font-semibold text-gray-700 mb-1">Already disabled:</p>
              <p className="text-sm text-gray-500 font-mono">{alreadyDisabledRooms.join(", ")}</p>
            </div>
          )}
          <p className="text-sm text-gray-500 pt-1">Please resolve the above before disabling.</p>
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="cursor-pointer px-5 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition text-sm font-medium"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

// ─── Main Component ──────────────────────────────────────────────────────────

const SESSION_KEY = "room_mgmt_hostel_id";

export default function RoomManagement() {
  const { user, loading: userLoading } = useUser();

  const [hostelOpen, setHostelOpen] = useState(false);
  const [floorOpen, setFloorOpen] = useState(false);

  const [hostels, setHostels] = useState([]);
  const [hostel, setHostel] = useState(null);
  const [floorIndex, setFloorIndex] = useState(1);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRooms, setSelectedRooms] = useState([]);
  const [actionsOpen, setActionsOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [deallocateOpen, setDeallocateOpen] = useState(false);
  const [disableGuardOpen, setDisableGuardOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [guardOccupied, setGuardOccupied] = useState([]);
  const [guardDisabled, setGuardDisabled] = useState([]);

  const [allocateRoom, setAllocateRoom] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const { confirm, confirmationDialog } = useConfirmation();

  // ── Derived ──────────────────────────────────────────────────────────────
  const hostelId = hostel?.id;
  const hostelGender = hostel?.gender ?? "";
  const numberOfFloors = hostel?.numberOfFloor ?? 0;
  const floorLabels = Array.from({ length: numberOfFloors }, (_, i) => i + 1);
  const floorAllocations = hostel?.floorAllocations ?? [];
  const allowedYear = floorAllocations.find((fa) => fa.floor === floorIndex)?.studentYear ?? null;

  const students = rooms.flatMap((r) =>
    (r.occupants ?? []).map((occ) => ({
      bookingId: occ.bookingId ?? null,
      studentNumber: occ.studentNumber ?? "",
      name: occ.name ?? "Unknown",
      id: occ.bookingId ?? occ.studentNumber,
      room: r.room,
      roomId: r.id,
      year: r.year,
    }))
  );

  const selectionMode = selectedRooms.length > 0;
  const selectedRoomDetails = rooms.filter((r) => selectedRooms.includes(r.id));
  const selectedOccupantCount = students.filter((s) => selectedRooms.includes(s.roomId)).length;

  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((s, r) => s + r.capacity, 0);
  const occupiedBeds = rooms.reduce((s, r) => s + (r.occupants?.length ?? 0), 0);
  const disabledCount = rooms.filter((r) => r.status === "disabled").length;

  const isAdmin = user?.role === "admin";
  const isCounselor = user?.role === "counselor";

  // ── Load hostels (admins) or single hostel (counselor) ────────────────
  useEffect(() => {
    if (userLoading) return;

    const loadHostels = async () => {
      if (isAdmin) {
        try {
          const res = await fetch("/api/admin/hostel");
          const json = await res.json();
          const list = Array.isArray(json) ? json
            : Array.isArray(json.data) ? json.data
            : Array.isArray(json.hostels) ? json.hostels
            : [];

          setHostels(list);
          if (list.length === 0) return;

          const savedId = sessionStorage.getItem(SESSION_KEY);
          const restored = savedId ? list.find((h) => h.id === savedId) : null;
          setHostel(restored ?? list[0]);
        } catch (err) {
          console.error("Failed to load hostels:", err);
        }
      } else if (isCounselor) {
        const assignedHostel = user?.counselor?.hostel;
        if (assignedHostel) {
          setHostel(assignedHostel);
          setHostels([assignedHostel]);
        } else {
          setError("You are not assigned to any hostel.");
        }
      }
    };

    loadHostels();
  }, [user, userLoading, isAdmin, isCounselor]);

  // ── Persist selected hostel (only admins) ─────────────────────────────
  useEffect(() => {
    if (isAdmin && hostel?.id) {
      sessionStorage.setItem(SESSION_KEY, hostel.id);
    }
  }, [hostel, isAdmin]);

  // ── Fetch rooms ─────────────────────────────────────────────────────────
  const fetchRooms = useCallback(async () => {
    if (!hostelId) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ hostelId, floor: floorIndex });
      const res = await fetch(`/api/admin/room?${params}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Failed to load rooms");
      setRooms(json.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hostelId, floorIndex]);

  useEffect(() => {
    if (hostelId) {
      setSelectedRooms([]);
      setActionsOpen(false);
      fetchRooms();
    }
  }, [fetchRooms, hostelId]);

  // ── Close dropdowns on outside click ──────────────────────────────────
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest("[data-dropdown]")) {
        setHostelOpen(false);
        setFloorOpen(false);
        setActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // ── API helper ──────────────────────────────────────────────────────────
  const callAction = useCallback(async (body) => {
    const res = await fetch("/api/admin/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message ?? "Action failed");
    return json.data;
  }, []);

  // ── Selection ──────────────────────────────────────────────────────────
  const clearSelection = useCallback(() => {
    setSelectedRooms([]);
    setActionsOpen(false);
  }, []);

  const selectAllRooms = useCallback(() => {
    const roomIds = rooms.map((r) => r.id);
    if (roomIds.length === 0) return;
    setSelectedRooms(roomIds);
  }, [rooms]);

  const toggleRoomSelection = (roomId) => {
    setActionsOpen(false);
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  // ── Helper to check if an action is allowed for the current user ──────
  const isActionAllowed = useCallback(
    (actionType) => {
      if (isAdmin) return true;
      if (isCounselor) {
        return actionType === "edit";
      }
      return false;
    },
    [isAdmin, isCounselor]
  );

  // ── Bulk actions ──────────────────────────────────────────────────────
  const handleBulkAction = useCallback(
    (type) => {
      if (selectedRooms.length === 0) return;
      setActionsOpen(false);

      if (!isActionAllowed(type)) {
        toast.error("You are not authorized to perform this action.");
        return;
      }

      if (type === "enable") {
        const ids = [...selectedRooms];
        confirm({
          message: `Enable ${ids.length} selected room${ids.length !== 1 ? "s" : ""}?`,
          confirmText: "Enable",
          onConfirm: async () => {
            setRooms((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: "empty" } : r)));
            try {
              await callAction({ action: "enable", roomIds: ids });
              await fetchRooms();
            } catch (err) {
              await fetchRooms();
              throw err;
            }
          },
        }).then((confirmed) => {
          if (confirmed) clearSelection();
        });
        return;
      }

      if (type === "deallocate") {
        if (selectedOccupantCount === 0) return;
        setDeallocateOpen(true);
        return;
      }

      if (type === "disable") {
        const selected = rooms.filter((r) => selectedRooms.includes(r.id));

        const alreadyDisabled = selected
          .filter((r) => r.status === "disabled")
          .map((r) => r.room);

        const occupied = selected
          .filter((r) => r.status !== "disabled" && (r.occupants?.length ?? 0) > 0)
          .map((r) => r.room);

        if (alreadyDisabled.length > 0 || occupied.length > 0) {
          setGuardOccupied(occupied);
          setGuardDisabled(alreadyDisabled);
          setDisableGuardOpen(true);
          return;
        }

        // ── Direct confirmation without reason modal ──
        const ids = [...selectedRooms];
        confirm({
          message: `Disable ${ids.length} selected room${ids.length !== 1 ? "s" : ""}?`,
          confirmText: "Disable",
          onConfirm: async () => {
            setRooms((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status: "disabled" } : r)));
            try {
              await callAction({ action: "disable", roomIds: ids, reason: "Disabled by admin" });
              clearSelection();
              await fetchRooms();
            } catch (err) {
              await fetchRooms();
              throw err;
            }
          },
        });
        return;
      }

      if (type === "edit") setEditModalOpen(true);
    },
    [
      callAction,
      clearSelection,
      confirm,
      fetchRooms,
      rooms,
      selectedOccupantCount,
      selectedRooms,
      isActionAllowed,
    ]
  );

  // ── Room click ──────────────────────────────────────────────────────────
  const handleRoomClickWrapper = (roomId) => {
    if (selectionMode) {
      toggleRoomSelection(roomId);
      return;
    }
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (room.status === "disabled") {
      if (isCounselor) {
        toast.error("You are not authorized to enable rooms.");
        return;
      }
      requestEnableRooms([roomId], `Enable room ${room.room}?`);
    } else {
      if (isCounselor) {
        toast.error("You are not authorized to allocate students.");
        return;
      }
      setAllocateRoom(roomId);
      setAllocateOpen(true);
    }
  };

  // ── Enable ──────────────────────────────────────────────────────────────
  const enableRooms = useCallback(
    async (roomIds) => {
      setRooms((prev) => prev.map((r) => (roomIds.includes(r.id) ? { ...r, status: "empty" } : r)));
      try {
        await callAction({ action: "enable", roomIds });
        await fetchRooms();
      } catch (err) {
        await fetchRooms();
        throw err;
      }
    },
    [callAction, fetchRooms]
  );

  const requestEnableRooms = useCallback(
    (roomIds, message) => {
      if (!roomIds.length) return false;
      return confirm({
        message,
        confirmText: "Enable",
        onConfirm: () => enableRooms(roomIds),
      });
    },
    [confirm, enableRooms]
  );

  // ── Edit save ──────────────────────────────────────────────────────────
  const handleEditSave = (data) => {
    const ids = [...selectedRooms];
    return confirm({
      message: `Save changes to ${ids.length} selected room${ids.length !== 1 ? "s" : ""}?`,
      confirmText: "Save",
      onConfirm: async () => {
        await callAction({
          action: "edit",
          roomIds: ids,
          ...(data.capacity !== undefined && { capacity: data.capacity }),
          ...(data.year !== undefined && { year: data.year }),
        });
        setEditModalOpen(false);
        clearSelection();
        await fetchRooms();
      },
    });
  };

  // ── Allocate ────────────────────────────────────────────────────────────
  const handleAllocateSave = (data) => {
    const roomId = allocateRoom;
    const room = rooms.find((r) => r.id === roomId);

    return confirm({
      message: `Allocate ${data.studentNumbers.length} student${data.studentNumbers.length !== 1 ? "s" : ""} to room ${room?.room ?? ""}?`,
      confirmText: "Allocate",
      onConfirm: async () => {
        await callAction({
          action: "allocate",
          roomId,
          studentNumbers: data.studentNumbers,
          checkIn: data.checkIn,
          checkOut: data.checkOut,
        });
        setAllocateOpen(false);
        setAllocateRoom(null);
        await fetchRooms();
      },
    });
  };

  // ── Download CSV ──────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (!hostelId) return;
    setDownloading(true);
    try {
      const roomRes = await fetch(`/api/admin/room?hostelId=${hostelId}`);
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
          const sRes = await fetch(`/api/admin/student?studentNumbers=${studentNumbers.join(",")}`);
          const sJson = await sRes.json();
          const list = Array.isArray(sJson.data) ? sJson.data : Array.isArray(sJson.students) ? sJson.students : [];
          list.forEach((s) => { phoneMap[s.studentNumber] = s.phoneNumber ?? ""; });
        } catch (_) {}
      }

      const csvRows = [["Room No.", "Student No.", "Student Name", "Phone Number"]];
      allRooms.forEach((room) => {
        (room.occupants ?? []).forEach((occ, idx) => {
          csvRows.push([
            idx === 0 ? room.room : "",
            occ.studentNumber ?? "",
            occ.name ?? "",
            phoneMap[occ.studentNumber] ?? "",
          ]);
        });
      });

      const csv = csvRows
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${hostel?.hostelName ?? "hostel"}_allocation.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  const selectedStudents = students.filter((s) => selectedRooms.includes(s.roomId));

  // ── Keyboard shortcuts ──────────────────────────────────────────────────
  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || tag === "select" || target.isContentEditable;
    };

    const onKey = (e) => {
      const key = e.key.toLowerCase();
      const modalOpen =
        editModalOpen || allocateOpen || disableGuardOpen || previewOpen;

      if (modalOpen || isTypingTarget(e.target)) return;

      if (e.ctrlKey && key === "a") {
        e.preventDefault();
        selectAllRooms();
        return;
      }

      if (e.key === "Escape" && selectedRooms.length > 0) {
        e.preventDefault();
        clearSelection();
        return;
      }

      if (selectedRooms.length === 0 || !e.ctrlKey) return;

      if (key === "n") {
        e.preventDefault();
        handleBulkAction("enable");
        return;
      }
      if (key === "d") {
        e.preventDefault();
        handleBulkAction("disable");
        return;
      }
      if (key === "e") {
        e.preventDefault();
        handleBulkAction("edit");
        return;
      }
      if (key === "r") {
        e.preventDefault();
        handleBulkAction("deallocate");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [
    allocateOpen,
    clearSelection,
    disableGuardOpen,
    editModalOpen,
    handleBulkAction,
    previewOpen,
    selectAllRooms,
    selectedRooms.length,
  ]);

  // ── Resolve allowedYears for allocation ──────────────────────────────
  const getAllowedYears = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room?.year) return [room.year];
    if (allowedYear) return [allowedYear];
    return [];
  };

  // ── Loading / error states ──────────────────────────────────────────────
  if (userLoading) {
    return <div className="min-h-screen bg-[#ececec] flex items-center justify-center">Loading user...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-[#ececec] flex items-center justify-center text-red-500">Not authenticated</div>;
  }

  if (isCounselor && !hostel) {
    return <div className="min-h-screen bg-[#ececec] flex items-center justify-center">No hostel assigned to you.</div>;
  }

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#ececec]">
      <div className="w-full bg-[#ececec] text-[#1e1e1e]">
        {/* Sticky header */}
        <div className="sticky top-16 z-40 bg-[#ececec] border-b border-gray-300 shadow-sm">
          <div className="px-4 sm:px-6 md:px-10 pt-5 pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-5">
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[18px] md:text-[20px]">
                {/* Hostel selector – only for admins */}
                {isAdmin ? (
                  <div className="relative" data-dropdown>
                    <button
                      onClick={() => setHostelOpen((p) => !p)}
                      className="cursor-pointer flex items-center text-cstcolor text-[20px] md:text-[22px]"
                    >
                      {hostel?.hostelName ?? hostel?.name ?? "Select Hostel"}
                      <ChevronDown size={16} className="ml-1" />
                    </button>
                    {hostelOpen && (
                      <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                        {hostels.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setHostel(item);
                              setFloorIndex(1);
                              setHostelOpen(false);
                            }}
                            className={`cursor-pointer w-full text-left px-4 py-2.5 text-base hover:bg-blue-50 transition-colors ${
                              item.id === hostelId
                                ? "text-cstcolor font-medium bg-blue-50"
                                : "text-gray-700"
                            }`}
                          >
                            {item.hostelName ?? item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-cstcolor text-[20px] md:text-[22px] font-medium">
                    {hostel?.hostelName ?? hostel?.name ?? "Hostel"}
                  </span>
                )}

                <div className="flex flex-wrap gap-2">
                  <Badge
                    color={
                      hostel?.status === "active"
                        ? "bg-[#56d154] text-white"
                        : "bg-gray-400 text-white"
                    }
                  >
                    {hostel?.status === "active" ? "Active" : hostel?.status ?? "—"}
                  </Badge>
                  {hostelGender && (
                    <Badge color="bg-cstcolor text-white">
                      {hostelGender.charAt(0).toUpperCase() + hostelGender.slice(1)} only
                    </Badge>
                  )}
                  <Badge color="bg-[#d9d9d9]">
                    {numberOfFloors} Floor{numberOfFloors !== 1 ? "s" : ""}
                  </Badge>
                  <Badge color="bg-[#d9d9d9]">{totalRooms} Rooms</Badge>
                  <Badge color="bg-[#d9d9d9]">{totalCapacity} Capacity</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setPreviewOpen(true)}
                  disabled={!hostelId}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 shadow-sm transition text-base disabled:opacity-50"
                >
                  <Eye size={18} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={handleDownload}
                  disabled={downloading || !hostelId}
                  className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg bg-cstcolor text-white hover:bg-cstcolor2 shadow-sm transition text-base disabled:opacity-60"
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
                    className="cursor-pointer text-cstcolor flex items-center gap-1"
                  >
                    Floor {floorIndex}
                    <ChevronDown size={16} />
                  </button>
                  {floorOpen && (
                    <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      {floorLabels.map((num) => {
                        const alloc = floorAllocations.find((fa) => fa.floor === num);
                        return (
                          <button
                            key={num}
                            onClick={() => {
                              setFloorIndex(num);
                              setFloorOpen(false);
                            }}
                            className={`cursor-pointer w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center justify-between ${
                              num === floorIndex
                                ? "text-cstcolor font-medium bg-blue-50"
                                : "text-gray-700"
                            }`}
                          >
                            <span>Floor {num}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span>
                  {occupiedBeds}/{totalCapacity} Occupied
                </span>
                <span className="text-gray-400">|</span>
                <span>
                  {disabledCount} disabled room{disabledCount !== 1 ? "s" : ""}
                </span>

                {selectionMode && selectedRooms.length > 0 && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-cstcolor font-medium text-base">
                      {selectedRooms.length} selected
                    </span>
                    <button
                      onClick={clearSelection}
                      className="cursor-pointer text-sm text-gray-400 hover:text-gray-600 underline transition"
                    >
                      Clear
                    </button>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-start lg:justify-end gap-3">
                {selectedRooms.length > 0 && (
                  <div className="relative" data-dropdown>
                    <button
                      type="button"
                      onClick={() => setActionsOpen((p) => !p)}
                      aria-haspopup="menu"
                      aria-expanded={actionsOpen}
                      className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-cstcolor px-4 py-2 text-base font-medium text-white shadow-sm transition hover:bg-cstcolor2"
                    >
                      Actions
                      <ChevronDown size={16} />
                    </button>

                    {actionsOpen && (
                      <div
                        role="menu"
                        className="
                          absolute top-full mt-2 z-50
                          left-0 sm:right-0 sm:left-auto
                          w-[90vw] sm:w-60
                          max-w-sm
                          overflow-hidden rounded-xl
                          border border-gray-200
                          bg-white py-1 text-sm
                          shadow-xl
                        "
                      >
                        {/* Edit – allowed for both */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleBulkAction("edit")}
                          className="cursor-pointer w-full px-4 py-2.5 text-left text-gray-700 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          Edit Selected Rooms
                        </button>

                        {/* Disable – only for admins */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleBulkAction("disable")}
                          disabled={!isActionAllowed("disable")}
                          className={`cursor-pointer w-full px-4 py-2.5 text-left transition ${
                            isActionAllowed("disable")
                              ? "text-gray-700 hover:bg-red-50 hover:text-red-600"
                              : "cursor-not-allowed text-gray-300"
                          }`}
                        >
                          Disable Selected Rooms
                        </button>

                        {/* Enable – only for admins */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleBulkAction("enable")}
                          disabled={!isActionAllowed("enable")}
                          className={`cursor-pointer w-full px-4 py-2.5 text-left transition ${
                            isActionAllowed("enable")
                              ? "text-gray-700 hover:bg-green-50 hover:text-green-700"
                              : "cursor-not-allowed text-gray-300"
                          }`}
                        >
                          Enable Selected Rooms
                        </button>

                        {/* Deallocate – only for admins */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => handleBulkAction("deallocate")}
                          disabled={!isActionAllowed("deallocate") || selectedOccupantCount === 0}
                          className={`cursor-pointer w-full px-4 py-2.5 text-left transition ${
                            isActionAllowed("deallocate") && selectedOccupantCount > 0
                              ? "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                              : "cursor-not-allowed text-gray-300"
                          }`}
                        >
                          Deallocate Students
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Room grid */}
        <div className="px-4 sm:px-6 md:px-10 py-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-100 text-red-700 border border-red-200 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchRooms} className="underline font-medium ml-4">
                Retry
              </button>
            </div>
          )}

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 ${
              selectionMode ? "cursor-default" : "cursor-pointer"
            }`}
          >
            {loading
              ? Array.from({ length: 12 }).map((_, i) => <RoomCard key={i} loading={true} />)
              : rooms.map((r) => (
                  <RoomCard
                    key={r.id}
                    room={r.room}
                    floor={`Floor ${r.floor}`}
                    status={r.status}
                    capacity={r.capacity}
                    occupants={r.occupants?.map((o) => `${o.studentNumber}  ${o.name}`)}
                    selectionMode={selectionMode}
                    selected={selectedRooms.includes(r.id)}
                    onSelect={() => toggleRoomSelection(r.id)}
                    onClickRoom={() => handleRoomClickWrapper(r.id)}
                    year={r.year}
                  />
                ))}
          </div>
          <div> </div>

          <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm md:text-base text-slate-700 ">
            {[
              { color: "bg-green-500", label: "Available" },
              { color: "bg-orange-400", label: "Partially Occupied" },
              { color: "bg-red-500", label: "Full" },
              { color: "bg-gray-500", label: "Disabled" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full ${color}`} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────────────────────── */}

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
        rooms={selectedRoomDetails}
        onSave={handleEditSave}
      />

      <AllocateStudents
        isOpen={allocateOpen}
        onClose={() => {
          setAllocateOpen(false);
          setAllocateRoom(null);
        }}
        rooms={rooms.filter((r) => r.id === allocateRoom)}
        hostel={{
          id: hostelId,
          gender: hostelGender,
          allowedYears: getAllowedYears(allocateRoom),
        }}
        selectedRooms={[allocateRoom]}
        onNext={handleAllocateSave}
      />

      <DeallocateStudents
        isOpen={deallocateOpen}
        onClose={() => setDeallocateOpen(false)}
        students={selectedStudents}
        onConfirm={async (bookingIds) => {
          await callAction({ action: "deallocate", bookingIds });
          setDeallocateOpen(false);
          clearSelection();
          await fetchRooms();
          return true;
        }}
      />

      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        hostelId={hostelId}
        hostelName={hostel?.hostelName ?? hostel?.name ?? "Hostel"}
      />

      {confirmationDialog}
    </div>
  );
}