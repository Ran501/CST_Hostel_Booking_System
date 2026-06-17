// NK Hostel Building Data Configuration

export const NK_NAME = "NK";

// Left wing rooms (4 rooms per floor)
export function nkLeftRoomsForFloor(floorNum) {
  const roomMap = {
    1: [101, 102, 103, 104],
    2: [201, 202, 203, 204],
    3: [301, 302, 303, 304],
    4: [401, 402, 403, 404],
  };
  return roomMap[floorNum] || [];
}

// Right wing rooms (4 rooms per floor)
export function nkRightRoomsForFloor(floorNum) {
  const roomMap = {
    1: [105, 106, 107, 108],
    2: [205, 206, 207, 208],
    3: [305, 306, 307, 308],
    4: [405, 406, 407, 408],
  };
  return roomMap[floorNum] || [];
}

// Left Kitchen name per floor (K101, K201, K301, K401)
export function getLeftKitchen(floorNum) {
  return `K${floorNum}01`;
}

// Right Kitchen name per floor (K102, K202, K302, K402)
export function getRightKitchen(floorNum) {
  return `K${floorNum}02`;
}