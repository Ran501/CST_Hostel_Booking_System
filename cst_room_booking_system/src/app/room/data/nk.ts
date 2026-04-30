// src/app/room/data/nk.ts
import type { FloorNumber } from "../types";

export const NK_NAME = "NK";
export const NK_FLOORS: FloorNumber[] = [1, 2, 3, 4];

export function nkLeftRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  return [base + 1, base + 2, base + 3]; // 101, 102, 103
}

export function nkMiddleRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  return [base + 4, base + 5]; // 104, 105
}

export function nkRightRoomsForFloor(floor: FloorNumber): number[] {
  const base = floor * 100;
  return [base + 6, base + 7, base + 8]; // 106, 107, 108
}

export function nkAllRoomsForFloor(floor: FloorNumber): number[] {
  return [
    ...nkLeftRoomsForFloor(floor),
    ...nkMiddleRoomsForFloor(floor),
    ...nkRightRoomsForFloor(floor),
  ];
}

export function nkBookedRoomsForFloor(floor: FloorNumber): number[] {
  // Demo base data: choose one fully booked and one partially booked scenario
  if (floor === 1) return [108]; // fully booked by base logic in page (A,B,C)
  if (floor === 2) return [205];
  if (floor === 3) return [];
  if (floor === 4) return [];
  return [];
}
