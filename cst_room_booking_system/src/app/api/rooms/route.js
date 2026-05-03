// src/app/api/rooms/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const floor = searchParams.get('floor');
  const building = searchParams.get('building');

  // Mock room data
  const mockRooms = [
    { roomNumber: `${building}-101`, capacity: 2, occupied: 0, forGender: 'M', isActive: true },
    { roomNumber: `${building}-102`, capacity: 2, occupied: 1, forGender: 'M', isActive: true },
    { roomNumber: `${building}-103`, capacity: 2, occupied: 2, forGender: 'M', isActive: true },
    { roomNumber: `${building}-104`, capacity: 2, occupied: 0, forGender: 'F', isActive: true },
    { roomNumber: `${building}-105`, capacity: 2, occupied: 1, forGender: 'F', isActive: true },
    { roomNumber: `${building}-106`, capacity: 2, occupied: 0, forGender: 'F', isActive: true },
    { roomNumber: `${building}-107`, capacity: 2, occupied: 0, forGender: 'M', isActive: true },
    { roomNumber: `${building}-108`, capacity: 2, occupied: 2, forGender: 'M', isActive: true },
    { roomNumber: `${building}-109`, capacity: 2, occupied: 1, forGender: 'M', isActive: true },
    { roomNumber: `${building}-110`, capacity: 2, occupied: 0, forGender: 'F', isActive: true },
    { roomNumber: `${building}-111`, capacity: 2, occupied: 1, forGender: 'F', isActive: true },
    { roomNumber: `${building}-112`, capacity: 2, occupied: 0, forGender: 'F', isActive: true },
  ];

  return Response.json({
    success: true,
    rooms: mockRooms,
  });
}
