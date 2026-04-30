import type { FloorNumber } from "../types";

export const RKB_FLOORS: FloorNumber[] = [1, 2, 3, 4];
export const RKB_NAME = "RKB";

export function allRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  return Array.from({ length: 12 }, (_, i) => base + 13 + i);
}

export function leftColumnRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  // 07..12 ascending
  return Array.from({ length: 6 }, (_, i) => base + 19 + i);
}

export function rightColumnRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  // 06..01 descending
  return Array.from({ length: 6 }, (_, i) => base + 18 - i);
}

export function isRoomNumberOnFloor(room: number, floor: FloorNumber): boolean {
  const base = floor * 100;
  return room >= base + 13 && room <= base + 24;
}

export function rkbBookedRoomsForFloor(floor: FloorNumber): number[] {
  // Demo data mirrors RKA: room 106 booked on floor 1, 205 on floor 2
  if (floor === 1) return [124];
  if (floor === 2) return [215];
  return [];
}
