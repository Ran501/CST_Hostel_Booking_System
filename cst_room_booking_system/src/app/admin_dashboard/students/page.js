// src/app/admin_dashboard/students/page.js
"use client";

import StudentManagement from "./components/student_model";
import Navbar from "../navbar/navbar";

export default function AdminStudentsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-4 sm:p-6 pt-24">
        <StudentManagement/>
      </div>
    </div>
  );
}