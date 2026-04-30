// src/app/components/hostelButtons.js
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react"; // or your icon library

export const HostelButtons = ({
  hostels,
  activeHostels,
  flyToPlace,
}) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Filter hostels based on active status
  const filteredHostels = hostels.filter((hostel) => {
    if (!activeHostels) return true; // API not loaded yet
    return activeHostels[hostel.id] !== false; // check active status
  });

  // Check if we need to show navigation arrows
  const checkScroll = () => {
    if (!containerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
    
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 1); // -1 for rounding errors
  };

  // Check on mount and when filtered hostels change
  useEffect(() => {
    checkScroll();
    // Re-check after a small delay to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkScroll, 100);
    return () => clearTimeout(timeoutId);
  }, [filteredHostels]);

  // Handle scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    
    return () => {
      container.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  // Scroll functions
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="pointer-events-auto absolute left-2 right-2 top-3 z-10 sm:left-4 sm:right-auto sm:top-4 sm:w-auto">
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={scrollLeft}
            className="cursor-pointer mt-8 ml-5 absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 z-20
                       rounded-full bg-white p-1.5 shadow-md hover:shadow-lg
                       transition-all hover:bg-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4 text-gray-700" />
          </button>
        )}

        {/* Hostel Buttons Container */}
        <div
          ref={containerRef}
          className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {filteredHostels.map((hostel) => (
            <button
              key={hostel.id}
              onClick={() => flyToPlace(hostel)}
              className="cursor-pointer shrink-0 rounded-full bg-white px-4 py-2 text-xs sm:text-sm
                         font-medium text-gray-800 shadow-md
                         hover:shadow-lg transition-all hover:bg-gray-200"
            >
              {hostel.name}
            </button>
          ))}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={scrollRight}
            className="cursor-pointer mr-5 mt-8 absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 z-20
                       rounded-full bg-white p-1.5 shadow-md hover:shadow-lg
                       transition-all hover:bg-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};