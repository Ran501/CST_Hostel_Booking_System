// components/help/Page.js
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState("faq");
  const router = useRouter();
  
  const faqs = [
    {
      question: "How do I book a hostel room?",
      answer: "Click on any hostel marker on the map, then click 'Book Now' to view available rooms. Select your preferred room to complete booking."
    },
    {
      question: "Can I change my booking after confirmation?",
      answer: "Once a booking is confirmed, changes can only be made by contacting the admin through this help page. Changes are subject to availability."
    },
    {
      question: "How long does booking confirmation take?",
      answer: "Automatic bookings are confirmed instantly."
    },
    {
      question: "What items are prohibited in hostel rooms?",
      answer: "Prohibited items include alcohol, drugs, weapons, and any item that violates fire safety regulations."
    },
    {
      question: "How do I report maintenance issues in my room?",
      answer: "Report all maintenance issues to the Student Service Officer. You can contact them at +975 17362124 or +975 17379976."
    },
  ];

  const adminContacts = [
    { 
      title: "Student Service Officer", 
      contacts: [ 
        "+975 17362124",
        "+975 17379976",
      ],
      emails: [
        "purnabdrmongar.cst@rub.edu.bt",
        "chimidem.cst@rub.edu.bt",
      ],
      icon: ""
    },
    { 
      title: "IT Support", 
      contacts: [
        "+975 17844269",
        "+975 17584420", 
        "+975 77665463"
      ],
      emails: [
        "02230122.cst@rub.edu.bt",
        "02230125.cst@rub.edu.bt",
        "02230129.cst@rub.edu.bt"
      ],
      icon: ""
    },
    { 
      title: "Emergency Contact", 
      contacts: [
        "+975 17666628"
      ],
      emails: [
        "kelzangdorji.cst@rub.edu.bt"
      ],
      icon: ""
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-linear-to-r from-cstcolor to-cstcolor2 text-white py-6">
        <div className="container mx-auto px-4">
          <button
            onClick={() => router.back()}
            className="mb-5 cursor-pointer inline-flex items-center gap-2 text-white hover:text-blue-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Help & Support Center</h1>
          </div>
          <p className="text-blue-100">Get assistance with hostel bookings and report issues</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Tabs Navigation - Only FAQ and Support Info */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("faq")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeTab === "faq" ? "bg-white border-t border-l border-r border-gray-200 text-cstcolor font-semibold" : "text-gray-600 hover:text-cstcolor3 hover:bg-blue-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            FAQ
          </button>
          
          <button
            onClick={() => setActiveTab("support")}
            className={`cursor-pointer flex items-center gap-2 px-4 py-3 rounded-t-lg transition-all ${activeTab === "support" ? "bg-white border-t border-l border-r border-gray-200 text-cstcolor font-semibold" : "text-gray-600 hover:text-cstcolor3 hover:bg-blue-50"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Support Info
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-cstcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Frequently Asked Questions</h2>
                  <p className="text-gray-600">Find quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg hover:border-blue-300 transition-all">
                    <button
                      className="cursor-pointer w-full px-5 py-4 text-left flex items-center justify-between hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => {
                        const answer = document.getElementById(`answer-${index}`);
                        if (answer) {
                          answer.classList.toggle('hidden');
                        }
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-100 text-cstcolor w-8 h-8 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-800">{faq.question}</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div id={`answer-${index}`} className="hidden px-5 pb-4">
                      <div className="pl-11">
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-cstcolor mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-gray-700">{faq.answer}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-8">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <svg className="w-5 h-5 text-cstcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Need more help?</h3>
                    <p className="text-gray-600 mb-3">Check the Support Info tab for direct contact information.</p>
                    <button
                      onClick={() => setActiveTab("support")}
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-cstcolor text-white rounded-lg hover:bg-cstcolor2 transition-colors"
                    >
                      View Support Info
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="w-6 h-6 text-cstcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Support Information</h2>
                  <p className="text-gray-600">Direct contacts and support hours</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminContacts.map((contact, index) => (
                  <div key={index} className="bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="text-2xl">{contact.icon}</div>
                      <h3 className="font-semibold text-gray-800">{contact.title}</h3>
                    </div>
                    <div className="space-y-3">
                      {/* Phone Numbers */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-cstcolor shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Contact Numbers:</span>
                        </div>
                        <ul className="space-y-1 pl-6">
                          {contact.contacts.map((phone, phoneIndex) => (
                            <li key={phoneIndex} className="text-sm text-gray-700">
                              {phone}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Email Addresses */}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className="w-4 h-4 text-cstcolor shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">Email Addresses:</span>
                        </div>
                        <ul className="space-y-1 pl-6">
                          {contact.emails.map((email, emailIndex) => (
                            <li key={emailIndex} className="text-sm text-gray-700 break-all">
                              {email}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-linear-to-br from-blue-50 to-white border border-blue-100 rounded-xl p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-cstcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Quick Tips
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 text-cstcolor w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">1</div>
                      <span className="text-gray-700">Check FAQ before contacting for faster resolution</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="bg-blue-100 text-cstcolor w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">2</div>
                      <span className="text-gray-700">For urgent matters, call the emergency contact</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-8 p-5 bg-linear-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-cstcolor" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-gray-800">Note</h4>
                    <p className="text-gray-700 text-sm mt-1">
                      For general questions, please check the FAQ section first. If you need further assistance, use the contact information provided above.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}