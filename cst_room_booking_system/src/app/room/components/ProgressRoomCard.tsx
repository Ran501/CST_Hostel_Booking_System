// components/ProgressRoomCard.tsx
"use client";

import React from "react";

interface ProgressRoomCardProps {
  roomNumber: number;
  occupied: number;
  capacity?: number;
  isActive?: boolean;
  isLoading?: boolean;
  isSelected?: boolean;
  isBooking?: boolean;
  onSelect?: () => void;
  style?: React.CSSProperties;
  buildingName?: string;
}

const ProgressRoomCard: React.FC<ProgressRoomCardProps> = ({
  roomNumber,
  occupied = 0,
  capacity = 3,
  isActive = true,
  isLoading = false,
  isSelected = false,
  isBooking = false,
  onSelect,
  style,
  buildingName = "",
}) => {
  const fullRoomId = buildingName ? `${buildingName}-${roomNumber}` : String(roomNumber);
  const isFull = occupied >= capacity;
  const occupancyPercentage = (occupied / capacity) * 100;
  const isRoomActive = isActive;

  // Determine colors based on occupancy
  let progressColor = "";
  let statusColor = "";
  let statusText = "";
  
  if (!isRoomActive) {
    progressColor = "bg-slate-400";
    statusColor = "text-slate-600";
    statusText = "Luggage";
  } else if (isFull) {
    progressColor = "bg-red-500";
    statusColor = "text-red-600";
    statusText = "Full";
  } else if (occupied > 0) {
    progressColor = "bg-amber-500";
    statusColor = "text-amber-600";
    statusText = occupied === 1 ? "1 Bed" : `${occupied} Beds`;
  } else {
    progressColor = "bg-emerald-500";
    statusColor = "text-emerald-600";
    statusText = "Empty";
  }

  // UI colors based on status
  const ringColor = !isRoomActive
    ? "ring-slate-200"
    : isFull
      ? "ring-red-300"
      : isSelected
        ? "ring-emerald-300"
        : "ring-slate-200";

  const colors = !isRoomActive
    ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
    : isFull
      ? "bg-red-50 text-red-700 border-red-200 cursor-not-allowed"
      : isSelected
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-300/70"
        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]";

  if (isLoading) {
    return (
      <div 
        className="absolute flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 animate-pulse"
        style={style}
      >
        <span className="text-[10px] text-slate-400">...</span>
      </div>
    );
  }

  return (
    <button
      aria-label={`Room ${fullRoomId} ${!isRoomActive ? "luggage room" : isFull ? "fully booked" : `${occupied}/${capacity} occupied`}`}
      disabled={!isRoomActive || isFull || isLoading || isBooking}
      onClick={onSelect}
      className={`
        cursor-pointer group absolute rounded-2xl border shadow-sm transition-all duration-200 
        focus:outline-none focus:ring-2 focus:ring-blue-300 ring-1 ${ringColor}
        disabled:opacity-60 disabled:shadow-none disabled:cursor-not-allowed
        w-[65px] h-[65px] xs:w-[70px] xs:h-[70px] sm:w-[75px] sm:h-[75px] 
        md:w-[85px] md:h-[85px] lg:w-[95px] lg:h-[95px] xl:w-[105px] xl:h-[105px]
        ${colors}
      `}
      style={style}
    >
      <div className="flex h-full flex-col items-center justify-center p-1">
        {/* Room Number */}
        <span className="text-xs xs:text-sm sm:text-base md:text-lg font-semibold">
          {roomNumber}
        </span>
        
        {/* Occupancy Ratio */}
        <span className="text-[7px] xs:text-[8px] sm:text-[9px] font-medium mt-0.5">
          {occupied}/{capacity}
        </span>
        
        {/* Progress Bar */}
        <div className="w-full mt-1 px-1">
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
              style={{ width: `${isRoomActive ? occupancyPercentage : 100}%` }}
            />
          </div>
        </div>
        
        {/* Status Text */}
        <span className={`text-[6px] xs:text-[7px] sm:text-[8px] font-medium mt-0.5 ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      {!isFull && isRoomActive && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl ring-0 transition group-hover:ring-1 group-hover:ring-slate-300/50" />
      )}
    </button>
  );
};

export default ProgressRoomCard;