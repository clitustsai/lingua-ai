"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function AppInit({ children }: { children: React.ReactNode }) {
  const { theme } = useAuthStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, [theme]);

  return <>{children}</>;
}
