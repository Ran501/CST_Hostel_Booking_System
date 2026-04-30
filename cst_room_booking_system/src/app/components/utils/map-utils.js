import { DEVICE_BREAKPOINTS, INITIAL_ZOOM_LEVELS } from '../constants';

export const getDeviceMapSettings = () => {
  if (typeof window === "undefined") {
    return getDesktopSettings();
  }
  
  const width = window.innerWidth;
  
  if (width < DEVICE_BREAKPOINTS.mobile) {
    return getMobileSettings();
  } else if (width < DEVICE_BREAKPOINTS.tablet) {
    return getTabletSettings();
  } else {
    return getDesktopSettings();
  }
};

export const getMobileSettings = () => ({
  center: { lng: 89.395650, lat: 26.849641 },
  zoom: INITIAL_ZOOM_LEVELS.mobile
});

export const getTabletSettings = () => ({
  center: { lng: 89.395650, lat: 26.849641 },
  zoom: INITIAL_ZOOM_LEVELS.tablet
});

export const getDesktopSettings = () => ({
  center: { lng: 89.3945, lat: 26.8495 },
  zoom: INITIAL_ZOOM_LEVELS.desktop
});

export const calculateFlyToOffset = (isMobile) => 
  isMobile ? [0, -180] : [0, 0];