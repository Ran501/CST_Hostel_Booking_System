import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get("session")?.value;

  if (!raw) redirect("/login");

  try {
    const session = JSON.parse(raw);
    if (session?.role !== "admin") redirect("/homecontent");
  } catch {
    redirect("/login");
  }

  return <>{children}</>;
}
