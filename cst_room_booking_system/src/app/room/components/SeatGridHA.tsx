"use client";

import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from "react";

type Props = {
  roomNumber: number;
  bookedBeds: string[]; // e.g., ["A"], ["A","B"] fully booked
  onSaved?: (selectedBeds: string[]) => void;
};

const BED_IDS = ["A", "B"] as const;

type BedId = typeof BED_IDS[number];

type Selections = Record<string, BedId[]>; // key: roomNumber

const STORAGE_KEY = "ha_selected_beds";

function loadSelections(): Selections {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Selections) : {};
  } catch {
    return {};
  }
}

function saveSelections(sel: Selections) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
  } catch {}
}

export type SeatGridHAHandle = {
  save: () => void;
  clear: () => void;
  getSelected: () => string[];
};

const SeatGridHA = forwardRef<SeatGridHAHandle, Props>(function SeatGridHA(
  { roomNumber, bookedBeds, onSaved }: Props,
  ref
) {
  const [selected, setSelected] = useState<BedId[]>([]);

  useEffect(() => {
    const current = loadSelections();
    setSelected((current[String(roomNumber)] || []) as BedId[]);
  }, [roomNumber]);

  const isBooked = (id: BedId) => bookedBeds.includes(id);
  const isSelected = (id: BedId) => selected.includes(id);

  const allBooked = useMemo(() => bookedBeds.length >= 2, [bookedBeds]);

  function toggle(id: BedId) {
    if (isBooked(id) || allBooked) return;
    setSelected((prev) => (prev.includes(id) ? [] : [id]));
  }

  function handleSave() {
    const current = loadSelections();
    current[String(roomNumber)] = selected;
    saveSelections(current);
    onSaved?.(selected);
  }

  function handleClear() {
    const current = loadSelections();
    delete current[String(roomNumber)];
    saveSelections(current);
    setSelected([]);
    onSaved?.([]);
  }

  useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      clear: handleClear,
      getSelected: () => [...selected],
    }),
    [selected]
  );

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[4/3] w-full rounded-xl border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-3 shadow-inner">
        <button
          aria-label="Bed A"
          onClick={() => toggle("A")}
          disabled={isBooked("A") || allBooked}
          className={
            "group absolute left-3 top-1/2 -translate-y-1/2 flex h-24 w-28 items-center justify-start rounded-lg border p-2 transition-all " +
            (isBooked("A")
              ? "cursor-not-allowed border-red-300 bg-red-50/70 text-red-400"
              : isSelected("A")
              ? "border-emerald-400 bg-emerald-50 shadow ring-2 ring-emerald-300/60"
              : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow")
          }
        >
          <div className="mr-2 flex h-full w-10 items-center justify-center">
            <span className="text-xl">🛏️</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs text-slate-500">Bed</div>
            <div className="font-medium">A</div>
          </div>
          <div className="absolute -right-2 -top-2 h-3 w-3 rounded-sm bg-slate-400/50" />
        </button>

        <button
          aria-label="Bed B"
          onClick={() => toggle("B")}
          disabled={isBooked("B") || allBooked}
          className={
            "group absolute right-3 top-1/2 -translate-y-1/2 flex h-24 w-28 items-center justify-start rounded-lg border p-2 transition-all " +
            (isBooked("B")
              ? "cursor-not-allowed border-red-300 bg-red-50/70 text-red-400"
              : isSelected("B")
              ? "border-emerald-400 bg-emerald-50 shadow ring-2 ring-emerald-300/60"
              : "border-slate-300 bg-white hover:-translate-y-0.5 hover:shadow")
          }
        >
          <div className="mr-2 flex h-full w-10 items-center justify-center">
            <span className="text-xl">🛏️</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs text-slate-500">Bed</div>
            <div className="font-medium">B</div>
          </div>
          <div className="absolute -right-2 -top-2 h-3 w-3 rounded-sm bg-slate-400/50" />
        </button>

        <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-slate-300/40" />
      </div>
    </div>
  );
});

export default SeatGridHA;
