// src/app/components/statsCard.js

//TODO: Update the StatsCards to show the real time data properly
export const StatsCards = ({ stats }) => {
  // stats already has loading property, so we use stats.loading
  return (
    <div className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-md sm:max-w-none sm:w-auto sm:bottom-6 md:bottom-7">
      <div className="flex flex-row gap-2 sm:gap-3">
        {/* Total Available Rooms */}
        <div className="bg-white rounded-lg shadow-lg py-2 sm:px-4 sm:py-3 flex-1 min-w-0 flex flex-col items-center justify-center sm:flex-row sm:aspect-auto sm:min-w-35 md:min-w-40 mb-10 sm:mb-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-5 sm:h-5"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div className="text-center sm:text-left min-w-0 flex-1 sm:ml-2">
            <div className="text-[9px] sm:text-xs text-gray-500 font-medium">
              Available
            </div>
            {stats.loading ? (
              <div className="h-4 sm:h-6 w-8 sm:w-12 bg-gray-200 animate-pulse rounded mx-auto sm:mx-0"></div>
            ) : (
              <div className="text-sm sm:text-xl md:text-xl font-bold text-gray-900">
                {stats.totalAvailableRooms}
              </div>
            )}
          </div>
        </div>

        {/* Total Rooms */}
        <div className="bg-white rounded-lg shadow-lg py-2 sm:px-4 sm:py-3 flex-1 aspect-square flex flex-col items-center justify-center sm:flex-row sm:aspect-auto sm:min-w-35 md:min-w-40 mb-10 sm:mb-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-5 sm:h-5"
            >
              <path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
              <path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4" />
              <path d="M12 4v6" />
              <path d="M2 18h20" />
            </svg>
          </div>
          <div className="text-center sm:text-left min-w-0 flex-1 sm:ml-2">
            <div className="text-[9px] sm:text-xs text-gray-500 font-medium">
              You booked
            </div>
            {stats.loading ? (
              <div className="h-4 sm:h-6 w-8 sm:w-12 bg-gray-200 animate-pulse rounded mx-auto sm:mx-0"></div>
            ) : (
                <div className="text-sm sm:text-xl md:text-xl font-bold text-gray-900">
                {stats.bookedRoom}
              </div>
            )}
          </div>
        </div>

        {/* Occupancy Rate */}
        <div className="bg-white rounded-lg shadow-lg py-2 sm:px-4 sm:py-3 flex-1 aspect-square flex flex-col items-center justify-center sm:flex-row sm:aspect-auto sm:min-w-35 md:min-w-40 mb-10 sm:mb-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mb-1 sm:mb-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="sm:w-5 sm:h-5"
            >
              <path d="m16 11 2 2 4-4" />
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div className="text-center sm:text-left min-w-0 flex-1 sm:ml-2">
            <div className="text-[9px] sm:text-xs text-gray-500 font-medium">
              Occupancy
            </div>
            {stats.loading ? (
              <div className="h-4 sm:h-6 w-8 sm:w-12 bg-gray-200 animate-pulse rounded mx-auto sm:mx-0"></div>
            ) : (
              <div className="text-sm sm:text-xl md:text-xl font-bold text-gray-900">
                {stats.occupancyRate}%
        
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};