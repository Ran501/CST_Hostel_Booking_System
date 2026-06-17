export const HE_NAME = "HE";
export const HE_ID = 10;
export const HE_FLOORS = [1, 2];

export const HE_FLOOR_META = {
  1: { totalRooms: 12, totalBeds: 24 },
  2: { totalRooms: 33, totalBeds: 66 },
};

export function floor1rightcolumn() {
  return [101, 102, 103, 104, 105, 106];
}

export function floor1leftcolumn() {
  return [112, 111, 110, 109, 108, 107];
}

export function floor2Toprightmid() {
  return [223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233];
}

export function floor2bottomright() {
  return [201, 202, 203, 204, 205, 206];
}

export function floor2topleft() {
  return [222, 221, 220, 219, 218];
}

export function floor2leftmid() {
  return [217, 216, 215, 214, 213];
}

export function floor2Bottomleft() {
  return [212, 211, 210, 209, 208, 207];
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience: all bookable rooms per floor
// ─────────────────────────────────────────────────────────────────────────────
export function allRoomsForFloor(floorNum) {
  switch (floorNum) {
    case 1:
      return [...floor1rightcolumn(), ...floor1leftcolumn()];
    case 2:
      return [
        ...floor2Toprightmid(),
        ...floor2bottomright(),
        ...floor2topleft(),
        ...floor2leftmid(),
        ...floor2Bottomleft(),
      ];
    default:
      return [];
  }
}