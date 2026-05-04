export const HE_NAME = "HE";
export const HE_ID = 10;
export const HE_FLOORS = [1, 2];

export const HE_FLOOR_META = {
  1: { totalRooms: 12, totalBeds: 24 },
  2: { totalRooms: 33, totalBeds: 66 },
};

export function floor1TopRow() {
  // Rooms in top row, left to right
  return [101, 102, 103, 104, 105, 106];
}

export function floor1BottomRow() {
  // Rooms in bottom row, left to right (reversed numbering)
  return [112, 111, 110, 109, 108, 107];
}


export function floor2TopRowGroupA() {
  return [224, 225, 226, 227, 228];
}

export function floor2TopRowGroupB() {
  return [229, 230, 231, 232, 233];
}

export function floor2TopRowGroupC() {
  return [201, 202, 203, 204, 205, 206];
}

export function floor2BottomRowGroupA() {
  return [222, 221, 220, 219, 218];
}

export function floor2BottomRowGroupB() {
  return [217, 216, 215, 214, 213];
}

export function floor2BottomRowGroupC() {
  return [212, 211, 210, 209, 208, 207];
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: all bookable rooms per floor
// ─────────────────────────────────────────────────────────────────────────────
export function allRoomsForFloor(floorNum) {
  switch (floorNum) {
    case 1:
      return [...floor1TopRow(), ...floor1BottomRow()];
    case 2:
      return [
        ...floor2TopRowGroupA(),
        ...floor2TopRowGroupB(),
        ...floor2TopRowGroupC(),
        ...floor2BottomRowGroupA(),
        ...floor2BottomRowGroupB(),
        ...floor2BottomRowGroupC(),
      ];
    default:
      return [];
  }
}