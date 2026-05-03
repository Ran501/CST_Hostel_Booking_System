// src/app/admin_dashboard/students/components/StudentManagement.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import * as XLSX from "xlsx";

// ── Constants ──────────────────────────────────────────────────────────────
const DEPARTMENTS = [
  "All",
  "Architecture",
  "Information Technology",
  "Engineering Geology",
  "Electronics and Communication",
  "Instrumentation and Control Engineering",
  "Water Resource Engineering",
  "Electrical Engineering",
  "Civil Engineering",
  "Software Engineering",
  "Mechanical Engineering",
];

const YEARS = ["All", 1, 2, 3, 4, 5];

const EMPTY_FORM = {
  name: "",
  studentId: "",
  email: "",
  department: DEPARTMENTS[1],
  year: 1,
  phone: "",
  gender: "Male",
};

// ── API helpers ────────────────────────────────────────────────────────────
const API = "/api/admin/student";

async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Request failed");
  return json;
}

// ── CSV parser (browser-side, for preview) ─────────────────────────────────
function parseCSVLine(line) {
  const result = [];
  let inQuotes = false;
  let cur = "";
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.replace(/^"|"$/g, "").trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.replace(/^"|"$/g, "").trim());
  return result;
}

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.replace(/"/g, "").trim().toLowerCase());
  const idx = (key) => headers.indexOf(key);

  return lines.slice(1).reduce((acc, line) => {
    if (!line.trim()) return acc;
    const v = parseCSVLine(line);
    const studentId =
      v[idx("student id")] ||
      v[idx("studentid")] ||
      v[idx("student_id")] ||
      "";
    const name = v[idx("name")] || "";
    const email = v[idx("email")] || "";
    if (!name || !studentId) return acc;
    acc.push({
      name,
      studentId,
      email,
      department: v[idx("department")] || "",
      year: parseInt(v[idx("year")] || "1", 10) || 1,
      phone: v[idx("phone")] || "",
      gender: v[idx("gender")] || "Male",
    });
    return acc;
  }, []);
}

// ── Excel export (one sheet per department) ────────────────────────────────
function exportToExcel(students) {
  const wb = XLSX.utils.book_new();
  const COLS = [
    "Student ID",
    "Name",
    "Email",
    "Department",
    "Year",
    "Phone",
    "Gender",
  ];

  const grouped = students.reduce((acc, s) => {
    const dept = s.department?.trim() || "Unassigned";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(s);
    return acc;
  }, {});

  const allRows = [
    COLS,
    ...students.map((s) => [
      s.studentId,
      s.name,
      s.email,
      s.department,
      s.year,
      s.phone,
      s.gender,
    ]),
  ];
  const allWs = XLSX.utils.aoa_to_sheet(allRows);
  styleSheet(allWs, COLS.length);
  XLSX.utils.book_append_sheet(wb, allWs, "All Students");

  Object.entries(grouped)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([dept, list]) => {
      const rows = [
        COLS,
        ...list.map((s) => [
          s.studentId,
          s.name,
          s.email,
          s.department,
          s.year,
          s.phone,
          s.gender,
        ]),
      ];
      const ws = XLSX.utils.aoa_to_sheet(rows);
      styleSheet(ws, COLS.length);
      const safeName = dept.replace(/[:\\/?*[\]]/g, "").slice(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, safeName);
    });

  XLSX.writeFile(wb, `students_${new Date().toISOString().split("T")[0]}.xlsx`);
}

function styleSheet(ws, colCount) {
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2563EB" } },
    alignment: { horizontal: "center" },
  };
  const colWidths = [14, 24, 30, 30, 6, 14, 10];
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  for (let c = 0; c < colCount; c++) {
    const cellAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (ws[cellAddr]) ws[cellAddr].s = headerStyle;
  }
}

// ── Reusable select wrapper ────────────────────────────────────────────────
function SelectField({ label, value, onChange, options, className = "" }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>
              {opt.label ?? opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────
export default function StudentManagement() {
  // Data
  const [students, setStudents] = useState([]);
  const [total, setTotal] = useState(0);
  const [cursors, setCursors] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters — ALL controlled (value= not defaultValue=)
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // raw input value
  const searchTimeout = useRef(null);

  // Selection
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Modals
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Add form
  const [newStudentData, setNewStudentData] = useState({ ...EMPTY_FORM });
  const [addError, setAddError] = useState("");

  // Import
  const [csvFile, setCsvFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);
  const [importing, setImporting] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchStudents = useCallback(
    async (cursor) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: "50" });
        if (cursor) params.set("cursor", cursor);
        if (searchTerm) params.set("search", searchTerm);
        if (selectedDepartment !== "All")
          params.set("department", selectedDepartment);
        if (selectedYear !== "All") params.set("year", String(selectedYear));

        const data = await apiFetch(`${API}?${params}`);
        setStudents(data.data);
        setTotal(data.total);
        setHasNextPage(data.hasNextPage);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, selectedDepartment, selectedYear]
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCursors([null]);
    setCurrentPage(0);
    setSelectedStudents([]);
  }, [searchTerm, selectedDepartment, selectedYear]);

  useEffect(() => {
    fetchStudents(cursors[currentPage]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, cursors, searchTerm, selectedDepartment, selectedYear]);

  // Debounce search input
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => setSearchTerm(value), 400);
  };

  // ── Pagination ─────────────────────────────────────────────────────────
  const goNextPage = () => {
    if (!hasNextPage) return;
    const nextCursor = students[students.length - 1]?.id;
    if (!nextCursor) return;
    const newPage = currentPage + 1;
    const newCursors = [...cursors.slice(0, newPage + 1)];
    newCursors[newPage] = nextCursor;
    setCursors(newCursors);
    setCurrentPage(newPage);
    setSelectedStudents([]);
  };

  const goPrevPage = () => {
    if (currentPage === 0) return;
    setCurrentPage(currentPage - 1);
    setSelectedStudents([]);
  };

  // ── Selection ──────────────────────────────────────────────────────────
  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudents((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    try {
      await apiFetch(API, {
        method: "DELETE",
        body: JSON.stringify({ ids: selectedStudents }),
      });
      setSelectedStudents([]);
      setShowDeleteConfirm(false);
      setCursors([null]);
      setCurrentPage(0);
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  // ── Edit ───────────────────────────────────────────────────────────────
  const handleEdit = (student) => {
    setEditingStudent({ ...student });
    setIsEditing(true);
  };

  const saveEdit = async () => {
    try {
      const updated = await apiFetch(API, {
        method: "PUT",
        body: JSON.stringify({
          id: editingStudent.id,
          name: editingStudent.name,
          email: editingStudent.email,
          phone: editingStudent.phone,
          gender: editingStudent.gender,
          year: editingStudent.year,
          department: editingStudent.department,
        }),
      });
      setStudents((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setIsEditing(false);
      setEditingStudent(null);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    }
  };

  // ── Add ────────────────────────────────────────────────────────────────
  const handleAddStudent = async () => {
    setAddError("");
    if (!newStudentData.name.trim()) { setAddError("Name is required"); return; }
    if (!newStudentData.studentId.trim()) { setAddError("Student ID is required"); return; }
    if (!newStudentData.email.trim()) { setAddError("Email is required"); return; }
    if (!newStudentData.phone.trim()) { setAddError("Phone number is required"); return; }

    try {
      await apiFetch(API, {
        method: "POST",
        body: JSON.stringify(newStudentData),
      });
      setShowAddModal(false);
      setNewStudentData({ ...EMPTY_FORM });
      setCursors([null]);
      setCurrentPage(0);
    } catch (err) {
      setAddError(err.message);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const params = new URLSearchParams({ export: "true" });
      if (selectedDepartment !== "All")
        params.set("department", selectedDepartment);
      if (selectedYear !== "All") params.set("year", String(selectedYear));
      if (searchTerm) params.set("search", searchTerm);

      const data = await apiFetch(`${API}?${params}`);
      if (!data.data?.length) {
        alert("No students found for the current filters.");
        return;
      }
      exportToExcel(data.data);
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  };

  // ── Import CSV ─────────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      alert("Please select a valid CSV file");
      return;
    }
    setCsvFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      setImportPreview(parsed.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const handleImportCSV = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first");
      return;
    }
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = parseCSV(ev.target.result);
        if (parsed.length === 0) {
          alert(
            "No valid students found in CSV. Check that columns are: Name, Student ID, Email, Department, Year, Phone, Gender"
          );
          setImporting(false);
          return;
        }

        const result = await apiFetch(API, {
          method: "POST",
          body: JSON.stringify({ students: parsed }),
        });

        setShowImportModal(false);
        setCsvFile(null);
        setImportPreview([]);
        setCursors([null]);
        setCurrentPage(0);
        alert(
          `Successfully imported ${result.count} students! (${result.skipped} skipped as duplicates)`
        );
      } catch (err) {
        alert(`Import failed: ${err.message}`);
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      alert("Error reading file");
      setImporting(false);
    };
    reader.readAsText(csvFile);
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const pageStart = currentPage * 50 + 1;
  const pageEnd = Math.min(pageStart + students.length - 1, total);

  const deptOptions = DEPARTMENTS.map((d) => ({ value: d, label: d }));
  const yearOptions = YEARS.map((y) => ({
    value: y,
    label: y === "All" ? "All" : `Year ${y}`,
  }));
  const deptOptionsNoAll = DEPARTMENTS.filter((d) => d !== "All").map((d) => ({
    value: d,
    label: d,
  }));
  const yearOptionsNoAll = [1, 2, 3, 4, 5].map((y) => ({
    value: y,
    label: `Year ${y}`,
  }));

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Management System
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and organize student records
          </p>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              {/* Department Filter — controlled with value= */}
              <SelectField
                label="Department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                options={deptOptions}
              />

              {/* Year Filter — controlled with value= */}
              <SelectField
                label="Year"
                value={selectedYear}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value === "All" ? "All" : parseInt(e.target.value)
                  )
                }
                options={yearOptions}
              />

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search
                </label>
                <input
                  type="text"
                  value={searchInput}
                  onChange={handleSearchChange}
                  placeholder="Name, ID, or Email..."
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Import CSV
              </button>

              <button
                onClick={handleExport}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Excel
              </button>

              {selectedStudents.length > 0 && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete ({selectedStudents.length})
                </button>
              )}

              <button
                onClick={() => {
                  setAddError("");
                  setNewStudentData({ ...EMPTY_FORM });
                  setShowAddModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
            Error: {error}
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.length === students.length &&
                        students.length > 0
                      }
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  {[
                    "Student ID",
                    "Name",
                    "Email",
                    "Department",
                    "Year",
                    "Phone",
                    "Gender",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-gray-400"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="text-center py-12 text-gray-500"
                    >
                      No students found matching the filters
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleSelectStudent(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {student.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Year {student.year}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {student.phone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.gender === "Male"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-pink-100 text-pink-800"
                          }`}
                        >
                          {student.gender}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(student)}
                          className="text-blue-600 hover:text-blue-800 cursor-pointer"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && students.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-medium">
                  {pageStart}–{pageEnd}
                </span>{" "}
                of <span className="font-medium">{total}</span> students
              </p>
              <div className="flex gap-2">
                <button
                  onClick={goPrevPage}
                  disabled={currentPage === 0}
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={goNextPage}
                  disabled={!hasNextPage}
                  className="px-3 py-1 rounded border border-gray-300 text-sm text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Edit Student Modal ──────────────────────────────────────────── */}
        {isEditing && editingStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Edit Student
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Update student information
                </p>
              </div>
              <div className="p-6">
                {[
                  {
                    label: "Full Name",
                    key: "name",
                    type: "text",
                    placeholder: "Enter full name",
                  },
                  {
                    label: "Email Address",
                    key: "email",
                    type: "email",
                    placeholder: "Enter email address",
                  },
                  {
                    label: "Phone Number",
                    key: "phone",
                    type: "text",
                    placeholder: "Enter phone number",
                  },
                ].map(({ label, key, type, placeholder }) => (
                  <div className="mb-4" key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={editingStudent[key] || ""}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          [key]: e.target.value,
                        })
                      }
                      placeholder={placeholder}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <SelectField
                  label="Department"
                  value={editingStudent.department || deptOptionsNoAll[0].value}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      department: e.target.value,
                    })
                  }
                  options={deptOptionsNoAll}
                  className="mb-4"
                />

                <SelectField
                  label="Year"
                  value={editingStudent.year || 1}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      year: parseInt(e.target.value),
                    })
                  }
                  options={yearOptionsNoAll}
                  className="mb-4"
                />

                <SelectField
                  label="Gender"
                  value={editingStudent.gender || "Male"}
                  onChange={(e) =>
                    setEditingStudent({
                      ...editingStudent,
                      gender: e.target.value,
                    })
                  }
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  className="mb-6"
                />

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Student Modal ───────────────────────────────────────────── */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Add New Student
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Enter student details
                </p>
              </div>
              <div className="p-6">
                {addError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                    {addError}
                  </div>
                )}

                {[
                  {
                    label: "Full Name",
                    key: "name",
                    type: "text",
                    placeholder: "Enter full name",
                  },
                  {
                    label: "Student ID",
                    key: "studentId",
                    type: "text",
                    placeholder: "e.g. 02210133",
                  },
                  {
                    label: "Email Address",
                    key: "email",
                    type: "email",
                    placeholder: "Enter email address",
                  },
                  {
                    label: "Phone Number",
                    key: "phone",
                    type: "text",
                    placeholder: "Enter phone number",
                  },
                ].map(({ label, key, type, placeholder }) => (
                  <div className="mb-4" key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label}
                    </label>
                    <input
                      type={type}
                      value={newStudentData[key]}
                      onChange={(e) =>
                        setNewStudentData({
                          ...newStudentData,
                          [key]: e.target.value,
                        })
                      }
                      placeholder={placeholder}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}

                <SelectField
                  label="Department"
                  value={newStudentData.department}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      department: e.target.value,
                    })
                  }
                  options={deptOptionsNoAll}
                  className="mb-4"
                />

                <SelectField
                  label="Year"
                  value={newStudentData.year}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      year: parseInt(e.target.value),
                    })
                  }
                  options={yearOptionsNoAll}
                  className="mb-4"
                />

                <SelectField
                  label="Gender"
                  value={newStudentData.gender}
                  onChange={(e) =>
                    setNewStudentData({
                      ...newStudentData,
                      gender: e.target.value,
                    })
                  }
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                  ]}
                  className="mb-6"
                />

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStudent}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Add Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Import CSV Modal ────────────────────────────────────────────── */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Import Students
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                  Import student data from CSV file
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select CSV File
                    </label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Required columns: <strong>Name</strong>,{" "}
                      <strong>Student ID</strong>, <strong>Email</strong>.
                      Optional: Department, Year, Phone, Gender.
                    </p>
                  </div>

                  {importPreview.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Preview (first {importPreview.length} row
                        {importPreview.length > 1 ? "s" : ""}):
                      </h3>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              {[
                                "Name",
                                "Student ID",
                                "Email",
                                "Department",
                                "Year",
                                "Phone",
                                "Gender",
                              ].map((col) => (
                                <th
                                  key={col}
                                  className="border-b px-3 py-2 text-left text-xs font-medium text-gray-500"
                                >
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((s, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="border-b px-3 py-2">{s.name}</td>
                                <td className="border-b px-3 py-2">{s.studentId}</td>
                                <td className="border-b px-3 py-2">{s.email}</td>
                                <td className="border-b px-3 py-2">{s.department}</td>
                                <td className="border-b px-3 py-2">{s.year}</td>
                                <td className="border-b px-3 py-2">{s.phone}</td>
                                <td className="border-b px-3 py-2">{s.gender}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Duplicate student numbers and
                      emails will be skipped automatically. Default password{" "}
                      <code>Welcome@123</code> is assigned to imported students.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setCsvFile(null);
                      setImportPreview([]);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportCSV}
                    disabled={!csvFile || importing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {importing ? "Importing..." : "Import Students"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ───────────────────────────────────── */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="bg-red-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                  Confirm Delete
                </h2>
                <p className="text-red-100 text-sm mt-1">
                  This action cannot be undone
                </p>
              </div>
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete{" "}
                    <strong>{selectedStudents.length}</strong> student(s)? This
                    action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Delete Students
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}