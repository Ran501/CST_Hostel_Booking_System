"use client";

export default function RoomCard({
  room,
  floor,
  status,
  capacity,
  occupants = [],
  disabledReason = "",
  selectionMode,
  selected,
  onSelect,
  onClickRoom,
}) {
  const percentage = Math.round((occupants.length / capacity) * 100);

  const isDisabled = status === "disabled";

  // 🎨 Background themes (matches image)
  const cardTheme = {
    full: "bg-red-200 border-red-100",
    partial: "bg-amber-100 border-amber-100",
    empty: "bg-green-200 border-green-100",
    disabled: "bg-gray-200 border-gray-300",
  };

  const badgeTheme = {
    full: "bg-red-500 text-white",
    partial: "bg-orange-500 text-white",
    empty: "bg-green-600 text-white",
    disabled: "border border-gray-400 text-gray-600 bg-white",
  };

  const progressColor = {
    full: "bg-red-500",
    partial: "bg-orange-500",
    empty: "bg-green-500",
    disabled: "bg-gray-400",
  };

  const handleClick = () => {
  if (selectionMode) {
    onSelect(room); // click = select in selection mode
    return;
  }

  if (onClickRoom) {
    onClickRoom(room);
  }
};

  return (
    <div
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleClick();
          }
        }}
        className={`
          relative rounded-xl border p-4 transition-all
          ${cardTheme[status]}
          ${!isDisabled ? "cursor-pointer hover:shadow-md" : "cursor-pointer opacity-90"}
          ${selected ? "ring-2 ring-blue-500" : ""}
        `}
      >
      {/* Selection checkbox */}
      {selectionMode && !isDisabled && (
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(room);
          }}
          className="absolute top-4 left-4 w-4 h-4 accent-blue-600 z-10"
        />
      )}


      {/* Header */}
      <div className="flex justify-between items-start">
        <div className={`${selectionMode ? "ml-6" : ""}`}>
          <h2 className="text-lg font-semibold text-gray-900">{room}</h2>
          <p className="text-sm text-gray-500">{floor}</p>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${badgeTheme[status]}`}
        >
          {status === "full"
            ? "Full"
            : status === "partial"
            ? `${occupants.length}/${capacity}`
            : status === "empty"
            ? "Empty"
            : "Disabled"}
        </span>
      </div>

      {/* Progress Bar */}
      {!isDisabled && (
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-2 ${progressColor[status]}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Disabled Box */}
      {isDisabled && (
        <div className="mt-4 border border-dashed border-gray-400 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Reason for Disabling</p>
          <p className="font-semibold text-gray-700 uppercase tracking-wide">
            {disabledReason || "RESERVED"}
          </p>
        </div>
      )}

      {/* Occupants */}
      {!isDisabled && (
        <div className="mt-4 text-sm text-gray-800">
          <p className="text-gray-500 mb-1">Occupants</p>

          {occupants.length > 0 ? (
            <ul className="space-y-1">
              {occupants.map((name, i) => (
                <li key={i}>{name}</li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-400">No occupants</p>
          )}

          <p className="mt-2 text-green-700 font-medium">
            Available: {capacity - occupants.length} beds
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t text-center text-sm text-gray-500">
        {isDisabled ? "Click to enable room" : "Click to Allocate"}
      </div>
    </div>
  );
}