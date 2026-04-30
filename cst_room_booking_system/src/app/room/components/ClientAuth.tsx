"use client";

import { useEffect, useState } from "react";
import AuthGate from "../../components/AuthGate";

export default function ClientAuth({ children }: { children: any }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <AuthGate>{children}</AuthGate>;
}
