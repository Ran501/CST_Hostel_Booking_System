import { useCallback, useRef, useState, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import { getDeviceMapSettings } from '../utils/map-utils';
import { HOSTELS } from '../constants';

export const useCampusMap = () => {
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [activeMap, setActiveMap] = useState({});

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

      marker.getElement().style.display = isActive
        ? 'block'
        : 'none';
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

    setSelectedHostel(place);
    
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    
    // Fix: Use proper PointLike type [number, number]
    const offset = isMobile ? [0, -180] : [0, 0];

    mapRef.current.flyTo({
      center: { lng: place.lng, lat: place.lat },
      zoom: 19,
      duration: 2000,
      offset // This is now properly typed
    });

    // Reset all markers first (flyToPlace should also reset markers)
    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      const markerEl = marker.getElement();
      if (markerEl) {
        const svg = markerEl.querySelector('svg');
        const path = svg?.querySelector('path');
        if (path) {
          path.setAttribute('fill', '#ef4444'); // Red color
        }
        markerEl.style.filter = 'none';
      }
    });

    // Highlight the selected marker after fly animation
    setTimeout(() => {
      const selectedMarker = markersRef.current[place.id];
      if (selectedMarker) {
        const markerEl = selectedMarker.getElement();
        if (markerEl) {
          const svg = markerEl.querySelector('svg');
          const path = svg?.querySelector('path');
          if (path) {
            path.setAttribute('fill', '#135463'); // cst color
          }
          markerEl.style.filter = 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 6px rgba(37, 99, 235, 0.6))';
        }
      }
    });
  }, []);

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
          path.setAttribute('fill', '#ef4444'); // Red color
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
  };
};