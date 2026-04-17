"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, Phone, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];
type Mode = "login" | "register";
type Method = "email" | "phone";
type Step = "form" | "otp";

// Floating orb background
function Orbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
      <div className="absolute top-1/2 -right-40 w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(circle,#6366f1,transparent)" }} />
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent)" }} />
    </div>
  );
}

// OTP input boxes
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => idx === i ? "" : d).join("").trimEnd();
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = digits.map((old, idx) => idx === i ? d : old).join("").replace(/\s/g, "");
    onChange(next);
    if (d && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs[Math.min(pasted.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input key={i} ref={refs[i]}
          value={d} maxLength={1} inputMode="numeric"
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none",
            "text-white bg-white/5",
            d ? "border-primary-500 shadow-lg shadow-primary-500/20" : "border-white/10 focus:border-primary-400"
          )}
        />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("email");
  const [step, setStep] = useState<Step>("form");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => { if (isLoggedIn) router.replace("/dashboard"); }, [isLoggedIn]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const u = session.user;
        const meta = u.user_metadata || {};
        const user: AuthUser = {
          id: u.id,
          name: meta.full_name || meta.name || u.email?.split("@")[0] || "User",
          email: u.email || "",
          avatar: meta.avatar_url || meta.picture || AVATARS[Math.floor(Math.random() * AVATARS.length)],
          createdAt: u.created_at,
        };
        login(user);
        router.replace("/dashboard");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const reset = () => { setError(""); setSuccessMsg(""); setOtp(""); };

  const switchMode = (m: Mode) => { setMode(m); setStep("form"); reset(); setAgreedToTerms(false); };
  const switchMethod = (m: Method) => { setMethod(m); setStep("form"); reset(); };

  const handleOAuth = async (provider: "google" | "facebook") => {
    setOauthLoading(provider); setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === "google" ? { access_type: "offline", prompt: "consent" } : {},
      },
    });
    if (error) { setError(error.message); setOauthLoading(null); }
  };

  const [otpEmail, setOtpEmail] = useState("");

  const sendOtp = async () => {
    if (!phone.trim()) { setError("Vui lòng nhập số điện thoại"); return; }
    if (!agreedToTerms) { setError("Vui lòng đồng ý điều khoản"); return; }
    setLoading(true); setError("");
    const formatted = phone.startsWith("+") ? phone : "+84" + phone.replace(/^0/, "");
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted });
    setLoading(false);
    if (error) { setError(error.message); return; }
  };

  const verifyOtp = async () => {
    if (otp.length < 6) { setError("Nhập đủ 6 số OTP"); return; }
    setLoading(true); setError("");
    const formatted = phone.startsWith("+") ? phone : "+84" + phone.replace(/^0/, "");
    const { data, error } = await supabase.auth.verifyOtp({ phone: formatted, token: otp, type: "sms" });
    setLoading(false);
    if (error) { setError("Mã OTP không đúng hoặc đã hết hạn"); return; }
    if (data.user) {
      const user: AuthUser = {
        id: data.user.id,
        name: data.user.user_metadata?.full_name || name || phone,
        email: data.user.email || "",
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        createdAt: data.user.created_at,
      };
      login(user);
      router.push("/dashboard");
    }
  };

  const submitForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError("Vui lòng nhập email"); return; }
    setLoading(true); setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setLoading(false);
    if (error) { setError(error.message); return; }
    setForgotSent(true);
  };

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault(); reset();
    if (!agreedToTerms) { setError("Vui lòng đồng ý điều khoản sử dụng"); return; }
    if (!email.trim() || !password.trim()) { setError("Vui lòng điền đầy đủ thông tin"); return; }
    if (password.length < 6) { setError("Mật khẩu tối thiểu 6 ký tự"); return; }
    setLoading(true);
    try {
      if (mode === "register") {
        if (!name.trim()) { setError("Vui lòng nhập tên"); setLoading(false); return; }
        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), password,
          options: { data: { full_name: name.trim(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)] } },
        });
        if (error) throw error;
        if (data.user && !data.session) {
          setSuccessMsg("Kiểm tra email để xác nhận tài khoản!");
        } else if (data.session) {
          const user: AuthUser = { id: data.user!.id, name: name.trim(), email: email.trim().toLowerCase(), avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)], createdAt: new Date().toISOString() };
          login(user); router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
        const u = data.user!;
        const user: AuthUser = { id: u.id, name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User", email: u.email || "", avatar: u.user_metadata?.avatar_url || AVATARS[Math.floor(Math.random() * AVATARS.length)], createdAt: u.created_at };
        login(user); router.push("/dashboard");
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.includes("Invalid login")) setError("Email hoặc mật khẩu không đúng");
      else if (msg.includes("already registered")) setError("Email đã được đăng ký");
      else if (msg.includes("Email not confirmed")) setError("Vui lòng xác nhận email trước");
      else setError(msg);
    } finally { setLoading(false); }
  };

  const inputCls = "w-full rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-primary-500/70 transition-all bg-white/5 backdrop-blur-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{ background: "linear-gradient(135deg,#050210 0%,#0d0520 40%,#050210 100%)" }}>
      <Orbs />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 relative"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 8px 32px rgba(124,58,237,0.5)" }}>
            <Sparkles className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.2),transparent)" }} />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">LinguaAI</h1>
          <p className="text-white/40 text-sm mt-1">Học ngôn ngữ cùng trí tuệ nhân tạo</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 32px 64px rgba(0,0,0,0.5)" }}>

          {/* Mode tabs */}
          <div className="flex p-1.5 gap-1" style={{ background: "rgba(0,0,0,0.3)" }}>
            {(["login","register"] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={cn("flex-1 py-3 rounded-2xl text-sm font-bold transition-all",
                  mode === m ? "text-white shadow-lg" : "text-white/40 hover:text-white/70")}
                style={mode === m ? { background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 16px rgba(124,58,237,0.4)" } : {}}>
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <div className="p-6">
            {step === "otp" ? (
              /* OTP Step */
              <div className="flex flex-col gap-5">
                <button onClick={() => { setStep("form"); setOtp(""); setError(""); }}
                  className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors w-fit">
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600/20 flex items-center justify-center mx-auto mb-3"
                    style={{ border: "1px solid rgba(139,92,246,0.3)" }}>
                    <Phone className="w-6 h-6 text-primary-400" />
                  </div>
                  <p className="text-white font-bold text-lg">Nhập mã OTP</p>
                  <p className="text-white/40 text-sm mt-1">Mã 6 số đã gửi qua SMS đến <span className="text-white/70">{phone.startsWith("+") ? phone : "+84" + phone.replace(/^0/, "")}</span></p>
                </div>
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button onClick={verifyOtp} disabled={loading || otp.length < 6}
                  className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                </button>
                <div className="text-center">
                  {countdown > 0
                    ? <p className="text-white/40 text-xs">Gửi lại sau {countdown}s</p>
                    : <button onClick={sendOtp} className="text-primary-400 text-xs hover:text-primary-300 transition-colors">Gửi lại mã OTP</button>
                  }
                </div>
              </div>
            ) : (
              /* Form Step */
              <div className="flex flex-col gap-4">
                {/* OAuth */}
                <div className="flex flex-col gap-2.5">
                  <button onClick={() => handleOAuth("google")} disabled={!!oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-medium text-sm transition-all disabled:opacity-60 hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {oauthLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    )}
                    <span className="text-white">Tiếp tục với Google</span>
                  </button>
                  <button onClick={() => handleOAuth("facebook")} disabled={!!oauthLoading}
                    className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-medium text-sm transition-all disabled:opacity-60 hover:bg-white/10"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {oauthLoading === "facebook" ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    )}
                    <span className="text-white">Tiếp tục với Facebook</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                  <span className="text-white/30 text-xs">hoặc</span>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                </div>

                {/* Fields - Email only */}
                {forgotMode ? (
                  /* Forgot password */
                  <div className="flex flex-col gap-4">
                    <button onClick={() => { setForgotMode(false); setForgotSent(false); setError(""); }}
                      className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs transition-colors w-fit">
                      ← Quay lại đăng nhập
                    </button>
                    {forgotSent ? (
                      <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
                        <p className="text-2xl mb-2">📧</p>
                        <p className="text-white font-bold text-sm mb-1">Đã gửi email!</p>
                        <p className="text-gray-400 text-xs">Kiểm tra hộp thư của bạn và làm theo hướng dẫn để đặt lại mật khẩu.</p>
                      </div>
                    ) : (
                      <form onSubmit={submitForgot} className="flex flex-col gap-3">
                        <p className="text-white/60 text-xs">Nhập email để nhận link đặt lại mật khẩu</p>
                        <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                          type="email" placeholder="Email của bạn" className={inputCls} autoFocus />
                        {error && <p className="text-red-400 text-xs">{error}</p>}
                        <button type="submit" disabled={loading}
                          className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                          {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                <form onSubmit={submitEmail} className="flex flex-col gap-3">
                    {mode === "register" && (
                      <input value={name} onChange={e => setName(e.target.value)} placeholder="Tên hiển thị" className={inputCls} />
                    )}
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className={inputCls} />
                    <div className="relative">
                      <input value={password} onChange={e => setPassword(e.target.value)}
                        type={showPw ? "text" : "password"} placeholder="Mật khẩu (tối thiểu 6 ký tự)" className={cn(inputCls, "pr-11")} />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
                      <div onClick={() => { setAgreedToTerms(v => !v); setError(""); }}
                        className={cn("w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                          agreedToTerms ? "bg-primary-600 border-primary-600" : "bg-transparent border-white/20 hover:border-primary-500")}>
                        {agreedToTerms && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span className="text-xs text-white/40 leading-relaxed">
                        Tôi đồng ý với <a href="/terms" target="_blank" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">điều khoản sử dụng</a> của LinguaAI
                      </span>
                    </label>
                    {error && <p className="text-red-400 text-xs px-1">{error}</p>}
                    {successMsg && <p className="text-green-400 text-xs px-1">{successMsg}</p>}
                    <button type="submit" disabled={loading || !agreedToTerms}
                      className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 mt-1"
                      style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                      {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                    </button>
                    {mode === "login" && (
                      <button type="button" onClick={() => { setForgotMode(true); setError(""); setForgotEmail(email); }}
                        className="text-center text-xs text-primary-400 hover:text-primary-300 transition-colors">
                        Quên mật khẩu?
                      </button>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          LinguaAI &copy; 2026 · <a href="/terms" className="hover:text-white/40 transition-colors">Điều khoản</a>
        </p>
      </div>
    </div>
  );
}
