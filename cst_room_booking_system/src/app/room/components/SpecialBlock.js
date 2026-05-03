export default function SpecialBlock({ text, type }) {
  return (
    <div className="w-full h-8 xs:h-10 sm:h-12 md:h-14 lg:h-16 flex items-center justify-center rounded-lg bg-slate-200 border border-slate-300 text-slate-700 text-xs sm:text-sm font-medium">
      {text}
    </div>
  );
}