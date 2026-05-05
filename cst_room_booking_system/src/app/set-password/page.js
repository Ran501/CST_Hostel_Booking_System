"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

export default function SetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentNumber = searchParams.get("studentNumber");
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentNumber) {
      router.push("/login");
    }
  }, [studentNumber, router]);

  const disabled = loading || !password || !confirmPassword || password.length < 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ studentNumber, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.error || "Failed to set password");
        setLoading(false);
        return;
      }

      toast.success("Password set successfully! Please login with your new password.");
      router.push("/login?passwordSet=true");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="relative rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl overflow-hidden">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#3b82f6_49%,#3b82f6_51%,transparent_52%)] bg-[length:30px_30px]"></div>
          </div>

          {/* Content */}
          <div className="relative p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Set Your Password</h1>
              <p className="text-white/70">Create a password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white/10"
                  placeholder="Enter your password"
                  autoFocus
                />
                <p className="mt-1 text-xs text-white/50">
                  Must be at least 6 characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white/10"
                  placeholder="Confirm your password"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <p className="text-sm text-white">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={disabled}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? "Setting Password..." : "Set Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
