// src/app/components/utils/stats-utils.js

export const calculateStats = (hostels) => {
  const totalRooms = hostels.reduce((sum, h) => sum + (h.totalRooms || 0), 0);
  const totalOccupied = hostels.reduce((sum, h) => sum + (h.occupiedRooms || 0), 0);
  const totalAvailable = hostels.reduce((sum, h) => sum + (h.availableRooms || 0), 0);
  const occupancyRate = totalRooms > 0 ? Math.round((totalOccupied / totalRooms) * 100) : 0;

  return {
    totalAvailableRooms: totalAvailable,
    occupancyRate: occupancyRate,
    bookedRoom: "None",
  };
};

export const fetchHostelStats = async () => {
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For now, return mock data
    return {
      totalAvailableRooms: 0,
      occupancyRate: 0,
      bookedRoom: "None",
      loading: false
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalAvailableRooms: 0,
      bookedRoom: "None",
      occupancyRate: 0,
      loading: false
    };
  }
};