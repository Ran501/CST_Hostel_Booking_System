"use client";

import React, { useState, useEffect, useRef } from "react";

export default function ConfirmationDialog({
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText = "Yes",
  cancelText = "No",
}) {
  // Button order in the DOM: 0 = Confirm (left), 1 = Cancel (right).
  const confirmRef = useRef(null);
  const cancelRef  = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Left/Right arrows move between the buttons; Esc cancels.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isLoading) return;
      if (e.key === "ArrowLeft")  { e.preventDefault(); setActiveIndex(0); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setActiveIndex(1); }
      else if (e.key === "Escape")     { e.preventDefault(); onCancel?.(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLoading, onCancel]);

  // Keep real DOM focus on the highlighted button so Enter/Space activates it.
  useEffect(() => {
    if (isLoading) return;
    const ref = activeIndex === 0 ? confirmRef : cancelRef;
    ref.current?.focus();
  }, [activeIndex, isLoading]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden rounded-t-2xl bg-cstcolor h-24">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.9) 60%, transparent 61%), radial-gradient(2px 2px at 70% 20%, rgba(255,255,255,0.8) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 40% 70%, rgba(255,255,255,0.7) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 85% 60%, rgba(255,255,255,0.75) 60%, transparent 61%), radial-gradient(1.5px 1.5px at 10% 80%, rgba(255,255,255,0.7) 60%, transparent 61%)",
            }}
          />
        </div>

        {/* Icon */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 h-16 w-16 flex items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isLoading ? "bg-blue-100" : "bg-white"
            } text-cstcolor shadow-md transition-colors duration-300`}
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-cstcolor border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                className="fill-current"
                aria-hidden="true"
              >
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm.01 17c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25S12.69 19 12 19zm2.07-7.75c-.9.64-1.32 1.14-1.32 2.25h-1.5c0-1.59.63-2.41 1.74-3.2.86-.61 1.26-1.02 1.26-1.8 0-1.07-.88-1.8-2.01-1.8-1.11 0-1.92.63-2.14 1.62l-1.47-.33c.36-1.64 1.8-2.79 3.61-2.79 2.07 0 3.54 1.29 3.54 3.18 0 1.34-.73 2.14-1.71 2.87z" />
              </svg>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pt-14 pb-6">
          <h2 className="text-center text-lg font-semibold text-gray-900">
            {isLoading ? "Processing..." : "Confirmation"}
          </h2>

          <p className="mt-2 text-center text-sm text-gray-600">
            {message}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              ref={confirmRef}
              onClick={onConfirm}
              disabled={isLoading}
              className={`cursor-pointer inline-flex w-full sm:w-auto h-10 items-center justify-center rounded-md px-5 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                isLoading
                  ? "bg-cstcolor cursor-not-allowed"
                  : "bg-cstcolor hover:bg-cstcolor2 focus:ring-blue-600/40"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {confirmText === "Yes"
                    ? "Processing..."
                    : confirmText}
                </span>
              ) : (
                confirmText
              )}
            </button>

            <button
              ref={cancelRef}
              onClick={onCancel}
              disabled={isLoading}
              className={`cursor-pointer inline-flex w-full sm:w-auto h-10 items-center justify-center rounded-md border px-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 ${
                isLoading
                  ? "border-gray-400 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "border-cstcolor bg-white text-cstcolor hover:bg-blue-50 focus:ring-blue-600/30"
              }`}
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}