// "use client";

// import { useEffect, useState } from "react";
// import HostelCard from "./HostelCard";
// import { Building, Loader2 } from "lucide-react";

// export default function HostelGrid() {
//   const INITIAL_DISPLAY = 5;
//   const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);
//   const [hostels, setHostels] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchHostels = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         try {
//           const hostelsResponse = await fetch("/api/admin/hostel-management");

//           if (hostelsResponse.ok) {
//             const hostelsData = await hostelsResponse.json();

//             if (hostelsData.success && hostelsData.hostels) {
//               const fetchedHostels = hostelsData.hostels.map((hostel) => ({
//                 id: hostel.id || hostel.name,
//                 name: hostel.name,
//                 total: hostel.total || hostel.totalRooms || 0,
//                 occupied: hostel.occupied || 0,
//                 isActive: hostel.isActive,
//                 totalFloors: hostel.totalFloors,
//                 capacity: hostel.capacity,
//               }));

//               setHostels(fetchedHostels);
//               setLoading(false);
//               return;
//             }
//           }
//         } catch (hostelMgmtError) {
//           console.log("Hostel management API failed:", hostelMgmtError);
//         }

//         try {
//           const hostelsResponse = await fetch("/api/admin/hostel");

//           if (hostelsResponse.ok) {
//             const hostelsData = await hostelsResponse.json();

//             if (hostelsData.success && hostelsData.hostels) {
//               const fetchedHostels = hostelsData.hostels.map((hostel) => ({
//                 id: hostel.id,
//                 name: hostel.name,
//                 total: hostel.totalRooms || hostel.roomCount || 0,
//                 occupied: 0,
//                 isActive: hostel.isActive,
//                 totalFloors: hostel.totalFloors,
//                 capacity: hostel.capacity,
//               }));

//               setHostels(fetchedHostels);
//               setLoading(false);
//               return;
//             }
//           }
//         } catch (hostelError) {
//           console.log("Hostel API failed:", hostelError);
//         }

//         try {
//           const roomsResponse = await fetch("/api/admin/room");

//           if (roomsResponse.ok) {
//             const roomsData = await roomsResponse.json();

//             if (roomsData.success && roomsData.rooms) {
//               const hostelMap = {};

//               roomsData.rooms.forEach((room) => {
//                 const hostelName = room.hostel?.name;
//                 if (!hostelName) return;

//                 if (!hostelMap[hostelName]) {
//                   hostelMap[hostelName] = {
//                     id: room.hostel.id || hostelName,
//                     name: hostelName,
//                     total: 0,
//                     occupied: 0,
//                     isActive: room.hostel.isActive,
//                     totalFloors: room.hostel.totalFloors,
//                   };
//                 }

//                 hostelMap[hostelName].total++;

//                 if (room.isOccupied) {
//                   hostelMap[hostelName].occupied++;
//                 }
//               });

//               setHostels(Object.values(hostelMap));
//               setLoading(false);
//               return;
//             }
//           }
//         } catch (roomError) {
//           console.log("Room API failed:", roomError);
//         }

//         try {
//           const occupancyResponse = await fetch(
//             "/api/admin/room?occupancy=true"
//           );

//           if (occupancyResponse.ok) {
//             const occupancyData = await occupancyResponse.json();

//             if (
//               occupancyData.success &&
//               occupancyData.occupancy?.byHostel
//             ) {
//               const byHostel = occupancyData.occupancy.byHostel;

//               const fetchedHostels = Object.entries(byHostel).map(
//                 ([name, stats]) => ({
//                   id: name,
//                   name: name,
//                   total: stats.totalRooms || 0,
//                   occupied: stats.occupiedCapacity || 0,
//                   isActive: true,
//                   totalFloors: undefined,
//                   capacity: stats.totalCapacity,
//                 })
//               );

//               setHostels(fetchedHostels);
//               setLoading(false);
//               return;
//             }
//           }
//         } catch (occupancyError) {
//           console.log("Occupancy API failed:", occupancyError);
//         }

//         setError("Unable to fetch hostel data. Please check API endpoints.");
//       } catch (error) {
//         console.error("Error fetching hostels:", error);
//         setError("Failed to load hostel data. Please check your connection.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHostels();
//   }, []);

//   const toggleSeeMoreLess = () => {
//     setDisplayCount(
//       displayCount < hostels.length ? hostels.length : INITIAL_DISPLAY
//     );
//   };

//   if (loading) {
//     return (
//       <section className="p-4 bg-white">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="font-semibold text-black text-lg">Hostels Info</h2>
//         </div>

//         <div className="flex items-center justify-center py-12">
//           <div className="text-center">
//             <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
//             <p className="text-gray-600">Loading hostel data...</p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   if (error) {
//     return (
//       <section className="p-4 bg-white">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="font-semibold text-black text-lg">Hostels Info</h2>
//         </div>

//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-600 text-sm">{error}</p>
//         </div>
//       </section>
//     );
//   }

//   if (hostels.length === 0) {
//     return (
//       <section className="p-4 bg-white">
//         <div className="flex items-center justify-between mb-4">
//           <h2 className="font-semibold text-black text-lg">Hostels Info</h2>
//         </div>

//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
//           <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
//           <p className="text-gray-600">No hostels found</p>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="p-4 bg-white">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="font-semibold text-black text-lg">Hostels Info</h2>
//         <div className="text-sm text-gray-600">
//           Showing {Math.min(displayCount, hostels.length)} of {hostels.length} hostels
//         </div>
//       </div>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
//         {hostels.slice(0, displayCount).map((hostel) => (
//           <HostelCard
//             key={hostel.id}
//             name={hostel.name}
//             total={hostel.total}
//             occupied={hostel.occupied}
//           />
//         ))}
//       </div>

//       {hostels.length > INITIAL_DISPLAY && (
//         <div className="flex justify-center mt-6">
//           <button
//             onClick={toggleSeeMoreLess}
//             className="cursor-pointer px-5 py-2.5 rounded-lg bg-cstcolor text-white hover:bg-cstcolor3 transition font-medium shadow-md hover:shadow-lg"
//           >
//             {displayCount < hostels.length ? "Show All Hostels" : "Show Less"}
//           </button>
//         </div>
//       )}
//     </section>
//   );
// }