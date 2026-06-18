// app/api/hostel-stats/route.js

import { NextResponse } from 'next/server';
import { prisma } from "../../lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    console.log('Fetching stats for:', { id, name });

    // Find the hostel
    const now = new Date();
    const hostel = await prisma.hostel.findFirst({
      where: {
        OR: [
          { id: id },
          { hostelName: name }
        ]
      },
      include: {
        rooms: {
          include: {
            // Count only active bookings (not yet checked out)
            _count: {
              select: {
                bookings: {
                  where: { checkOut: { gte: now } },
                },
              },
            },
          },
        },
      },
    });

    if (!hostel) {
      console.log('Error: Hostel not found');
      return NextResponse.json(
        { success: false, error: 'Hostel not found' },
        { status: 404 }
      );
    }

    console.log('Hostel found:', hostel.hostelName);
    console.log('Total rooms found:', hostel.rooms?.length || 0);

    // Calculate bed statistics from rooms
    let totalBeds = 0;
    let occupiedBeds = 0;

    if (hostel.rooms && hostel.rooms.length > 0) {
      hostel.rooms.forEach(room => {
        totalBeds += room.capacity || 0;
        // Occupied beds = number of active bookings for the room
        occupiedBeds += room._count?.bookings || 0;
      });
    }

    const availableBeds = totalBeds - occupiedBeds;
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Calculate room stats
    const totalRooms = hostel.rooms?.length || 0;
    const occupiedRooms = hostel.rooms?.filter(r => (r._count?.bookings || 0) > 0).length || 0;
    const availableRooms = hostel.rooms?.filter(r => (r._count?.bookings || 0) < r.capacity && r.status === 'available').length || 0;

    const stats = {
      totalBeds: totalBeds,
      occupiedBeds: occupiedBeds,
      availableBeds: availableBeds,
      occupancyRate: occupancyRate,
      totalRooms: totalRooms,
      occupiedRooms: occupiedRooms,
      availableRooms: availableRooms,
    };

    console.log('Stats calculated:', stats);

    return NextResponse.json({
      success: true,
      stats: stats
    });

  } catch (error) {
    console.error('Error fetching hostel stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error'
      },
      { status: 500 }
    );
  }
}