"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain, Loader2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];

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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (isLoggedIn) router.replace("/dashboard");
  }, [isLoggedIn]);

  // Listen for OAuth callback
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const u = session.user;
        const avatar = u.user_metadata?.avatar_url || AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const user: AuthUser = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          avatar,
          createdAt: u.created_at,
        };
        login(user);
        router.replace("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthLoading(provider);
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : {},
      },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccessMsg("");
    if (!agreedToTerms) { setError("Vui lòng đọc và đồng ý với điều khoản sử dụng"); return; }
    if (!email.trim() || !password.trim()) { setError("Vui lòng điền đầy đủ thông tin"); return; }
    if (password.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setLoading(true);

    try {
      if (mode === "register") {
        if (!name.trim()) { setError("Vui lòng nhập tên"); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { full_name: name.trim(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setSuccessMsg("Kiểm tra email để xác nhận tài khoản!");
        } else if (data.session) {
          // Auto-confirmed
          const user: AuthUser = {
            id: data.user!.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
            createdAt: new Date().toISOString(),
          };
          login(user);
          router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) throw error;
        const u = data.user!;
        const user: AuthUser = {
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          avatar: u.user_metadata?.avatar_url || AVATARS[Math.floor(Math.random() * AVATARS.length)],
          createdAt: u.created_at,
        };
        login(user);
        router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "Đã xảy ra lỗi";
      if (msg.includes("Invalid login")) setError("Email hoặc mật khẩu không đúng");
      else if (msg.includes("already registered")) setError("Email đã được đăng ký");
      else if (msg.includes("Email not confirmed")) setError("Vui lòng xác nhận email trước khi đăng nhập");
      else setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1a0533 50%,#0f0a1e 100%)" }}>
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

        <div className="rounded-3xl p-6" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.25)", backdropFilter: "blur(20px)" }}>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(15,10,30,0.6)" }}>
            <button onClick={() => { setMode("login"); setError(""); setSuccessMsg(""); setAgreedToTerms(false); }}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mode === "login" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
              Đăng nhập
            </button>
            <button onClick={() => { setMode("register"); setError(""); setSuccessMsg(""); setAgreedToTerms(false); }}
              className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
                mode === "register" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
              Đăng ký
            </button>
          </div>

          {/* OAuth buttons */}
          <div className="flex flex-col gap-2 mb-5">
            <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
              {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Tiếp tục với Google
            </button>

            <button onClick={() => handleOAuth("facebook")} disabled={!!oauthLoading}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-700 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors disabled:opacity-60">
              {oauthLoading === "facebook" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              )}
              Tiếp tục với Facebook
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500">hoặc</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Email form */}
          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "register" && (
              <div>
                <label className="text-xs text-gray-400 font-medium mb-1.5 block">Tên hiển thị</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nguyen Van A"
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

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <div className="relative mt-0.5 flex-shrink-0">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => { setAgreedToTerms(e.target.checked); setError(""); }}
                  className="sr-only"
                />
                <div
                  onClick={() => { setAgreedToTerms(v => !v); setError(""); }}
                  className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                    agreedToTerms
                      ? "bg-primary-600 border-primary-600"
                      : "bg-transparent border-gray-600 hover:border-primary-500"
                  )}
                >
                  {agreedToTerms && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-400 leading-relaxed">
                Tôi đã đọc và đồng ý với{" "}
                <a href="/terms" target="_blank" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">
                  điều khoản sử dụng
                </a>{" "}
                của LinguaAI
              </span>
            </label>

            {error && (
              <div className="rounded-xl px-4 py-2.5 text-sm text-red-300"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
                {error}
              </div>
            )}

            {successMsg && (
              <div className="rounded-xl px-4 py-2.5 text-sm text-green-300"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                {successMsg}
              </div>
            )}

            <button type="submit" disabled={loading || !agreedToTerms}
              className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-1"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</> : (
                <><Mail className="w-4 h-4" /> {mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
