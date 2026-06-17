// HC Hostel Building Data Configuration

export const HC_NAME = "HC";
export const HC_FLOORS = [1, 2, 3];

export function hcAllRoomsForFloor(floor) {
  const base = floor * 100;
  const count = floor === 1 ? 13 : 14; // Floor 1: 13 rooms, Floors 2-3: 14 rooms
  return Array.from({ length: count }, (_, i) => base + i + 1);
}

export function hcLeftRoomsForFloor(floor) {
  const b = floor * 100;
  if (floor === 1) {
    // Left column top: 110,111,112,113; bottom: 101..104
    return [b + 10, b + 11, b + 12, b + 13, b + 1, b + 2, b + 3, b + 4];
  }
  // Floors 2 and 3: left column 211..203 descending (9 rooms)
  return [b + 11, b + 10, b + 9, b + 8, b + 7, b + 6, b + 5, b + 4, b + 3];
}

export function hcRightRoomsForFloor(floor) {
  const b = floor * 100;
  if (floor === 1) {
    // Right column: 109,108,107,106,105 (top to bottom)
    return [b + 9, b + 8, b + 7, b + 6, b + 5];
  }
  // Floors 2 and 3: right column top: 212,213,214; then 201,202
  return [b + 12, b + 13, b + 14, b + 1, b + 2];
}

export function hcIsRoomNumberOnFloor(room, floor) {
  const base = floor * 100;
  const max = floor === 1 ? base + 13 : base + 14;
  return room >= base + 1 && room <= max;
}

export function hcBookedRoomsForFloor(floor) {
  // Demo booking to match provided visuals: 106 on floor 1, 201 on floor 2
  if (floor === 1) return [106];
  if (floor === 2) return [201];
  return [];
}