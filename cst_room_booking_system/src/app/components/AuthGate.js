// components/AuthGate.js
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import LoginModal from "../login/page";

export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Check authentication
  useEffect(() => {
    setMounted(true);

    let cancelled = false;

    const verify = async () => {
      try {
        const raw = localStorage.getItem("session");
        if (!raw) {
          if (!cancelled) {
            setAuthenticated(false);
            setShowLogin(true);
          }
          return;
        }

        const parsed = JSON.parse(raw);
        const studentNumber = parsed?.studentNumber?.toString().trim();
        if (!studentNumber) {
          localStorage.removeItem("session");
          if (!cancelled) {
            setAuthenticated(false);
            setShowLogin(true);
          }
          return;
        }

        const res = await fetch("/api/session/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ studentNumber }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success) {
          localStorage.removeItem("session");
          if (!cancelled) {
            setAuthenticated(false);
            setShowLogin(true);
          }
          return;
        }

        const user = data.user;
        const refreshed = JSON.stringify({
          studentNumber: user.studentNumber,
          phoneNumber: user.phoneNumber,
          name: user.name,
          email: user.email,
          gender: user.gender,
          role: user.role,
          timestamp: Date.now(),
        });
        localStorage.setItem("session", refreshed);

        if (!cancelled) {
          setAuthenticated(true);
          setShowLogin(false);
        }
      } catch {
        localStorage.removeItem("session");
        if (!cancelled) {
          setAuthenticated(false);
          setShowLogin(true);
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!mounted || !authenticated) return;

    try {
      const raw = localStorage.getItem("session");
      if (!raw) return;

      const parsed = JSON.parse(raw);
      const role = parsed?.role;
      const isAdmin = role === "admin";
      const inAdminArea = pathname.startsWith("/admin_dashboard");

      if (inAdminArea && !isAdmin) {
        router.replace("/");
        return;
      }

      if (!inAdminArea && isAdmin) {
        router.replace("/admin_dashboard");
      }
    } catch {
      // If parsing fails, don't redirect here; initial verify effect will handle invalid sessions.
    }
  }, [authenticated, mounted, pathname, router]);

  const handleLoginSuccess = (studentNumber) => {
    // Re-check auth from localStorage
    try {
      const raw = localStorage.getItem("session");
      if (raw) {
        const parsed = JSON.parse(raw);
        const storedStudentNumber = parsed?.studentNumber?.toString() ?? String(parsed?.studentNumber ?? "");
        const incomingStudentNumber = studentNumber?.toString() ?? String(studentNumber ?? "");
        if (storedStudentNumber.trim() === incomingStudentNumber.trim()) {
          setAuthenticated(true);
          setShowLogin(false);

          const role = parsed?.role;
          const isAdmin = role === "admin";
          const inAdminArea = pathname.startsWith("/admin_dashboard");
          if (inAdminArea && !isAdmin) {
            router.replace("/");
          } else if (!inAdminArea && isAdmin) {
            router.replace("/admin_dashboard");
          }
        }
      }
    } catch {
      // If error, stay unauthenticated
      setAuthenticated(false);
      setShowLogin(true);
    }
  };

  const handleCancelLogin = () => {
    // Clear any session and keep user on login
    localStorage.removeItem("session");
    setAuthenticated(false);
    setShowLogin(true);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show ONLY login modal
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <LoginModal
          open={showLogin}
          onClose={handleCancelLogin}
          onSuccess={handleLoginSuccess}
        />
      </div>
    );
  }

  // If authenticated, show the children (CampusMap)
  return <>{children}</>;
}