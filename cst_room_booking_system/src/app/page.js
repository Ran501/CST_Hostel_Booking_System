// src/app/page.tsx
import AdminDashboardPage from "./admin_dashboard/page";
import HomeContent from "./components/HomeContent";
import LoginModal from "./login/page";

export default function HomePage() {
  return <AdminDashboardPage />;
}
// import { redirect } from "next/navigation";

// export default function HomePage() {
//   redirect("/room/rka/floor/1");
// }