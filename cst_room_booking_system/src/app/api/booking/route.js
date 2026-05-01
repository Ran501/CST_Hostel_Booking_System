// src/app/api/booking/route.js
export async function POST(request) {
  const body = await request.json();

  // Mock booking logic
  const { roomNumber, userId, email, userName } = body;

  // Simulate booking success
  return Response.json({
    success: true,
    message: `Room ${roomNumber} has been booked successfully!`,
    booking: {
      roomNumber,
      userId,
      email,
      userName,
      bookedAt: new Date().toISOString(),
    },
  });
}
