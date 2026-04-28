"use client";

import { toast } from "react-hot-toast";

export default function StatCard({
  icon,
  label,
  value,
  bg,
  description,
  onClick,
}) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      toast(
        <div className="text-left">
          <div className="font-semibold text-gray-800">{label}</div>

          {description && (
            <div className="text-sm text-gray-600 mt-1">
              {description}
            </div>
          )}

          <div className="text-sm text-gray-500 mt-1">
            Current value:{" "}
            <span className="font-medium">{value}</span>
          </div>
        </div>,
        {
          icon: "📊",
          style: {
            background: "#fff",
            color: "#2563EB",
            padding: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          },
          position: "top-center",
          duration: 3000,
        }
      );
    }
  };

  const formatValue = (val) => {
    if (typeof val === "number") {
      return val >= 1000 ? val.toLocaleString() : val.toString();
    }
    return val;
  };

  return (
    <div
      className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3 shadow-sm min-w-[150px] cursor-pointer hover:scale-105 transition-all duration-200 hover:shadow-md active:scale-95"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className={`p-2 rounded-lg ${bg} text-white`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="font-semibold text-lg truncate">
          {formatValue(value)}
        </p>
      </div>
    </div>
  );
}