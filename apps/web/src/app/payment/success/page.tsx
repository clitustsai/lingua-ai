"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase";
import { Crown, CheckCircle2, Loader2 } from "lucide-react";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const { user, login } = useAuthStore();
  const [checking, setChecking] = useState(true);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Poll Supabase to check if premium was activated (webhook may take a few seconds)
    let attempts = 0;
    const check = async () => {
      attempts++;
      const supabase = createClient();
      const { data: { user: supaUser } } = await supabase.auth.getUser();
      if (supaUser?.user_metadata?.isPremium) {
        // Update local store
        if (user) {
          login({ ...user, isPremium: true });
        }
        setActivated(true);
        setChecking(false);
        setTimeout(() => router.replace("/dashboard"), 3000);
        return;
      }
      if (attempts < 10) {
        setTimeout(check, 2000); // retry every 2s for up to 20s
      } else {
        setChecking(false); // timeout — show manual refresh
      }
    };
    check();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#050210,#0d0520)" }}>
      <div className="text-center max-w-sm">
        {checking && !activated && (
          <>
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <h2 className="text-white font-bold text-xl mb-2">Đang xác nhận thanh toán...</h2>
            <p className="text-gray-400 text-sm">Vui lòng chờ trong giây lát</p>
          </>
        )}
        {activated && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-white font-black text-2xl mb-2">Thanh toán thành công!</h2>
            <p className="text-yellow-300 font-semibold mb-2 flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" /> Tài khoản VIP đã được kích hoạt
            </p>
            <p className="text-gray-400 text-sm">Đang chuyển về Dashboard...</p>
          </>
        )}
        {!checking && !activated && (
          <>
            <div className="text-4xl mb-4">⏳</div>
            <h2 className="text-white font-bold text-xl mb-2">Đang xử lý...</h2>
            <p className="text-gray-400 text-sm mb-4">Thanh toán đang được xác nhận. Có thể mất vài phút.</p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              Kiểm tra lại
            </button>
          </>
        )}
      </div>
    </div>
  );
}
