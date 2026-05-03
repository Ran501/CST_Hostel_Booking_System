import { MARKER_COLORS } from '../constants';

export const createHostelMarker = (hostelName, isSelected) => {
  const markerEl = document.createElement('div');
  markerEl.style.width = '30px';
  markerEl.style.height = '30px';
  markerEl.style.cursor = 'pointer';
  markerEl.style.transition = 'filter 0.3s ease';
  markerEl.style.transform = 'none';
  
  const color = isSelected ? MARKER_COLORS.selected : MARKER_COLORS.default;
  
  markerEl.innerHTML = `
    <svg width="30" height="30" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
  `;
  
  return markerEl;
};

export const createGateMarker = () => {
  const gateEl = document.createElement("div");
  gateEl.style.cursor = "pointer";
  
  gateEl.innerHTML = `
    <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="6" y="10" width="2" height="10" fill="${MARKER_COLORS.gate}"/>
          <rect x="16" y="10" width="2" height="10" fill="${MARKER_COLORS.gate}"/>
          <path d="M6 10 A6 6 0 0 1 18 10" stroke="${MARKER_COLORS.gate}" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <span style="position:absolute; bottom:32px; background:rgba(255,255,255,0.95); color:#111; padding:2px 6px; border-radius:4px; font-size:12px; line-height:1; box-shadow:0 1px 2px rgba(0,0,0,0.2); white-space:nowrap;">
        College Gate
      </span>
    </div>
  `;
  
  return gateEl;
};

export const highlightMarker = (markerEl) => {
  if (!markerEl) return;
  
  const svg = markerEl.querySelector("svg");
  const path = svg?.querySelector("path");
  if (path) {
    path.setAttribute("fill", MARKER_COLORS.selected);
  }
  
  markerEl.style.filter = 'drop-shadow(0 0 12px rgba(37, 99, 235, 0.9)) drop-shadow(0 0 6px rgba(37, 99, 235, 0.6))';
};

export const resetMarker = (markerEl) => {
  if (!markerEl) return;
  
  const svg = markerEl.querySelector("svg");
  const path = svg?.querySelector("path");
  if (path) {
    path.setAttribute("fill", MARKER_COLORS.default);
  }
  
  markerEl.style.filter = 'none';
};

export const applyHoverEffect = (markerEl) => {
  if (!markerEl) return;
  
  const svg = markerEl.querySelector('svg');
  const path = svg?.querySelector('path');
  // Only show hover effect if marker is not selected (blue)
  if (path && path.getAttribute('fill') !== MARKER_COLORS.selected) {
    markerEl.style.filter = 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))';
  }
};

export const removeHoverEffect = (markerEl) => {
  if (!markerEl) return;
  
  const svg = markerEl.querySelector('svg');
  const path = svg?.querySelector('path');
  // Only reset hover effect if marker is not selected (blue)
  if (path && path.getAttribute('fill') !== MARKER_COLORS.selected) {
    markerEl.style.filter = 'none';
  }
};