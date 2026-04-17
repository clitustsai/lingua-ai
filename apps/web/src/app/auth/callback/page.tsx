"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];

export default function AuthCallbackPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const user: AuthUser = {
          id: u.id,
          name: meta.full_name || meta.name || meta.user_name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          avatar: meta.avatar_url || meta.picture || AVATARS[Math.floor(Math.random() * AVATARS.length)],
          createdAt: u.created_at,
        };
        login(user);
        router.replace("/dashboard");
      } else {
        router.replace("/auth");
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f0a1e" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-primary-600/30 flex items-center justify-center animate-pulse">
          <span className="text-2xl">🧠</span>
        </div>
        <p className="text-gray-500 text-sm">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
