// src/app/components/hooks/usecampusMap.js
import { useCallback, useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { getDeviceMapSettings } from '../utils/map-utils';
import { HOSTELS } from '../constants';

export const useCampusMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [activeMap, setActiveMap] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const normalize = (name) => 
    name.replace(' HOSTEL', '').toUpperCase();

  useEffect(() => {
    const fetchActiveStatus = async () => {
      const res = await fetch('/api/admin/hostel');
      const data = await res.json();

      const obj = {};
      data.hostels.forEach((h) => {
        obj[h.id] = h.isActive;
      });

      setActiveMap(obj);

      // Update markers immediately
      Object.entries(markersRef.current).forEach(([name, marker]) => {
        const hostel = HOSTELS.find(h => h.name === name);
        if (!hostel) return;
        const isActive = obj[hostel.id] ?? true;
        marker.getElement().style.display = isActive ? 'block' : 'none';
      });
    };

    fetchActiveStatus();
    const interval = setInterval(fetchActiveStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const isActive = activeMap[id] ?? true;
      marker.getElement().style.display = isActive ? 'block' : 'none';
    });
  }, [activeMap]);

  const resetMapView = useCallback(() => {
    if (!mapRef.current) return;
    const settings = getDeviceMapSettings();
    mapRef.current.flyTo({
      center: settings.center,
      zoom: settings.zoom,
      duration: 2000
    });
  }, []);

  const flyToPlace = useCallback((place) => {
    if (!mapRef.current) return;

    // Get responsive coordinates for the hostel
    const coordinates = getHostelCoordinates(place, isMobile);
    
    // Create a new place object with the correct coordinates for this device
    const placeWithCorrectCoords = {
      ...place,
      lng: coordinates.lng,
      lat: coordinates.lat
    };

    setSelectedHostel(placeWithCorrectCoords);
    
    const mobileCheck = isMobile || (typeof window !== 'undefined' && window.innerWidth < 640);
    
    // Fix: Use proper PointLike type [number, number]
    const offset = mobileCheck ? [0, -180] : [0, 0];

    mapRef.current.flyTo({
      center: { lng: coordinates.lng, lat: coordinates.lat },
      zoom: 19,
      duration: 2000,
      offset
    });

    // Reset all markers first
    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      const markerEl = marker.getElement();
      if (markerEl) {
        const svg = markerEl.querySelector('svg');
        const path = svg?.querySelector('path');
        if (path) {
          path.setAttribute('fill', '#ef4444');
        }
        markerEl.style.filter = 'none';
      }
    });

    // Highlight the selected marker
    setTimeout(() => {
      const selectedMarker = markersRef.current[place.id];
      if (selectedMarker) {
        const markerEl = selectedMarker.getElement();
        if (markerEl) {
          const svg = markerEl.querySelector('svg');
          const path = svg?.querySelector('path');
          if (path) {
            path.setAttribute('fill', '#135463');
          }
          markerEl.style.filter = 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 6px rgba(37, 99, 235, 0.6))';
        }
      }
    });
  }, [isMobile]);

  const handleCloseHostelCard = useCallback(() => {
    setSelectedHostel(null);
    // Reset all markers when closing card
    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      const markerEl = marker.getElement();
      if (markerEl) {
        const svg = markerEl.querySelector('svg');
        const path = svg?.querySelector('path');
        if (path) {
          path.setAttribute('fill', '#ef4444');
        }
        markerEl.style.filter = 'none';
      }
    });
  }, []);

  return {
    mapRef,
    markersRef,
    selectedHostel,
    setSelectedHostel,
    resetMapView,
    flyToPlace,
    handleCloseHostelCard,
    hostels: HOSTELS,
    activeMap,
    isMobile,
  };
};