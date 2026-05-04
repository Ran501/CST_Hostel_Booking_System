export default function SpecialBlock({ text, type }) {
  const baseClasses = "w-full h-8 xs:h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center rounded-lg text-xs sm:text-sm font-medium";
  const typeClasses =
    type === "washroom"
      ? "border-2 border-dashed border-blue-400 bg-blue-50 text-blue-700"
      : "border border-slate-300 bg-slate-200 text-slate-700";

  return (
    <div className={`${baseClasses} ${typeClasses}`}>
      {text}
    </div>
  );
}