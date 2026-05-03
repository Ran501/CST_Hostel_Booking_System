// src/app/components/StudentManagement.js
"use client";

import { useState, useMemo } from "react";

// Dummy data structure
const initialStudents = [
  { id: 1, name: "Tshewang Dorji", studentId: "20210001", email: "tshewang.dorji@cst.edu.bt", department: "Architecture", year: 4, phone: "17123456", gender: "Male" },
  { id: 2, name: "Pema Choden", studentId: "20210002", email: "pema.choden@cst.edu.bt", department: "Information Technology", year: 3, phone: "17123457", gender: "Female" },
  { id: 3, name: "Kinley Wangchuk", studentId: "20210003", email: "kinley.wangchuk@cst.edu.bt", department: "Architecture", year: 2, phone: "17123458", gender: "Male" },
  { id: 4, name: "Dechen Zam", studentId: "20210004", email: "dechen.zam@cst.edu.bt", department: "Electronics", year: 4, phone: "17123459", gender: "Female" },
  { id: 5, name: "Sonam Tobgay", studentId: "20210005", email: "sonam.tobgay@cst.edu.bt", department: "Civil Engineering", year: 3, phone: "17123460", gender: "Male" },
  { id: 6, name: "Yangchen Lhamo", studentId: "20210006", email: "yangchen.lhamo@cst.edu.bt", department: "Information Technology", year: 1, phone: "17123461", gender: "Female" },
  { id: 7, name: "Jigme Norbu", studentId: "20210007", email: "jigme.norbu@cst.edu.bt", department: "Civil Engineering", year: 4, phone: "17123462", gender: "Male" },
  { id: 8, name: "Chimi Dema", studentId: "20210008", email: "chimi.dema@cst.edu.bt", department: "Software Engineering", year: 1, phone: "17123463", gender: "Female" },
  { id: 9, name: "Lhendup Tshering", studentId: "20210009", email: "lhendup.tshering@cst.edu.bt", department: "Electronics", year: 2, phone: "17123464", gender: "Male" },
  { id: 10, name: "Karma Yangzom", studentId: "20210010", email: "karma.yangzom@cst.edu.bt", department: "Information Technology", year: 4, phone: "17123465", gender: "Female" },
  { id: 11, name: "Rinchen Dorji", studentId: "20210011", email: "rinchen.dorji@cst.edu.bt", department: "Civil Engineering", year: 3, phone: "17123466", gender: "Male" },
  { id: 12, name: "Tshering Yangden", studentId: "20210012", email: "tshering.yangden@cst.edu.bt", department: "Software Engineering", year: 2, phone: "17123467", gender: "Female" },
];

const departments = ["All", "Architecture", "Information Technology", "Engineering Geology", "Electronics and Communication","Instrumentation and Control Engineering", "Water Resource Engineering","Electrical Engineering","Civil Engineering", "Software Engineering", "Mechanical Engineering"];
const years = ["All", 1, 2, 3, 4,5];

export default function StudentManagement() {
  const [students, setStudents] = useState(initialStudents);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [csvFile, setCsvFile] = useState(null);

  // Add Student Modal form data
  const [newStudentData, setNewStudentData] = useState({
    name: "",
    studentId: "",
    email: "",
    department: departments[1],
    year: 1,
    phone: "",
    gender: "Male"
  });

  // Filter students based on department, year, and search
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesDepartment = selectedDepartment === "All" || student.department === selectedDepartment;
      const matchesYear = selectedYear === "All" || student.year === selectedYear;
      const matchesSearch = searchTerm === "" || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesYear && matchesSearch;
    });
  }, [students, selectedDepartment, selectedYear, searchTerm]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  // Handle single select
  const handleSelectStudent = (id) => {
    if (selectedStudents.includes(id)) {
      setSelectedStudents(selectedStudents.filter(sid => sid !== id));
    } else {
      setSelectedStudents([...selectedStudents, id]);
    }
  };

  // Handle delete selected
  const handleDeleteSelected = () => {
    if (selectedStudents.length === 0) return;
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setStudents(students.filter(s => !selectedStudents.includes(s.id)));
    setSelectedStudents([]);
    setShowDeleteConfirm(false);
  };

  // Handle edit student
  const handleEdit = (student) => {
    setEditingStudent({ ...student });
    setIsEditing(true);
  };

  const saveEdit = () => {
    setStudents(students.map(s => s.id === editingStudent.id ? editingStudent : s));
    setIsEditing(false);
    setEditingStudent(null);
  };

  // Handle add new student
  const handleAddStudent = () => {
    const maxId = Math.max(...students.map(s => s.id), 0);
    setStudents([...students, { ...newStudentData, id: maxId + 1 }]);
    setShowAddModal(false);
    setNewStudentData({
      name: "",
      studentId: "",
      email: "",
      department: departments[1],
      year: 1,
      phone: "",
      gender: "Male"
    });
  };

  // Export to CSV
  const exportToCSV = () => {
    const exportData = filteredStudents.map(student => ({
      'Student ID': student.studentId,
      'Name': student.name,
      'Email': student.email,
      'Department': student.department,
      'Year': student.year,
      'Phone': student.phone,
      'Gender': student.gender
    }));

    const headers = Object.keys(exportData[0]);
    const csvRows = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => {
          const value = row[header] || '';
          return `"${value.toString().replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      previewCSV(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  // Preview CSV file
  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = parseCSV(text);
      setImportPreview(parsedData.slice(0, 5));
    };
    reader.readAsText(file);
  };

  // Parse CSV to array
  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().toLowerCase());
    
    const students = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const values = parseCSVLine(lines[i]);
      const student = {
        name: values[headers.indexOf('name')] || '',
        studentId: values[headers.indexOf('student id')] || values[headers.indexOf('studentid')] || '',
        email: values[headers.indexOf('email')] || '',
        department: values[headers.indexOf('department')] || '',
        year: parseInt(values[headers.indexOf('year')] || 1),
        phone: values[headers.indexOf('phone')] || '',
        gender: values[headers.indexOf('gender')] || 'Male'
      };
      
      if (student.name && student.studentId) {
        students.push(student);
      }
    }
    return students;
  };

  // Parse CSV line
  const parseCSVLine = (line) => {
    const result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(currentValue.replace(/^"|"$/g, '').trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    result.push(currentValue.replace(/^"|"$/g, '').trim());
    return result;
  };

  // Import CSV data
  const importCSV = () => {
    if (!csvFile) {
      alert('Please select a CSV file first');
      return;
    }

    setImporting(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target.result;
      const newStudents = parseCSV(text);
      
      if (newStudents.length === 0) {
        alert('No valid students found in the CSV file');
        setImporting(false);
        return;
      }
      
      const maxId = Math.max(...students.map(s => s.id), 0);
      const studentsWithIds = newStudents.map((student, index) => ({
        ...student,
        id: maxId + index + 1
      }));
      
      setStudents([...students, ...studentsWithIds]);
      setShowImportModal(false);
      setCsvFile(null);
      setImportPreview([]);
      alert(`Successfully imported ${studentsWithIds.length} students!`);
      setImporting(false);
    };
    
    reader.onerror = () => {
      alert('Error reading file');
      setImporting(false);
    };
    
    reader.readAsText(csvFile);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-600 mt-2">Manage and organize student records</p>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Department Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-black mb-1">Department</label>
                <div className="relative">
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Year Filter */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value === "All" ? "All" : parseInt(e.target.value))}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, ID, or Email..."
                  className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowImportModal(true)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import CSV
              </button>

              <button onClick={exportToCSV} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export CSV
              </button>

              {selectedStudents.length > 0 && (
                <button onClick={handleDeleteSelected} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete ({selectedStudents.length})
                </button>
              )}
              
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Student
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.studentId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Year {student.year}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{student.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${student.gender === "Male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"}`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(student)}
                        className="text-blue-600 hover:text-blue-800 mr-3 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No students found matching the filters</p>
            </div>
          )}
        </div>

        {/* Edit Student Modal - Blue Theme */}
        {isEditing && editingStudent && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              {/* Header with blue accent */}
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Edit Student</h2>
                <p className="text-blue-100 text-sm mt-1">Update student information</p>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editingStudent.name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2  text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">Department</label>
                  <div className="relative">
                    <select
                      value={editingStudent.department}
                      onChange={(e) => setEditingStudent({ ...editingStudent, department: e.target.value })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {departments.filter(d => d !== "All").map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">Year</label>
                  <div className="relative">
                    <select
                      value={editingStudent.year}
                      onChange={(e) => setEditingStudent({ ...editingStudent, year: parseInt(e.target.value) })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={saveEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal - Blue Theme */}
        {showAddModal && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              {/* Header with blue accent */}
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Add New Student</h2>
                <p className="text-blue-100 text-sm mt-1">Enter student details</p>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={newStudentData.name}
                    onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    value={newStudentData.studentId}
                    onChange={(e) => setNewStudentData({ ...newStudentData, studentId: e.target.value })}
                    placeholder="Enter student ID"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={newStudentData.email}
                    onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <div className="relative">
                    <select
                      value={newStudentData.department}
                      onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {departments.filter(d => d !== "All").map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <div className="relative">
                    <select
                      value={newStudentData.year}
                      onChange={(e) => setNewStudentData({ ...newStudentData, year: parseInt(e.target.value) })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      {[1, 2, 3, 4].map(year => (
                        <option key={year} value={year}>Year {year}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={newStudentData.phone}
                    onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="relative">
                    <select
                      value={newStudentData.gender}
                      onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })}
                      className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={handleAddStudent} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">Add Student</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal - Blue Theme */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              {/* Header with blue accent */}
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Import Students</h2>
                <p className="text-blue-100 text-sm mt-1">Import student data from CSV file</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      File should have columns: Name, Student ID, Email, Department, Year, Phone, Gender
                    </p>
                  </div>

                  {importPreview.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-3">Preview (first 5 rows):</h3>
                      <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="border-b px-3 py-2 text-left">Name</th>
                              <th className="border-b px-3 py-2 text-left">Student ID</th>
                              <th className="border-b px-3 py-2 text-left">Email</th>
                              <th className="border-b px-3 py-2 text-left">Department</th>
                              <th className="border-b px-3 py-2 text-left">Year</th>
                              <th className="border-b px-3 py-2 text-left">Phone</th>
                              <th className="border-b px-3 py-2 text-left">Gender</th>
                            </tr>
                          </thead>
                          <tbody>
                            {importPreview.map((student, idx) => (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="border-b px-3 py-2">{student.name}</td>
                                <td className="border-b px-3 py-2">{student.studentId}</td>
                                <td className="border-b px-3 py-2">{student.email}</td>
                                <td className="border-b px-3 py-2">{student.department}</td>
                                <td className="border-b px-3 py-2">{student.year}</td>
                                <td className="border-b px-3 py-2">{student.phone}</td>
                                <td className="border-b px-3 py-2">{student.gender}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Imported students will be added to the existing list. Duplicate entries are not automatically detected.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button onClick={() => { setShowImportModal(false); setCsvFile(null); setImportPreview([]); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={importCSV} disabled={!csvFile || importing} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer">{importing ? "Importing..." : "Import Students"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal - Blue Theme */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              {/* Header with red accent (keeping red for delete for better UX) */}
              <div className="bg-red-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Confirm Delete</h2>
                <p className="text-red-100 text-sm mt-1">This action cannot be undone</p>
              </div>
              
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    Are you sure you want to delete <strong>{selectedStudents.length}</strong> student(s)? This action cannot be undone.
                  </p>
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors cursor-pointer">Delete Students</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}