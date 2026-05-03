// HF Hostel Building Data Configuration

export const HF_NAME = "HF";

export function getFloorConfig(floorNum) {
  // Returns configuration for a specific floor
  const floorConfig = {
    1: {
      name: "First Floor",
      topLeft: [101, 102, 103, 104, 105, 106],
      bottomLeft: [113, 114, 115, 116, 117, 118],
      topRight: [107, 108, 109, 110, 111, 112],
      bottomRight: [119, 120, 121, 122, 123, 124],
      totalRooms: 12,
      totalBeds: 24,
    },
    2: {
      name: "Second Floor",
      topLeft: [201, 202, 203],
      middleLeft: [204, 205, 206, 207, 208],
      bottomLeft: [209, 210, 211],
      topRight: [212, 213, 214, 215, 216, 217],
      bottomRight: [218, 219, 220, 221, 222, 223],
      totalRooms: 12,
      totalBeds: 24,
    },
    3: {
      name: "Third Floor",
      topLeft: [301, 302, 303],
      middleLeft: [304, 305, 306, 307, 308],
      bottomLeft: [309, 310, 311],
      topRight: [312, 313, 314, 315, 316, 317],
      bottomRight: [318, 319, 320, 321, 322, 323],
      totalRooms: 12,
      totalBeds: 24,
    },
    4: {
      name: "Fourth Floor",
      topLeft: [401, 402, 403],
      middleLeft: [404, 405, 406, 407, 408],
      bottomLeft: [409, 410, 411],
      topRight: [412, 413, 414, 415, 416, 417],
      bottomRight: [418, 419, 420, 421, 422, 423],
      totalRooms: 12,
      totalBeds: 24,
    },
  };
  return floorConfig[floorNum] || floorConfig[1];
}

export function getTotalRoomsForFloor(floorNum) {
  const config = getFloorConfig(floorNum);
  return config.totalRooms;
}

export function getTotalBedsForFloor(floorNum) {
  const config = getFloorConfig(floorNum);
  return config.totalBeds;
}

export function getBedsForRoom(roomNumber) {
  // Returns number of beds for a specific room
  return 2; // Standard 2-bed rooms
}
