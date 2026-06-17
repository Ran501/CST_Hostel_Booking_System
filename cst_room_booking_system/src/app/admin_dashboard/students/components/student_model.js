"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useConfirmation } from "../../components/useConfirmation";

const departments = [
  "All", "Architecture", "Information Technology", "Engineering Geology",
  "Electronics and Communication", "Instrumentation and Control Engineering",
  "Water Resource Engineering", "Electrical Engineering", "Civil Engineering",
  "Software Engineering", "Mechanical Engineering"
];

const roleOptions = ["student", "admin", "counselor"];

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="px-2 py-2"><div className="w-4 h-4 bg-gray-200 rounded" /></td>
    <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-24" /></td>
    <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-40" /></td>
    <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-52" /></td>
    <td className="px-2 py-2"><div className="h-5 bg-gray-200 rounded w-20" /></td>
    <td className="px-2 py-2"><div className="h-5 bg-gray-200 rounded w-36" /></td>
    <td className="px-2 py-2"><div className="h-5 bg-gray-200 rounded w-12" /></td>
    <td className="px-2 py-2"><div className="h-4 bg-gray-200 rounded w-28" /></td>
    <td className="px-2 py-2"><div className="h-5 bg-gray-200 rounded w-20" /></td>
    <td className="px-2 py-2"><div className="h-5 w-10 bg-gray-200 rounded-full" /></td>
  </tr>
);

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

// ── Assign Hostel Modal ────────────────────────────────────────────────────
// Shown whenever a user is promoted to / created as "counselor".
// Fetches available hostels (those not yet assigned to another counselor).
function AssignHostelModal({ isOpen, studentName, userId, onAssign, onClose }) {
  const [hostels, setHostels]     = useState([]);
  const [selected, setSelected]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Fetch unassigned hostels every time the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setSelected("");
    setError("");
    setLoading(true);

    fetch("/api/admin/counselor?available=true")
      .then((r) => r.json())
      .then((data) => setHostels(data.hostels || []))
      .catch(() => setError("Failed to load hostels."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selected) { setError("Please select a hostel."); return; }
    setSaving(true);
    setError("");
    try {
      await onAssign(userId, selected);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign hostel.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Hostel to Counselor</h2>
        <p className="text-sm text-gray-500 mb-4">
          <span className="font-medium text-gray-700">{studentName}</span> is being made a counselor.
          Select the hostel they will manage.
        </p>

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading hostels…</div>
        ) : hostels.length === 0 ? (
          <div className="py-6 text-center text-amber-600 text-sm bg-amber-50 rounded-lg">
            All hostels already have a counselor assigned.<br />
            Reassign an existing counselor first, or add a new hostel.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {hostels.map((h) => (
              <label
                key={h.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected === h.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="hostel"
                  value={h.id}
                  checked={selected === h.id}
                  onChange={() => { setSelected(h.id); setError(""); }}
                  className="text-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">{h.hostelName}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {h.gender} · {h.numberOfFloor} floor{h.numberOfFloor !== 1 ? "s" : ""} · capacity {h.capacity}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          {hostels.length > 0 && (
            <button
              onClick={handleAssign}
              disabled={saving || !selected}
              className="px-4 py-2 rounded-lg bg-cstcolor text-white text-sm hover:bg-cstcolor3 disabled:opacity-60"
            >
              {saving ? "Assigning…" : "Assign Hostel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Add Student Modal ──────────────────────────────────────────────────────
function AddStudentModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    studentNumber: "", name: "", email: "", role: "student",
    department: "Information Technology", year: 1,
    phoneNumber: "", gender: "male", isActive: false,
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!form.studentNumber || !form.name || !form.email) {
      alert("Student number, name and email are required.");
      return;
    }
    setSaving(true);
    try {
      // onAdd returns { student, needsHostelAssignment } when role is counselor
      const result = await onAdd(form);
      if (result === false) return;
      onClose();
      setForm({
        studentNumber: "", name: "", email: "", role: "student",
        department: "Information Technology", year: 1,
        phoneNumber: "", gender: "male", isActive: true,
      });
    } catch (err) {
      alert(err.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Student</h2>

        {form.role === "counselor" && (
          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
            You will be prompted to assign a hostel after creating this counselor.
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Student Number", key: "studentNumber" },
            { label: "Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phoneNumber" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <input
              type="number" min={1} max={6}
              value={form.year}
              onChange={(e) => setForm(f => ({ ...f, year: Number(e.target.value) }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => setForm(f => ({ ...f, gender: e.target.value }))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
              className="rounded"
            />
            <label className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="px-4 py-2 rounded-lg bg-cstcolor text-white text-sm hover:bg-cstcolor3 disabled:opacity-60">
            {saving ? "Adding..." : "Add Student"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Import Modal ───────────────────────────────────────────────────────────
function ImportModal({ isOpen, onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [preview, setPreview]   = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setFileText(text);
      const lines = text.split("\n").filter(l => l.trim());
      setPreview(lines.slice(0, 5));
    };
    reader.onerror = () => alert("Could not read the file. Please try selecting it again.");
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!fileText) { alert("Please select a CSV file first."); return; }
    setImporting(true);
    setImportResult(null);
    try {
      const result = await onImport(fileText);
      if (result === false) return;
      setImportResult(result);
    } catch (err) {
      alert(err.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFileName("");
    setFileText("");
    setPreview([]);
    setImportResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Import Students (CSV)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Required columns: <code>studentNumber, name, email, year, gender, phoneNumber, department</code>
          <br />
          Optional columns: <code>role</code> (default: student), <code>isActive / status</code> (default: disabled), <code>password</code>
          <br />
          Column headers are case-insensitive.
        </p>

        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <input ref={fileRef} type="file" accept=".csv,.CSV" className="hidden" onChange={handleFile} />
          {fileName
            ? <p className="text-sm text-gray-700 font-medium">{fileName}</p>
            : <p className="text-sm text-gray-400">Click to select a CSV file</p>
          }
        </div>

        {preview.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono overflow-x-auto">
            {preview.map((line, i) => <div key={i} className={i === 0 ? "font-bold text-gray-800" : ""}>{line}</div>)}
            <div className="text-gray-400 mt-1">preview — first {preview.length} rows</div>
          </div>
        )}

        {importResult && (
          <div className={`mt-3 rounded p-3 text-sm ${importResult.errors?.length ? "bg-yellow-50 text-yellow-800" : "bg-green-50 text-green-800"}`}>
            <p className="font-medium">
              Import complete — {importResult.created} created, {importResult.skipped} skipped
            </p>
            {importResult.errors?.length > 0 && (
              <ul className="mt-1 text-xs list-disc list-inside space-y-0.5 max-h-24 overflow-y-auto">
                {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={handleClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
            {importResult ? "Close" : "Cancel"}
          </button>
          {!importResult && (
            <button onClick={handleImport} disabled={importing || !fileText} className="px-4 py-2 rounded-lg bg-cstcolor text-white text-sm hover:bg-cstcolor3 disabled:opacity-60">
              {importing ? "Importing..." : "Import"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function StudentManagement() {
  const { user, loading: userLoading } = useUser();
  const isAdmin = user?.role === "admin";
  const isCounselor = user?.role === "counselor";
  const isViewOnly = isCounselor;  // only counselors are read-only

  const [students, setStudents] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal]       = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { confirm, confirmationDialog }       = useConfirmation();

  // ── Hostel assignment modal state ────────────────────────────────────────
  // Triggered after a user is promoted to counselor (role change or new user).
  const [hostelModal, setHostelModal] = useState({
    open: false,
    userId: null,
    studentName: "",
  });

  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: "" });
  const editConfirmationPending = useRef(false);
  const loadMoreRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const normalizeStudent = (raw) => ({
    ...raw,
    isActive:   Boolean(raw.isActive),
    role:       (raw.role       ?? "student").toString().trim().toLowerCase(),
    department: (raw.department ?? "").toString().trim(),
    gender:     (raw.gender     ?? "").toString().trim().toLowerCase(),
  });

  const normalizeStudents = (arr) => arr.map(normalizeStudent);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(async (cursor = null, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: "25",
        search: searchTerm,
        department: selectedDepartment === "All" ? "" : selectedDepartment,
        year: selectedYear === "All" ? "" : selectedYear,
      });
      if (cursor) params.append("cursor", cursor);

      const res = await fetch(`/api/admin/student?${params}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      const result = await res.json();

      const newStudents = normalizeStudents(result.data || []);

      if (isLoadMore) {
        setStudents(prev => {
          const combined = [...prev, ...newStudents];
          return Array.from(new Map(combined.map(item => [item.id, item])).values());
        });
      } else {
        setStudents(newStudents);
      }

      setNextCursor(result.nextCursor);
      setHasMore(!!result.nextCursor && newStudents.length > 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDepartment, selectedYear, searchTerm]);

  useEffect(() => {
    setStudents([]);
    setNextCursor(null);
    setHasMore(true);
    fetchStudents();
  }, [fetchStudents]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchStudents(nextCursor, true);
        }
      },
      { threshold: 0.6 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadingMore, fetchStudents]);

  // ── API helpers ──────────────────────────────────────────────────────────
  const updateStudent = async (id, fields) => {
    const res = await fetch("/api/admin/student", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Update failed");
    }
    return res.json();
  };

  // ── Counselor hostel assignment ──────────────────────────────────────────
  // Called by AssignHostelModal once the admin picks a hostel.
  const handleAssignHostel = async (userId, hostelId) => {
    const res = await fetch("/api/admin/counselor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hostelId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to assign hostel");
    }
    return res.json();
  };

  // Opens the hostel assignment modal for a given user.
  const promptHostelAssignment = (userId, studentName) => {
    // Only admins can assign hostels
    if (!isAdmin) return;
    setHostelModal({ open: true, userId, studentName });
  };

  const deleteSelectedStudents = async () => {
    const ids = [...selectedStudents];
    const res = await fetch("/api/admin/student", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete");
    }

    setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setSelectedStudents([]);
  };

  const requestDeleteSelectedStudents = () => {
    if (selectedStudents.length === 0 || isViewOnly) return;

    confirm({
      message: `Delete ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: deleteSelectedStudents,
    });
  };

  // ── Add student ──────────────────────────────────────────────────────────
  const handleAddStudent = async (form) => {
    const res = await fetch("/api/admin/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to add student");
    }
    const newStudent = await res.json();
    setStudents(prev => [normalizeStudent(newStudent), ...prev]);

    // If the new user is a counselor, open the hostel assignment modal
    if (form.role === "counselor") {
      promptHostelAssignment(newStudent.id, newStudent.name);
    }

    return newStudent;
  };

  const requestAddStudent = (form) => {
    if (isViewOnly) return;
    return confirm({
      message: `Add ${form.name || form.studentNumber} as a ${form.role}?`,
      confirmText: "Add Student",
      onConfirm: () => handleAddStudent(form),
    });
  };

  // ── Bulk import ──────────────────────────────────────────────────────────
  const handleImportStudents = async (csvText) => {
    const res = await fetch("/api/admin/student", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csvText,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Import failed");
    }
    const result = await res.json();
    setStudents([]);
    setNextCursor(null);
    await fetchStudents();
    return result;
  };

  const requestImportStudents = (csvText) => {
    if (isViewOnly) return;
    return confirm({
      message: "Import students from the selected CSV file?",
      confirmText: "Import",
      onConfirm: () => handleImportStudents(csvText),
    });
  };

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: "true",
        department: selectedDepartment === "All" ? "" : selectedDepartment,
        year: selectedYear === "All" ? "" : selectedYear,
        search: searchTerm,
      });
      const res = await fetch(`/api/admin/student?${params}`);
      if (!res.ok) throw new Error("Export failed");
      const { data } = await res.json();

      const headers = ["studentNumber", "name", "email", "role", "department", "year", "phoneNumber", "gender", "isActive"];
      const rows = data.map(s => headers.map(h => s[h] ?? "").join(","));
      const csv = [headers.join(","), ...rows].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `students_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(err.message || "Export failed");
    }
  };

  // ── Editing ──────────────────────────────────────────────────────────────
  const startEdit = (id, field, value) => {
    if (isViewOnly) return;
    setEditingCell({ id, field, value: value ?? "" });
  };

  const saveEdit = (id, field, newValue) => {
    if (isViewOnly || editConfirmationPending.current) return;

    editConfirmationPending.current = true;
    setEditingCell({ id: null, field: null, value: "" });

    confirm({
      message: `Update ${field} to "${newValue}"?`,
      confirmText: "Save",
      onConfirm: async () => {
        await updateStudent(id, { [field]: newValue });
        setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: newValue } : s));
      },
      onCancel: () => setEditingCell({ id: null, field: null, value: "" }),
    }).finally(() => {
      editConfirmationPending.current = false;
    });
  };

  const updateStudentYear = async (student, newYear) => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: newYear } : s));
    try {
      await updateStudent(student.id, { year: newYear });
    } catch (error) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: student.year } : s));
      throw error;
    }
  };

  const renderEditableCell = (student, field, displayValue) => {
    const isEditing = editingCell.id === student.id && editingCell.field === field;
    if (isEditing) {
      return (
        <input
          type={field === "year" ? "number" : "text"}
          value={editingCell.value}
          onChange={(e) => setEditingCell(prev => ({ ...prev, value: e.target.value }))}
          onBlur={() => saveEdit(student.id, field, editingCell.value)}
          onKeyDown={(e) => e.key === "Enter" && saveEdit(student.id, field, editingCell.value)}
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          autoFocus
        />
      );
    }
    return (
      <div
        className={`px-2 py-1 rounded transition-colors text-sm text-gray-800 ${
          isViewOnly ? "" : "cursor-text hover:bg-gray-100"
        }`}
        onDoubleClick={() => startEdit(student.id, field, displayValue)}
        title={isViewOnly ? "Read‑only" : displayValue}
      >
        {displayValue || "-"}
      </div>
    );
  };

  const toggleStatus = (student) => {
    if (isViewOnly) return;
    const newStatus = !student.isActive;

    confirm({
      message: `${newStatus ? "Activate" : "Deactivate"} ${student.name}?`,
      confirmText: newStatus ? "Activate" : "Deactivate",
      onConfirm: async () => {
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: newStatus } : s));
        try {
          await updateStudent(student.id, { isActive: newStatus });
        } catch (error) {
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: student.isActive } : s));
          throw error;
        }
      },
    });
  };

  // ── Year actions ─────────────────────────────────────────────────────────
  const promoteStudent = (student) => {
    if (isViewOnly) return;
    const isArch = student.department === "Architecture";
    const maxYear = isArch ? 6 : 5;
    if (student.year >= maxYear) return;
    const newYear = student.year + 1;

    confirm({
      message: `Promote ${student.name} from year ${student.year} to year ${newYear}?`,
      confirmText: "Promote",
      onConfirm: () => updateStudentYear(student, newYear),
    });
  };

  const demoteStudent = (student) => {
    if (isViewOnly) return;
    if (student.year <= 1) return;
    const newYear = student.year - 1;

    confirm({
      message: `Demote ${student.name} from year ${student.year} to year ${newYear}?`,
      confirmText: "Demote",
      onConfirm: () => updateStudentYear(student, newYear),
    });
  };

  const applyBulkYearAction = async (type) => {
    const targets = students.filter(s => selectedStudents.includes(s.id));
    const updates = targets.map(s => {
      const isArch = s.department === "Architecture";
      const maxYear = isArch ? 6 : 5;
      const newYear = type === "promote"
        ? Math.min(s.year + 1, maxYear)
        : Math.max(s.year - 1, 1);
      return { ...s, year: newYear };
    });

    setStudents(prev => prev.map(s => {
      const updated = updates.find(u => u.id === s.id);
      return updated ? { ...s, year: updated.year } : s;
    }));

    const results = await Promise.allSettled(updates.map(s => updateStudent(s.id, { year: s.year })));
    const failures = results.filter((result) => result.status === "rejected");

    if (failures.length > 0) {
      await fetchStudents();
      throw new Error(`Failed to update ${failures.length} student${failures.length !== 1 ? "s" : ""}`);
    }
  };

  const requestBulkYearAction = (type) => {
    if (isViewOnly) return;
    if (selectedStudents.length === 0) { alert("Select at least one student first."); return; }

    confirm({
      message: `${type === "promote" ? "Promote" : "Demote"} ${selectedStudents.length} selected student${selectedStudents.length !== 1 ? "s" : ""} by one year?`,
      confirmText: type === "promote" ? "Promote" : "Demote",
      onConfirm: () => applyBulkYearAction(type),
    });
  };

  // ── Role change — triggers hostel modal for counselor ────────────────────
  const requestRoleChange = (student, newRole) => {
    if (isViewOnly || newRole === student.role) return;

    confirm({
      message: `Change ${student.name}'s role to "${newRole}"?`,
      confirmText: "Change",
      onConfirm: async () => {
        await updateStudent(student.id, { role: newRole });
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, role: newRole } : s));

        // After the role is saved, open the hostel assignment modal
        if (newRole === "counselor") {
          promptHostelAssignment(student.id, student.name);
        }
      },
    });
  };

  const requestDepartmentChange = (student, newDepartment) => {
    if (isViewOnly || newDepartment === student.department) return;

    confirm({
      message: `Move ${student.name} to "${newDepartment}"?`,
      confirmText: "Change",
      onConfirm: async () => {
        await updateStudent(student.id, { department: newDepartment });
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, department: newDepartment } : s));
      },
    });
  };

  const requestGenderChange = (student) => {
    if (isViewOnly) return;
    const newGender = student.gender === "male" ? "female" : "male";

    confirm({
      message: `Change ${student.name}'s gender to "${newGender}"?`,
      confirmText: "Change",
      onConfirm: async () => {
        await updateStudent(student.id, { gender: newGender });
        setStudents(prev => prev.map(s => s.id === student.id ? { ...s, gender: newGender } : s));
      },
    });
  };

  // ── Selection ────────────────────────────────────────────────────────────
  const handleSelectStudent = (id) => {
    if (isViewOnly) return;
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (isViewOnly) return;
    setSelectedStudents(prev => prev.length === students.length && students.length > 0 ? [] : students.map(s => s.id));
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (userLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading user...</div>;
  }

  if (!user) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Not authenticated</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isViewOnly
              ? "View‑only mode – you are a counselor."
              : "Double‑click any cell to edit | Select checkboxes for bulk actions"}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                {["All", 1, 2, 3, 4, 5, 6, "Graduated"].map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 text-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action buttons – hidden for counselors */}
            {!isViewOnly && (
              <div className="flex gap-2">
                <button onClick={() => setShowImportModal(true)} className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Import</button>
                <button onClick={handleExport} className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Export</button>
                {selectedStudents.length > 0 && (
                  <button onClick={requestDeleteSelectedStudents} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600">
                    Delete ({selectedStudents.length})
                  </button>
                )}
                <button onClick={() => setShowAddModal(true)} className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Add</button>
              </div>
            )}
            {/* For counselors, show a read-only badge */}
            {isViewOnly && (
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Read‑only</span>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === students.length && students.length > 0}
                      onChange={handleSelectAll}
                      disabled={isViewOnly}
                      className={`rounded ${isViewOnly ? "cursor-not-allowed opacity-50" : ""}`}
                    />
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Year</span>
                      {!isViewOnly && (
                        <div className="flex flex-col ml-1">
                          <button onClick={() => requestBulkYearAction("promote")} title="Promote selected" className="text-green-600 text-xs leading-none hover:text-green-800">▲</button>
                          <button onClick={() => requestBulkYearAction("demote")} title="Demote selected" className="text-red-600 text-xs leading-none hover:text-red-800">▼</button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading && Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}

                {!loading && students.map((student) => (
                  <tr
                    key={student.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedStudents.includes(student.id) ? "bg-blue-50" : ""}`}
                  >
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        disabled={isViewOnly}
                        className={`rounded ${isViewOnly ? "cursor-not-allowed opacity-50" : ""}`}
                      />
                    </td>

                    <td className="px-2 py-2 text-sm font-medium text-gray-900">{renderEditableCell(student, "studentNumber", student.studentNumber)}</td>
                    <td className="px-2 py-2 text-sm text-gray-700">{renderEditableCell(student, "name", student.name)}</td>
                    <td className="px-2 py-2 text-sm text-gray-500">{renderEditableCell(student, "email", student.email)}</td>

                    {/* Role dropdown — disabled for counselors */}
                    <td className="px-2 py-2 text-sm">
                      <select
                        value={student.role}
                        onChange={(e) => requestRoleChange(student, e.target.value)}
                        disabled={isViewOnly}
                        className={`border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500 ${
                          isViewOnly ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        {!roleOptions.includes(student.role) && (
                          <option value={student.role}>{student.role || "— unknown —"}</option>
                        )}
                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>

                    {/* Department dropdown — disabled for counselors */}
                    <td className="px-2 py-2 text-sm">
                      <select
                        value={student.department}
                        onChange={(e) => requestDepartmentChange(student, e.target.value)}
                        disabled={isViewOnly}
                        className={`border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500 ${
                          isViewOnly ? "cursor-not-allowed opacity-80" : ""
                        }`}
                      >
                        {!departments.filter(d => d !== "All").includes(student.department) && (
                          <option value={student.department}>{student.department || "— select —"}</option>
                        )}
                        {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>

                    <td className="px-2 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800">{student.year}</span>
                        {!isViewOnly && (
                          <div className="flex flex-col">
                            <button onClick={() => promoteStudent(student)} className="text-green-600 text-xs leading-none hover:text-green-800">▲</button>
                            <button onClick={() => demoteStudent(student)} className="text-red-600 text-xs leading-none hover:text-red-800">▼</button>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="px-2 py-2 text-sm text-gray-700">{renderEditableCell(student, "phoneNumber", student.phoneNumber)}</td>

                    <td className="px-2 py-2">
                      <button
                        onClick={() => requestGenderChange(student)}
                        disabled={isViewOnly}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          student.gender === "male" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-pink-100 text-pink-800 hover:bg-pink-200"
                        } ${isViewOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        {student.gender?.toUpperCase() || "-"}
                      </button>
                    </td>

                    <td className="px-2 py-2">
                      <button
                        onClick={() => toggleStatus(student)}
                        disabled={isViewOnly}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                          student.isActive ? "bg-green-600" : "bg-gray-300"
                        } ${isViewOnly ? "cursor-not-allowed opacity-60" : ""}`}
                      >
                        <span className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${student.isActive ? "translate-x-5" : "translate-x-1"}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div ref={loadMoreRef} className="py-8 text-center text-gray-500">
            {loadingMore ? "Loading more students..." : hasMore ? "Scroll to load more" : "No more students"}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {/* Only render modals if admin, but the modal components themselves will not open if isViewOnly */}
      {!isViewOnly && (
        <>
          <AddStudentModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onAdd={requestAddStudent}
          />

          <ImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onImport={requestImportStudents}
          />

          <AssignHostelModal
            isOpen={hostelModal.open}
            studentName={hostelModal.studentName}
            userId={hostelModal.userId}
            onAssign={handleAssignHostel}
            onClose={() => setHostelModal({ open: false, userId: null, studentName: "" })}
          />
        </>
      )}

      {confirmationDialog}
    </div>
  );
}