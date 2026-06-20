"use client";

import { Toaster } from "react-hot-toast";

// Single render target for all react-hot-toast `toast.*()` calls across the app.
// Without this mounted, every toast silently does nothing.
export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#1a1a1a",
          color: "#ff4444",
          border: "1px solid #ff4444",
          borderRadius: "8px",
          padding: "16px 20px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 8px 32px rgba(255, 68, 68, 0.3)",
        },
        error: {
          duration: 5000,
          style: {
            background: "#1a0000",
            color: "#ff6666",
            border: "2px solid #ff0000",
            boxShadow: "0 8px 32px rgba(255, 0, 0, 0.4)",
          },
        },
        success: {
          style: {
            background: "#001a00",
            color: "#66ff66",
            border: "1px solid #66ff66",
          },
        },
      }}
    />
  );
}