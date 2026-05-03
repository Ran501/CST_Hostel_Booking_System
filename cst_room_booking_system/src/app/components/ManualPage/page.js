"use client";

import Link from "next/link";
import { useState } from "react";

export default function ManualPage() {
  const [activeSection, setActiveSection] = useState("introduction");

  const sections = [
    { id: "introduction", title: "Introduction" },
    { id: "overview", title: "System Overview" },
    { id: "requirements", title: "System Requirements" },
    { id: "procedure", title: "Booking Procedure" },
    { id: "logout", title: "Logout Procedure" },
    { id: "conclusion", title: "Conclusion" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 to-slate-100 py-6 sm:py-8 md:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-8 sm:mb-10 md:mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-slate-600 hover:text-cstcolor transition-colors group"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            
            <div className="text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
              <span className="text-cstcolor">User Manual</span>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              AFM Room Booking System
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto">
              Complete User Guide for Hostel Room Booking
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 sm:p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Contents
              </h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`cursor-pointer w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      activeSection === section.id
                        ? "bg-cstcolor/10 text-cstcolor font-medium border-l-4 border-cstcolor"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>
              
              <div className="mt-8 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Need Help?</p>
                    <p className="text-slate-500">Contact  +975 17844269</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Section 1: Introduction */}
              <section 
                id="introduction" 
                className={`p-6 sm:p-8 ${activeSection === "introduction" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">1</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-700 mb-6">
                    The <strong className="text-cstcolor">AFM Room Booking System</strong> is a web-based application designed to help users easily view hostel information, check room availability, and book rooms online. This user manual provides step-by-step guidance for end users, from logging into the system to successfully booking a hostel room.
                  </p>
                  
                  <div className="bg-gradient-to-r from-cstcolor/5 to-slate-50 border-l-4 border-cstcolor p-5 rounded-r-lg mb-6">
                    <p className="text-slate-800 italic">
                      The system is accessible on both <strong>desktop and mobile devices</strong>, ensuring convenience and ease of use.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-cstcolor/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-slate-900">Web-Based Platform</h3>
                      </div>
                      <p className="text-slate-600 text-sm">Accessible through any modern web browser without installation</p>
                    </div>
                    
                    <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-8 w-8 rounded-full bg-cstcolor/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-slate-900">Mobile Responsive</h3>
                      </div>
                      <p className="text-slate-600 text-sm">Optimized for smartphones, tablets, and desktop computers</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: System Overview */}
              <section 
                id="overview" 
                className={`p-6 sm:p-8 ${activeSection === "overview" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">System Overview</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-700 mb-6">
                    The AFM Room Booking System allows users to:
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {[
                      "Log in securely using their phone number",
                      "View available hostels",
                      "Check room availability and occupancy details",
                      "Select and book hostel rooms",
                      "Receive booking confirmation via email"
                    ].map((item, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="h-6 w-6 rounded-full bg-cstcolor/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 mb-8">
                    <div className="flex items-start gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-amber-900 mb-1">Important Notice</h4>
                        <p className="text-amber-800 text-sm">
                          The system ensures that hostel bookings follow <strong>gender-based allocation rules</strong>. Users can only book hostels that match their registered gender.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-5">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Male Hostels
                      </h3>
                      <ul className="space-y-2">
                        {["Hostel RKA", "Hostel RKB", "Hostel C", "Hostel D", "Hostel NK"].map((hostel) => (
                          <li key={hostel} className="text-slate-700 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-cstcolor"></div>
                            {hostel}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border border-slate-200 rounded-lg p-5">
                      <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Female Hostel
                      </h3>
                      <ul className="space-y-2">
                        <li className="text-slate-700 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-pink-500"></div>
                          Hostel HF
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3: System Requirements */}
              <section 
                id="requirements" 
                className={`p-6 sm:p-8 ${activeSection === "requirements" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">System Requirements</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <p className="text-lg text-slate-700 mb-8">
                    To use the AFM Room Booking System, ensure that you have:
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    {[
                      {
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        ),
                        title: "Internet Access",
                        description: "Desktop, laptop, tablet, or smartphone with internet connection"
                      },
                      {
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        ),
                        title: "Modern Browser",
                        description: "Chrome, Edge, Firefox, or Safari (latest version recommended)"
                      },
                      {
                        icon: (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        ),
                        title: "Valid Phone Number",
                        description: "Required for login and authentication"
                      }
                    ].map((req, index) => (
                      <div key={index} className="bg-slate-50 rounded-lg p-5 border border-slate-200">
                        <div className="h-12 w-12 rounded-full bg-cstcolor/10 flex items-center justify-center text-cstcolor mb-4">
                          {req.icon}
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-2">{req.title}</h3>
                        <p className="text-slate-600 text-sm">{req.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Section 4: Booking Procedure */}
              <section 
                id="procedure" 
                className={`p-6 sm:p-8 ${activeSection === "procedure" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">4</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Booking Procedure</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <div className="space-y-10">
                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          1
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 1: Access the Website</h3>
                        <ol className="space-y-3 text-slate-700 ml-5">
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                            <span>Open a web browser</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                            <span>Visit the official AFM website: <strong className="text-cstcolor">https://afm.rub.edu.bt</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                            <span>On the homepage, click on <strong className="text-cstcolor">Book Logistics</strong></span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                            <span>You will be redirected to the <strong className="text-cstcolor">Login Page</strong></span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          2
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 2: Login</h3>
                        <div className="space-y-3">
                          <p className="text-slate-700">
                            Enter your <strong>phone number</strong> in the login field and submit the form to access the system dashboard.
                          </p>
                          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cstcolor flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <div>
                                <p className="text-slate-800 font-medium">Note</p>
                                <p className="text-slate-600 text-sm">User authentication is required to access all system features</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          3
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 3: View Available Hostels</h3>
                        <div className="space-y-3">
                          <p className="text-slate-700">
                            After logging in, the dashboard displays all available hostels. Users can only book hostels that match their registered gender.
                          </p>
                          <div className="bg-slate-50 rounded-lg p-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Male Hostels</h4>
                                <ul className="space-y-1">
                                  {["Hostel RKA", "Hostel RKB", "Hostel C", "Hostel D", "Hostel NK"].map((hostel) => (
                                    <li key={hostel} className="text-sm text-slate-600">• {hostel}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <h4 className="font-medium text-slate-900 mb-2">Female Hostels</h4>
                                <ul className="space-y-1">
                                  <li className="text-sm text-slate-600">• HF</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          4
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 4: View Hostel Details</h3>
                        <p className="text-slate-700 mb-4">
                          Click on the <strong>location icon</strong> or <strong>Navigation Button</strong> on the top of the desired hostel to view:
                        </p>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            "Total number of rooms",
                            "Available rooms", 
                            "Occupied rooms",
                            "Room availability percentage"
                          ].map((item, index) => (
                            <li key={index} className="flex items-center gap-2 text-slate-700">
                              <div className="h-2 w-2 rounded-full bg-cstcolor"></div>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Step 5 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          5
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 5: Select a Room</h3>
                        <ol className="space-y-3 text-slate-700 ml-5">
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                            <span>Click the <strong className="text-cstcolor">"Book Now"</strong> button for the selected hostel</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                            <span>Choose a floor to explore available rooms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                            <span>Click the room number to reserve your choice</span>
                          </li>
                        </ol>
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                              <p className="text-blue-800 font-medium">Visual Indicators</p>
                              <p className="text-blue-700 text-sm">Available rooms are clearly indicated with different colors for easy selection</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 6 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          6
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 6: Confirm Booking</h3>
                        <ol className="space-y-3 text-slate-700 ml-5">
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                            <span>Click on your preferred room</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                            <span>A <strong className="text-cstcolor">confirmation dialog</strong> will appear</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                            <span>Review the booking details carefully</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">4</span>
                            <span>Click <strong className="text-cstcolor">Confirm</strong> to finalize your booking</span>
                          </li>
                        </ol>
                      </div>
                    </div>

                    {/* Step 7 */}
                    <div className="relative">
                      <div className="absolute left-0 top-0 h-full w-8 flex items-start justify-center">
                        <div className="h-8 w-8 rounded-full bg-cstcolor flex items-center justify-center text-white font-bold">
                          7
                        </div>
                      </div>
                      <div className="ml-12">
                        <h3 className="text-xl font-semibold text-slate-900 mb-4">Step 7: Booking Confirmation</h3>
                        <div className="space-y-4">
                          <p className="text-slate-700">
                            After confirmation, you will receive:
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h4 className="font-medium text-emerald-900">Confirmation Email</h4>
                              </div>
                              <p className="text-emerald-800 text-sm">Room details will be sent to your registered email address</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center gap-3 mb-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <h4 className="font-medium text-blue-900">Dashboard Display</h4>
                              </div>
                              <p className="text-blue-800 text-sm">Your booked room details will be displayed on the dashboard</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5: Logout Procedure */}
              <section 
                id="logout" 
                className={`p-6 sm:p-8 ${activeSection === "logout" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">5</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Logout Procedure</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 1: Open System Menu</h3>
                      <p className="text-slate-700">Click on the menu icon in the top navigation bar to access system options.</p>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 2: Click Logout</h3>
                      <p className="text-slate-700">Select the <strong className="text-cstcolor">Logout</strong> option from the dropdown menu.</p>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 3: Confirmation</h3>
                      <p className="text-slate-700">You will be safely logged out of the system and redirected to the login page.</p>
                    </div>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                          <p className="font-medium text-amber-900">Security Tip</p>
                          <p className="text-amber-800 text-sm">Always log out after completing your session, especially when using shared computers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 6: Conclusion */}
              <section 
                id="conclusion" 
                className={`p-6 sm:p-8 ${activeSection === "conclusion" ? "block" : "hidden"}`}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-cstcolor/10 flex items-center justify-center">
                    <span className="text-cstcolor font-bold">6</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Conclusion</h2>
                </div>
                
                <div className="prose prose-slate max-w-none">
                  <div className="bg-gradient-to-r from-cstcolor/5 to-slate-50 rounded-xl p-6 sm:p-8 border border-cstcolor/20">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-full bg-cstcolor/10 flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg text-slate-800 mb-4">
                          The AFM Room Booking System simplifies the hostel booking process for RUB institutions by providing a secure, user-friendly, and efficient online platform.
                        </p>
                        <p className="text-slate-700">
                          By following this manual, users can easily navigate the system and complete their hostel room bookings with confidence.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="text-center p-4">
                      <div className="h-16 w-16 rounded-full bg-cstcolor/10 flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">Secure</h4>
                      <p className="text-slate-600 text-sm">Phone-based authentication</p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="h-16 w-16 rounded-full bg-cstcolor/10 flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">User-Friendly</h4>
                      <p className="text-slate-600 text-sm">Intuitive interface design</p>
                    </div>
                    
                    <div className="text-center p-4">
                      <div className="h-16 w-16 rounded-full bg-cstcolor/10 flex items-center justify-center mx-auto mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cstcolor" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-slate-900 mb-1">Efficient</h4>
                      <p className="text-slate-600 text-sm">Quick booking process</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <Link
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-cstcolor text-white font-semibold rounded-lg hover:bg-cstcolor/90 transition-colors shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}