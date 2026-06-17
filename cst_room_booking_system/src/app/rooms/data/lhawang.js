export const LHAWANG_HOSTEL_NAME = "Lhawang";

export const LHAWANG_NAME = "LH";
export const LHAWANG_FLOOR_META = {
  1: { totalRooms: 2, totalBeds: 14 },
  2: { totalRooms: 7, totalBeds: 14 },
  3: { totalRooms: 7, totalBeds: 14 },
  4: { totalRooms: 7, totalBeds: 14 },
  5: { totalRooms: 2, totalBeds: 14 },
};
// floor 1
export function floor1LeftRoom() {
  return 102;
}

export function floor1RightRoom() {
  return 101;
}

//floor 2
export function floor2LeftColumn() {
  return [203, 202, 201];
}

export function floor2RightSection() {
  return {
    // Horizontal connected pair with arrow between them
    connectedPair: [204, 205],
    // Standalone room below the pair (right-aligned in the layout)
    standaloneRoom: 206,
    // Room shown next to Stairs at the bottom
    stairsRoom: 207,
  };
}
// FLOOR 3
export function floor3LeftColumn() {
  return [304, 303, 302, 301];
}

export function floor3RightSection() {
  return {
    // Shows "Enter" label above the connected pair
    hasEnterLabel: true,
    // Horizontal connected pair with arrow between them
    connectedPair: [305, 306],
    // Rooms stacked below the pair (left-aligned)
    stackedRooms: [307, 308],
    // Room shown next to Stairs at the bottom
    stairsRoom: 309,
  };
}
// FLOOR 4
export function floor4LeftColumn() {
  return [403, 402, 401];
}

export function floor4RightSection() {
  return {
    // Shows "Enter" label above the entrance room
    hasEnterLabel: true,
    // Single room with outward arrow (entrance, no room on the right of arrow)
    entranceRoom: 405,
    // Room shown on the right side below (right-aligned)
    standaloneRoom: 407,
    // Room shown next to Stairs at the bottom
    stairsRoom: 408,
  };
}
// FLOOR 5
export function floor5LeftRoom() {
  return 502;
}

export function floor5RightRoom() {
  return 501;
}
export const LHAWANG_KITCHEN_LABELS = {
  2: "Kitchen 1",
  3: "Kitchen 2",
  4: "Kitchen 3",
};

export function allRoomsForFloor(floorNum) {
  switch (floorNum) {
    case 1:
      return [floor1LeftRoom(), floor1RightRoom()];

    case 2: {
      const { connectedPair, standaloneRoom, stairsRoom } = floor2RightSection();
      return [...floor2LeftColumn(), ...connectedPair, standaloneRoom, stairsRoom];
    }

    case 3: {
      const { connectedPair, stackedRooms, stairsRoom } = floor3RightSection();
      return [...floor3LeftColumn(), ...connectedPair, ...stackedRooms, stairsRoom];
    }

    case 4: {
      const { entranceRoom, standaloneRoom, stairsRoom } = floor4RightSection();
      return [...floor4LeftColumn(), entranceRoom, standaloneRoom, stairsRoom];
    }

    case 5:
      return [floor5LeftRoom(), floor5RightRoom()];

    default:
      return [];
  }
}
