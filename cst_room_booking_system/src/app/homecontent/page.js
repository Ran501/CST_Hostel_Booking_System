"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const HomeContent = dynamic(() => import("../components/HomeContent"), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  ),
});

export default function HomeContentPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any corrupted session before loading
    try {
      const session = localStorage.getItem("session");
      if (session) {
        JSON.parse(session); // Validate JSON
      }
    } catch (error) {
      console.error("Clearing corrupted session:", error);
      localStorage.removeItem("session");
      router.push("/login");
    }
  }, [router]);

  return <HomeContent />;
}
