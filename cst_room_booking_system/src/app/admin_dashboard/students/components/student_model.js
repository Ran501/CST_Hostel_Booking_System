"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useConfirmation } from "../../components/useConfirmation";

const departments = [
  "All", "Architecture", "Information Technology", "Engineering Geology",
  "Electronics and Communication", "Instrumentation and Control Engineering",
  "Water Resource Engineering", "Electrical Engineering", "Civil Engineering",
  "Software Engineering", "Mechanical Engineering", "Administration", "Councillor"
];

const roleOptions = ["student", "admin", "counselor"];

// Export helpers ────────────────────────────────────────────────────────────
const YEAR_NAMES = {
  1: "First Year", 2: "Second Year", 3: "Third Year",
  4: "Fourth Year", 5: "Fifth Year"
};

// Columns written to each exported sheet, in order.
const EXPORT_HEADERS = [
  "studentNumber", "name", "email",
  "department", "year", "phoneNumber", "gender",
];

// Excel sheet names: max 31 chars, no \ / ? * [ ] : , and must be unique.
function safeSheetName(name, used) {
  let base = String(name).replace(/[\\/?*[\]:]/g, " ").trim().slice(0, 31) || "Sheet";
  let candidate = base;
  let i = 1;
  while (used.has(candidate)) {
    const suffix = ` (${++i})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
  }
  used.add(candidate);
  return candidate;
}

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

// ─── useUser hook ──────────────────────────────────────────────────────────

function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const raw = localStorage.getItem("session");
    if (raw) {
      try { setUser(JSON.parse(raw)); }
      catch { setUser(null); }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
    const handleStorage = (e) => { if (e.key === "session") loadUser(); };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadUser]);

  return { user, loading };
}

// ── Inline error banner ────────────────────────────────────────────────────

function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="mb-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
}

// ── Assign Hostel Modal ──────────────────────────────────────────────────

function AssignHostelModal({ isOpen, studentName, userId, onAssign, onClose }) {
  const [hostels, setHostels] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setSelected("");
    setError("");
    setLoading(true);
    fetch("/api/admin/counselor?available=true")
      .then((r) => r.json())
      .then((data) => setHostels(data.hostels || []))
      .catch(() => setError("Failed to load hostels. Please try again."))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssign = async () => {
    if (!selected) { setError("Please select a hostel."); return; }
    setSaving(true);
    setError("");
    try {
      await onAssign(userId, selected);
      toast.success(`Hostel assigned to ${studentName}`);
      onClose();
    } catch (err) {
      const msg = err.message || "Failed to assign hostel.";
      setError(msg);
      toast.error(msg);
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

        <ErrorBanner message={error} />

        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm">Loading hostels…</div>
        ) : hostels.length === 0 ? (
          <div className="py-6 text-center text-amber-600 text-sm bg-amber-50 rounded-lg">
            All hostels already have a counselor assigned.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {hostels.map((h) => (
              <label
                key={h.id}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selected === h.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
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
                  <p className="text-xs text-gray-500 capitalize">{h.gender}</p>
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
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

// ── Add Student Modal ────────────────────────────────────────────────────

function AddStudentModal({ isOpen, onClose, onAdd }) {
  const [form, setForm] = useState({
    studentNumber: "", name: "", email: "", role: "student",
    department: "Information Technology", year: 1,
    phoneNumber: "", gender: "male", isActive: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { if (isOpen) setError(""); }, [isOpen]);

  if (!isOpen) return null;

  const getMaxYear = (department) => {
    return department === "Architecture" ? 5 : 4;
  };

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!form.studentNumber.trim()) { setError("Student number is required."); return; }
    if (!form.name.trim())          { setError("Name is required."); return; }
    if (!form.email.trim())         { setError("Email is required."); return; }

    setSaving(true);
    setError("");
    try {
      const result = await onAdd(form);
      if (result === false) return;
      toast.success(`${form.name} added successfully!`);
      onClose();
      setForm({
        studentNumber: "", name: "", email: "", role: "student",
        department: "Information Technology", year: 1,
        phoneNumber: "", gender: "male", isActive: true,
      });
    } catch (err) {
      const msg = err.message || "Failed to add student. Please try again.";
      setError(msg);
      toast.error(msg, { duration: 6000 });
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

        <ErrorBanner message={error} />

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Student Number", key: "studentNumber" },
            { label: "Name",           key: "name" },
            { label: "Email",          key: "email" },
            { label: "Phone",          key: "phoneNumber" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
              <input
                type="text"
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
            <select
              value={form.department}
              onChange={(e) => {
                handleChange("department", e.target.value);
                // Reset year to 1 when department changes
                handleChange("year", 1);
              }}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => handleChange("role", e.target.value)}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Year</label>
            <select
              value={form.year}
              onChange={(e) => handleChange("year", Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900"
            >
              {Array.from({ length: getMaxYear(form.department) }, (_, i) => i + 1).map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
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
              onChange={(e) => handleChange("isActive", e.target.checked)}
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

// ── Import Modal ─────────────────────────────────────────────────────────

function ImportModal({ isOpen, onClose, onImport }) {
  const [fileName, setFileName] = useState("");
  const [fileText, setFileText] = useState("");
  const [preview, setPreview] = useState([]);
  const [sheetInfo, setSheetInfo] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef();

  useEffect(() => { if (isOpen) setError(""); }, [isOpen]);

  if (!isOpen) return null;

  const setCsvPreview = (csvText, info = "") => {
    setFileText(csvText);
    setPreview(csvText.split("\n").filter(l => l.trim()).slice(0, 5));
    setSheetInfo(info);
  };

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setImportResult(null);
    setError("");
    setSheetInfo("");

    const isExcel = /\.(xlsx|xls)$/i.test(f.name);

    // ── CSV: read as text (unchanged behaviour) ─────────────────────────────
    if (!isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => setCsvPreview(ev.target.result);
      reader.onerror = () => {
        const msg = "Could not read the file. Please try selecting it again.";
        setError(msg);
        toast.error(msg);
      };
      reader.readAsText(f);
      return;
    }

    // ── Excel: merge EVERY tab into one CSV, then reuse the CSV import path ──
    try {
      const buf = await f.arrayBuffer();
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default ?? xlsxModule;
      const wb = XLSX.read(new Uint8Array(buf), { type: "array" });

      let allRows = [];
      for (const sheetName of wb.SheetNames) {
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: "", raw: false });
        allRows = allRows.concat(rows);
      }

      if (allRows.length === 0) {
        const msg = "No rows found in any sheet of this workbook.";
        setError(msg);
        toast.error(msg);
        setFileText("");
        setPreview([]);
        return;
      }

      // json_to_sheet builds a unified header row across all tabs.
      const combined = XLSX.utils.json_to_sheet(allRows);
      const csv = XLSX.utils.sheet_to_csv(combined);
      setCsvPreview(csv, `${wb.SheetNames.length} tab(s) combined · ${allRows.length} rows`);
    } catch (err) {
      console.error("Excel parse error:", err);
      const msg = "Could not read this Excel file. Make sure it's a valid .xlsx/.xls workbook.";
      setError(msg);
      toast.error(msg);
      setFileText("");
      setPreview([]);
    }
  };

  const handleImport = async () => {
    if (!fileText) {
      const msg = "Please select a CSV or Excel file first.";
      setError(msg);
      toast.error(msg);
      return;
    }
    setImporting(true);
    setError("");
    setImportResult(null);
    try {
      const result = await onImport(fileText);
      if (result === false) return;
      setImportResult(result);
      if (result.errors?.length) {
        toast.error(`Import finished with ${result.errors.length} error(s). Check the list below.`, { duration: 6000 });
      } else {
        toast.success(`Import complete: ${result.created} created, ${result.skipped} skipped`);
      }
    } catch (err) {
      const msg = err.message || "Import failed. Please check the file and try again.";
      setError(msg);
      toast.error(msg, { duration: 6000 });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFileName("");
    setFileText("");
    setPreview([]);
    setSheetInfo("");
    setImportResult(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Import Students (CSV or Excel)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Required columns: <code>studentNumber, name, email, year, gender, department</code>
          <br />
          Optional: <code>phoneNumber</code>, <code>role</code> (default: student), <code>isActive / status</code> (default: disabled), <code>password</code>
          <br />
          Excel (.xlsx/.xls): every tab is imported and combined — each row keeps its own year &amp; department.
        </p>

        <ErrorBanner message={error} />

        <div
          onClick={() => fileRef.current.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors"
        >
          <input ref={fileRef} type="file" accept=".csv,.CSV,.xlsx,.xls" className="hidden" onChange={handleFile} />
          {fileName ? <p className="text-sm text-gray-700 font-medium">{fileName}</p> : <p className="text-sm text-gray-400">Click to select a CSV or Excel file</p>}
          {sheetInfo && <p className="text-xs text-green-600 mt-1">{sheetInfo}</p>}
        </div>

        {preview.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded p-3 text-xs text-gray-600 font-mono overflow-x-auto">
            {preview.map((line, i) => <div key={i} className={i === 0 ? "font-bold text-gray-800" : ""}>{line}</div>)}
            <div className="text-gray-400 mt-1">preview — first {preview.length} rows</div>
          </div>
        )}

        {importResult && (
          <div className={`mt-3 rounded p-3 text-sm ${importResult.errors?.length ? "bg-yellow-50 text-yellow-800 border border-yellow-200" : "bg-green-50 text-green-800 border border-green-200"}`}>
            <p className="font-medium">Import complete — {importResult.created} created, {importResult.skipped} skipped</p>
            {importResult.errors?.length > 0 && (
              <ul className="mt-1 text-xs list-disc list-inside space-y-0.5 max-h-28 overflow-y-auto">
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

// ── Main Component ────────────────────────────────────────────────────────

export default function StudentManagement() {
  const { user, loading: userLoading } = useUser();
  const isAdmin    = user?.role === "admin";
  const isCounselor = user?.role === "counselor";
  const isViewOnly  = isCounselor;

  const [students, setStudents] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  // Debounced copy of searchTerm — the actual fetch keys off this, so typing
  // doesn't fire a request on every keystroke (only ~300ms after you stop).
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedStudents, setSelectedStudents] = useState([]);
  // Power-user selection: anchor row for range-select, focus row for Shift+Arrow.
  const selectionAnchorRef = useRef(null);
  const [focusIndex, setFocusIndex] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { confirm, confirmationDialog } = useConfirmation();

  const [hostelModal, setHostelModal] = useState({ open: false, userId: null, studentName: "" });
  const [pendingRoleChange, setPendingRoleChange] = useState(null);
  const [hostelsData, setHostelsData] = useState([]);

  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: "" });
  const editConfirmationPending = useRef(false);
  const loadMoreRef = useRef(null);

  // ── Year Helper Functions ──────────────────────────────────────────────

  const getMaxYear = (department) => {
    return department === "Architecture" ? 5 : 4;
  };

  const getAvailableYears = (department) => {
    if (department === "All") {
      return [1, 2, 3, 4, 5];
    }
    const maxYear = getMaxYear(department);
    const years = [];
    for (let i = 1; i <= maxYear; i++) {
      years.push(i);
    }
    return years;
  };

  // ── Helpers ──────────────────────────────────────────────────────────────

  const normalizeStudent = (raw) => ({
    ...raw,
    isActive:   Boolean(raw.isActive),
    role:       (raw.role       ?? "student").toString().trim().toLowerCase(),
    department: (raw.department ?? "").toString().trim(),
    gender:     (raw.gender     ?? "").toString().trim().toLowerCase(),
  });

  const normalizeStudents = (arr) => arr.map(normalizeStudent);

  // ── Generic safe API call ──────────────────────────────────────────────

  const apiCall = async (url, options = {}) => {
    const res  = await fetch(url, options);
    const text = await res.text();
    let json;
    try { json = JSON.parse(text); }
    catch { throw new Error(`Server error (${res.status}): ${text.slice(0, 120)}`); }
    if (!res.ok) throw new Error(json.error || json.message || `Request failed (${res.status})`);
    return json;
  };

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchStudents = useCallback(async (cursor = null, isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        limit: "25",
        search: debouncedSearch,
        department: selectedDepartment === "All" ? "" : selectedDepartment,
        year: selectedYear === "All" ? "" : selectedYear,
      });
      if (cursor) params.append("cursor", cursor);

      const result = await apiCall(`/api/admin/student?${params}`);
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
      toast.error(err.message || "Failed to load students");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedDepartment, selectedYear, debouncedSearch]);

  // Copy searchTerm into debouncedSearch ~300ms after the user stops typing.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => {
    setStudents([]);
    setNextCursor(null);
    setHasMore(true);
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasMore && !loadingMore) fetchStudents(nextCursor, true); },
      { threshold: 0.6 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadingMore, fetchStudents]);

  // ── Hostels data ────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/admin/hostel")
      .then(r => r.json())
      .then(json => {
        const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : Array.isArray(json.hostels) ? json.hostels : [];
        setHostelsData(list);
      })
      .catch(err => console.error("Failed to fetch hostels:", err));
  }, []);

  // ── API helpers ──────────────────────────────────────────────────────────

  const updateStudent = (id, fields) =>
    apiCall("/api/admin/student", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...fields }),
    });

  const handleAssignHostel = (userId, hostelId) =>
    apiCall("/api/admin/counselor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hostelId }),
    });

  // ── Role change ────────────────────────────────────────────────────────

  const handleHostelSelectForRoleChange = async (userId, hostelId) => {
    setHostelModal({ open: false, userId: null, studentName: "" });

    const student = students.find(s => s.id === userId);
    const hostel  = hostelsData.find(h => h.id === hostelId);

    if (!student || !hostel) {
      toast.error("Student or hostel not found. Please refresh and try again.");
      setPendingRoleChange(null);
      return;
    }

    confirm({
      message: `Change ${student.name}'s role to counselor and assign them to "${hostel.hostelName}"?`,
      confirmText: "Confirm",
      onConfirm: async () => {
        try {
          await updateStudent(userId, { role: "counselor" });
          setStudents(prev => prev.map(s => s.id === userId ? { ...s, role: "counselor" } : s));
          await handleAssignHostel(userId, hostelId);
          toast.success(`${student.name} is now a counselor assigned to ${hostel.hostelName}`);
        } catch (err) {
          toast.error(err.message || "Failed to assign role/hostel. Please try again.");
        } finally {
          setPendingRoleChange(null);
        }
      },
      onCancel: () => setPendingRoleChange(null),
    });
  };

  const requestRoleChange = (student, newRole) => {
    if (isViewOnly || newRole === student.role) return;

    if (newRole === "counselor" && student.role !== "counselor") {
      setPendingRoleChange({ studentId: student.id, studentName: student.name });
      setHostelModal({ open: true, userId: student.id, studentName: student.name });
      return;
    }

    confirm({
      message: `Change ${student.name}'s role to "${newRole}"?`,
      confirmText: "Change",
      onConfirm: async () => {
        try {
          await updateStudent(student.id, { role: newRole });
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, role: newRole } : s));
          toast.success(`${student.name}'s role updated to ${newRole}`);
        } catch (err) {
          toast.error(err.message || "Role update failed. Please try again.");
        }
      },
    });
  };

  // ── Other actions ────────────────────────────────────────────────────────

  const promptHostelAssignment = (userId, studentName) => {
    if (!isAdmin) return;
    setHostelModal({ open: true, userId, studentName });
  };

  const deleteSelectedStudents = async () => {
    const ids = [...selectedStudents];
    await apiCall("/api/admin/student", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setStudents(prev => prev.filter(s => !ids.includes(s.id)));
    setSelectedStudents([]);
    toast.success(`Deleted ${ids.length} student${ids.length !== 1 ? "s" : ""}`);
  };

  const requestDeleteSelectedStudents = () => {
    if (selectedStudents.length === 0 || isViewOnly) return;
    confirm({
      message: `Delete ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}? This cannot be undone.`,
      confirmText: "Delete",
      onConfirm: async () => {
        try { await deleteSelectedStudents(); }
        catch (err) { toast.error(err.message || "Delete failed. Please try again."); }
      },
    });
  };

  const handleAddStudent = async (form) => {
    const newStudent = await apiCall("/api/admin/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStudents(prev => [normalizeStudent(newStudent), ...prev]);
    if (form.role === "counselor") promptHostelAssignment(newStudent.id, newStudent.name);
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

  const handleImportStudents = async (csvText) => {
    const result = await apiCall("/api/admin/student", {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csvText,
    });
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

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        export: "true",
        department: selectedDepartment === "All" ? "" : selectedDepartment,
        year: selectedYear === "All" ? "" : selectedYear,
        search: searchTerm,
      });
      const result = await apiCall(`/api/admin/student?${params}`);
      const data = result.data || [];

      if (data.length === 0) {
        toast.error("No students match the current filters — nothing to export.");
        return;
      }

      // Group students by department → one Excel tab per department.
      const byDept = new Map();
      for (const s of data) {
        const dept = s.department || "Unknown";
        if (!byDept.has(dept)) byDept.set(dept, []);
        byDept.get(dept).push(s);
      }

      // Keep the configured department order, then any unexpected ones at the end.
      const known = departments.filter(d => d !== "All" && byDept.has(d));
      const extra = [...byDept.keys()].filter(d => !departments.includes(d));
      const orderedDepts = [...known, ...extra];

      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.default ?? xlsxModule;

      const wb = XLSX.utils.book_new();
      const usedNames = new Set();
      for (const dept of orderedDepts) {
        const rows = byDept.get(dept).map(s => {
          const row = {};
          EXPORT_HEADERS.forEach(h => { row[h] = s[h] ?? ""; });
          return row;
        });
        const ws = XLSX.utils.json_to_sheet(rows, { header: EXPORT_HEADERS });
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName(dept, usedNames));
      }

      // File named after the selected year, e.g. "First Year.xlsx".
      const yearLabel = selectedYear === "All"
        ? "All Years"
        : (YEAR_NAMES[selectedYear] || `Year ${selectedYear}`);

      XLSX.writeFile(wb, `${yearLabel}.xlsx`);
      toast.success(
        `Exported ${data.length} student${data.length !== 1 ? "s" : ""} to ${yearLabel}.xlsx ` +
        `(${orderedDepts.length} tab${orderedDepts.length !== 1 ? "s" : ""})`
      );
    } catch (err) {
      toast.error(err.message || "Export failed. Please try again.");
    }
  };

  // ── Editing ──────────────────────────────────────────────────────────────

  const startEdit = (id, field, value) => {
    if (isViewOnly) return;
    setEditingCell({ id, field, value: value ?? "" });
  };

  const saveEdit = (id, field, newValue) => {
    if (isViewOnly || editConfirmationPending.current) return;

    // Only confirm when the value actually changed — otherwise just close the
    // editor so a no-op click/blur never pops the confirmation dialog.
    const student  = students.find(s => s.id === id);
    const original = student?.[field] ?? "";
    if (String(newValue).trim() === String(original).trim()) {
      setEditingCell({ id: null, field: null, value: "" });
      return;
    }

    editConfirmationPending.current = true;
    setEditingCell({ id: null, field: null, value: "" });
    confirm({
      message: `Update ${field} to "${newValue}"?`,
      confirmText: "Save",
      onConfirm: async () => {
        try {
          await updateStudent(id, { [field]: newValue });
          setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: newValue } : s));
          toast.success(`${field} updated successfully`);
        } catch (err) {
          toast.error(err.message || "Update failed. Please try again.");
        } finally {
          editConfirmationPending.current = false;
        }
      },
      onCancel: () => {
        setEditingCell({ id: null, field: null, value: "" });
        editConfirmationPending.current = false;
      },
    });
  };

  const updateStudentYear = async (student, newYear) => {
    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: newYear } : s));
    try {
      await updateStudent(student.id, { year: newYear });
      toast.success(`${student.name} moved to year ${newYear}`);
    } catch (err) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, year: student.year } : s));
      toast.error(err.message || "Year update failed. Please try again.");
      throw err;
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
        className={`px-2 py-1 rounded transition-colors text-sm text-gray-800 ${isViewOnly ? "" : "cursor-text hover:bg-gray-100"}`}
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
        try {
          await updateStudent(student.id, { isActive: newStatus });
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: newStatus } : s));
          toast.success(`${student.name} ${newStatus ? "activated" : "deactivated"}`);
        } catch (err) {
          toast.error(err.message || "Status update failed. Please try again.");
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, isActive: student.isActive } : s));
        }
      },
    });
  };

  // ── Year promotion/demotion functions ──────────────────────────────────

  const promoteStudent = (student) => {
    if (isViewOnly) return;
    const maxYear = getMaxYear(student.department);
    if (student.year >= maxYear) {
      // react-hot-toast has no .info(); use the base toast with an info icon.
      toast(`${student.name} is already in their final year (Year ${maxYear}). Can't promote further.`, { icon: "ℹ️" });
      return;
    }
    const newYear = student.year + 1;
    confirm({
      message: `Promote ${student.name} from year ${student.year} to year ${newYear}?`,
      confirmText: "Promote",
      onConfirm: () => updateStudentYear(student, newYear),
    });
  };

  const demoteStudent = (student) => {
    if (isViewOnly) return;
    if (student.year <= 1) {
      // react-hot-toast has no .info(); use the base toast with an info icon.
      toast(`${student.name} is already in Year 1. Can't demote further.`, { icon: "ℹ️" });
      return;
    }
    const newYear = student.year - 1;
    confirm({
      message: `Demote ${student.name} from year ${student.year} to year ${newYear}?`,
      confirmText: "Demote",
      onConfirm: () => updateStudentYear(student, newYear),
    });
  };

  const applyBulkYearAction = async (type) => {
    const ids = [...selectedStudents];
    if (ids.length === 0) return;

    // Snapshot for rollback if the single bulk request fails.
    const snapshot = students;

    // Optimistic local update using the same clamping rules the server applies.
    setStudents(prev => prev.map(s => {
      if (!ids.includes(s.id)) return s;
      const maxYear = getMaxYear(s.department);
      const newYear = type === "promote"
        ? Math.min(s.year + 1, maxYear)
        : Math.max(s.year - 1, 1);
      return { ...s, year: newYear };
    }));

    try {
      // One request: the server computes new years (per-department cap) and
      // applies them with a few grouped updateMany queries in a transaction.
      const result = await apiCall("/api/admin/student", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action: type }),
      });

      const updated = result?.updated ?? 0;
      const skipped = result?.skipped ?? 0;

      if (updated === 0 && skipped > 0) {
        toast(
          type === "promote"
            ? "All selected students are already in their final year."
            : "All selected students are already in Year 1.",
          { icon: "ℹ️" },
        );
      } else {
        let msg = `${type === "promote" ? "Promoted" : "Demoted"} ${updated} student${updated !== 1 ? "s" : ""}`;
        if (skipped > 0) msg += ` · ${skipped} already at the limit`;
        toast.success(msg);
      }
    } catch (err) {
      setStudents(snapshot); // rollback the optimistic change
      toast.error(err.message || "Bulk update failed. Please try again.");
    }
  };

  const requestBulkYearAction = (type) => {
    if (isViewOnly) return;
    if (selectedStudents.length === 0) { toast.error("Select at least one student first."); return; }
    confirm({
      message: `${type === "promote" ? "Promote" : "Demote"} ${selectedStudents.length} selected student${selectedStudents.length !== 1 ? "s" : ""} by one year?`,
      confirmText: type === "promote" ? "Promote" : "Demote",
      onConfirm: () => applyBulkYearAction(type),
    });
  };

  const requestDepartmentChange = (student, newDepartment) => {
    if (isViewOnly || newDepartment === student.department) return;
    confirm({
      message: `Move ${student.name} to "${newDepartment}"?`,
      confirmText: "Change",
      onConfirm: async () => {
        try {
          await updateStudent(student.id, { department: newDepartment });
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, department: newDepartment } : s));
          toast.success(`${student.name} moved to ${newDepartment}`);
        } catch (err) {
          toast.error(err.message || "Department update failed. Please try again.");
        }
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
        try {
          await updateStudent(student.id, { gender: newGender });
          setStudents(prev => prev.map(s => s.id === student.id ? { ...s, gender: newGender } : s));
          toast.success(`${student.name}'s gender updated`);
        } catch (err) {
          toast.error(err.message || "Gender update failed. Please try again.");
        }
      },
    });
  };

  const handleSelectStudent = (id) => {
    if (isViewOnly) return;
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (isViewOnly) return;
    setSelectedStudents(prev => prev.length === students.length && students.length > 0 ? [] : students.map(s => s.id));
  };

  // ── Power-user selection (range + multi-select) ────────────────────────────

  // Inclusive list of student ids between two row indices.
  const idsInRange = (a, b) => {
    const [lo, hi] = a <= b ? [a, b] : [b, a];
    return students.slice(lo, hi + 1).map(s => s.id);
  };

  // Checkbox click: Shift extends a contiguous range from the anchor; a plain
  // click toggles a single row and makes it the new anchor.
  const handleCheckboxClick = (student, index, e) => {
    if (isViewOnly) return;
    if (e.shiftKey && selectionAnchorRef.current !== null) {
      setSelectedStudents(idsInRange(selectionAnchorRef.current, index));
    } else {
      handleSelectStudent(student.id);
      selectionAnchorRef.current = index;
    }
    setFocusIndex(index);
  };

  // Ctrl/Cmd+Click toggles a row; Shift+Click extends a range — anywhere on the
  // row except the actual controls (which keep their normal behaviour).
  const handleRowClick = (student, index, e) => {
    if (isViewOnly) return;
    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) return;
    if (e.target.closest("input, select, button, textarea")) return;
    if (e.shiftKey && selectionAnchorRef.current !== null) {
      setSelectedStudents(idsInRange(selectionAnchorRef.current, index));
    } else {
      handleSelectStudent(student.id);
      selectionAnchorRef.current = index;
    }
    setFocusIndex(index);
  };

  // ── Keyboard shortcuts for fast/frequent users ─────────────────────────────
  useEffect(() => {
    if (isViewOnly) return;

    const isTypingTarget = (el) =>
      !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

    const onKeyDown = (e) => {
      // Esc: close an open modal, else cancel an in-progress edit, else clear selection.
      if (e.key === "Escape") {
        if (showAddModal) return setShowAddModal(false);
        if (showImportModal) return setShowImportModal(false);
        if (hostelModal.open) {
          setHostelModal({ open: false, userId: null, studentName: "" });
          if (pendingRoleChange) setPendingRoleChange(null);
          return;
        }
        if (editingCell.id) return setEditingCell({ id: null, field: null, value: "" });
        if (selectedStudents.length > 0) { setSelectedStudents([]); setFocusIndex(null); }
        return;
      }

      // The rest must not fight with typing in a field or an open modal.
      if (isTypingTarget(e.target)) return;
      if (showAddModal || showImportModal || hostelModal.open) return;

      // Ctrl/Cmd + A → select every loaded row.
      if ((e.ctrlKey || e.metaKey) && (e.key === "a" || e.key === "A")) {
        if (students.length === 0) return;
        e.preventDefault();
        setSelectedStudents(students.map(s => s.id));
        return;
      }

      // Delete / Backspace → delete the current selection.
      if ((e.key === "Delete" || e.key === "Backspace") && selectedStudents.length > 0) {
        e.preventDefault();
        requestDeleteSelectedStudents();
        return;
      }

      // Shift + Arrow Up/Down → extend the selection one row at a time.
      if (e.shiftKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        if (students.length === 0) return;
        e.preventDefault();
        const current = focusIndex ?? selectionAnchorRef.current ?? 0;
        if (selectionAnchorRef.current === null) selectionAnchorRef.current = current;
        const next = Math.max(
          0,
          Math.min(students.length - 1, current + (e.key === "ArrowDown" ? 1 : -1)),
        );
        setSelectedStudents(idsInRange(selectionAnchorRef.current, next));
        setFocusIndex(next);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isViewOnly, showAddModal, showImportModal, hostelModal, pendingRoleChange, editingCell, selectedStudents, students, focusIndex]);

  // ── Render ───────────────────────────────────────────────────────────────

  if (userLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading user...</div>;
  if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Not authenticated</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-500 text-sm mt-1">
            {isViewOnly ? "View‑only mode – you are a counselor." : "Double‑click any cell to edit | Select checkboxes for bulk actions"}
          </p>
          {!isViewOnly && (
            <p className="text-gray-400 text-xs mt-1">
              Shortcuts: <kbd className="font-sans">Ctrl/⌘+A</kbd> select all ·{" "}
              <kbd className="font-sans">Ctrl/⌘+Click</kbd> multi‑select ·{" "}
              <kbd className="font-sans">Shift+Click</kbd> / <kbd className="font-sans">Shift+↑↓</kbd> range ·{" "}
              <kbd className="font-sans">Delete</kbd> remove selected ·{" "}
              <kbd className="font-sans">Esc</kbd> cancel
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              <select 
                value={selectedDepartment} 
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedYear("All");
                }} 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
              </select>

              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)} 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="All">All Years</option>
                {getAvailableYears(selectedDepartment).map(y => (
                  <option key={y} value={y}>Year {y}</option>
                ))}
              </select>

              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Search..." 
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-64 text-gray-900 focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            {!isViewOnly && (
              <div className="flex gap-2">
                <button onClick={() => setShowImportModal(true)} className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Import</button>
                <button onClick={handleExport} className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Export</button>
                {selectedStudents.length > 0 && <button onClick={requestDeleteSelectedStudents} className="cursor-pointer bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600">Delete ({selectedStudents.length})</button>}
                <button onClick={() => setShowAddModal(true)} className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3">Add</button>
              </div>
            )}
            {isViewOnly && <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">Read‑only</span>}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left w-8">
                    <input type="checkbox" checked={selectedStudents.length === students.length && students.length > 0} onChange={handleSelectAll} disabled={isViewOnly} className={`rounded ${isViewOnly ? "cursor-not-allowed opacity-50" : ""}`} />
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
                {!loading && students.filter(student => isCounselor ? student.role === "student" : true) 
                              .map((student, index) => (
                  <tr key={student.id} onClick={(e) => handleRowClick(student, index, e)} className={`hover:bg-gray-50 transition-colors ${selectedStudents.includes(student.id) ? "bg-blue-50" : ""} ${index === focusIndex ? "ring-2 ring-inset ring-blue-400" : ""}`}>
                    <td className="px-2 py-2">
                      <input type="checkbox" checked={selectedStudents.includes(student.id)} onClick={(e) => handleCheckboxClick(student, index, e)} onChange={() => {}} disabled={isViewOnly} className={`rounded ${isViewOnly ? "cursor-not-allowed opacity-50" : ""}`} />
                    </td>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900">{renderEditableCell(student, "studentNumber", student.studentNumber)}</td>
                    <td className="px-2 py-2 text-sm text-gray-700">{renderEditableCell(student, "name", student.name)}</td>
                    <td className="px-2 py-2 text-sm text-gray-500">{renderEditableCell(student, "email", student.email)}</td>
                    <td className="px-2 py-2 text-sm">
                      <select value={student.role} onChange={(e) => requestRoleChange(student, e.target.value)} disabled={isViewOnly} className={`border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "cursor-not-allowed opacity-80" : ""}`}>
                        {!roleOptions.includes(student.role) && <option value={student.role}>{student.role || "— unknown —"}</option>}
                        {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <select value={student.department} onChange={(e) => requestDepartmentChange(student, e.target.value)} disabled={isViewOnly} className={`border border-gray-300 rounded px-2 py-1 text-sm text-gray-900 bg-white w-full focus:ring-2 focus:ring-blue-500 ${isViewOnly ? "cursor-not-allowed opacity-80" : ""}`}>
                        {!departments.filter(d => d !== "All").includes(student.department) && <option value={student.department}>{student.department || "— select —"}</option>}
                        {departments.filter(d => d !== "All").map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-800">{student.year}</span>
                        {!isViewOnly && (
                          <div className="flex flex-col">
                            <button 
                              onClick={() => promoteStudent(student)} 
                              className={`text-green-600 text-xs leading-none hover:text-green-800 ${student.year >= getMaxYear(student.department) ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={student.year >= getMaxYear(student.department) ? 'Already in final year' : 'Promote'}
                            >
                              ▲
                            </button>
                            <button 
                              onClick={() => demoteStudent(student)} 
                              className={`text-red-600 text-xs leading-none hover:text-red-800 ${student.year <= 1 ? 'opacity-40 cursor-not-allowed' : ''}`}
                              title={student.year <= 1 ? 'Already in Year 1' : 'Demote'}
                            >
                              ▼
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700">{renderEditableCell(student, "phoneNumber", student.phoneNumber)}</td>
                    <td className="px-2 py-2">
                      <button onClick={() => requestGenderChange(student)} disabled={isViewOnly} className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${student.gender === "male" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" : "bg-pink-100 text-pink-800 hover:bg-pink-200"} ${isViewOnly ? "cursor-not-allowed opacity-60" : ""}`}>
                        {student.gender?.toUpperCase() || "-"}
                      </button>
                    </td>
                    <td className="px-2 py-2">
                      <button onClick={() => toggleStatus(student)} disabled={isViewOnly} className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${student.isActive ? "bg-green-600" : "bg-gray-300"} ${isViewOnly ? "cursor-not-allowed opacity-60" : ""}`}>
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

      {!isViewOnly && (
        <>
          <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={requestAddStudent} />
          <ImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={requestImportStudents} />
          <AssignHostelModal
            isOpen={hostelModal.open}
            studentName={hostelModal.studentName}
            userId={hostelModal.userId}
            onAssign={pendingRoleChange ? handleHostelSelectForRoleChange : handleAssignHostel}
            onClose={() => {
              setHostelModal({ open: false, userId: null, studentName: "" });
              if (pendingRoleChange) setPendingRoleChange(null);
            }}
          />
        </>
      )}
      {confirmationDialog}
    </div>
  );
}