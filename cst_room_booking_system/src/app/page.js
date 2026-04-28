"use client"; // required for hooks in Next.js App Router

import { useRouter } from "next/navigation";

export default function GlobalPage() {
  const router = useRouter();

  const goToAdmin = () => {
    router.push("/admin_dashboard"); // navigates to Admin Dashboard
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-3xl font-bold">Welcome to the Global Page</h1>
        <p className="text-gray-600">
          Navigate to the Admin Dashboard to manage bookings and hostels.
        </p>
        <button
          onClick={goToAdmin}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go to Admin Dashboard
        </button>
      </div>
    </main>
  );
}
