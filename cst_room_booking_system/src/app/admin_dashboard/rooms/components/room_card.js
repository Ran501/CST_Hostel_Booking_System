"use client";

export default function RoomCard({
  room,
  status,
  capacity,
  occupants,
  selectionMode,
  selected,
  onSelect,
  onClickRoom,
}) {
  const percentage = Math.round((occupants.length / capacity) * 100);

  const statusColors = {
    full: "bg-red-500 text-white",
    partial: "bg-orange-400 text-white",
    empty: "bg-green-500 text-white",
    disabled: "bg-gray-500 text-white",
  };

  // ✅ unified click handler
  const handleClick = () => {
    // ❌ ignore disabled rooms (optional but recommended)
    if (status === "disabled") return;

    // 🟢 allocate mode or custom mode click
    if (onClickRoom) {
      onClickRoom(room);
      return;
    }

    // 🟡 selection mode fallback
    if (selectionMode) {
      onSelect(room);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative border rounded-md p-3 min-h-[175px] transition cursor-pointer
        hover:shadow-md
        ${
          selected
            ? "border-blue-500 bg-blue-50 shadow-md"
            : "bg-[#f5f5f5] border-gray-200"
        }
      `}
    >
      {/* Checkbox (only in selection mode) */}
      {selectionMode && (
        <input
          type="checkbox"
          checked={selected}
          readOnly
          className="absolute top-3 left-3 w-4 h-4 accent-blue-600"
        />
      )}

      {/* Header */}
      <div className="flex justify-between text-[18px] font-medium text-[#1e1e1e]">
        <span className="ml-6">{room}</span>

        <span
          className={`px-2 py-0.5 rounded-full text-sm ${statusColors[status]}`}
        >
          {status === "full"
            ? "Full"
            : status === "partial"
            ? "Partially Full"
            : status === "empty"
            ? "Empty"
            : "Disabled"}
        </span>
      </div>

      {/* Capacity */}
      <div className="mt-3 flex justify-between text-[16px] text-[#1e1e1e]">
        <span>Capacity</span>
        <span>{capacity}</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 w-full">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-4 ${statusColors[status].split(" ")[0]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="mt-1 text-sm text-gray-700 text-center">
          {occupants.length}/{capacity}
        </div>
      </div>

      {/* Occupants */}
      <div className="mt-4 text-[15px] text-[#1e1e1e]">
        {occupants.length > 0 ? (
          <ul className="list-disc list-inside">
            {occupants.map((name, idx) => (
              <li key={idx}>{name}</li>
            ))}
          </ul>
        ) : (
          <span className="italic text-gray-500">
            {status === "disabled" ? "Disabled (Luggage Room)" : "No occupants"}
          </span>
        )}
      </div>
    </div>
  );
}