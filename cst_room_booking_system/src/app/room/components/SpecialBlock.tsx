// components/SpecialBlock.tsx
import React from "react";

type SpecialBlockProps = {
  text: string;
  type?: "balcony" | "steps" | "washroom"; // ✅ added dashed washroom
  style?: React.CSSProperties;
};

const SpecialBlock: React.FC<SpecialBlockProps> = ({ text, type = "washroom", style }) => {
  const styles = {
    washroom: "border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700", // ✅ dashed washroom
    balcony: "border-2 border-dashed border-green-400 bg-green-50 text-green-700",
    steps: "border-2 border-dashed border-slate-400 bg-slate-100 text-slate-700",
  };

  return (
    <div
      className={`flex items-center justify-center rounded-lg sm:rounded-xl shadow px-2 py-1 ${styles[type]}`}
      style={style}
    >
      {text}
    </div>
  );
};

export default SpecialBlock;