// HF Hostel Building Data Configuration

export const HF_NAME = "HF";
export const HF_FLOORS = [1, 2, 3];

// ----------------------
// Room generation helpers
// ----------------------
export function hfAllRoomsForFloor(floor) {
  const base = floor * 100;
  const count = floor === 1 ? 24 : 23;
  return Array.from({ length: count }, (_, i) => base + i + 1);
}

export function hfTopLeftRooms(floor) {
  const base = floor * 100;
  return floor === 1
    ? Array.from({ length: 6 }, (_, i) => base + 12 - i) // 112–107
    : Array.from({ length: 3 }, (_, i) => base + 11 - i); // 211–209
}

export function hfMiddleLeftRooms(floor) {
  const base = floor * 100;
  return floor > 1
    ? Array.from({ length: 5 }, (_, i) => base + 8 - i) // 208–204
    : [];
}

export function hfBottomLeftRooms(floor) {
  const base = floor * 100;
  return floor === 1
    ? Array.from({ length: 6 }, (_, i) => base + 6 - i) // 106–101
    : Array.from({ length: 3 }, (_, i) => base + 3 - i); // 203–201
}

export function hfTopRightRooms(floor) {
  const base = floor * 100;
  return floor === 1
    ? [base + 13, base + 14, base + 15, base + 24, base + 16, base + 17] // 113–117 + 124
    : Array.from({ length: 6 }, (_, i) => base + 12 + i); // 212–217
}

export function hfBottomRightRooms(floor) {
  const base = floor * 100;
  return floor === 1
    ? [base + 18, base + 19, base + 23, base + 20, base + 21, base + 22] // 118–122 + 123
    : Array.from({ length: 6 }, (_, i) => base + 18 + i); // 218–223
}

// ----------------------
// Booking & bed rules
// ----------------------
export function hfBookedRoomsForFloor(_floor) {
  // No predefined bookings for HF by default
  return [];
}

// Rooms with 3 beds
const twoBedRooms = [123, 124];

export function getBedsForRoom(room) {
  if (twoBedRooms.includes(room)) return 3;
  return 2;
}

// ----------------------
// Layout config
// ----------------------
export function getFloorConfig(floor) {
  if (floor === 1) {
    return {
      // Quadrants for first floor (24 rooms)
      topLeft: hfTopLeftRooms(floor),
      bottomLeft: hfBottomLeftRooms(floor),
      topRight: hfTopRightRooms(floor),
      bottomRight: hfBottomRightRooms(floor),

      // Washrooms only top and bottom
      washroomTop: ["Washroom"],
      washroomBottom: ["Washroom"],

      // No corridor or balcony on floor 1
      corridorLeft: [],
      corridorRight: [],
      balconyLeft: [],
      balconyRight: [],
    };
  }

  // Floors 2 & 3 (23 rooms each)
  return {
    topLeft: hfTopLeftRooms(floor),       // 211–209
    middleLeft: hfMiddleLeftRooms(floor), // 208–204
    bottomLeft: hfBottomLeftRooms(floor), // 203–201
    topRight: hfTopRightRooms(floor),     // 212–217
    bottomRight: hfBottomRightRooms(floor), // 218–223

    // Washrooms top and bottom
    washroomTop: ["Washroom"],
    washroomBottom: ["Washroom"],

    // Balconies exist on upper floors
    corridorLeft: [],
    corridorRight: [],
    balconyLeft: ["Balcony1", "Balcony2"], // two balconies dividing left side
    balconyRight: [],
  };
}

// ----------------------
// Totals
// ----------------------
export function getTotalRoomsForFloor(floor) {
  return hfAllRoomsForFloor(floor).length;
}

export function getTotalBedsForFloor(floor) {
  const rooms = hfAllRoomsForFloor(floor);
  return rooms.reduce((sum, room) => sum + getBedsForRoom(room), 0);
}