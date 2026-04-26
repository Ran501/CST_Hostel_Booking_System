// "use client";

// import { useEffect, useState } from "react";
// import { animated, useSpring, useSpringRef } from "@react-spring/web";

// export default function TopCards({
//   totalCapacity,
//   occupied,
//   available,
//   totalHostels,
//   statistics,
// }) {
//   const [mounted, setMounted] = useState(false);

//   const [cardValues, setCardValues] = useState({
//     totalCapacity: 0,
//     occupied: 0,
//     available: 0,
//     totalHostels: 0,
//   });

//   const totalBookings =
//     statistics?.totalBookings ||
//     statistics?.occupancy?.totalBookings ||
//     0;

//   const activeBookings = statistics?.activeBookings || 0;

//   const occupancyRate =
//     statistics?.occupancy?.occupancyRateCapacity ||
//     (totalCapacity > 0
//       ? (occupied / totalCapacity) * 100
//       : 0);

//   const springRef = useSpringRef();

//   useSpring({
//     ref: springRef,
//     from: cardValues,
//     to: { totalCapacity, occupied, available, totalHostels },
//     config: { duration: 900 },
//     onChange: (v) =>
//       setCardValues({
//         totalCapacity: v.value.totalCapacity,
//         occupied: v.value.occupied,
//         available: v.value.available,
//         totalHostels: v.value.totalHostels,
//       }),
//   });

//   useEffect(() => {
//     const id = requestAnimationFrame(() => setMounted(true));
//     return () => cancelAnimationFrame(id);
//   }, []);

//   useEffect(() => {
//     if (mounted) springRef.start();
//   }, [mounted, springRef]);

//   if (!mounted) return null;

//   const occupancyPercentage =
//     occupancyRate ||
//     (totalCapacity > 0
//       ? (occupied / totalCapacity) * 100
//       : 0);

//   const availabilityPercentage =
//     totalCapacity > 0
//       ? (available / totalCapacity) * 100
//       : 0;

//   const avgBedsPerHostel =
//     totalHostels > 0
//       ? totalCapacity / totalHostels
//       : 0;

//   const cards = [
//     {
//       title: "Total Beds Capacity",
//       value: cardValues.totalCapacity,
//       color: "text-blue-600",
//       wide: true,
//       subtitle: "Total beds in active hostels",
//       badge:
//         activeBookings > 0
//           ? `${activeBookings} active bookings`
//           : totalBookings > 0
//           ? `${totalBookings} total bookings`
//           : null,
//       tooltip: "Sum of all bed capacities across active hostels",
//       dataSource: "room/capacity API",
//     },
//     {
//       title: "Occupied Beds",
//       value: cardValues.occupied,
//       color: "text-red-600",
//       progress: occupancyPercentage,
//       progressColor: "bg-red-500",
//       subtitle: `${occupancyPercentage.toFixed(
//         1
//       )}% occupancy rate`,
//       tooltip: `Currently occupied bed capacity (${activeBookings} active bookings)`,
//       dataSource: "bookings API + room occupancy",
//     },
//     {
//       title: "Available Beds",
//       value: cardValues.available,
//       color: "text-green-600",
//       progress: availabilityPercentage,
//       progressColor: "bg-green-500",
//       subtitle: `${availabilityPercentage.toFixed(
//         1
//       )}% availability`,
//       tooltip: "Available bed capacity (total - occupied)",
//       dataSource: "calculated from capacity - occupied",
//     },
//     {
//       title: "Active Hostels",
//       value: cardValues.totalHostels,
//       color: "text-indigo-600",
//       badge:
//         avgBedsPerHostel > 0
//           ? `~${avgBedsPerHostel.toFixed(0)} beds/hostel`
//           : null,
//       tooltip: "Number of active hostels in the system",
//       dataSource: "hostel-management API",
//     },
//   ];

//   return (
//     <div className="grid grid-cols-3 gap-2 sm:gap-3">
//       {cards.map((card, i) => (
//         <animated.div
//           key={i}
//           className={`${
//             card.wide
//               ? "col-span-3"
//               : "aspect-square max-h-[140px] sm:max-h-none"
//           } bg-white rounded-xl p-2 sm:p-4 shadow hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col items-center justify-between text-center border border-gray-100 hover:border-blue-100 group relative min-w-0 min-h-0`}
//           title={card.tooltip}
//           onClick={() =>
//             console.log(
//               `Clicked ${card.title}: ${card.value} (${card.dataSource})`
//             )
//           }
//         >
//           <div className="flex items-center justify-center gap-2 mb-1 sm:mb-2">
//             <div className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-medium truncate w-full">
//               {card.title}
//             </div>
//           </div>

//           <div
//             className={`font-bold ${card.color} text-base sm:text-lg md:text-2xl leading-tight mb-1 sm:mb-2`}
//           >
//             {Math.floor(card.value).toLocaleString()}
//           </div>

//           {card.progress !== undefined && (
//             <div className="w-full mt-1 sm:mt-2 px-1">
//               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
//                 <div
//                   className={`h-full ${card.progressColor} transition-all duration-700`}
//                   style={{ width: `${card.progress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {card.subtitle && (
//             <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-600 max-w-full px-2">
//               {card.subtitle}
//             </div>
//           )}

//           {card.badge && (
//             <div className="mt-1 sm:mt-2 px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-gray-50 text-gray-700 border border-gray-200 font-medium">
//               {card.badge}
//             </div>
//           )}

//           {process.env.NODE_ENV === "development" && (
//             <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity duration-300">
//               <span className="text-[8px] text-gray-400">API</span>
//             </div>
//           )}

//           <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full"></div>
//         </animated.div>
//       ))}
//     </div>
//   );
// }