export type FloorNumber = 1 | 2 | 3 | 4;

export type BedStatus = "available" | "booked";

export type Bed = {
  id: string; // e.g., "A", "B", "C"
  status: BedStatus;
};

export type Room = {
  number: number; // e.g., 101
  beds: Bed[]; // always 3 for RKA
};

export type FloorData = {
  floor: FloorNumber;
  rooms: Room[];
};
