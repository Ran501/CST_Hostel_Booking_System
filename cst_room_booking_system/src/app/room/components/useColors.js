// rooms/components/useColors.js

export const getRoomColors = (roomInfo, selectedRoom, currentUser, buildingName, roomNumber) => {
  const dbValue = roomInfo.isActive ?? roomInfo.is_active;
  const status = String(roomInfo.status ?? "").toLowerCase().trim();
  const isRoomActive =
    dbValue !== false &&
    String(dbValue).toUpperCase().trim() !== "FALSE" &&
    !["disabled", "inactive", "maintenance"].includes(status);
  const occupied = roomInfo.occupied || 0;
  const capacity = roomInfo.capacity || 3;

  const isFully = occupied >= capacity;
  const isPartial = occupied > 0 && occupied < capacity;
  const isSelected = selectedRoom === roomNumber;
  const isYourBooking = currentUser && currentUser.bookedRoomNumber === `${buildingName}-${roomNumber}`;

  let colorClasses = "";
  let textColorClass = "";
  let statusText = "";
  let legendColorClass = "";

  if (!isRoomActive) {
    colorClasses = "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60";
    textColorClass = "text-gray-400";
    statusText = roomInfo.disabledReason || "Inactive";
    legendColorClass = "bg-gray-400";
  } 
  else if (isYourBooking) {
    colorClasses = "border-green-500 bg-green-50 hover:bg-green-100";
    textColorClass = "text-green-700";
    statusText = "Your Booking";
    legendColorClass = "bg-green-500";
  }
  else if (isFully) {
    colorClasses = "border-red-400 bg-red-50 cursor-not-allowed opacity-75";
    textColorClass = "text-red-600";
    statusText = `${capacity}/${capacity} Booked`;
    legendColorClass = "bg-red-400";
  }
  else if (isSelected) {
    colorClasses = "border-indigo-500 bg-indigo-50";
    textColorClass = "text-indigo-600";
    statusText = `${capacity - occupied} Available`;
    legendColorClass = "bg-indigo-500";
  }
  else if (isPartial) {
    colorClasses = "border-amber-400 bg-amber-50 hover:border-amber-500 hover:bg-amber-100 hover:-translate-y-0.5 hover:shadow-md";
    textColorClass = "text-amber-600";
    statusText = `${occupied}/${capacity} Booked`;
    legendColorClass = "bg-amber-400";
  }
  else {
    colorClasses = "border-gray-400 bg-gray-50 hover:border-gray-500 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-md";
    textColorClass = "text-gray-600";
    statusText = `${capacity - occupied} Available`;
    legendColorClass = "bg-gray-400";
  }

  return {
    colorClasses,
    textColorClass,
    statusText,
    isDisabled: !isRoomActive || (isFully && !isYourBooking),
    legendColorClass
  };
};

// Legend component as a function
export const RoomLegend = () => {
  const legendItems = [
    { key: "available", label: "Available", colorClass: "bg-gray-400" },
    { key: "partiallyBooked", label: "Partially Booked", colorClass: "bg-amber-400" },
    { key: "fullyBooked", label: "Fully Booked", colorClass: "bg-red-400" },
    { key: "yourBooking", label: "Your Booking", colorClass: "bg-green-500" },
    { key: "inactive", label: "Inactive", colorClass: "bg-gray-400" }
  ];

  return (
    <div className="mt-3 xs:mt-4 sm:mt-5 lg:mt-6">
      <div className="flex flex-wrap justify-center gap-2 xs:gap-3 sm:gap-4 text-xs xs:text-sm md:text-base text-slate-700">
        {legendItems.map((item) => (
          <div key={item.key} className="flex items-center gap-1 xs:gap-2">
            <div className={`h-3 w-3 rounded-full ${item.colorClass} border border-white shadow-sm`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};