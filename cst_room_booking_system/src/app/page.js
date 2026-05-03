// "use client";

// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useState } from "react";

// const hostels = [
//   { id: 1, name: "RKA", fullName: "RUB Hostel A", floors: 4, available: true },
//   { id: 2, name: "RKB", fullName: "RUB Hostel B", floors: 4, available: true },
//   { id: 3, name: "NK", fullName: "RUB Hostel NK", floors: 4, available: true },
//   { id: 4, name: "HA", fullName: "RUB Hostel HA", floors: 3, available: true },
//   { id: 5, name: "HB", fullName: "RUB Hostel HB", floors: 3, available: true },
//   { id: 6, name: "HC", fullName: "RUB Hostel HC", floors: 3, available: true },
//   { id: 7, name: "HD", fullName: "RUB Hostel HD", floors: 3, available: true },
//   { id: 8, name: "HF", fullName: "RUB Hostel HF", floors: 3, available: true },
// ];

// export default function HomePage() {
//   const router = useRouter();
//   const [searchTerm, setSearchTerm] = useState("");

//   const goToAdmin = () => {
//     router.push("/admin_dashboard");
//   };

//   // Remove the direct navigation - we want to show the selection page
//   // If you had something like router.push("/rooms/8/floor/1") here, REMOVE IT

//   const filteredHostels = hostels.filter(hostel =>
//     hostel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     hostel.fullName.toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   return (
//     <main className="min-h-screen bg-gradient-to-br from-zinc-100 to-zinc-200">
//       {/* Admin Button */}
//       <div className="fixed top-4 right-4 z-10">
//         <button
//           onClick={goToAdmin}
//           className="px-4 py-2 bg-slate-800 text-white rounded-lg shadow-md hover:bg-slate-700 transition-colors text-sm font-medium"
//         >
//           Admin Panel
//         </button>
//       </div>

//       <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
//         {/* Hero Section */}
//         <div className="text-center mb-12">
//           <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg mb-6">
//             <span className="text-5xl">🏠</span>
//           </div>
//           <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-800 mb-4">
//             RUB Hostel Booking
//           </h1>
//           <p className="text-lg text-slate-600 max-w-2xl mx-auto">
//             Find your perfect room across 8 hostels. View availability, check room layouts, and book your stay.
//           </p>
//         </div>

//         {/* Search Bar */}
//         <div className="max-w-md mx-auto mb-10">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search hostel by name..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               className="w-full px-4 py-3 pl-12 rounded-xl border border-slate-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
//             />
//             <svg
//               className="absolute left-4 top-3.5 h-5 w-5 text-slate-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//         </div>

//         {/* Hostel Grid */}
//         {filteredHostels.length === 0 ? (
//           <div className="text-center py-12">
//             <p className="text-slate-500">No hostels found matching "{searchTerm}"</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//             {filteredHostels.map((hostel) => (
//               <Link
//                 key={hostel.id}
//                 href={`/rooms/${hostel.id}/floor/1`}
//                 className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-200 hover:border-blue-300 hover:-translate-y-1"
//               >
//                 <div className="p-6">
//                   <div className="flex justify-between items-start mb-4">
//                     <div>
//                       <h2 className="text-2xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
//                         {hostel.name}
//                       </h2>
//                       <p className="text-sm text-slate-500 mt-1">{hostel.fullName}</p>
//                     </div>
//                     <div className="bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-semibold">
//                       {hostel.floors} Floors
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
//                     <div className="flex gap-1">
//                       {[...Array(Math.min(hostel.floors, 3))].map((_, i) => (
//                         <div key={i} className="w-2 h-2 rounded-full bg-blue-400"></div>
//                       ))}
//                       {hostel.floors > 3 && (
//                         <span className="text-xs text-slate-400 ml-1">+{hostel.floors - 3}</span>
//                       )}
//                     </div>
//                     <span className="text-sm font-medium text-blue-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
//                       View Rooms 
//                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                       </svg>
//                     </span>
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}

//         {/* Quick Stats */}
//         <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
//           <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
//             <div className="text-2xl font-bold text-blue-600">8</div>
//             <div className="text-sm text-slate-600">Hostels</div>
//           </div>
//           <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
//             <div className="text-2xl font-bold text-blue-600">27</div>
//             <div className="text-sm text-slate-600">Total Floors</div>
//           </div>
//           <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
//             <div className="text-2xl font-bold text-blue-600">150+</div>
//             <div className="text-sm text-slate-600">Rooms</div>
//           </div>
//           <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
//             <div className="text-2xl font-bold text-blue-600">300+</div>
//             <div className="text-sm text-slate-600">Beds</div>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }