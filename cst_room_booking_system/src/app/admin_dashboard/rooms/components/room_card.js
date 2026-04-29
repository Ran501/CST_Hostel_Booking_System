"use client";

export default function RoomCard({ room, status, capacity, occupants }) {
  const percentage = Math.round((occupants.length / capacity) * 100);

  const statusColors = {
    full: "bg-red-500 text-white",
    partial: "bg-orange-400 text-white",
    empty: "bg-green-500 text-white",
    disabled: "bg-gray-500 text-white",
  };

  return (
    <div className="bg-[#f5f5f5] border rounded-md p-3 min-h-[175px] hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between text-[18px] font-medium text-[#1e1e1e]">
        <span>{room}</span>
        <span className={`px-2 py-0.5 rounded-full text-sm ${statusColors[status]}`}>
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

      {/* Horizontal progress bar */}
      <div className="mt-3 w-full">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-4 ${statusColors[status].split(" ")[0]}`} // only use bg color
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="mt-1 text-sm text-gray-700 text-center">
          {occupants.length}/{capacity}
        </div>
      </div>

      {/* Names */}
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
