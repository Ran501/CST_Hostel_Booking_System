"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ConfirmationModal from "./ConfirmationModal";

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

// ── Add Student Modal ──────────────────────────────────────────────────────
function AddStudentModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    studentNumber: "", name: "", email: "", role: "student",
    department: "Information Technology", year: 1,
    phoneNumber: "", gender: "male", isActive: true,
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
      await onAdd(form);
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
  const [fileText, setFileText] = useState("");   // raw CSV text — read ONCE on select
  const [preview, setPreview]   = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { created, skipped, errors }
  const fileRef = useRef();

  if (!isOpen) return null;

  // Read the file into state immediately on selection so we never touch the
  // File object again — avoids the "file could not be read / permission" error
  // that occurs when the browser invalidates the File reference after first read.
  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      setFileText(text);
      // Show first 5 non-empty lines as preview
      const lines = text.split("\n").filter(l => l.trim());
      setPreview(lines.slice(0, 5));
    };
    reader.onerror = () => {
      alert("Could not read the file. Please try selecting it again.");
    };
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!fileText) { alert("Please select a CSV file first."); return; }
    setImporting(true);
    setImportResult(null);
    try {
      // Pass the already-read text string to onImport — no second File read needed.
      const result = await onImport(fileText);
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
  const [showDepartmentConfirm, setShowDepartmentConfirm] = useState(false);
  const [showGenderConfirm, setShowGenderConfirm] = useState(false);

  const [pendingEdit, setPendingEdit] = useState(null);
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [pendingDepartmentChange, setPendingDepartmentChange] = useState(null);
  const [pendingGenderChange, setPendingGenderChange] = useState(null);
  const [bulkActionType, setBulkActionType] = useState(null);

  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: "" });
  const loadMoreRef = useRef(null);

  // ── Helpers ──────────────────────────────────────────────────────────────

  // Normalize a student record from the API.
  // isActive is now a real boolean from Prisma (added to the repository select),
  // so Boolean() is all we need. We also trim string fields to prevent
  // whitespace mismatches in the role/department dropdowns.
  const normalizeStudent = (raw) => ({
    ...raw,
    isActive:   Boolean(raw.isActive),
    role:       (raw.role       ?? "student").toString().trim().toLowerCase(),
    department: (raw.department ?? "").toString().trim(),
    gender:     (raw.gender     ?? "").toString().trim().toLowerCase(),
  });

  const normalizeStudents = (arr) => arr.map(normalizeStudent);

  // ── Fetch ────────────────────────────────────────────────────────────────
  // FIX #5: wrap in useCallback so the stable reference can be passed to the
  // IntersectionObserver effect without stale-closure problems.
  const fetchStudents = useCallback(async (cursor = null, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: "25",
        search: searchTerm,
        // FIX #5: send the actual filter values, empty-string means "no filter"
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

  // FIX #5: reset + refetch whenever any filter changes
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
    if (!res.ok) throw new Error("Update failed");
    return res.json();
  };

  const deleteSelectedStudents = async () => {
    try {
      await fetch("/api/admin/student", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedStudents }),
      });
      setStudents(prev => prev.filter(s => !selectedStudents.includes(s.id)));
      setSelectedStudents([]);
    } catch {
      alert("Failed to delete");
    }
    setShowDeleteConfirm(false);
  };

  // FIX #4: Add student
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

setStudents(prev => [newStudent, ...prev]);
  };

  // FIX #4: Bulk import
  // Receives raw CSV text from ImportModal (file is read once there).
  // Sends it as text/csv so the API route can forward it to importFromCsv.
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
    // Refresh the list so newly imported students appear
    setStudents([]);
    setNextCursor(null);
    fetchStudents();
    // Return result so ImportModal can show the summary (created / skipped / errors)
    return result;
  };

  // FIX #4: Export
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
  const startEdit = (id, field, value) => setEditingCell({ id, field, value: value ?? "" });

  const saveEdit = (id, field, newValue) => {
    setPendingEdit({ id, field, newValue });
    setShowSaveConfirm(true);
  };

  const confirmEdit = async () => {
    if (!pendingEdit) return;
    const { id, field, newValue } = pendingEdit;
    try {
      await updateStudent(id, { [field]: newValue });
      setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: newValue } : s));
    } catch {
      alert("Failed to save");
    }
    setShowSaveConfirm(false);
    setPendingEdit(null);
    setEditingCell({ id: null, field: null, value: "" });
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
        className="cursor-text hover:bg-gray-100 px-2 py-1 rounded transition-colors text-sm text-gray-800"
        onDoubleClick={() => startEdit(student.id, field, displayValue)}
        title={displayValue}
      >
        {displayValue || "-"}
      </div>
    );
  };

  const toggleStatus = async (student) => {
    const newStatus = !student.isActive;
    // Optimistic update first
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: newStatus } : s));
    try {
      await updateStudent(student.id, { isActive: newStatus });
    } catch {
      // Rollback on failure
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: student.isActive } : s));
      alert("Failed to update status");
    }
  };

  // ── Year actions ─────────────────────────────────────────────────────────
  const promoteStudent = async (student) => {
    const isArch = student.department === "Architecture";
    const maxYear = isArch ? 6 : 5;
    if (student.year >= maxYear) return;
    const newYear = student.year + 1;
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: newYear } : s));
    try { await updateStudent(student.id, { year: newYear }); }
    catch { setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: student.year } : s)); }
  };

  const demoteStudent = async (student) => {
    if (student.year <= 1) return;
    const newYear = student.year - 1;
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: newYear } : s));
    try { await updateStudent(student.id, { year: newYear }); }
    catch { setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: student.year } : s)); }
  };

  // FIX #6: Bulk promote/demote for selected students
  const confirmBulkAction = async () => {
    if (!bulkActionType) return;
    const targets = students.filter(s => selectedStudents.includes(s.id));
    const updates = targets.map(s => {
      const isArch = s.department === "Architecture";
      const maxYear = isArch ? 6 : 5;
      const newYear = bulkActionType === "promote"
        ? Math.min(s.year + 1, maxYear)
        : Math.max(s.year - 1, 1);
      return { ...s, year: newYear };
    });

    // Optimistic UI
    setStudents(prev => prev.map(s => {
      const updated = updates.find(u => u.id === s.id);
      return updated ? { ...s, year: updated.year } : s;
    }));

    // Persist each
    await Promise.allSettled(updates.map(s => updateStudent(s.id, { year: s.year })));

    setShowBulkConfirm(false);
    setBulkActionType(null);
  };

  // ── Confirm handlers ─────────────────────────────────────────────────────
  const confirmRoleChange = async () => {
    if (!pendingRoleChange) return;
    const { student, newRole } = pendingRoleChange;
    try {
      await updateStudent(student.id, { role: newRole });
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, role: newRole } : s));
    } catch { alert("Failed to update role"); }
    setShowRoleConfirm(false);
    setPendingRoleChange(null);
  };

  const confirmDepartmentChange = async () => {
    if (!pendingDepartmentChange) return;
    const { student, newDepartment } = pendingDepartmentChange;
    try {
      await updateStudent(student.id, { department: newDepartment });
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, department: newDepartment } : s));
    } catch { alert("Failed to update department"); }
    setShowDepartmentConfirm(false);
    setPendingDepartmentChange(null);
  };

  // FIX #3: Gender confirmation actually updates the DB
  const confirmGenderChange = async () => {
    if (!pendingGenderChange) return;
    const { student, newGender } = pendingGenderChange;
    try {
      await updateStudent(student.id, { gender: newGender });
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, gender: newGender } : s));
    } catch { alert("Failed to update gender"); }
    setShowGenderConfirm(false);
    setPendingGenderChange(null);
  };

  // ── Selection ────────────────────────────────────────────────────────────
  const handleSelectStudent = (id) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);

  const handleSelectAll = () =>
    setSelectedStudents(prev => prev.length === students.length && students.length > 0 ? [] : students.map(s => s.id));

  const handleHeaderPromote = () => {
    if (selectedStudents.length === 0) { alert("Select at least one student first."); return; }
    setBulkActionType("promote");
    setShowBulkConfirm(true);
  };

  const handleHeaderDemote = () => {
    if (selectedStudents.length === 0) { alert("Select at least one student first."); return; }
    setBulkActionType("demote");
    setShowBulkConfirm(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-500 text-sm mt-1">Double-click any cell to edit | Select checkboxes for bulk actions</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* FIX #5: controlled selects that actually drive fetchStudents via useEffect */}
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

            <div className="flex gap-2">
              {/* FIX #4: all buttons now functional */}
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3"
              >
                Import
              </button>
              <button
                onClick={handleExport}
                className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3"
              >
                Export
              </button>
              {selectedStudents.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600"
                >
                  Delete ({selectedStudents.length})
                </button>
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3"
              >
                Add
              </button>
            </div>
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
                      className="rounded"
                    />
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Number</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  {/* FIX #6: Year header with bulk promote/demote buttons */}
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Year</span>
                      <div className="flex flex-col ml-1">
                        <button
                          onClick={handleHeaderPromote}
                          title="Promote selected"
                          className="text-green-600 text-xs leading-none hover:text-green-800"
                        >▲</button>
                        <button
                          onClick={handleHeaderDemote}
                          title="Demote selected"
                          className="text-red-600 text-xs leading-none hover:text-red-800"
                        >▼</button>
                      </div>
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
                        className="rounded"
                      />
                    </td>

                    <td className="px-2 py-2 text-sm font-medium text-gray-900">
                      {renderEditableCell(student, "studentNumber", student.studentNumber)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">
                      {renderEditableCell(student, "name", student.name)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500">
                      {renderEditableCell(student, "email", student.email)}
                    </td>

                    {/* Role Dropdown — value comes from normalised student.role */}
                    <td className="px-2 py-2 text-sm">
                      <select
                        value={student.role}
                        onChange={(e) => {
                          setPendingRoleChange({ student, newRole: e.target.value });
                          setShowRoleConfirm(true);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500"
                      >
                        {/* Placeholder shown when DB value doesn't match any option */}
                        {!roleOptions.includes(student.role) && (
                          <option value={student.role}>{student.role || "— unknown —"}</option>
                        )}
                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>

                    {/* Department dropdown — value is the exact string from DB */}
                    <td className="px-2 py-2 text-sm">
                      <select
                        value={student.department}
                        onChange={(e) => {
                          setPendingDepartmentChange({ student, newDepartment: e.target.value });
                          setShowDepartmentConfirm(true);
                        }}
                        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500"
                      >
                        {/* Show whatever the DB has, even if it doesn't match our list */}
                        {!departments.filter(d => d !== "All").includes(student.department) && (
                          <option value={student.department}>{student.department || "— select —"}</option>
                        )}
                        {departments.filter(d => d !== "All").map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </td>

                    {/* FIX #6: Year shown before the buttons */}
                    <td className="px-2 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800">{student.year}</span>
                        <div className="flex flex-col">
                          <button
                            onClick={() => promoteStudent(student)}
                            className="text-green-600 text-xs leading-none hover:text-green-800"
                          >▲</button>
                          <button
                            onClick={() => demoteStudent(student)}
                            className="text-red-600 text-xs leading-none hover:text-red-800"
                          >▼</button>
                        </div>
                      </div>
                    </td>

                    <td className="px-2 py-2 text-sm text-gray-700">
                      {renderEditableCell(student, "phoneNumber", student.phoneNumber)}
                    </td>

                    {/* FIX #3: Gender button opens confirmation modal to change */}
                    <td className="px-2 py-2">
                      <button
                        onClick={() => {
                          const newGender = student.gender === "male" ? "female" : "male";
                          setPendingGenderChange({ student, newGender });
                          setShowGenderConfirm(true);
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          student.gender === "male"
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                            : "bg-pink-100 text-pink-800 hover:bg-pink-200"
                        }`}
                      >
                        {student.gender?.toUpperCase() || "-"}
                      </button>
                    </td>

                    {/* FIX #2: Toggle reads normalised boolean */}
                    <td className="px-2 py-2">
                      <button
                        onClick={() => toggleStatus(student)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                          student.isActive ? "bg-green-600" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 bg-white rounded-full transition-transform ${
                            student.isActive ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div ref={loadMoreRef} className="py-8 text-center text-gray-500">
            {loadingMore
              ? "Loading more students..."
              : hasMore
                ? "Scroll to load more"
                : "No more students"}
          </div>
        </div>
      </div>

      {/* ── Confirmation Modals ─────────────────────────────────────────── */}
      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => { setShowSaveConfirm(false); setPendingEdit(null); setEditingCell({ id: null, field: null, value: "" }); }}
        onConfirm={confirmEdit}
        title="Save Changes"
        message={pendingEdit ? `Update ${pendingEdit.field} to "${pendingEdit.newValue}"?` : "Save this change?"}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteSelectedStudents}
        title="Confirm Delete"
        message={`Delete ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}? This cannot be undone.`}
        actionType="danger"
      />

      <ConfirmationModal
        isOpen={showRoleConfirm}
        onClose={() => { setShowRoleConfirm(false); setPendingRoleChange(null); }}
        onConfirm={confirmRoleChange}
        title="Change Role"
        message={pendingRoleChange
          ? `Change ${pendingRoleChange.student.name}'s role to "${pendingRoleChange.newRole}"?`
          : ""}
      />

      {/* FIX #1: Department confirmation modal wired up */}
      <ConfirmationModal
        isOpen={showDepartmentConfirm}
        onClose={() => { setShowDepartmentConfirm(false); setPendingDepartmentChange(null); }}
        onConfirm={confirmDepartmentChange}
        title="Change Department"
        message={pendingDepartmentChange
          ? `Move ${pendingDepartmentChange.student.name} to "${pendingDepartmentChange.newDepartment}"?`
          : ""}
      />

      {/* FIX #3: Gender confirmation modal wired up and saves to DB */}
      <ConfirmationModal
        isOpen={showGenderConfirm}
        onClose={() => { setShowGenderConfirm(false); setPendingGenderChange(null); }}
        onConfirm={confirmGenderChange}
        title="Change Gender"
        message={pendingGenderChange
          ? `Change ${pendingGenderChange.student.name}'s gender to "${pendingGenderChange.newGender}"?`
          : ""}
      />

      {/* FIX #6: Bulk year confirm */}
      <ConfirmationModal
        isOpen={showBulkConfirm}
        onClose={() => { setShowBulkConfirm(false); setBulkActionType(null); }}
        onConfirm={confirmBulkAction}
        title={bulkActionType === "promote" ? "Bulk Promote" : "Bulk Demote"}
        message={`${bulkActionType === "promote" ? "Promote" : "Demote"} ${selectedStudents.length} selected student${selectedStudents.length !== 1 ? "s" : ""} by one year?`}
      />

      {/* FIX #4: Add modal rendered */}
      <AddStudentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStudent}
      />

      {/* FIX #4: Import modal rendered */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportStudents}
      />
    </div>
  );
}