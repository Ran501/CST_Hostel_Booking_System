// src/app/page.tsx
import HomeContent from "./components/HomeContent";
import LoginModal from "./login/page";

export default function HomePage() {
  return <HomeContent/>;
}
// import { redirect } from "next/navigation";

// export default function HomePage() {
//   redirect("/room/rka/floor/1");
// }