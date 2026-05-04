import { prisma } from "../../app/lib/prisma";

export const hostelRepository = {
  async getAll() {
    const hostels = await prisma.hostel.findMany({
      include: {
        rooms: {
          include: {
            bookings: true,
          },
        },
      },
    });

    return hostels.map((hostel) => {
      const totalRooms = hostel.rooms.length;

      let occupiedRooms = 0;

      hostel.rooms.forEach((room) => {
        if (room.bookings.length > 0) {
          occupiedRooms++;
        }
      });

      return {
        id: hostel.id,
        name: hostel.hostelName,
        total: totalRooms,
        occupied: occupiedRooms,
        isActive: hostel.status === "active",
        gender: hostel.gender,
      };
    });
  },

  async update(id, data) {
    return prisma.hostel.update({
      where: { id },
      data: {
        gender: data.gender,
        status: data.isActive ? "active" : "inactive",
      },
    });
  },
};