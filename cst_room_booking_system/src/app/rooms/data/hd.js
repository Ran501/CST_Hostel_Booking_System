// HD Hostel Building Data Configuration

export const HD_NAME = "HD";

export function hdLeftRoomsForFloor(floorNum) {
  // Returns room numbers for left column based on floor
  const roomMap = {
    1: [101, 102, 103, 104, 105, 106],
    2: [201, 202, 203, 204, 205, 206],
    3: [301, 302, 303, 304, 305, 306],
  };
  return roomMap[floorNum] || [];
}

export function hdRightRoomsForFloor(floorNum) {
  // Returns room numbers for right column based on floor
  const roomMap = {
    1: [107, 108, 109, 110, 111, 112],
    2: [207, 208, 209, 210, 211, 212],
    3: [307, 308, 309, 310, 311, 312],
  };
  return roomMap[floorNum] || [];
}
