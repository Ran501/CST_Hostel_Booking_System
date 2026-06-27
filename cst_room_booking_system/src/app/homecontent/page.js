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
    try {
      const raw = localStorage.getItem("session");
      if (!raw) {
        router.push("/login");
        return;
      }
      const parsed = JSON.parse(raw);
      // Admin/counselor should never land here
      if (parsed.role === "admin" || parsed.role === "counselor") {
        router.push("/admin_dashboard");
      }
    } catch (error) {
      console.error("Clearing corrupted session:", error);
      localStorage.removeItem("session");
      router.push("/login");
    }
  }, [router]);

  return <HomeContent />;
}
