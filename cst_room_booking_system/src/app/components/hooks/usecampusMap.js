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

  // Fetch active status
  useEffect(() => {
    const fetchActiveStatus = async () => {
      try {
        const res = await fetch('/api/admin/hostel');
        const data = await res.json().catch(() => null);

        if (!data || !data.hostels) {
          console.warn('No hostel data received from API');
          return;
        }

        const obj = {};
        data.hostels.forEach((h) => {
          obj[h.id] = h.isActive;
        });

        setActiveMap(obj);

        Object.entries(markersRef.current).forEach(([name, marker]) => {
          const hostel = HOSTELS.find((h) => h.name === name);
          if (!hostel) return;

          const isActive = obj[hostel.id] ?? true;
          marker.getElement().style.display = isActive ? 'block' : 'none';
        });
      } catch (error) {
        console.error('Error fetching active status:', error);
      }
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

  // Reset map view
  const resetMapView = useCallback(() => {
    if (!mapRef.current) return;

    const settings = getDeviceMapSettings();

    mapRef.current.flyTo({
      center: settings.center,
      zoom: settings.zoom,
      duration: 2000
    });
  }, []);

  // Fixed fly function
  const flyToPlace = useCallback((place) => {
    if (!mapRef.current) {
      console.log('Map not ready');
      return;
    }

    setSelectedHostel(place);

    // Reset all markers to default red color
    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      const markerEl = marker.getElement();

      if (markerEl) {
        const path = markerEl.querySelector('svg path');
        if (path) {
          path.setAttribute('fill', '#ef4444');
        }
        markerEl.style.filter = 'none';
      }
    });

    // Highlight selected marker with a small delay to allow DOM to render
    setTimeout(() => {
      const selectedMarker = markersRef.current[place.id];
      if (selectedMarker) {
        const markerEl = selectedMarker.getElement();
        if (markerEl) {
          const path = markerEl.querySelector('svg path');
          if (path) {
            path.setAttribute('fill', '#135463');
          }
          markerEl.style.filter = 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 6px rgba(37, 99, 235, 0.6))';
        }
      }
    }, 10); // Small delay for DOM to render the SVG path

    // Fly to the place coordinates
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

    let lng = place.lng;
    let lat = place.lat;

    if (place.name === 'LHAWANG HOSTEL' || place.name === 'Lhawang Hostel') {
      // Use desktop coordinates for Lhawang Hostel
      lng = place.coordinates.desktop.lng;
      lat = place.coordinates.desktop.lat;
    }

    const offset = isMobile ? [0, -120] : [0, 0];

    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 18,
      duration: 2000,
      offset
    });
  }, []);

  // Close card
  const handleCloseHostelCard = useCallback(() => {
    setSelectedHostel(null);

    Object.keys(markersRef.current).forEach((key) => {
      const marker = markersRef.current[key];
      const markerEl = marker.getElement();

      if (markerEl) {
        const path = markerEl.querySelector('svg path');
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
    activeMap
  };
};