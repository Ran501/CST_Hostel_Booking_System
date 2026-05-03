"use client";

import HostelPage from "./components/hostel_page"; // adjust path if needed
import Navbar from "../navbar/navbar";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <HostelPage />
    </div>
  );
}
