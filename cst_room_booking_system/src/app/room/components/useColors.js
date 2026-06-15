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
    colorClasses = "border-gray-100 bg-gray-100 bg-opacity-100 cursor-not-allowed";
    textColorClass = "text-gray-400";
    statusText = roomInfo.disabledReason || "INACTIVE";
    legendColorClass = "bg-gray-300";
  } 
  else if (isYourBooking) {
    colorClasses = "border-green-500 bg-green-100 hover:bg-green-200";
    textColorClass = "text-green-700";
    statusText = "Your Booking";
    legendColorClass = "bg-green-500";
  }
  else if (isFully) {
    colorClasses = "border-red-900 bg-red-300 cursor-not-allowed opacity-80";
    textColorClass = "text-red-900";
    statusText = `${capacity}/${capacity} Booked`;
    legendColorClass = "bg-red-800";
  }
  else if (isSelected) {
    colorClasses = "border-indigo-500 bg-indigo-100";
    textColorClass = "text-indigo-700";
    statusText = `${capacity - occupied} Available`;
    legendColorClass = "bg-indigo-500";
  }
  else if (isPartial) {
    colorClasses = "border-yellow-500 bg-yellow-100 hover:border-yellow-600 hover:bg-yellow-200 hover:-translate-y-0.5 hover:shadow-md";
    textColorClass = "text-yellow-700";
    statusText = `${occupied}/${capacity} Booked`;
    legendColorClass = "bg-yellow-500";
  }
  else {
    colorClasses = "border-gray-400 bg-gray-100 hover:border-gray-500 hover:bg-gray-200 hover:-translate-y-0.5 hover:shadow-md";
    textColorClass = "text-gray-700";
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
    { key: "partiallyBooked", label: "Partially Booked", colorClass: "bg-yellow-500" },
    { key: "fullyBooked", label: "Fully Booked", colorClass: "bg-red-800" },
    { key: "yourBooking", label: "Your Booking", colorClass: "bg-green-500" },
    { key: "inactive", label: "Inactive", colorClass: "bg-gray-300" }
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