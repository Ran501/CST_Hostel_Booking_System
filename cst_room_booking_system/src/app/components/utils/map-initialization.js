// src/app/components/utils/map-initialization.js
import maplibregl from 'maplibre-gl';
import { getDeviceMapSettings } from './map-utils';
import { 
  createHostelMarker, 
  createGateMarker, 
  applyHoverEffect, 
  removeHoverEffect,
  highlightMarker,
  resetMarker 
} from './marker-utils';
import { MAP_BOUNDS, GATE_COORDINATES, HOSTELS, getHostelCoordinates } from '../constants';
import { MAP_STYLE } from '../config/map-styles';

export const initializeMap = (container, style, bounds) => {
  const settings = getDeviceMapSettings();
  
  const map = new maplibregl.Map({
    container,
    style,
    center: settings.center,
    zoom: settings.zoom,
    minZoom: 15.5,
    maxZoom: 18.5,
    maxBounds: [bounds.southwest, bounds.northeast],
    attributionControl: false
  });

  return map;
};

export const addHostelMarkers = (map, hostels, markersRef, onHostelSelect) => {
  // Detect if mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  
  hostels.forEach(hostel => {
    // Get responsive coordinates for this hostel
    const coordinates = getHostelCoordinates(hostel, isMobile);
    
    // Create marker with the responsive coordinates
    const markerEl = createHostelMarker(hostel.name, false);
    
    const marker = new maplibregl.Marker({ 
      element: markerEl,
      anchor: 'bottom'
    })
      .setLngLat({ lng: coordinates.lng, lat: coordinates.lat })
      .addTo(map);

    // Create popup for hover
    const hoverPopup = new maplibregl.Popup({ 
      offset: 25,
      closeButton: false,
      closeOnClick: false
    })
      .setLngLat({ lng: coordinates.lng, lat: coordinates.lat })
      .setHTML(`<div style="padding: 4px 8px; color:black;font-size: 13px; font-weight: 500;">${hostel.name}</div>`);

    // Add hover effects
    markerEl.addEventListener('mouseenter', () => {
      applyHoverEffect(markerEl);
      hoverPopup.addTo(map);
    });

    markerEl.addEventListener('mouseleave', () => {
      removeHoverEffect(markerEl);
      hoverPopup.remove();
    });

    // Add click handler
    markerEl.addEventListener('click', () => {
      // Reset all markers to red first
      Object.keys(markersRef.current).forEach((key) => {
        const otherMarker = markersRef.current[key];
        const otherMarkerEl = otherMarker.getElement();
        resetMarker(otherMarkerEl);
      });

      // Highlight this marker
      highlightMarker(markerEl);

      // Open hostel card with the hostel object
      onHostelSelect(hostel);
    });

    markersRef.current[hostel.id] = marker;
  });
};

export const addGateMarker = (map) => {
  const gateEl = createGateMarker();
  
  new maplibregl.Marker({ element: gateEl })
    .setLngLat({ lng: GATE_COORDINATES.lng, lat: GATE_COORDINATES.lat })
    .addTo(map);
};

export const handleMapResize = (map) => {
  if (map) {
    map.resize();
  }
};

export const resetAllMarkers = (markersRef) => {
  Object.keys(markersRef.current).forEach((key) => {
    const marker = markersRef.current[key];
    const markerEl = marker.getElement();
    resetMarker(markerEl);
  });
};