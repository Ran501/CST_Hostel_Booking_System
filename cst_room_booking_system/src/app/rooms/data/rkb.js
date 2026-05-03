// RKB Hostel Building Data Configuration

export const RKB_NAME = "RKB";

export function leftColumnRoomsForFloor(floorNum) {
  // Returns room numbers for left column based on floor
  const roomMap = {
    1: [113, 114, 115, 116, 117, 118],
    2: [213, 214, 215, 216, 217, 218],
    3: [313, 314, 315, 316, 317, 318],
    4: [413, 414, 415, 416, 417, 418],
  };
  return roomMap[floorNum] || [];
}

export function rightColumnRoomsForFloor(floorNum) {
  // Returns room numbers for right column based on floor
  const roomMap = {
    1: [119, 120, 121, 122, 123, 124],
    2: [219, 220, 221, 222, 223, 224],
    3: [319, 320, 321, 322, 323, 324],
    4: [419, 420, 421, 422, 423, 424],
  };
  return roomMap[floorNum] || [];
}
