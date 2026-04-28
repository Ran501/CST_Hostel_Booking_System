"use client";

import Image from "next/image";
import { Menu, X, Settings, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
// import LoginModal from "../../../login/page";
// import AdminManagementModal from "../../../admin_dashboard/components/AdminManagementModal";
import ConfirmationDialog from "../../confirmation";

export default function Navbar() {
    
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

//   const [userName, setUserName] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [gender, setGender] = useState("male");

  const navItems = ["Dashboard", "Guest", "Rooms", "Hostel"];

  const [confirmation, setConfirmation] = useState({
    message: "",
    onConfirm: () => {},
    isOpen: false,
  });

  const openConfirmation = (message, onConfirm) => {
    setConfirmation({ message, onConfirm, isOpen: true });
  };

  const closeConfirmation = () =>
    setConfirmation({ ...confirmation, isOpen: false });

  const isActive = (item) => {
    if (item === "Dashboard") return pathname === "/admin_dashboard";
    if (item === "Guest") return pathname.startsWith("/admin_dashboard/guests");
    if (item === "Rooms") return pathname.startsWith("/admin_dashboard/rooms");
    if (item === "Hostel") return pathname.startsWith("/admin_dashboard/hostel");
    return false;
  };

  const handleNavClick = (page) => {
    switch (page) {
      case "Dashboard":
        return router.push("/admin_dashboard");
      case "Guest":
        return router.push("/admin_dashboard/guests");
      case "Rooms":
        return router.push("/admin_dashboard/rooms");
      case "Hostel":
        return router.push("/admin_dashboard/hostel");
    }
  };

  const handleUserMenuClick = (action) => {
    console.log(`${action} clicked`);
    setUserMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("session");
    window.location.href = "/";
  };

//   useEffect(() => {
//     try {
//       const session = localStorage.getItem("session");
//       if (session) {
//         const parsed = JSON.parse(session);
//         setUserName(parsed.name || parsed.phoneNumber || "User");
//         setUserEmail(parsed.email || "");
//         if (parsed.gender === "female" || parsed.gender === "male") {
//           setGender(parsed.gender);
//         }
//       }
//     } catch (error) {
//       console.error("Error loading user session:", error);
//     }
//   }, []);
  // Dummy session object
  const dummySession = {
    name: "Test User",
    email: "test@example.com",
    phoneNumber: "1234567890",
    gender: "female",
  };

  // Initialize state directly from dummySession
  const [userName] = useState(dummySession.name || dummySession.phoneNumber || "User");
  const [userEmail] = useState(dummySession.email || "");
  const [gender] = useState(
    dummySession.gender === "female" || dummySession.gender === "male"
      ? dummySession.gender
      : ""
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setUserMenuOpen(false);
      }
    }

    if (userMenuOpen)
      document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [userMenuOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b">
      <div className="w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3">

        <div className="flex items-center gap-3">
          <Image src="/cstlogo.png" alt="CST Logo" width={40} height={40} priority />
          <span className="font-bold text-lg text-gray-800">
            AFM Room Booking System
          </span>
        </div>

        <div className="flex items-center gap-4 relative">

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <span
                key={item}
                className={`cursor-pointer relative font-medium transition-colors duration-300 ${
                  isActive(item)
                    ? "text-blue-600 font-bold"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={() => handleNavClick(item)}
              >
                {item}
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full bg-gray-100 p-1.5 hover:bg-gray-200 transition"
            >
              <div className="h-7 w-7 sm:h-9 sm:w-9 rounded-full bg-cstcolor overflow-hidden">
                <img
                  src={gender === "female" ? "/woman2.png" : "/man2.png"}
                  className="h-full w-full object-cover"
                  alt="avatar"
                />
              </div>
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />

                <div
                  ref={userMenuRef}
                  className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white shadow-2xl rounded-xl z-50"
                >
                  <div className="px-4 py-3 bg-gray-50 border-b">
                    <p className="font-semibold">{userName}</p>
                    {userEmail && (
                      <p className="text-xs text-gray-500">{userEmail}</p>
                    )}
                  </div>

                  <button
                    className="w-full px-4 py-2 text-left hover:bg-gray-100"
                    onClick={() => setAdminModalOpen(true)}
                  >
                    <Settings className="inline w-4 h-4 mr-2" />
                    Manage Admin
                  </button>

                  <button
                    className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
                    onClick={() =>
                      openConfirmation("Logout?", () => {
                        handleLogout();
                        setUserMenuOpen(false);
                      })
                    }
                  >
                    <LogOut className="inline w-4 h-4 mr-2" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transition-transform md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex justify-between p-4 border-b">
          <span>Menu</span>
          <X onClick={() => setOpen(false)} />
        </div>

        <div className="p-4 flex flex-col gap-4">
          {navItems.map((item) => (
            <span
              key={item}
              onClick={() => {
                handleNavClick(item);
                setOpen(false);
              }}
              className="cursor-pointer"
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 bg-black/25 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* <AdminManagementModal
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
      />

      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={(id) => console.log("Logged in", id)}
      /> */}

      {confirmation.isOpen && (
        <ConfirmationDialog
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={closeConfirmation}
        />
      )}
    </header>
  );
}