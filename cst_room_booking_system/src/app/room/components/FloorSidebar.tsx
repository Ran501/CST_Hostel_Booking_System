"use client";

import Link from "next/link";

type Floor = 1 | 2 | 3 | 4;

type Props = {
  currentFloor: Floor;
  baseHref: string;
  floors?: Floor[];
};

export default function FloorSidebar({ currentFloor, baseHref, floors }: Props) {
  const list: Floor[] = floors ?? [1, 2, 3, 4];
  return (
    <aside className="w-24">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-700 bg-slate-800/70 p-2 shadow">
        {list.map((f) => (
          <Link
            key={f}
            href={`${baseHref}/${f}`}
            className={
              "flex items-center justify-center rounded-md border px-2 py-3 text-sm transition " +
              (f === currentFloor
                ? "border-emerald-400/70 bg-emerald-900/30 text-emerald-200 shadow"
                : "border-slate-600 bg-slate-700/40 text-slate-200 hover:border-slate-400 hover:bg-slate-700/70")
            }
          >
            {`Floor 0${f}`}
          </Link>
        ))}
      </div>
    </aside>
  );
}
