// src/app/components/StudentManagement.js
"use client";
import ConfirmationModal from "./ConfirmationModal";

import { useState, useMemo, useEffect, useCallback } from "react";


// Dummy data structure
const initialStudents = [
  { id: 1, name: "Tshewang Dorji", studentId: "20210001", email: "tshewang.dorji@cst.edu.bt", department: "Architecture", year: 4, phone: "17123456", gender: "Male", isActive: true },
  { id: 2, name: "Pema Choden", studentId: "20210002", email: "pema.choden@cst.edu.bt", department: "Information Technology", year: 3, phone: "17123457", gender: "Female", isActive: true },
  { id: 3, name: "Kinley Wangchuk", studentId: "20210003", email: "kinley.wangchuk@cst.edu.bt", department: "Architecture", year: 2, phone: "17123458", gender: "Male", isActive: true },
  { id: 4, name: "Dechen Zam", studentId: "20210004", email: "dechen.zam@cst.edu.bt", department: "Electronics", year: 4, phone: "17123459", gender: "Female", isActive: true },
  { id: 5, name: "Sonam Tobgay", studentId: "20210005", email: "sonam.tobgay@cst.edu.bt", department: "Civil Engineering", year: 3, phone: "17123460", gender: "Male", isActive: true },
  { id: 6, name: "Yangchen Lhamo", studentId: "20210006", email: "yangchen.lhamo@cst.edu.bt", department: "Information Technology", year: 1, phone: "17123461", gender: "Female", isActive: true },
  { id: 7, name: "Jigme Norbu", studentId: "20210007", email: "jigme.norbu@cst.edu.bt", department: "Civil Engineering", year: 4, phone: "17123462", gender: "Male", isActive: true },
  { id: 8, name: "Chimi Dema", studentId: "20210008", email: "chimi.dema@cst.edu.bt", department: "Software Engineering", year: 1, phone: "17123463", gender: "Female", isActive: true },
  { id: 9, name: "Lhendup Tshering", studentId: "20210009", email: "lhendup.tshering@cst.edu.bt", department: "Electronics", year: 2, phone: "17123464", gender: "Male", isActive: true },
  { id: 10, name: "Karma Yangzom", studentId: "20210010", email: "karma.yangzom@cst.edu.bt", department: "Information Technology", year: 4, phone: "17123465", gender: "Female", isActive: true },
  { id: 11, name: "Rinchen Dorji", studentId: "20210011", email: "rinchen.dorji@cst.edu.bt", department: "Civil Engineering", year: 3, phone: "17123466", gender: "Male", isActive: true },
  { id: 12, name: "Tshering Yangden", studentId: "20210012", email: "tshering.yangden@cst.edu.bt", department: "Software Engineering", year: 2, phone: "17123467", gender: "Female", isActive: true },
];

const roleOptions = ["student", "admin", "counselor"];

const departments = ["All", "Architecture", "Information Technology", "Engineering Geology", "Electronics and Communication","Instrumentation and Control Engineering", "Water Resource Engineering","Electrical Engineering","Civil Engineering", "Software Engineering", "Mechanical Engineering"];
// Replace the static years array with this function:
const getYearsForDepartment = (department) => {
  if (department === "Architecture") {
    return ["All", 1, 2, 3, 4, 5, "Graduated"]; 
  } else if (department === "All") {
    return ["All", 1, 2, 3, 4, 5, "Graduated"];
  } else {
    return ["All", 1, 2, 3, 4, "Graduated"];
  }
};

export default function StudentManagement() {
  const [students, setStudents] = useState(initialStudents);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
const [showStatusConfirm, setShowStatusConfirm] = useState(false);
const [showDepartmentConfirm, setShowDepartmentConfirm] = useState(false);
const [showGenderConfirm, setShowGenderConfirm] = useState(false);
const [pendingStatusChange, setPendingStatusChange] = useState(null);
const [pendingDepartmentChange, setPendingDepartmentChange] = useState(null);
const [pendingGenderChange, setPendingGenderChange] = useState(null);
const [showYearConfirm, setShowYearConfirm] = useState(false);
const [pendingYearChange, setPendingYearChange] = useState(null);
const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  
  // Inline editing states
  const [editingCell, setEditingCell] = useState({ id: null, field: null, value: "" });
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [pendingEdit, setPendingEdit] = useState(null);
  const [showRoleConfirm, setShowRoleConfirm] = useState(false);
const [pendingRoleChange, setPendingRoleChange] = useState(null);
  

  // Bulk action confirmation states
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [bulkActionType, setBulkActionType] = useState(null); // 'promote' or 'demote'
  
  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importPreview, setImportPreview] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [showBulkStatusConfirm, setShowBulkStatusConfirm] = useState(false);
  const [bulkStatusOption, setBulkStatusOption] = useState(null); // 'activate' or 'deactivate'

  // Handle Ctrl+Click for row selection
const handleRowClick = (e, student, index) => {
  // Ctrl key + Click - Toggle selection for this row
  if (e.ctrlKey) {
    e.preventDefault();
    handleSelectStudent(student.id);
    setLastSelectedIndex(index);
    return;
  }
  
  // Shift key + Click - Select range from last selected to current
  if (e.shiftKey && lastSelectedIndex !== null) {
    e.preventDefault();
    const start = Math.min(lastSelectedIndex, index);
    const end = Math.max(lastSelectedIndex, index);
    const rangeIds = filteredStudents.slice(start, end + 1).map(s => s.id);
    
    // Add all in range to selection
    const newSelection = [...new Set([...selectedStudents, ...rangeIds])];
    setSelectedStudents(newSelection);
    return;
  }
};

const handleBulkActivate = () => {
  if (selectedStudents.length === 0) {
    alert('Please select at least one student to activate');
    return;
  }
  setBulkStatusOption('activate');
  setBulkActionType('activate');
  setShowBulkConfirm(true);
};

const handleBulkDeactivate = () => {
  if (selectedStudents.length === 0) {
    alert('Please select at least one student to deactivate');
    return;
  }
  setBulkStatusOption('deactivate');
  setBulkActionType('deactivate');
  setShowBulkConfirm(true);
};



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

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesDepartment = selectedDepartment === "All" || student.department === selectedDepartment;
      
      let matchesYear = true;
      if (selectedYear === "Graduated") {
        matchesYear = student.status === 'graduated';
      } else if (selectedYear !== "All") {
        matchesYear = student.year === selectedYear;
      }
      
      const matchesSearch = searchTerm === "" || 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.includes(searchTerm) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesDepartment && matchesYear && matchesSearch;
    });
  }, [students, selectedDepartment, selectedYear, searchTerm]);

  // Handle Select All with Ctrl+A
useEffect(() => {
  const handleKeyDown = (e) => {
    // Ctrl+A - Select all filtered students
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      e.preventDefault();
      setSelectedStudents(filteredStudents.map(s => s.id));
      // Show temporary notification
      const notification = document.createElement('div');
      notification.textContent = `Selected ${filteredStudents.length} students`;
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    }
    
    // Escape key - Clear all selections
    if (e.key === 'Escape') {
      setSelectedStudents([]);
      setLastSelectedIndex(null);
    }
  };
  
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [filteredStudents]);

useEffect(() => {
  const handleDeleteKey = (e) => {
    // Check if Delete key is pressed (not Ctrl+Delete, just Delete)
    if (e.key === 'Delete' || e.key === 'Del') {
      // Don't trigger if user is typing in an input field
      const target = e.target;
      const isTyping = target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' || 
                       target.isContentEditable;
      
      if (!isTyping && selectedStudents.length > 0) {
        e.preventDefault();
        setShowDeleteConfirm(true);
      }
    }
  };
  
  window.addEventListener('keydown', handleDeleteKey);
  return () => window.removeEventListener('keydown', handleDeleteKey);
}, [selectedStudents]);

// Add Ctrl+S shortcut for export
useEffect(() => {
  const handleExportShortcut = (e) => {
    // Ctrl+S or Cmd+S (Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault(); // Prevent browser's default save page dialog
      exportToCSV();
    }
  };
  
  window.addEventListener('keydown', handleExportShortcut);
  return () => window.removeEventListener('keydown', handleExportShortcut);
}, [filteredStudents]); // Add filteredStudents as dependency

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

  // Inline edit handlers
  const startEdit = (id, field, currentValue) => {
    setEditingCell({ id, field, value: currentValue });
  };

  const saveEdit = (id, field, newValue) => {
    const originalStudent = students.find(s => s.id === id);
    const originalValue = originalStudent[field];
    
    if (newValue === originalValue) {
      setEditingCell({ id: null, field: null, value: "" });
      return;
    }
    
    setPendingEdit({ id, field, newValue, originalValue });
    setShowSaveConfirm(true);
  };

  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);

  const confirmEdit = () => {
    if (pendingEdit) {
      const { id, field, newValue } = pendingEdit;
      const updatedStudents = students.map(student =>
        student.id === id ? { ...student, [field]: newValue } : student
      );
      setStudents(updatedStudents);
    }
    setShowSaveConfirm(false);
    setPendingEdit(null);
    setEditingCell({ id: null, field: null, value: "" });
  };

  // Individual year promotion/demotion
  // Individual year promotion/demotion with confirmation
const promoteStudent = (student) => {
  const isArchitecture = student.department === "Architecture";
  const maxYear = isArchitecture ? 5 : 4;
  
  if (student.year < maxYear) {
    setPendingYearChange({
      student,
      action: 'promote',
      newYear: student.year + 1,
      oldYear: student.year,
      willGraduate: false
    });
    setShowYearConfirm(true);
  } else if (student.year === maxYear) {
    setPendingYearChange({
      student,
      action: 'promote',
      newYear: maxYear,
      oldYear: student.year,
      willGraduate: true
    });
    setShowYearConfirm(true);
  }
};

const demoteStudent = (student) => {
  // If student is graduated, demote back to final year
  if (student.status === 'graduated') {
    const isArchitecture = student.department === "Architecture";
    const maxYear = isArchitecture ? 5 : 4;
    
    setPendingYearChange({
      student,
      action: 'demoteGraduated',
      newYear: maxYear,
      oldYear: 'Graduated',
      willGraduate: false,
      maxYear: maxYear
    });
    setShowYearConfirm(true);
    return;
  }
  
  // Normal demotion for active students
  if (student.year > 1) {
    setPendingYearChange({
      student,
      action: 'demote',
      newYear: student.year - 1,
      oldYear: student.year,
      willGraduate: false
    });
    setShowYearConfirm(true);
  } else {
    alert(`${student.name} is already in Year 1 and cannot be demoted further.`);
  }
};


// Function to execute year change after confirmation
const confirmYearChange = () => {
  if (!pendingYearChange) return;
  
  const { student, action, newYear, oldYear, willGraduate, maxYear } = pendingYearChange;
  const currentYear = new Date().getFullYear();
  
  if (action === 'promote') {
    if (willGraduate) {
      const updatedStudents = students.map(s => 
        s.id === student.id 
          ? { ...s, status: 'graduated', year: newYear, isActive: false, graduatedYear: currentYear }
          : s
      );
      setStudents(updatedStudents);
    } else {
      const updatedStudents = students.map(s => 
        s.id === student.id ? { ...s, year: newYear, isActive: true } : s
      );
      setStudents(updatedStudents);
    }
  } else if (action === 'demote') {
    const updatedStudents = students.map(s => 
      s.id === student.id ? { ...s, year: newYear, isActive: true, status: 'active' } : s
    );
    setStudents(updatedStudents);
  } else if (action === 'demoteGraduated') {
    const updatedStudents = students.map(s => 
      s.id === student.id 
        ? { ...s, status: 'active', year: newYear, isActive: true, graduatedYear: null }
        : s
    );
    setStudents(updatedStudents);
  }
  
  setShowYearConfirm(false);
  setPendingYearChange(null);
};

  // Bulk promotion/demotion confirmation handlers
  const handleHeaderPromote = () => {
    setBulkActionType('promote');
    setShowBulkConfirm(true);
  };

  const handleHeaderDemote = () => {
    setBulkActionType('demote');
    setShowBulkConfirm(true);
  };

  const confirmBulkAction = () => {
  const currentYear = new Date().getFullYear();
  
  if (bulkActionType === 'activate') {
    const updatedStudents = students.map(student => {
      if (selectedStudents.length > 0 && !selectedStudents.includes(student.id)) return student;
      return { ...student, isActive: true };
    });
    setStudents(updatedStudents);
  }
  else if (bulkActionType === 'deactivate') {
    const updatedStudents = students.map(student => {
      if (selectedStudents.length > 0 && !selectedStudents.includes(student.id)) return student;
      return { ...student, isActive: false };
    });
    setStudents(updatedStudents);
  }
  else if (bulkActionType === 'promote') {
    const updatedStudents = students.map(student => {
      if (selectedStudents.length > 0 && !selectedStudents.includes(student.id)) return student;
      if (student.status === 'graduated') return student;
      
      const isArchitecture = student.department === "Architecture";
      const maxYear = isArchitecture ? 5 : 4;
      
      if (student.year < maxYear) {
        return { ...student, year: student.year + 1, isActive: true };
      } else if (student.year === maxYear) {
        return { ...student, status: 'graduated', year: maxYear, isActive: false, graduatedYear: currentYear };
      }
      return student;
    });
    setStudents(updatedStudents);
  }
  else if (bulkActionType === 'demote') {
    const updatedStudents = students.map(student => {
      if (selectedStudents.length > 0 && !selectedStudents.includes(student.id)) return student;
      
      if (student.status === 'graduated') {
        const isArchitecture = student.department === "Architecture";
        const maxYear = isArchitecture ? 5 : 4;
        return { ...student, status: 'active', year: maxYear, isActive: true, graduatedYear: null };
      }
      
      if (student.year > 1) {
        return { ...student, year: student.year - 1, isActive: true, status: 'active' };
      }
      return student;
    });
    setStudents(updatedStudents);
  }
  
  setShowBulkConfirm(false);
  setBulkActionType(null);
  setSelectedStudents([]);
};

  // Handle add new student
  const handleAddStudent = () => {
    const maxId = Math.max(...students.map(s => s.id), 0);
    setStudents([...students, { ...newStudentData, id: maxId + 1, isActive: true }]);
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

  const exportToCSV = useCallback(async () => {
  // Filter only active students
  const activeStudents = filteredStudents.filter(student => 
    student.isActive !== false && student.status !== 'graduated'
  );
  
  if (activeStudents.length === 0) {
    alert('No active students found to export');
    return;
  }
  
  // Prepare data
  const exportData = activeStudents.map(student => ({
    'Student ID': student.studentId,
    'Name': student.name,
    'Email': student.email,
    'Role': student.role || 'student',
    'Department': student.department,
    'Year': student.year,
    'Phone': student.phone,
    'Gender': student.gender,
    'Status': 'Active'
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
  
  // Direct Save As dialog
  if ('showSaveFilePicker' in window) {
    try {
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `active_students_${new Date().toISOString().split('T')[0]}.csv`,
        types: [{
          description: 'CSV File',
          accept: { 'text/csv': ['.csv'] }
        }]
      });
      
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
      
      // Show subtle feedback
      const notification = document.createElement('div');
      notification.textContent = `✅ Exported ${activeStudents.length} students`;
      notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-fade-in';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 2000);
    } catch (err) {
      if (err.name !== 'AbortError') {
        fallbackDownload(blob);
      }
    }
  } else {
    fallbackDownload(blob);
  }
}, [filteredStudents]);

// Fallback download function (no filename parameter needed)
const fallbackDownload = (blob) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `active_students_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  const notification = document.createElement('div');
  notification.textContent = `Exported to Downloads folder`;
  notification.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm animate-fade-in';
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 2000);
};

  // Import CSV functions
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      previewCSV(file);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const previewCSV = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = parseCSV(text);
      setImportPreview(parsedData.slice(0, 5));
    };
    reader.readAsText(file);
  };

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFilename, setExportFilename] = useState('');


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

  const checkForDuplicates = (newStudents, existingStudents) => {
  const duplicates = [];
  const uniqueStudents = [];
  
  // Create a Set for quick lookup of existing student IDs
  const existingStudentIds = new Set(existingStudents.map(s => s.studentId));
  
  for (const newStudent of newStudents) {
    if (existingStudentIds.has(newStudent.studentId)) {
      duplicates.push(newStudent);
    } else {
      uniqueStudents.push(newStudent);
    }
  }
  
  return { duplicates, uniqueStudents };
};

const isDuplicateInPreview = (studentId) => {
  return students.some(s => s.studentId === studentId);
};

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
    
    // Check for duplicates using Student ID
    const { duplicates, uniqueStudents } = checkForDuplicates(newStudents, students);
    
    if (duplicates.length > 0) {
      // Store duplicate info and show modal instead of confirm()
      setDuplicateData({
        duplicates,
        uniqueStudents,
        duplicateCount: duplicates.length,
        uniqueCount: uniqueStudents.length
      });
      setShowDuplicateConfirm(true);
      setImporting(false);
      return;
    }
    
    if (uniqueStudents.length === 0) {
      setImporting(false);
      setShowImportModal(false);
      setCsvFile(null);
      setImportPreview([]);
      return;
    }
    
    proceedWithImport(uniqueStudents);
  };
  
  reader.onerror = () => {
    alert('Error reading file');
    setImporting(false);
  };
  
  reader.readAsText(csvFile);
};

// Separate function to proceed with import
const proceedWithImport = (uniqueStudents) => {
  if (uniqueStudents.length === 0) {
    alert('No new students to import. All records already exist.');
    setShowImportModal(false);
    setCsvFile(null);
    setImportPreview([]);
    setShowDuplicateConfirm(false);
    setDuplicateData(null);
    setImporting(false);
    return;
  }

  const maxId = Math.max(...students.map(s => s.id), 0);
  const studentsWithIds = uniqueStudents.map((student, index) => ({
    ...student,
    id: maxId + index + 1,
    isActive: true
  }));
  
  setStudents([...students, ...studentsWithIds]);
  setShowImportModal(false);
  setCsvFile(null);
  setImportPreview([]);
  setShowDuplicateConfirm(false);
  setDuplicateData(null);
  setImporting(false);
};
  
  // Render editable cell
  const renderEditableCell = (student, field, displayValue) => {
    const isEditing = editingCell.id === student.id && editingCell.field === field;
    
    if (isEditing) {
      return (
        <input
          type="text"
          value={editingCell.value}
          onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
          onBlur={() => saveEdit(student.id, field, editingCell.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              saveEdit(student.id, field, editingCell.value);
            }
          }}
          className="w-full px-1 py-0.5 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      );
    }
    
    return (
      <div 
        className="cursor-text hover:bg-gray-100 px-1 py-0.5 rounded transition-colors truncate"
        onDoubleClick={() => startEdit(student.id, field, displayValue)}
        title={displayValue}
      >
        {displayValue}
      </div>
    );
  };

  // Toggle gender
  const toggleGender = (student) => {
    const newGender = student.gender === "Male" ? "Female" : "Male";
    const updatedStudents = students.map(s =>
      s.id === student.id ? { ...s, gender: newGender } : s
    );
    setStudents(updatedStudents);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Management System</h1>
          <p className="text-gray-500 text-sm mt-1">Double-click any cell to edit | Select checkboxes for bulk actions</p>
        </div>

        {/* Filters and Actions Bar */}
        <div className="bg-white rounded-lg text-black shadow-sm p-3 mb-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-3 items-center">
              {/* Department Filter */}
              <div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="border border-gray-300 cursor-pointer rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              {/* Year Filter */}
              <div>
            <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-gray-300 cursor-pointer rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {getYearsForDepartment(selectedDepartment).map(year => (
                <option key={year} value={year}>{year}</option>
                ))}
            </select>
            </div>

              {/* Search */}
              <div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

                  {/* Student Count Display */}
              <div className="flex items-center gap-2 ml-2">
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-cstcolor">{filteredStudents.length}</span>
                <span className="text-gray-400"> / </span>
                <span className="font-semibold text-gray-900">{students.length}</span>
                <span className="ml-1 text-gray-400">students</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setShowImportModal(true)} className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3  transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Import
              </button>

              <button 
              onClick={exportToCSV} 
              className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3 transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export
            </button>

              {selectedStudents.length > 0 && (
                <button onClick={handleDeleteSelected} className="cursor-pointer bg-red-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Delete ({selectedStudents.length})
                </button>
              )}
              
              <button onClick={() => setShowAddModal(true)} className="cursor-pointer bg-cstcolor text-white px-3 py-1.5 rounded-lg text-sm hover:bg-cstcolor3 transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-auto divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <span>Year</span>
                      <div className="flex flex-col">
                        <button
                          onClick={handleHeaderPromote}
                          className="text-green-600 hover:text-green-800 text-xs cursor-pointer leading-3"
                          title="Promote all/selected students"
                        >
                          ▲
                        </button>
                        <button
                          onClick={handleHeaderDemote}
                          className="text-red-600 hover:text-red-800 text-xs cursor-pointer leading-3"
                          title="Demote all/selected students"
                        >
                          ▼
                        </button>
                      </div>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedStudents.length > 0 ? (
                        <div className="flex items-center gap-1">
                        <button
                            onClick={handleBulkActivate}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                        >
                            Activate
                        </button>
                        <button
                            onClick={handleBulkDeactivate}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                            Deactivate
                        </button>
                        </div>
                    ) : (
                        <span>Status</span>
                    )}
                    </th>
                    </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, index) => (
                  <tr key={student.id} className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedStudents.includes(student.id) ? 'bg-blue-50' : ''
                }`}
                onClick={(e) => handleRowClick(e, student, index)}
            >
                    <td className="px-2 py-2">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 py-2 text-sm font-medium text-gray-900 max-w-[100px]">
                      {renderEditableCell(student, 'studentId', student.studentId)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700 max-w-[120px]">
                      {renderEditableCell(student, 'name', student.name)}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500 max-w-[150px]">
                      {renderEditableCell(student, 'email', student.email)}
                    </td>

                    <td className="px-2 py-2 text-sm text-gray-700 max-w-[100px]">
                    <select
                        value={student.role || "student"}
                        onChange={(e) => {
                        const newRole = e.target.value;
                        if (newRole === student.role) return;
                        setPendingRoleChange({ student, newRole });
                        setShowRoleConfirm(true);
                        }}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full truncate focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        {roleOptions.map(role => (
                        <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                        ))}
                    </select>
                    </td>

                    <td className="px-2 py-2 text-sm text-gray-700 max-w-[130px]">
                    <select
                        value={student.department}
                        onChange={(e) => {
                        const newDepartment = e.target.value;
                        if (newDepartment === student.department) return;
                        setPendingDepartmentChange({ student, newDepartment });
                        setShowDepartmentConfirm(true);
                        }}
                        className="border border-gray-300 rounded px-1 py-0.5 text-xs w-full truncate focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                    >
                        {departments.filter(d => d !== "All").map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                        ))}
                    </select>
                    </td>

                    <td className="px-2 py-2 text-sm text-gray-700 whitespace-nowrap">
                      {student.status === 'graduated' ? (
                        <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 whitespace-nowrap">
                          Graduated
                        </span>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                            {student.year}
                          </span>
                          <div className="flex flex-col">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                promoteStudent(student);
                              }}
                              className="text-green-600 hover:text-green-800 text-xs cursor-pointer leading-3"
                              title="Promote to next year"
                            >
                              ▲
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                demoteStudent(student);
                              }}
                              className="text-red-600 hover:text-red-800 text-xs cursor-pointer leading-3"
                              title="Demote to previous year"
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-700 max-w-[100px]">
                      {renderEditableCell(student, 'phone', student.phone)}
                    </td>
                    <td className="px-2 py-2">
                    <button
                        onClick={(e) => {
                        e.stopPropagation();
                        const newGender = student.gender === "Male" ? "Female" : "Male";
                        setPendingGenderChange({ student, newGender });
                        setShowGenderConfirm(true);
                        }}
                        className={`px-1.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        student.gender === "Male" 
                            ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                            : "bg-pink-100 text-pink-800 hover:bg-pink-200"
                        }`}
                    >
                        {student.gender === "Male" ? "Male" : "Female"}
                    </button>
                    </td>
                    <td className="px-2 py-2">
                    <button
                    onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = student.isActive !== false ? false : true;
                    setPendingStatusChange({ student, newStatus });
                    setShowStatusConfirm(true);
                    }}
                    className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors cursor-pointer ${
                    student.isActive !== false ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    title={student.isActive !== false ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                >
                    <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        student.isActive !== false ? 'translate-x-4' : 'translate-x-1'
                    }`}
                    />
                </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredStudents.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No students found matching the filters</p>
            </div>
          )}
        </div>

        {/* Bulk Action Confirmation Modal - Blue Theme */}
        {showBulkConfirm && (
        <div className="fixed inset-0 bg-gray bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">
                {bulkActionType === 'activate' ? 'Bulk Activate' : 
                bulkActionType === 'deactivate' ? 'Bulk Deactivate' :
                bulkActionType === 'promote' ? 'Bulk Promote' : 'Bulk Demote'}
                </h2>
                <p className="text-blue-100 text-sm mt-1">
                Confirm {bulkActionType === 'activate' ? 'activation' : 
                            bulkActionType === 'deactivate' ? 'deactivation' :
                            bulkActionType === 'promote' ? 'promotion' : 'demotion'} for selected students
                </p>
            </div>
            
            <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                    You are about to <strong>
                    {bulkActionType === 'activate' ? 'activate' : 
                    bulkActionType === 'deactivate' ? 'deactivate' :
                    bulkActionType === 'promote' ? 'promote' : 'demote'}
                    </strong>:
                </p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                    {selectedStudents.length > 0 ? selectedStudents.length : filteredStudents.length} students
                </p>
                </div>

                <div className="flex gap-3 justify-end">
                <button 
                    onClick={() => {
                    setShowBulkConfirm(false);
                    setBulkActionType(null);
                    }} 
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 cursor-pointer"
                >
                    Cancel
                </button>
                <button 
                    onClick={confirmBulkAction} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 cursor-pointer"
                >
                    Confirm
                </button>
                </div>
            </div>
            </div>
        </div>
        )}

        {/* Save Confirmation Modal - Blue Theme */}
        {showSaveConfirm && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="bg-blue-600 rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Save Changes</h2>
                <p className="text-blue-100 text-sm mt-1">Confirm your edit</p>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">Are you sure you want to save this change?</p>
                  {pendingEdit && (
                    <p className="text-sm text-gray-600 mt-2">
                      Changing <strong>{pendingEdit.field}</strong> from "{pendingEdit.originalValue}" to "{pendingEdit.newValue}"
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => {
                    setShowSaveConfirm(false);
                    setPendingEdit(null);
                    setEditingCell({ id: null, field: null, value: "" });
                  }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors cursor-pointer">Cancel</button>
                  <button onClick={confirmEdit} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer">Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Student Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md">
              <div className="bg-cstcolor rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Add New Student</h2>
                <p className="text-blue-100 text-sm mt-1">Enter student details</p>
              </div>
              
              <div className="p-6">
                <div className="text-black space-y-3">
                  <input type="text-black" value={newStudentData.name} onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })} placeholder="Full Name" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="text" value={newStudentData.studentId} onChange={(e) => setNewStudentData({ ...newStudentData, studentId: e.target.value })} placeholder="Student ID" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <input type="email" value={newStudentData.email} onChange={(e) => setNewStudentData({ ...newStudentData, email: e.target.value })} placeholder="Email" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <select value={newStudentData.department} onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {departments.filter(d => d !== "All").map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                  </select>
                  <select value={newStudentData.year} onChange={(e) => setNewStudentData({ ...newStudentData, year: parseInt(e.target.value) })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    {[1, 2, 3, 4, 5].map(year => (<option key={year} value={year}>Year {year}</option>))}
                  </select>
                  <input type="text" value={newStudentData.phone} onChange={(e) => setNewStudentData({ ...newStudentData, phone: e.target.value })} placeholder="Phone" className="w-full border rounded-lg px-3 py-2 text-sm" />
                  <select value={newStudentData.gender} onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })} className="w-full border rounded-lg px-3 py-2 text-sm">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                  <button onClick={() => setShowAddModal(false)} className="text-black px-4 py-2 border rounded-lg text-sm">Cancel</button>
                  <button onClick={handleAddStudent} className="px-4 py-2 bg-cstcolor text-white rounded-lg text-sm">Add Student</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Import CSV Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-grey bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="bg-cstcolor rounded-t-2xl px-6 py-4">
                <h2 className="text-xl font-semibold text-white">Import Students</h2>
                <p className="text-blue-100 text-sm mt-1">Import student data from CSV file</p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload CSV File
                    <span className="text-xs text-gray-400 ml-2">(.csv only)</span>
                </label>
                <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 hover:bg-white hover:border-cstcolor transition-all">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 5h18a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm text-gray-600 truncate flex-1">
                        {csvFile ? csvFile.name : 'Choose CSV file...'}
                        </span>
                    </div>
                    <input type="file" accept=".csv" onChange={handleFileSelect} className="hidden" />
                    </label>
                    {csvFile && (
                    <button
                        onClick={() => { setCsvFile(null); setImportPreview([]); }}
                        className="px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        Remove
                    </button>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                    File should include: Name, Student ID, Email, Department, Year, Phone, Gender
                </p>
                </div>

                    {importPreview.length > 0 && (
    <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Preview (first 5 rows):</h3>
        <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
            <tr>
                <th className="border-b px-3 py-2 text-left">Status</th>
                <th className="border-b px-3 py-2 text-left">Name</th>
                <th className="border-b px-3 py-2 text-left">Student ID</th>
                <th className="border-b px-3 py-2 text-left">Email</th>
                <th className="border-b px-3 py-2 text-left">Department</th>
                <th className="border-b px-3 py-2 text-left">Year</th>
            </tr>
            </thead>
            <tbody>
            {importPreview.map((student, idx) => {
                const isDuplicate = isDuplicateInPreview(student.studentId);
                return (
                <tr key={idx} className={isDuplicate ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="border-b px-3 py-2">
                    {isDuplicate ? (
                        <span className="inline-flex items-center gap-1 text-red-600 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Duplicate
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        New
                        </span>
                  )}
                </td>
                <td className="border-b px-3 py-2">{student.name}</td>
                <td className="border-b px-3 py-2 font-mono text-xs">{student.studentId}</td>
                <td className="border-b px-3 py-2 text-xs">{student.email}</td>
                <td className="border-b px-3 py-2">{student.department}</td>
                <td className="border-b px-3 py-2">{student.year}</td>
              </tr>
            );
          })}
        </tbody>
        </table>
        </div>
        {importPreview.some(s => isDuplicateInPreview(s.studentId)) && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
            Some records in this preview already exist (duplicate Student IDs). They will be skipped during import.
            </p>
        </div>
        )}
    </div>
                  )}

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800"><strong>Note:</strong> Imported students will be added to the existing list.</p>
                  </div>
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button onClick={() => { setShowImportModal(false); setCsvFile(null); setImportPreview([]); }} className="cursor-pointer text-black px-4 py-2 border rounded-lg text-sm">Cancel</button>
                  <button onClick={importCSV} disabled={!csvFile || importing} className="cursor-pointer hover:bg-cstcolor3 px-4 py-2 bg-cstcolor text-white rounded-lg text-sm disabled:opacity-50">{importing ? "Importing..." : "Import Students"}</button>
                </div>
              </div>
            </div>
          </div>
        )}

                {/* Bulk Action Confirmation Modal */}
        <ConfirmationModal
          isOpen={showBulkConfirm}
          onClose={() => {
            setShowBulkConfirm(false);
            setBulkActionType(null);
          }}
          onConfirm={confirmBulkAction}
          title={bulkActionType === 'activate' ? 'Bulk Activate' : 
                 bulkActionType === 'deactivate' ? 'Bulk Deactivate' :
                 bulkActionType === 'promote' ? 'Bulk Promote' : 'Bulk Demote'}
          message={`You are about to ${bulkActionType === 'activate' ? 'activate' : 
                                         bulkActionType === 'deactivate' ? 'deactivate' :
                                         bulkActionType === 'promote' ? 'promote' : 'demote'} 
                                         ${selectedStudents.length > 0 ? selectedStudents.length : filteredStudents.length} student(s).`}
        />

        {/* Save Confirmation Modal */}
        <ConfirmationModal
          isOpen={showSaveConfirm}
          onClose={() => {
            setShowSaveConfirm(false);
            setPendingEdit(null);
            setEditingCell({ id: null, field: null, value: "" });
          }}
          onConfirm={confirmEdit}
          title="Save Changes"
          message="Are you sure you want to save this change?"
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Confirm Delete"
          message={`Are you sure you want to delete ${selectedStudents.length} student(s)?`}
          confirmText="Delete"
          actionType="danger"
        />

        {/* Status Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showStatusConfirm}
          onClose={() => {
            setShowStatusConfirm(false);
            setPendingStatusChange(null);
          }}
          onConfirm={() => {
            if (pendingStatusChange) {
              const updatedStudents = students.map(s =>
                s.id === pendingStatusChange.student.id ? { ...s, isActive: pendingStatusChange.newStatus } : s
              );
              setStudents(updatedStudents);
            }
            setShowStatusConfirm(false);
            setPendingStatusChange(null);
          }}
          title="Change Status"
          message={`Change status for ${pendingStatusChange?.student?.name} from ${pendingStatusChange?.student?.isActive !== false ? 'Active' : 'Inactive'} to ${pendingStatusChange?.newStatus ? 'Active' : 'Inactive'}?`}
        />

        {/* Department Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDepartmentConfirm}
          onClose={() => {
            setShowDepartmentConfirm(false);
            setPendingDepartmentChange(null);
          }}
          onConfirm={() => {
            if (pendingDepartmentChange) {
              const updatedStudents = students.map(s =>
                s.id === pendingDepartmentChange.student.id ? { ...s, department: pendingDepartmentChange.newDepartment } : s
              );
              setStudents(updatedStudents);
            }
            setShowDepartmentConfirm(false);
            setPendingDepartmentChange(null);
          }}
          title="Change Department"
          message={`Change department for ${pendingDepartmentChange?.student?.name} from ${pendingDepartmentChange?.student?.department} to ${pendingDepartmentChange?.newDepartment}?`}
        />

        {/* Gender Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showGenderConfirm}
          onClose={() => {
            setShowGenderConfirm(false);
            setPendingGenderChange(null);
          }}
          onConfirm={() => {
            if (pendingGenderChange) {
              const updatedStudents = students.map(s =>
                s.id === pendingGenderChange.student.id ? { ...s, gender: pendingGenderChange.newGender } : s
              );
              setStudents(updatedStudents);
            }
            setShowGenderConfirm(false);
            setPendingGenderChange(null);
          }}
          title="Change Gender"
          message={`Change gender for ${pendingGenderChange?.student?.name} from ${pendingGenderChange?.student?.gender} to ${pendingGenderChange?.newGender}?`}
        />

        {/* Year Change Confirmation Modal */}
        <ConfirmationModal
          isOpen={showYearConfirm}
          onClose={() => {
            setShowYearConfirm(false);
            setPendingYearChange(null);
          }}
          onConfirm={confirmYearChange}
          title={pendingYearChange?.action === 'promote' ? 'Promote Student' : 
                 pendingYearChange?.action === 'demote' ? 'Demote Student' : 'Reactivate Student'}
          message={pendingYearChange?.action === 'promote' ? 
                   `${pendingYearChange?.student?.name} from Year ${pendingYearChange?.oldYear} to Year ${pendingYearChange?.newYear}` :
                   pendingYearChange?.action === 'demote' ?
                   `${pendingYearChange?.student?.name} from Year ${pendingYearChange?.oldYear} to Year ${pendingYearChange?.newYear}` :
                   `${pendingYearChange?.student?.name} from Graduated to Year ${pendingYearChange?.newYear}`}
        />

        <ConfirmationModal
        isOpen={showDuplicateConfirm}
        onClose={() => {
            setShowDuplicateConfirm(false);
            setDuplicateData(null);
            setImporting(false);
        }}
        onConfirm={() => {
            if (duplicateData) {
            proceedWithImport(duplicateData.uniqueStudents);
            }
        }}
        title="Duplicate Records Found"
        message={`Found ${duplicateData?.duplicateCount} duplicate(s) by Student ID. Continue importing ${duplicateData?.uniqueCount} new student(s)?`}
        confirmText="Continue Import"
        cancelText="Cancel"
        />

        <ConfirmationModal
        isOpen={showRoleConfirm}
        onClose={() => {
            setShowRoleConfirm(false);
            setPendingRoleChange(null);
        }}
        onConfirm={() => {
            if (pendingRoleChange) {
            const updatedStudents = students.map(s =>
                s.id === pendingRoleChange.student.id ? { ...s, role: pendingRoleChange.newRole } : s
            );
            setStudents(updatedStudents);
            }
            setShowRoleConfirm(false);
            setPendingRoleChange(null);
        }}
        title="Change Role"
        message={`Change role for ${pendingRoleChange?.student?.name} from ${pendingRoleChange?.student?.role || 'student'} to ${pendingRoleChange?.newRole}?`}
        />

      </div>
    </div>
  );
};