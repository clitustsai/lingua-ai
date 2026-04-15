"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationManager from "@/components/NotificationManager";
import AuthGuard from "@/components/AuthGuard";

export default function AppInit({ children }: { children: React.ReactNode }) {
  const { theme } = useAuthStore();

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
    // Apply theme immediately
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <AuthGuard>
      <NotificationManager />
      {children}
    </AuthGuard>
  );
}
