// src/app/components/constants.js

export const HOSTELS = [
  {   
    id: "1",
    name: "Hostel RK-A", 
    lng: 89.394749, 
    lat: 26.849672,
    college: "College of Science and Technology",
    images: ["/rka/1.jpeg", "/rka/7.jpeg", "/rka/2.jpeg"],
    totalRooms: 144,
    occupiedRooms: 38,
    availableRooms: 12
  },
  { 
    id: "2",
    name: "Hostel RK-B", 
    lng: 89.395076, 
    lat: 26.849579,
    college: "College of Science and Technology",
    images: ["/rka/1.jpeg", "/rka/9.jpeg", "/rka/10.jpeg"],
    totalRooms: 144,
    occupiedRooms: 38,
    availableRooms: 12
  },
  { 
    id: "3",
    name: "NK Hostel", 
    lng: 89.396380, 
    lat: 26.850656,
    college: "College of Science and Technology",
    images: ["/nk/1.jpg", "/nk/3.jpeg", "/nk/4.jpeg"],
    totalRooms: 96,
    occupiedRooms: 32,
    availableRooms: 13
  },
  { 
    id: "8",
    name: "Hostel F", 
    lng: 89.394765, 
    lat: 26.848738,
    college: "College of Science and Technology",
    images: ["/hf/8.jpeg", "/hf/9.jpeg", "/hf/1.jpeg", "/hf/hf1.jpg"],
    totalRooms: 178,
    occupiedRooms: 45,
    availableRooms: 15
  },
  { 
    id: "6",
    name: "Hostel C", 
    lng: 89.394596, 
    lat: 26.848944,
    college: "College of Science and Technology",
    images: ["/hc/1.jpeg", "/hc/2.jpeg", "/hc/6.jpeg"],
    totalRooms: 70,
    occupiedRooms: 48,
    availableRooms: 7
  },
  { 
    id: "7",
    name: "Hostel D", 
    lng: 89.394743, 
    lat: 26.849073,
    college: "College of Science and Technology",
    images: ["/hd/1.jpeg", "/hd/2.jpeg"],
    totalRooms: 70,
    occupiedRooms: 48,
    availableRooms: 7
  },
  { 
    id: "4",
    name: "Hostel A", 
    lng: 89.394499, 
    lat: 26.849351,
    college: "College of Science and Technology",
    images: ["/ha/24.jpg"],
    totalRooms: 70,
    occupiedRooms: 48,
    availableRooms: 7
  },
  { 
    id: "5",
    name: "Hostel B", 
    lng: 89.394320, 
    lat: 26.849210,
    college: "College of Science and Technology",
    images: ["/hb/21.jpg", "/hb/20.jpg", "/hb/22.jpg", "/hb/11.jpg"],
    totalRooms: 70,
    occupiedRooms: 48,
    availableRooms: 7
  },

  { 
    id: "9",
    name: "Hostel HE", 
    lng: 89.395232, 
    lat: 26.849035,
    college: "College of Science and Technology",
    images: ["/hb/21.jpg", "/hb/20.jpg", "/hb/22.jpg", "/hb/11.jpg"],
    totalRooms: 70,
    occupiedRooms: 48,
    availableRooms: 7
  },

  { 
    id: "10",
    name: "Lhawang Hostel", 
    lng: 89.396857,
    lat: 26.849049,
    college: "College of Science and Technology",
    images: ["/new-hostel/1.jpg", "/new-hostel/2.jpg"],
    totalRooms: 100,
    occupiedRooms: 0,
    availableRooms: 100,
    coordinates: {
      mobile: { lng: 89.396895, lat: 26.849008 }, 
      desktop: { lng: 89.398992, lat: 26.850417 }
    }
  },
];

// ADD THIS FUNCTION - THIS IS WHAT'S MISSING
export const getHostelCoordinates = (hostel, isMobile = null) => {
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    return { lng: hostel.lng, lat: hostel.lat };
  }
  
  const checkIsMobile = isMobile !== null ? isMobile : window.innerWidth < 768;
  
  // If hostel has specific coordinates for mobile/desktop
  if (hostel.coordinates) {
    return checkIsMobile ? hostel.coordinates.mobile : hostel.coordinates.desktop;
  }
  
  // Otherwise return the default coordinates
  return { lng: hostel.lng, lat: hostel.lat };
};

export const MAP_BOUNDS = {
  southwest: [89.3919, 26.8471],
  northeast: [89.400, 26.8529]
};

export const DEVICE_BREAKPOINTS = {
  mobile: 640,
  tablet: 1024
};

export const INITIAL_ZOOM_LEVELS = {
  mobile: 16.8,
  tablet: 16.8,
  desktop: 17.3
};

export const MARKER_COLORS = {
  default: '#ef4444', // red
  selected: '#135463', // cstcolor
  gate: '#b20000' // dark red
};

export const GATE_COORDINATES = {
  lng: 89.396954,
  lat: 26.848786,
  name: "College Gate"
};