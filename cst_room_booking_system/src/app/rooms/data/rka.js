// src/app/room/data/rka.js

export const RKA_FLOORS = [1, 2, 3, 4];
export const RKA_NAME = "RKA";

export function allRoomsForFloor(floor) {
  const base = floor * 100;
  return Array.from({ length: 12 }, (_, i) => base + i + 1);
}

export function leftColumnRoomsForFloor(floor) {
  const base = floor * 100;
  // 07..12 ascending
  return Array.from({ length: 6 }, (_, i) => base + 7 + i);
}

export function rightColumnRoomsForFloor(floor) {
  const base = floor * 100;
  // 06..01 descending
  return Array.from({ length: 6 }, (_, i) => base + 6 - i);
}

export function isRoomNumberOnFloor(room, floor) {
  const base = floor * 100;
  return room >= base + 1 && room <= base + 12;
}

export function bookedRoomsForFloor(floor) {
  // Demo data: room 106 booked on floor 1, 205 on floor 2
  if (floor === 1) return [106];
  if (floor === 2) return [205];
  return [];
}
