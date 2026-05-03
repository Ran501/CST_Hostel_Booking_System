// NK Hostel Building Data Configuration

export const NK_NAME = "NK";

export function nkLeftRoomsForFloor(floorNum) {
  // Returns room numbers for left column based on floor
  const roomMap = {
    1: [101, 102, 103, 104],
    2: [201, 202, 203, 204],
    3: [301, 302, 303, 304],
    4: [401, 402, 403, 404],
  };
  return roomMap[floorNum] || [];
}

export function nkMiddleRoomsForFloor(floorNum) {
  // Returns room numbers for middle column based on floor
  const roomMap = {
    1: [105, 106, 107, 108],
    2: [205, 206, 207, 208],
    3: [305, 306, 307, 308],
    4: [405, 406, 407, 408],
  };
  return roomMap[floorNum] || [];
}

export function nkRightRoomsForFloor(floorNum) {
  // Returns room numbers for right column based on floor
  const roomMap = {
    1: [109, 110, 111, 112],
    2: [209, 210, 211, 212],
    3: [309, 310, 311, 312],
    4: [409, 410, 411, 412],
  };
  return roomMap[floorNum] || [];
}
