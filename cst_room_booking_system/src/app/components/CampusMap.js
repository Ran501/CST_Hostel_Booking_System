"use client";

import { useEffect, useRef } from "react";
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// Import from your new files
import { useCampusMap } from './hooks/usecampusMap';
import { useMapStats } from './hooks/useMapStats';
import { StatsCards } from './statsCard';
import { HostelButtons } from './hostelButtons';
import { HostelCard } from './hostelcard';
import { MapControls } from './mapcontrol';
import { MAP_STYLE } from './config/map-styles';
import { MAP_BOUNDS } from './constants';
import { HOSTELS } from "./constants";
import { initializeMap, addHostelMarkers, addGateMarker } from './utils/map-initialization';

export default function CampusMap() {
  const containerRef = useRef(null);
  
  const {
    mapRef,
    markersRef,
    selectedHostel,
    setSelectedHostel,
    resetMapView,
    flyToPlace,
    handleCloseHostelCard,
    hostels,
    activeMap,
  } = useCampusMap();

  const { stats } = useMapStats(hostels);

  // Initialize map - FIRST PRIORITY
  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current || mapRef.current) return;

    const map = initializeMap(containerRef.current, MAP_STYLE, MAP_BOUNDS);
    mapRef.current = map;

    addHostelMarkers(map, hostels, markersRef, setSelectedHostel);
    addGateMarker(map);

    // Setup event listeners
    const handleResize = () => map.resize();
    window.addEventListener("resize", handleResize);

    map.on("load", () => {
      map.resize();
      console.log("✅ Map loaded successfully");
    });

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Preload hostel images AFTER map is initialized (secondary priority)
  useEffect(() => {
    if (!mapRef.current) return;

    const preloadImages = () => {
      console.log("📸 Starting to preload hostel images...");
      let loadedCount = 0;
      let totalImages = 0;
      
      HOSTELS.forEach(hostel => {
        if (hostel.images && Array.isArray(hostel.images)) {
          hostel.images.forEach(imgSrc => {
            if (imgSrc && imgSrc.trim() !== '') {
              totalImages++;
              const img = new Image();
              img.src = imgSrc;
              img.decoding = "async";
              
              img.onload = () => {
                loadedCount++;
                if (loadedCount === totalImages) {
                  console.log(`✅ All ${totalImages} hostel images preloaded`);
                }
              };
              
              img.onerror = () => {
                console.warn(`❌ Failed to load: ${imgSrc}`);
                loadedCount++;
              };
            }
          });
        }
      });
      
      console.log(`📊 Found ${totalImages} images to preload`);
    };

    // Wait 1 second after map loads, then start preloading
    const timer = setTimeout(preloadImages, 1000);
    
    return () => clearTimeout(timer);
  }, [mapRef.current]); // This runs when mapRef.current changes (when map is ready)

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <StatsCards stats={stats} />
      <HostelButtons hostels={hostels} flyToPlace={flyToPlace} activeHostels={activeMap} />
      <MapControls resetMapView={resetMapView} />
      {selectedHostel && (
        <HostelCard 
          hostel={selectedHostel} 
          onClose={handleCloseHostelCard}
        />
      )}
    </div>
  );
}