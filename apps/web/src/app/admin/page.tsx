"use client";
import { useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Crown, CheckCircle2, Loader2, Search, Shield } from "lucide-react";

// Admin password - set in env
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin123";

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const login = () => {
    if (password === ADMIN_PASSWORD) setAuthed(true);
    else setError("Sai mật khẩu admin");
  };

  const activatePremium = async () => {
    if (!email.trim()) { setError("Nhập email user"); return; }
    setLoading(true); setError(""); setResult("");
    try {
      const res = await fetch("/api/admin/activate-premium", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), plan, adminPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(`✅ Đã kích hoạt VIP ${plan} cho ${email}`);
        setEmail("");
      } else {
        setError(data.error || "Lỗi kích hoạt");
      }
    } catch {
      setError("Lỗi kết nối");
    } finally { setLoading(false); }
  };

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#050210" }}>
      <div className="w-full max-w-sm rounded-3xl p-6"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-purple-400" />
          <h1 className="text-white font-bold">Admin Panel</h1>
        </div>
        <input value={password} onChange={e => setPassword(e.target.value)}
          type="password" placeholder="Mật khẩu admin"
          onKeyDown={e => e.key === "Enter" && login()}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-purple-500 mb-3"
          style={{ background: "rgba(255,255,255,0.05)" }} />
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <button onClick={login}
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          Đăng nhập
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6" style={{ background: "#050210" }}>
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="w-5 h-5 text-purple-400" />
          <h1 className="text-white font-bold text-xl">Admin Panel — Kích hoạt VIP</h1>
        </div>

        <div className="rounded-2xl p-5 mb-5"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-sm font-semibold text-white mb-4">Kích hoạt VIP cho user</p>

          <div className="flex flex-col gap-3">
            <input value={email} onChange={e => setEmail(e.target.value)}
              type="email" placeholder="Email của user"
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-purple-500"
              style={{ background: "rgba(255,255,255,0.05)" }} />

            <div className="flex gap-2">
              {(["monthly", "yearly"] as const).map(p => (
                <button key={p} onClick={() => setPlan(p)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${plan === p ? "bg-purple-600 text-white" : "bg-white/5 text-gray-400"}`}>
                  {p === "monthly" ? "1 tháng (99k)" : "1 năm (1tr)"}
                </button>
              ))}
            </div>

            {error && <p className="text-red-400 text-xs">{error}</p>}
            {result && <p className="text-green-400 text-xs">{result}</p>}

            <button onClick={activatePremium} disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              {loading ? "Đang kích hoạt..." : "Kích hoạt VIP"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl p-4 text-xs text-gray-500"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p className="font-semibold text-gray-400 mb-2">Hướng dẫn:</p>
          <p>1. User chuyển khoản ACB với nội dung chứa email hoặc mã user</p>
          <p>2. Kiểm tra app ngân hàng ACB</p>
          <p>3. Nhập email user vào đây và bấm Kích hoạt VIP</p>
          <p>4. VIP tự động được bật cho tài khoản đó</p>
        </div>
      </div>
    </div>
  );
}
