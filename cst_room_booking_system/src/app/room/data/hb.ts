import type { FloorNumber } from "../types";

export const HB_NAME = "HB";
export const HB_FLOORS: FloorNumber[] = [1, 2, 3];

export function hbAllRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  const count = floor === 1 ? 13 : 14; // Floor 1: 13 rooms, Floors 2-3: 14 rooms
  return Array.from({ length: count }, (_, i) => base + i + 1);
}

export function hbLeftRoomsForFloor(floor: FloorNumber): number[] {
  const b = floor * 100;
  if (floor === 1) {
    return [b + 10, b + 11, b + 12, b + 13, b + 1, b + 2, b + 3, b + 4];
  }
  return [b + 11, b + 10, b + 9, b + 8, b + 7, b + 6, b + 5, b + 4, b + 3];
}

export function hbRightRoomsForFloor(floor: FloorNumber): number[] {
  const b = floor * 100;
  if (floor === 1) {
    return [b + 9, b + 8, b + 7, b + 6, b + 5];
  }
  return [b + 12, b + 13, b + 14, b + 1, b + 2];
}

export function hbIsRoomNumberOnFloor(room: number, floor: FloorNumber): boolean {
  const base = floor * 100;
  const max = floor === 1 ? base + 13 : base + 14;
  return room >= base + 1 && room <= max;
}

export function hbBookedRoomsForFloor(floor: FloorNumber): number[] {
  if (floor === 1) return [106];
  if (floor === 2) return [201];
  return [];
}
