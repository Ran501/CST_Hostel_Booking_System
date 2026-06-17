"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Read session from localStorage
    const raw = localStorage.getItem("session");

    if (!raw) {
      router.replace("/login");
      return;
    }

    try {
      const session = JSON.parse(raw);

      // Check if user has admin or counselor role
      if (session?.role !== "admin" && session?.role !== "counselor") {
        router.replace("/homecontent");
        return;
      }

      // User is authorized
      setIsLoading(false);
    } catch {
      // Invalid session data
      router.replace("/login");
    }
  }, [router]);

  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}