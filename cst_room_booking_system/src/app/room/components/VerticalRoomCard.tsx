"use client";
import type { CSSProperties } from "react";

type Status = "available" | "booked" | "partial";

type Props = {
  roomNumber: number;
  status: Status;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  label?: string; // optional occupancy label (e.g., "1/2 Occupied")
};

function cx(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export default function VerticalRoomCard({ roomNumber, status, onClick, disabled, className, style, label }: Props) {
  const isBooked = status === "booked";
  const isPartial = status === "partial";
  const isAvailable = status === "available";

  const containerColors = isBooked
    ? "border-red-200 bg-red-50 text-red-700 cursor-not-allowed ring-1 ring-red-300/70"
    : isPartial
    ? "border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300 hover:bg-amber-50/80 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]";

  const badge = isBooked
    ? { wrap: "bg-red-50 text-red-700", text: label || "Fully Booked" }
    : isPartial
    ? { wrap: "bg-amber-50 text-amber-700", text: label || "Partially occupied" }
    : { wrap: "bg-emerald-50 text-emerald-700", text: label || "0 Available" };

  return (
    <button
      aria-label={`Room ${roomNumber} ${badge.text}`}
      onClick={onClick}
      disabled={disabled || isBooked}
      className={cx(
        "group relative rounded-xl border shadow-sm transition-all duration-200 disabled:opacity-60 disabled:shadow-none",
        containerColors,
        className
      )}
      style={style}
    >
      <div className="flex h-full flex-col items-center justify-center gap-1">
        <div className="font-semibold tracking-wide text-base md:text-lg">{`Room ${roomNumber}`}</div>
        <div className={cx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", badge.wrap)}>
          <span>{badge.text}</span>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/50" />
    </button>
  );
}
