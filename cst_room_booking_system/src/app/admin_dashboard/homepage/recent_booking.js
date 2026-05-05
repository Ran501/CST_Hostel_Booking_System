"use client";

import { useEffect, useState } from "react";
import { animated, useSpring, useSpringRef } from "@react-spring/web";

export default function RecentBookings() {
  const [mounted, setMounted] = useState(false);
  const springRef = useSpringRef();

  const fadeIn = useSpring({
    ref: springRef,
    from: { opacity: 0, transform: "translateY(10px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { duration: 400 },
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (mounted) springRef.start();
  }, [mounted, springRef]);

  if (!mounted) return null;

  // 🔥 Dummy Data
  const bookings = [
    { id: 1, studentNumber: "2021001", name: "Tshewang Dorji", email: "tshewang.dorji@cst.edu.bt", room: "RKA-101", gender: "Male" },
    { id: 2, studentNumber: "2021002", name: "Pema Choden", email: "pema.choden@cst.edu.bt", room: "HF-102", gender: "Female" },
    { id: 3, studentNumber: "2021003", name: "Kinley Wangchuk", email: "kinley.wangchuk@cst.edu.bt", room: "HA-103", gender: "Male" },
    { id: 4, studentNumber: "2021004", name: "Yangchen Lhamo", email: "yangchen.lhamo@cst.edu.bt", room: "HF-108", gender: "Female" },
    { id: 5, studentNumber: "2021005", name: "Chimi Dema", email: "chimi.dema@cst.edu.bt", room: "HF-105", gender: "Female" },
    { id: 6, studentNumber: "2021006", name: "Karma Yangzom", email: "karma.yangzom@cst.edu.bt", room: "HF-106", gender: "Female" },
    { id: 7, studentNumber: "2021007", name: "Lhendup Tshering", email: "lhendup.tshering@cst.edu.bt", room: "NK-107", gender: "Male" },
    { id: 8, studentNumber: "2021008", name: "Rinchen Dorji", email: "rinchen.dorji@cst.edu.bt", room: "HE-108", gender: "Male" },
    { id: 9, studentNumber: "2021009", name: "Sonam Tobgay", email: "sonam.tobgay@cst.edu.bt", room: "HB-109", gender: "Male" },
    { id: 10, studentNumber: "2021010", name: "Tshering Yangden", email: "tshering.yangden@cst.edu.bt", room: "HF-110", gender: "Female" },
  ];

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
          Recent Bookings
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">Top 10</span>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        
        {/* Table Head */}
        <div className="hidden md:grid grid-cols-5 gap-4 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span>ID</span>
          <span>Name</span>
          <span>Email</span>
          <span>Room</span>
          <span>Gender</span>
        </div>

        {/* Rows */}
        <div className="divide-y">
          {bookings.map((student) => (
            <animated.div
              key={student.id}
              style={fadeIn}
              className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4 px-4 py-3 hover:bg-gray-50 transition group cursor-pointer"
            >
              {/* Mobile layout */}
              <div className="md:hidden flex justify-between text-xs text-gray-500">
                <span>#{student.studentNumber}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px]
                  ${
                    student.gender === "Male"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-pink-50 text-pink-600"
                  }`}
                >
                  {student.gender}
                </span>
              </div>

              <div className="text-sm text-gray-700 font-medium md:text-xs md:text-gray-500">
                #{student.studentNumber}
              </div>

              <div className="text-sm font-semibold text-gray-800 truncate">
                {student.name}
              </div>

              <div className="text-xs text-gray-500 truncate">
                {student.email}
              </div>

              <div className="text-sm font-medium text-blue-600">
                {student.room}
              </div>

              <div className="hidden md:flex items-center">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full
                  ${
                    student.gender === "Male"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-pink-50 text-pink-600"
                  }`}
                >
                  {student.gender}
                </span>
              </div>
            </animated.div>
          ))}
        </div>
      </div>
    </div>
  );
}