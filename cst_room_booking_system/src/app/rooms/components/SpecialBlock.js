// src/app/room/components/SpecialBlock.js
"use client";

import React from "react";

const SpecialBlock1 = ({ text, type = "washroom", style }) => {
  const styles = {
    washroom: "border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700",
    balcony: "border-2 border-dashed border-green-400 bg-green-50 text-green-700",
    steps: "border-2 border-dashed border-slate-400 bg-slate-100 text-slate-700",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-full shadow-sm ${styles[type]}`}
      style={{ ...style, width: "70px", height: "70px" }}
    >
      <span className="text-[10px] xs:text-xs sm:text-sm font-medium text-center leading-tight">
        {text}
      </span>
    </div>
  );
};

export default SpecialBlock;