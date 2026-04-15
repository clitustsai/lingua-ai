"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, registerUser, loginUser } from "@/store/useAuthStore";
import { Eye, EyeOff, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AuthPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in → go to app
  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard");
  }, [isLoggedIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) { setError("Vui lòng điền đầy đủ thông tin"); return; }
    if (password.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 400)); // simulate async

    if (mode === "register") {
      if (!name.trim()) { setError("Vui lòng nhập tên"); setLoading(false); return; }
      const result = registerUser(name.trim(), email.trim().toLowerCase(), password);
      if (!result.ok) { setError(result.error!); setLoading(false); return; }
      login(result.user!);
    } else {
      const result = loginUser(email.trim().toLowerCase(), password);
      if (!result.ok) { setError(result.error!); setLoading(false); return; }
      login(result.user!);
    }
    setLoading(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1a0533 50%,#0f0a1e 100%)" }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600/30 flex items-center justify-center mb-3 shadow-2xl"
            style={{ border: "1px solid rgba(139,92,246,0.4)" }}>
            <Brain className="w-8 h-8 text-primary-400" />
          </div>
          <h1 className="text-2xl font-black text-white">LinguaAI</h1>
          <p className="text-gray-400 text-sm mt-1">Học ngôn ngữ cùng AI</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.25)", backdropFilter: "blur(20px)" }}>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(15,10,30,0.6)" }}>
            <button onClick={() => { setMode("login"); setError(""); }}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mode === "login" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
              Đăng nhập
            </button>
            <button onClick={() => { setMode("register"); setError(""); }}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mode === "register" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
              Đăng ký
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Tên hiển thị</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                  style={{ background: "rgba(15,10,30,0.8)" }}
                />
              </div>
            )}

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="email@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                style={{ background: "rgba(15,10,30,0.8)" }}
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Mật khẩu</label>
              <div className="relative">
                <input value={password} onChange={e => setPassword(e.target.value)}
                  type={showPw ? "text" : "password"} placeholder="Tối thiểu 6 ký tự"
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                  style={{ background: "rgba(15,10,30,0.8)" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm text-red-300"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-1"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
            </button>
          </form>

          {/* Demo account */}
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <p className="text-xs text-gray-600 mb-2">Hoặc dùng tài khoản demo</p>
            <button onClick={() => {
              // Auto-register demo if not exists, then login
              const r = loginUser("demo@lingua.ai", "demo123");
              if (!r.ok) registerUser("Demo User", "demo@lingua.ai", "demo123");
              const result = loginUser("demo@lingua.ai", "demo123");
              if (result.ok) { login(result.user!); router.push("/dashboard"); }
            }}
              className="text-xs text-primary-400 hover:text-primary-300 underline transition-colors">
              Dùng demo (demo@lingua.ai / demo123)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Bằng cách đăng ký, bạn đồng ý với điều khoản sử dụng của LinguaAI
        </p>
      </div>
    </div>
  );
}
