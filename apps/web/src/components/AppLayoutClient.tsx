"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "@/components/Sidebar";
import NotificationManager from "@/components/NotificationManager";
import BottomNav from "@/components/BottomNav";

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, theme } = useAuthStore();
  const router = useRouter();
  // hydrated = zustand persist đã load xong từ localStorage
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      document.documentElement.setAttribute("data-theme", theme);
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js").catch(() => {});
      }
    }
  }, [hydrated, theme]);

  useEffect(() => {
    if (hydrated && !isLoggedIn) {
      router.replace("/auth");
    }
  }, [hydrated, isLoggedIn]);

  // Chờ hydration xong mới kiểm tra
  if (!hydrated || !isLoggedIn) {
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
      <main className="flex-1 ml-16 md:ml-56 pb-20 md:pb-0">
        <NotificationManager />
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
