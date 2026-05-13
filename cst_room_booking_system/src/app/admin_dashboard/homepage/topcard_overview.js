"use client";

import { useEffect, useState } from "react";
import { useSpring, useSpringRef, animated } from "@react-spring/web";

export default function TopCards({ stats }) {
  const [mounted, setMounted] = useState(false);
  const [animVals, setAnimVals] = useState({
    totalCapacity: 0,
    occupiedBeds:  0,
    availableBeds: 0,
    totalHostels:  0,
  });

  const springRef = useSpringRef();

  useSpring({
    ref: springRef,
    from: { totalCapacity: 0, occupiedBeds: 0, availableBeds: 0, totalHostels: 0 },
    to: {
      totalCapacity: stats?.totalCapacity ?? 0,
      occupiedBeds:  stats?.occupiedBeds  ?? 0,
      availableBeds: stats?.availableBeds ?? 0,
      totalHostels:  stats?.totalHostels  ?? 0,
    },
    config: { duration: 900 },
    onChange: (v) => setAnimVals({ ...v.value }),
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (mounted) springRef.start();
  }, [mounted, springRef, stats]);

  if (!mounted) return null;

  const totalCapacity = stats?.totalCapacity ?? 0;
  const occupiedBeds  = stats?.occupiedBeds  ?? 0;
  const totalHostels  = stats?.totalHostels  ?? 0;

  const occupancyPct    = totalCapacity > 0 ? (occupiedBeds / totalCapacity) * 100 : 0;
  const availabilityPct = totalCapacity > 0 ? ((totalCapacity - occupiedBeds) / totalCapacity) * 100 : 0;
  const avgBeds         = totalHostels  > 0 ? totalCapacity / totalHostels : 0;

  const cards = [
    {
      title:         "Total Beds Capacity",
      value:         animVals.totalCapacity,
      color:         "text-blue-600",
      wide:          true,
      subtitle:      "Sum of all room capacities across every hostel",
      badge:         avgBeds > 0 ? `~${Math.round(avgBeds)} beds / hostel avg` : null,
    },
    {
      title:         "Occupied Beds",
      value:         animVals.occupiedBeds,
      color:         "text-red-600",
      progress:      occupancyPct,
      progressColor: "bg-red-500",
      subtitle:      `${occupancyPct.toFixed(1)}% occupancy rate`,
    },
    {
      title:         "Available Beds",
      value:         animVals.availableBeds,
      color:         "text-green-600",
      progress:      availabilityPct,
      progressColor: "bg-green-500",
      subtitle:      `${availabilityPct.toFixed(1)}% availability`,
    },
    {
      title:         "Total Hostels",
      value:         animVals.totalHostels,
      color:         "text-indigo-600",
      badge:         stats?.activeHostels != null ? `${stats.activeHostels} active` : null,
      subtitle:      "Registered hostels",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((card, i) => (
        <animated.div
          key={i}
          className={`${
            card.wide ? "col-span-3" : "aspect-square max-h-[140px] sm:max-h-none"
          } bg-white rounded-xl p-2 sm:p-4 shadow hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center border border-gray-100 hover:border-blue-100 group relative min-w-0 min-h-0`}
        >
          <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-medium w-full text-center">
            {card.title}
          </div>

          <div className={`font-bold ${card.color} text-base sm:text-lg md:text-2xl leading-tight`}>
            {Math.floor(card.value).toLocaleString()}
          </div>

          {card.progress !== undefined && (
            <div className="w-full px-1">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${card.progressColor} transition-all duration-700`}
                  style={{ width: `${card.progress}%` }}
                />
              </div>
            </div>
          )}

          {card.subtitle && (
            <div className="text-[10px] sm:text-xs text-gray-500 px-2">{card.subtitle}</div>
          )}

          {card.badge && (
            <div className="px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200 font-medium">
              {card.badge}
            </div>
          )}

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full" />
        </animated.div>
      ))}
    </div>
  );
}