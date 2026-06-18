// src/app/components/hostelcard.js

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export const HostelCard = ({ hostel, onClose, onBook, refreshTrigger, onBookingComplete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  const router = useRouter();
  const timeoutRef = useRef(null);

  // Dynamic data from API
  const totalBeds = stats?.totalBeds ?? hostel.totalBeds ?? hostel.capacity ?? 0;
  const availableBeds = stats?.availableBeds ?? hostel.availableBeds ?? 0;
  const occupiedBeds = useMemo(() => {
    if (stats?.occupiedBeds != null) return stats.occupiedBeds;
    if (hostel.occupiedBeds != null) return hostel.occupiedBeds;
    if (totalBeds > 0 && availableBeds >= 0) {
      return Math.max(0, totalBeds - availableBeds);
    }
    return 0;
  }, [stats, hostel, totalBeds, availableBeds]);

  const bookedPercentage = useMemo(() => {
    if (!totalBeds || totalBeds === 0) return 0;
    return Math.round((occupiedBeds / totalBeds) * 100);
  }, [occupiedBeds, totalBeds]);

  const imageAlt = useMemo(() => 
    `${hostel.name} at ${hostel.college} - Photo ${currentImageIndex + 1} of ${hostel.images?.length || 0}`
  , [hostel.name, hostel.college, currentImageIndex, hostel.images]);

  const handleNextImage = useCallback(() => {
    const images = hostel.images;
    if (images && images.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % images.length);
    }
  }, [hostel.images]);

  const handlePrevImage = useCallback(() => {
    const images = hostel.images;
    if (images && images.length > 1) {
      setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length);
    }
  }, [hostel.images]);

  // Function to fetch stats
  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await fetch(
        `/api/hostel-stats?id=${encodeURIComponent(hostel.id)}&name=${encodeURIComponent(hostel.name)}`,
        {
          cache: 'no-store',
        }
      );
      const data = await res.json().catch(() => null);

      console.log('API Response:', data);

      if (!res.ok || !data?.success || !data?.stats) {
        console.log('No stats data from API');
        setIsStatsLoading(false);
        return;
      }

      const next = {
        totalBeds: Number(data.stats.totalBeds ?? 0),
        occupiedBeds: Number(data.stats.occupiedBeds ?? 0),
        availableBeds: Number(data.stats.availableBeds ?? 0),
        occupancyRate: Number(data.stats.occupancyRate ?? 0),
      };

      console.log('Processed stats:', next);
      setStats(next);
      setIsStatsLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setIsStatsLoading(false);
    }
  }, [hostel.id, hostel.name]);

  // Fetch stats on mount and when refreshTrigger changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats, refreshTrigger]); // ← refreshTrigger added here

  const handleBookNow = useCallback(() => {
    setIsLoading(true);

    if (onBookingComplete) {
      onBookingComplete(); // This will refresh stats
    }
    
    if (onBook) {
      onBook();
    } else {
      router.push(`/rooms/${hostel.id}/floor/1`);
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onClose();
      setIsLoading(false);
    }, 500);
  }, [hostel.id, onBook, onClose, router]);

  // Preload adjacent images via Next's image optimizer (NOT the raw originals),
  // so navigation is instant without downloading full-size source files.
  useEffect(() => {
    const images = hostel.images;
    if (images && images.length > 1) {
      const nextIndex = (currentImageIndex + 1) % images.length;
      const prevIndex = (currentImageIndex - 1 + images.length) % images.length;

      [nextIndex, prevIndex].forEach(index => {
        const img = new window.Image();
        img.src = `/_next/image?url=${encodeURIComponent(images[index])}&w=640&q=85`;
      });
    }
  }, [currentImageIndex, hostel.images]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Get current image URL safely
  const currentImage = hostel.images?.[currentImageIndex];
  const hasMultipleImages = hostel.images && hostel.images.length > 1;

  return (
    <div className="pointer-events-auto fixed left-0 right-0 bottom-0 z-20 bg-white rounded-t-3xl shadow-2xl overflow-y-auto max-h-[55vh] flex flex-col mx-0 sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:w-80 md:w-96 sm:max-h-none sm:rounded-xl sm:flex-none sm:mx-0">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-30 w-9 h-9 flex items-center justify-center bg-white/95 hover:bg-white rounded-full shadow-lg transition-all cursor-pointer sm:top-4 sm:right-4 sm:w-8 sm:h-8 hardware-accelerated"
        aria-label="Close hostel details"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" color="black">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Image Carousel */}
      <div className="relative h-56 sm:h-64 md:h-72 lg:h-80 bg-gray-200 shrink-0 mb-0 sm:mb-0 sm:pb-0">
        {currentImage && currentImage.trim() ? (
          <>
            <div className="relative w-full h-full">
              <Image
                src={currentImage}
                alt={imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 384px"
                quality={85}
                priority={currentImageIndex === 0}
                loading={currentImageIndex === 0 ? "eager" : "lazy"}
              />
            </div>
            
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-lg transition-all cursor-pointer hardware-accelerated"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/80 hover:bg-white rounded-full shadow-lg transition-all cursor-pointer hardware-accelerated"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" color="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </>
            )}

            {hasMultipleImages && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {hostel.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/60 hover:bg-white/80'
                    }`}
                    aria-label={`Go to image ${idx + 1}`}
                    aria-current={idx === currentImageIndex ? 'true' : 'false'}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No images available
          </div>
        )}
      </div>

      {/* Hostel Information */}
      <div className="p-3 sm:p-5 md:p-6 flex-1 overflow-y-auto mt-0">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{hostel.name}</h2>
        <p className="text-[10px] sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4 line-clamp-1 sm:line-clamp-2">{hostel.college}</p>
        
        {isStatsLoading ? (
          // Loading skeleton
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-sm font-medium text-gray-700">Occupancy</span>
              <span className="text-[10px] sm:text-sm font-semibold text-gray-300 animate-pulse">Loading...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
              <div className="bg-gray-300 h-full rounded-full w-0 animate-pulse" />
            </div>
          </div>
        ) : totalBeds > 0 ? (
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <span className="text-[10px] sm:text-sm font-medium text-gray-700">Occupancy</span>
              <span className="text-[10px] sm:text-sm font-semibold text-cstcolor">
                {occupiedBeds} / {totalBeds}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
              <div 
                className="bg-linear-to-r from-cstcolor to-cstcolor2 h-full rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ 
                  width: `${bookedPercentage}%` 
                }}
                aria-valuenow={bookedPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[9px] sm:text-xs text-gray-500">
              <span>{availableBeds} Beds Available</span>
              <span className="text-cstcolor font-medium">{bookedPercentage}% Booked</span>
            </div>
          </div>
        ) : (
          <div className="mb-3 sm:mb-4 md:mb-5 text-center text-gray-400 text-sm">
            No availability data
          </div>
        )}
        
        <button
          onClick={handleBookNow}
          disabled={isLoading}
          className={`w-full py-2.5 sm:py-2.5 md:py-3 px-3 sm:px-4 ${
            isLoading ? 'bg-cstcolor' : 'bg-cstcolor hover:bg-cstcolor2'
          } text-white text-xs sm:text-sm md:text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 ${
            isLoading ? 'cursor-wait' : 'cursor-pointer'
          } hardware-accelerated`}
          aria-busy={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Redirecting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-4 sm:h-4 md:h-4.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Book Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};