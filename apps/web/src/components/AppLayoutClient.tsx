"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import NotificationManager from "@/components/NotificationManager";
import BottomNav from "@/components/BottomNav";
import WelcomePopup from "@/components/WelcomePopup";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, login, theme } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Sync Supabase session -> Zustand (handles OAuth redirect)
  useEffect(() => {
    if (!hydrated) return;
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const name = meta.full_name || meta.name || meta.user_name || u.email?.split("@")[0] || "User";
        const avatar = meta.avatar_url || meta.picture || AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const stored = useAuthStore.getState().user;
        // Only update if name/avatar differs (e.g. after OAuth)
        if (!stored || stored.name === "Demo User" || stored.email !== u.email) {
          const user: AuthUser = { id: u.id, name, email: u.email || "", avatar, createdAt: u.created_at };
          login(user);
        }
      }
    });
  }, [hydrated]);

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
      <WelcomePopup />
    </div>
  );
}
