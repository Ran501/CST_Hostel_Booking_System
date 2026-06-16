import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJWT } from "../lib/jwt";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) redirect("/login");

  try {
    const session = await verifyJWT(token);
    if (session?.role !== "admin") redirect("/homecontent");
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
