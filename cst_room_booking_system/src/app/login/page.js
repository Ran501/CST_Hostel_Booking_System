// components/LoginModal.js
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginModal({ open = true, onClose, onSuccess }) {
  const [studentNumber, setStudentNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const activated = searchParams.get("activated");
  const passwordSet = searchParams.get("passwordSet");

  const handleActivateAccount = () => {
    router.push("/activate");
  };

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setPassword("");
      setError(null);
      setStudentNumber("");
    }
  }, [open]);

  // Show toast messages after activation or password setup
  useEffect(() => {
    if (activated === "true") {
      toast.success("Account activated successfully! You can now login.");
    }
    if (passwordSet === "true") {
      toast.success("Password set successfully! Please login with your new password.");
    }
  }, [activated, passwordSet]);

  const disabled = loading || studentNumber.trim().length === 0 || password.trim().length === 0;

  const handleCancel = () => {
    localStorage.removeItem("session");
    if (onClose) onClose();
    window.location.href = "https://afm.rub.edu.bt/logistics/";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const studentNum = studentNumber.trim();

      if (!studentNum) {
        setError("Student number is required");
        setLoading(false);
        setTimeout(() => setError(null), 3000);
        return;
      }

      const body = { studentNumber: studentNum, password: password.trim() };

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => null);

      if (data?.requiresPasswordSetup) {
        router.push(`/set-password?studentNumber=${studentNum}`);
        setLoading(false);
        return;
      }

      if (data?.requiresActivation) {
        setError("Account not activated. Please activate your account first.");
        setLoading(false);
        setTimeout(() => setError(null), 4000);
        return;
      }

      if (!res.ok || !data?.success) {
        setError(data?.error || "Login failed");
        setLoading(false);
        setTimeout(() => setError(null), 4000);
        return;
      }

      const user = data.user;

      //  Save the FULL user object (including counselor relation)
      localStorage.setItem("session", JSON.stringify(user));

      // Notify AuthGate of successful login
      if (onSuccess) {
        onSuccess(user.studentNumber?.toString?.() ?? String(user.studentNumber));
      }

      // Redirect admins and counselors to admin_dashboard
      if (user.role === "admin" || user.role === "counselor") {
        router.push("/admin_dashboard");
        return;
      }

      // Regular users → homecontent
      router.push("/homecontent");
    } catch {
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  // Don't render if not open
  if (!open) return null;

  // ─── Render UI ──────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background images – unchanged */}
      <div className="absolute inset-0">
        <div className="block md:hidden absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="hidden md:block lg:hidden absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="hidden lg:block absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
      </div>

      {/* Back button – unchanged */}
      <button
        onClick={handleCancel}
        className="cursor-pointer absolute left-4 top-4 md:left-6 md:top-6 z-20 text-white hover:text-gray-200 transition-colors group"
        aria-label="Go back"
      >
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <svg
            className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm md:text-base font-medium">Back</span>
        </div>
      </button>

      {/* Main content – unchanged */}
      <div className="relative z-10 w-full max-w-6xl px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center min-h-screen">
          {/* Branding – unchanged */}
          <div className="hidden md:flex md:w-1/2 lg:w-2/3 items-center justify-center p-8 lg:pr-16">
            <div className="max-w-lg text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4">
                CST <span className="text-cstcolor3">ROOM</span> BOOKING{" "}
                <span className="text-cstcolor3">SYSTEM</span>
              </h1>
              <p className="text-2xl lg:text-3xl font-light text-gray-300 mb-6">
                In pursuit of preparing for tomorrow's Technologist
              </p>
              <div className="h-1 w-24 bg-cstcolor3 mt-2 rounded-full"></div>
            </div>
          </div>

          {/* Login form – unchanged UI */}
          <div className="w-full md:w-1/2 lg:w-1/3 flex justify-center lg:justify-start">
            <div className="w-full max-w-md">
              <div className="relative rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl overflow-hidden">
                <div className="absolute inset-0 opacity-[0.02]">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#3b82f6_49%,#3b82f6_51%,transparent_52%)] bg-[length:30px_30px]"></div>
                </div>

                <div className="relative">
                  {/* Header */}
                  <div className="px-8 py-6 text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
                    <h1 className="text-2xl font-bold text-white">CST LOGIN PORTAL</h1>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-3"></div>
                    <h2 className="text-white mt-5 font-bold text-lg">LOGIN</h2>
                    <p className="text-white/70 mt-1 text-sm">
                      using your student number and password
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/90">
                        Student Number
                      </label>
                      <div className="relative">
                        <input
                          value={studentNumber}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 shadow-inner outline-none transition-all duration-200 focus:border-cstcolor/50 focus:bg-white/10 focus:shadow-lg"
                          onChange={(e) => setStudentNumber(e.target.value)}
                          placeholder="Enter your student number"
                          autoFocus
                        />
                        <div className="absolute inset-0 rounded-lg border border-transparent pointer-events-none transition-all duration-200 group-focus-within:border-cstcolor/30"></div>
                      </div>
                      <p className="mt-2 text-xs text-white/50">
                        Example: <span className="font-medium text-white/80">2023001</span>
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-white/90">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          value={password}
                          className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 shadow-inner outline-none transition-all duration-200 focus:border-cstcolor/50 focus:bg-white/10 focus:shadow-lg"
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={(e) => e.target.removeAttribute("readOnly")}
                          readOnly
                          autoComplete="new-password"
                          placeholder="Enter your password"
                        />
                        <div className="absolute inset-0 rounded-lg border border-transparent pointer-events-none transition-all duration-200 group-focus-within:border-cstcolor/30"></div>
                      </div>
                    </div>

                    {error && (
                      <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                        <p className="text-sm text-white flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {error}
                        </p>
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-cstcolor2 to-cstcolor3 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        disabled={disabled}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Logging in...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            Login
                          </span>
                        )}
                      </button>
                    </div>

                    <div className="pt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="text-xs text-white/40 font-medium">or</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                      </div>
                    </div>

                    <div className="pb-1">
                      <p className="text-center text-sm text-white/60 mb-3">
                        Haven&apos;t activated your account?
                      </p>
                      <button
                        type="button"
                        onClick={handleActivateAccount}
                        className="w-full cursor-pointer rounded-xl border border-cstcolor3/50 bg-cstcolor3/10 px-5 py-2.5 text-sm font-semibold text-cstcolor3 hover:bg-cstcolor3/20 hover:border-cstcolor3 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                      >
                        Activate Account
                      </button>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-cstcolor/5 rounded-full blur-3xl"></div>
                    <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 bg-cstcolor2/5 rounded-full blur-3xl"></div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}