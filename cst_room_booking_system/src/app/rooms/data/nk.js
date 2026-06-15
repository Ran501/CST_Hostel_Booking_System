// NK Hostel Building Data Configuration

export const NK_NAME = "NK";

export function nkLeftRoomsForFloor(floorNum) {
  const roomMap = {
    1: [101, 102, 103, 104],
    2: [201, 202, 203, 204],
    3: [301, 302, 303, 304],  // Fixed: 309-312 on left
    4: [401, 402, 403, 404],
  };
  return roomMap[floorNum] || [];
}

export function nkRightRoomsForFloor(floorNum) {
  const roomMap = {
    1: [105, 106, 107, 108],
    2: [205, 206, 207, 208],
    3: [305, 306, 307, 308],  // Fixed: 305-308 on right
    4: [405, 406, 407, 408],
  };
  return roomMap[floorNum] || [];
}

// Remove nkMiddleRoomsForFloor - not needed
export function nkMiddleRoomsForFloor(floorNum) {
  return [];  // Return empty array since not used
}

// Bookable Luggage Rooms
export const LEFT_KITCHEN = "Kitchen";
export const RIGHT_KITCHEN = "Kitchen";