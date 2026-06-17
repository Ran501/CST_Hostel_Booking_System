// src/app/room/data/rkb.js

export const RKB_FLOORS = [1, 2, 3, 4];
export const RKB_NAME = "RKB";

export function allRoomsForFloor(floor) {
  const base = floor * 100;
  return Array.from({ length: 12 }, (_, i) => base + 13 + i);
}

export function leftColumnRoomsForFloor(floor) {
  const base = floor * 100;
  // 19..24 ascending
  return Array.from({ length: 6 }, (_, i) => base + 19 + i);
}

export function rightColumnRoomsForFloor(floor) {
  const base = floor * 100;
  // 18..13 descending
  return Array.from({ length: 6 }, (_, i) => base + 18 - i);
}

export function isRoomNumberOnFloor(room, floor) {
  const base = floor * 100;
  return room >= base + 13 && room <= base + 24;
}

export function rkbBookedRoomsForFloor(floor) {
  // Demo data mirrors RKA: room 124 booked on floor 1, 215 on floor 2
  if (floor === 1) return [124];
  if (floor === 2) return [215];
  return [];
}
