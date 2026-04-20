"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";
import { isTrialActive } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase";
import { useAppStore } from "@/store/useAppStore";
import Sidebar from "@/components/Sidebar";
import NotificationManager from "@/components/NotificationManager";
import WelcomePopup from "@/components/WelcomePopup";
import ExitGuard from "@/components/ExitGuard";
import PremiumGate from "@/components/PremiumGate";
import DailyStreakPopup from "@/components/DailyStreakPopup";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];

export default function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, login, theme, user } = useAuthStore();
  const { checkDailyStreak } = useAppStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Check daily streak on app open
  useEffect(() => {
    if (hydrated && isLoggedIn) {
      checkDailyStreak();
    }
  }, [hydrated, isLoggedIn]);

  // Sync Supabase session -> Zustand (handles OAuth redirect)
  useEffect(() => {
    if (!hydrated) return;
    const supabase = createClient();

    const syncUser = (u: any) => {
      if (!u) return;
      const meta = u.user_metadata || {};
      const name = (meta.full_name || meta.name || meta.user_name || "").trim()
        || (u.email?.split("@")[0] || "User");
      const avatar = meta.avatar_url || meta.picture || AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const isPremium = !!meta.isPremium;
      const stored = useAuthStore.getState().user;
      const needsUpdate = !stored
        || stored.email !== u.email
        || stored.name === "Demo User"
        || stored.name === stored.email?.split("@")[0]
        || stored.isPremium !== isPremium; // sync premium status
      if (needsUpdate) {
        const user: AuthUser = { id: u.id, name, email: u.email || "", avatar, createdAt: u.created_at, isPremium };
        login(user);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) syncUser(session.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) syncUser(session.user);
    });

    // Refresh session every 60s to pick up premium activation
    const refreshInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Force refresh to get latest user_metadata
        const { data: { user: freshUser } } = await supabase.auth.getUser();
        if (freshUser) syncUser(freshUser);
      }
    }, 60000);

    return () => { subscription.unsubscribe(); clearInterval(refreshInterval); };
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

  // Hết trial và chưa premium → khóa toàn bộ app
  const trialExpired = user && !user.isPremium && !isTrialActive(user.createdAt);
  if (trialExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0f0a1e" }}>
        <PremiumGate
          title="Thời gian dùng thử đã hết"
          desc="10 ngày dùng thử miễn phí của bạn đã kết thúc. Nâng cấp Premium để tiếp tục học không giới hạn."
        />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-16 md:ml-60 pb-4 md:pb-0">
        <NotificationManager />
        {children}
      </main>
      <WelcomePopup />
      <ExitGuard />
      <DailyStreakPopup />
    </div>
  );
}
