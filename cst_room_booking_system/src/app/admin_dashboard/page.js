import BookingInfo from "./homepage/booking_info";
import HostelGrid from "./homepage/hostel_grid";
import Navbar from "./navbar/navbar";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 space-y-10">
      <Navbar />
      <BookingInfo />
      <HostelGrid />
    </div>
  );
}