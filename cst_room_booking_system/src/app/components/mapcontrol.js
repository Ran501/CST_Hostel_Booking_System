// src/app/components/mapcontrol.js

export const MapControls = ({ resetMapView }) => {
  return (
    <div className="hidden sm:block pointer-events-auto absolute left-2 right-2 top-14 z-10 sm:left-4 sm:right-auto sm:top-16 sm:w-auto">
      <button
        onClick={resetMapView}
        className="cursor-pointer rounded-full bg-white px-4 py-2 text-xs sm:text-sm font-medium text-gray-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap hover:bg-gray-200"
        title="Reset to center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
          <line x1="12" y1="2" x2="12" y2="4"/>
          <line x1="12" y1="20" x2="12" y2="22"/>
          <line x1="2" y1="12" x2="4" y2="12"/>
          <line x1="20" y1="12" x2="22" y2="12"/>
        </svg>
        <span>Reset View</span>
      </button>
    </div>
  );
};