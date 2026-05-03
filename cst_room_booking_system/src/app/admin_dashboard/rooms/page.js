"use client";

import RoomManagement from "./components/room_model"; // adjust path if needed
import Navbar from "../navbar/navbar";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <RoomManagement />
    </div>
  );
}
