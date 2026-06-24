"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function VerifyOTPContent() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const studentNumber = searchParams.get("studentNumber");

  useEffect(() => {
    if (!studentNumber) {
      toast.error("Student number not provided");
      router.push("/activate");
    }
  }, [studentNumber, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentNumber: studentNumber.trim(),
          otp: otp.trim(),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        toast.error(data?.error || "Failed to verify OTP");
        setLoading(false);
        return;
      }
      toast.success("Account activated successfully");
      setTimeout(() => {
        router.push(`/set-password?studentNumber=${studentNumber}`);
      }, 1000);
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleResendOTP() {
    router.push(`/activate?studentNumber=${encodeURIComponent(studentNumber)}`);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute inset-0">
        <div className="block md:hidden absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="hidden md:block lg:hidden absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
        <div className="hidden lg:block absolute inset-0 bg-[url('/backgroundimage.jpg')] bg-cover bg-center opacity-20"></div>
      </div>

      <button
        onClick={() => router.push("/activate")}
        className="cursor-pointer absolute left-4 top-4 md:left-6 md:top-6 z-20 text-white hover:text-gray-200 transition-colors group"
        aria-label="Go back"
      >
        <div className="flex items-center gap-2 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
          <svg className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm md:text-base font-medium">Back</span>
        </div>
      </button>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="relative rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 shadow-xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#3b82f6_49%,#3b82f6_51%,transparent_52%)] bg-[length:30px_30px]"></div>
          </div>
          <div className="relative">
            <div className="px-8 py-6 text-center border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <h1 className="text-2xl font-bold text-white">ACTIVATE ACCOUNT</h1>
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mt-3"></div>
              <h2 className="text-white mt-5 font-bold text-lg">Verify OTP</h2>
              <p className="text-white/70 mt-1 text-sm">Enter the 6-digit code sent to your email</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 px-8 py-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/90">OTP Code</label>
                <div className="relative">
                  <input
                    value={otp}
                    className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-white placeholder-white/40 shadow-inner outline-none transition-all duration-200 focus:border-cstcolor/50 focus:bg-white/10 focus:shadow-lg text-center text-2xl tracking-widest"
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setOtp(value);
                    }}
                    placeholder="000000"
                    autoFocus
                    maxLength={6}
                  />
                  <div className="absolute inset-0 rounded-lg border border-transparent pointer-events-none transition-all duration-200 group-focus-within:border-cstcolor/30"></div>
                </div>
                <p className="mt-2 text-xs text-white/50 text-center">
                  Student Number: <span className="font-medium text-white/80">{studentNumber}</span>
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-cstcolor2 to-cstcolor3 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  disabled={loading || otp.trim().length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Verify OTP
                    </span>
                  )}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-cstcolor3 hover:text-cstcolor2 transition-colors"
                >
                  Didn't receive OTP? Request again
                </button>
              </div>
              <div className="absolute -z-10 -top-10 -right-10 w-40 h-40 bg-cstcolor/5 rounded-full blur-3xl"></div>
              <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 bg-cstcolor2/5 rounded-full blur-3xl"></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTP() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-lg">Loading...</div>
      </div>
    }>
      <VerifyOTPContent />
    </Suspense>
  );
}