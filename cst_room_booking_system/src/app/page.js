"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import HomeContent to avoid SSR issues
const HomeContent = dynamic(() => import("./components/HomeContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function HomePage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const session = localStorage.getItem("session");
      if (session) {
        // Try to parse to validate it's valid JSON
        const parsed = JSON.parse(session);
        // Ensure it's an object with expected properties
        if (typeof parsed === 'object' && parsed !== null) {
          setIsAuthenticated(true);
        } else {
          throw new Error("Invalid session format");
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Invalid session data:", error);
      localStorage.removeItem("session");
      router.push("/login");
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <HomeContent />;
}
