"use client";

export default function RoomCard({
  room,
  floor,
  status,
  capacity,
  year,
  occupants = [],
  disabledReason = "",
  selectionMode,
  selected,
  onSelect,
  onClickRoom,
  loading = false,
}) {

  // ── Skeleton Loading State ─────────────────────────────────────
  if (loading) {
    return (
      <div className="relative rounded-xl border p-4 bg-gray-100 border-gray-200 animate-pulse">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-5 w-20 bg-gray-300 rounded-md" />
            <div className="h-3.5 w-12 bg-gray-200 rounded-md" />
          </div>

          <div className="h-6 w-16 bg-gray-300 rounded-full" />
        </div>

        {/* Progress */}
        <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-2 w-1/2 bg-gray-300 rounded-full" />
        </div>

        {/* Occupants */}
        <div className="mt-4 space-y-2">
          <div className="h-3.5 w-16 bg-gray-200 rounded-md" />
          <div className="h-4 w-36 bg-gray-300 rounded-md" />
          <div className="h-4 w-28 bg-gray-300 rounded-md" />
          <div className="h-4 w-32 bg-gray-300 rounded-md" />
          <div className="h-4 w-24 bg-gray-200 rounded-md mt-1" />
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex justify-center">
          <div className="h-3.5 w-24 bg-gray-200 rounded-md" />
        </div>
      </div>
    );
  }

  // ── Real Card State ────────────────────────────────────────────
  const percentage =
    capacity > 0
      ? Math.round((occupants.length / capacity) * 100)
      : 0;

  const isDisabled = status === "disabled";

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
      onSelect?.();
      return;
    }

    if (onClickRoom) {
      onClickRoom();
    }
  };

  return (
    <div
      role="button"
      aria-pressed={selected}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "Enter") {
          handleClick();
        }
      }}
      className={`
        relative rounded-xl border p-4 transition-all
        ${cardTheme[status]}
        ${
          !isDisabled
            ? "cursor-pointer hover:shadow-md"
            : "cursor-pointer opacity-90"
        }
        ${selected ? "border-blue-600 ring-2 ring-blue-600 shadow-lg shadow-blue-100" : ""}
      `}
    >

      {/* Selection checkbox */}
      <input
        type="checkbox"
        checked={selected}
        aria-label={`Select room ${room}`}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        className="absolute top-4 left-4 z-10 h-5 w-5 cursor-pointer rounded border-gray-300 accent-blue-600"
      />

      {/* Header */}
      <div className="flex justify-between items-start">

        <div className="ml-7 min-w-0 pr-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {room}
          </h2>

          {/* <p className="text-sm text-gray-500">
            {floor}
          </p> */}
          {/* <p className="text-xs text-gray-400">
            Year: {year}
          </p> */}
        </div>

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

      {/* Progress bar */}
      {!isDisabled && (
        <div className="mt-4">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

            <div
              className={`h-2 ${progressColor[status]}`}
              style={{
                width: `${percentage}%`,
              }}
            />

          </div>
        </div>
      )}

      {/* Disabled section */}
      {isDisabled && (
        <div className="mt-4 border border-dashed border-gray-400 rounded-lg p-4 text-center">

          <p className="text-xs text-gray-500 mb-1">
            Reason for Disabling
          </p>

          <p className="font-semibold text-gray-700 uppercase tracking-wide">
            {disabledReason || "RESERVED"}
          </p>

        </div>
      )}

      {/* Occupants */}
      {!isDisabled && (
        <div className="mt-4 text-sm text-gray-800">

          <p className="text-gray-500 mb-1">
            Occupants
          </p>

          {occupants.length > 0 ? (
            <ul className="space-y-1">
              {occupants.map((name, i) => (
                <li key={i}>
                  {name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="italic text-gray-400">
              No occupants
            </p>
          )}

          <p className="mt-2 text-green-700 font-medium">
            Available: {capacity - occupants.length} beds
          </p>

          <p className="mt-2 text-green-700 font-medium">
            Year: {year} 
          </p>

        </div>
      )}

      {/* Footer */}
      <div className="mt-4 pt-3 border-t text-center text-sm text-gray-500">
        {selectionMode
          ? selected ? "Selected" : "Not selected"
          : isDisabled
          ? "Click to enable room"
          : "Click to Allocate"}
      </div>
    </div>
  );
}
