"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/Sidebar";
import NotificationManager from "@/components/NotificationManager";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, theme } = useAuthStore();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Apply theme
    document.documentElement.setAttribute("data-theme", theme);

    // Register SW
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Auth check after hydration
    if (!isLoggedIn) {
      router.replace("/auth");
    } else {
      setChecked(true);
    }
  }, [isLoggedIn, theme]);

  // Don't render app until auth confirmed
  if (!checked || !isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0a1e" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/30 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🧠</span>
          </div>
          <p className="text-gray-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-56">
        <NotificationManager />
        {children}
      </main>
    </div>
  );
}
