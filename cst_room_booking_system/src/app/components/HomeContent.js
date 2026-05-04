// src/app/components/HomeContent.js
"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
// Remove this line: import AuthGate from "./AuthGate";
import { useRouter } from 'next/navigation';

const CampusMap = dynamic(() => import("./CampusMap"), { ssr: false });

export default function HomeContent() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userGender, setUserGender] = useState("");
  const [forceReauth, setForceReauth] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get user info from localStorage or set default demo user
    try {
      const session = localStorage.getItem("session");
      if (session) {
        const parsed = JSON.parse(session);
        setUserName(parsed.name || parsed.phoneNumber || "Demo User");
        setUserEmail(parsed.email || "");
        setUserGender(parsed.gender || "");
      } else {
        // Redirect to login if no session
        router.push("/login");
      }
    } catch (error) {
      console.error("Error loading user session:", error);
      // Clear invalid session and redirect to login
      localStorage.removeItem("session");
      router.push("/login");
    }
  }, [router]);

  const normalizedGender = userGender?.toString?.().trim().toLowerCase();
  const avatarSrc =
    normalizedGender === "female"
      ? "/woman2.png"
      : normalizedGender === "male"
        ? "/man2.png"
        : "";

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem("session");
    setShowProfileMenu(false);
    // Trigger re-authentication
    setForceReauth(true);
    // Reload to reset
    window.location.reload();
  };

  return (
    <main className="min-h-screen w-full bg-slate-50">
      {/* Top Navbar - keep your existing navbar code */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          {/* Left: CST Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Image
              src="/cstlogo.png"
              alt="CST"
              width={55}
              height={55}
              className="rounded-full w-10 h-10 sm:w-12 sm:h-12"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/55?text=CST";
              }}
            />
          </div>

          {/* Center: Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-center text-base font-semibold text-gray-900 leading-tight sm:text-lg md:text-xl lg:text-2xl">
              AFM Room Booking System
            </h1>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 transition-colors cursor-pointer sm:p-2"
              >
                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-cstcolor overflow-hidden">
                  {avatarSrc ? (
                    <img
                      src={avatarSrc}
                      alt="User Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-white sm:text-sm">
                      {userName ? userName.charAt(0).toUpperCase() : "D"}
                    </span>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Dropdown Menu */}
          {showProfileMenu && (
            <>
              <div
                className="cursor-pointer fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-2 top-[calc(100%+8px)] z-50 w-56 sm:w-64 rounded-xl border border-gray-200 bg-white shadow-2xl sm:right-4 sm:top-[calc(100%+12px)]">
                <div className="border-b border-gray-200 px-4 py-3 bg-gray-50 rounded-t-xl">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cstcolor overflow-hidden">
                      {avatarSrc ? (
                        <img
                          src={avatarSrc}
                          alt="User Avatar"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-white">
                          {userName ? userName.charAt(0).toUpperCase() : "D"}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {userName}
                      </p>
                      {userEmail && (
                        <p className="truncate text-xs text-gray-500">{userEmail}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="py-2 divide-y divide-gray-100">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/help');
                    }}
                    className="cursor-pointer flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-cstcolor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    <span>Help & Support</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      router.push('/manual');
                    }}
                    className="cursor-pointer flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-blue-50 hover:text-cstcolor"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      <path d="M9 9h6" />
                      <path d="M9 13h6" />
                      <path d="M9 17h2" />
                    </svg>
                    <span>User Manual</span>
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="cursor-pointer flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="relative overflow-hidden rounded-t-2xl bg-cstcolor h-24">
                  <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.9) 60%, transparent 61%), radial-gradient(2px 2px at 70% 20%, rgba(255,255,255,0.8) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.7) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.75) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.7) 60%, transparent 61%)" }} />
                </div>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 h-16 w-16 flex items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-cstcolor shadow-md">
                    <svg width="24" height="24" viewBox="0 0 24 24" className="fill-current" aria-hidden="true">
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 17c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25S12.69 19 12 19zm2.07-7.75c-.9.64-1.32 1.14-1.32 2.25h-1.5c0-1.59.63-2.41 1.74-3.2.86-.61 1.26-1.02 1.26-1.8 0-1.07-.88-1.8-2.01-1.8-1.11 0-1.92.63-2.14 1.62l-1.47-.33c.36-1.64 1.8-2.79 3.61-2.79 2.07 0 3.54 1.29 3.54 3.18 0 1.34-.73 2.14-1.71 2.87z" />
                    </svg>
                  </div>
                </div>
                <div className="px-6 pt-14 pb-6">
                  <h2 className="text-center text-lg font-semibold text-gray-900">Confirmation</h2>
                  <p className="mt-2 text-center text-sm text-gray-600">Are you sure you want to log out of your account?</p>
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button onClick={handleLogout} className="inline-flex w-full sm:w-auto h-10 items-center justify-center rounded-md bg-cstcolor px-5 text-sm font-medium text-white shadow-sm hover:bg-cstcolor-700 cursor-pointer">Yes</button>
                    <button onClick={() => setShowLogoutConfirm(false)} className="inline-flex w-full sm:w-auto h-10 items-center justify-center rounded-md border border-cstcolor bg-white px-5 text-sm font-medium text-cstcolor hover:bg-blue-50 cursor-pointer">No</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content under navbar - REMOVED AuthGate */}
      <div className="h-[calc(100vh-60px)] min-h-125 sm:h-[calc(100vh-68px)] md:h-[calc(100vh-76px)]">
        <CampusMap />
      </div>
    </main>
  );
}