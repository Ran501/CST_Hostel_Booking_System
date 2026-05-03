import BookingInfo from "./homepage/booking_info";
import Navbar from "./navbar/navbar";
import RecentBookings from "./homepage/recent_booking";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 space-y-10">
      <Navbar />
      <BookingInfo />
      <RecentBookings />
    </div>
  );
}