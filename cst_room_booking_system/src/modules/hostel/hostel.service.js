import { hostelRepository } from "./hostel.repository";

export const hostelService = {
  async getHostels() {
    return hostelRepository.getAll();
  },

  async updateHostel(id, data) {
    if (!id) throw new Error("Hostel ID is required");

    return hostelRepository.update(id, data);
  },
};