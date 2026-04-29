"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Mail, ArrowLeft, CheckCircle2, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { AuthUser } from "@/store/useAuthStore";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭"];
type Mode = "login" | "register";
type Step = "form" | "otp" | "2fa";

const MARQUEE_ROW1 = [
  { icon: "🤖", text: "AI Chat thông minh" },
  { icon: "🎤", text: "Luyện phát âm chuẩn" },
  { icon: "🎧", text: "Nghe & hiểu tự nhiên" },
  { icon: "📚", text: "Flashcard SRS thông minh" },
  { icon: "🏆", text: "Bảng xếp hạng toàn cầu" },
  { icon: "🎬", text: "Video bài học sinh động" },
  { icon: "✍️", text: "AI chấm điểm bài viết" },
  { icon: "🧠", text: "Phân tích điểm yếu tự động" },
];
const MARQUEE_ROW2 = [
  { icon: "🌍", text: "10+ ngôn ngữ hỗ trợ" },
  { icon: "⚡", text: "Phản hồi AI tức thì" },
  { icon: "🎯", text: "Lộ trình học cá nhân hóa" },
  { icon: "🔥", text: "Streak học mỗi ngày" },
  { icon: "📷", text: "Chụp ảnh dịch ngay" },
  { icon: "🎭", text: "AI Roleplay tình huống thực" },
  { icon: "📊", text: "Theo dõi tiến độ chi tiết" },
  { icon: "🏅", text: "Chứng chỉ hoàn thành" },
];

const TYPING_PHRASES = [
  "Học tiếng Anh cùng AI...",
  "Luyện phát âm chuẩn bản ngữ...",
  "Chinh phục IELTS với AI...",
  "Giao tiếp tự tin mỗi ngày...",
  "Khám phá 10+ ngôn ngữ...",
];

const STATS = [
  { value: "50K+", label: "Học viên" },
  { value: "10+", label: "Ngôn ngữ" },
  { value: "99%", label: "AI chính xác" },
  { value: "24/7", label: "Hỗ trợ" },
];

function MarqueeRow({ items, reverse = false }: { items: { icon: string; text: string }[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden w-full" style={{ maskImage: "linear-gradient(to right,transparent,black 8%,black 92%,transparent)" }}>
      <div className="flex gap-2 w-max"
        style={{ animation: `marquee${reverse ? "Rev" : ""} ${reverse ? "32s" : "26s"} linear infinite` }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shrink-0"
            style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <span className="text-xs">{item.icon}</span>
            <span className="text-xs font-medium text-white/60 whitespace-nowrap">{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypingText() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIdx];
    if (!deleting && charIdx < phrase.length) {
      const t = setTimeout(() => { setDisplayed(phrase.slice(0, charIdx + 1)); setCharIdx(c => c + 1); }, 55);
      return () => clearTimeout(t);
    }
    if (!deleting && charIdx === phrase.length) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx > 0) {
      const t = setTimeout(() => { setDisplayed(phrase.slice(0, charIdx - 1)); setCharIdx(c => c - 1); }, 28);
      return () => clearTimeout(t);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx(i => (i + 1) % TYPING_PHRASES.length);
    }
  }, [charIdx, deleting, phraseIdx]);

  return (
    <span className="text-purple-300 font-semibold">
      {displayed}
      <span className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
        style={{ animation: "blink 1s step-end infinite" }} />
    </span>
  );
}

// Grid dot background
function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Dot grid */}
      <div className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(circle,#a78bfa 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
      {/* Glow orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(ellipse,#7c3aed,transparent 70%)", animation: "floatOrb 8s ease-in-out infinite" }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle,#6366f1,transparent)", animation: "floatOrb 10s ease-in-out infinite 2s" }} />
      <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(circle,#8b5cf6,transparent)", animation: "floatOrb 12s ease-in-out infinite 4s" }} />
      {/* Top beam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-64 opacity-30"
        style={{ background: "linear-gradient(180deg,#a78bfa,transparent)", animation: "beamPulse 4s ease-in-out infinite" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full opacity-20 blur-2xl"
        style={{ background: "radial-gradient(circle,#7c3aed,transparent)", animation: "glowPulse 4s ease-in-out infinite" }} />
    </div>
  );
}

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
        <input key={i} ref={refs[i]} value={d} maxLength={1} inputMode="numeric"
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)} onPaste={handlePaste}
          className={cn("w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 transition-all outline-none text-white bg-white/5",
            d ? "border-purple-500 shadow-lg shadow-purple-500/20" : "border-white/10 focus:border-purple-400")} />
      ))}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuthStore();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [step, setStep] = useState<Step>("form");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaFactorId, setTwoFaFactorId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaQ] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { a, b, answer: String(a + b) };
  });

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

  const sendOtp = async () => {
    if (!phone.trim()) { setError("Vui lòng nhập số điện thoại"); return; }
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
        id: data.user.id, name: data.user.user_metadata?.full_name || name || phone,
        email: data.user.email || "", avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        createdAt: data.user.created_at,
      };
      login(user); router.push("/dashboard");
    }
  };

  const verify2FA = async () => {
    if (twoFaCode.length !== 6) { setError("Nhập đủ 6 số"); return; }
    setLoading(true); setError("");
    try {
      const { data: challenge } = await supabase.auth.mfa.challenge({ factorId: twoFaFactorId });
      if (!challenge) throw new Error("Không thể tạo challenge");
      const { error } = await supabase.auth.mfa.verify({ factorId: twoFaFactorId, challengeId: challenge.id, code: twoFaCode });
      if (error) throw error;
      const { data: { user: u } } = await supabase.auth.getUser();
      if (u) {
        const user: AuthUser = { id: u.id, name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User", email: u.email || "", avatar: u.user_metadata?.avatar_url || AVATARS[Math.floor(Math.random() * AVATARS.length)], createdAt: u.created_at };
        login(user); router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Mã 2FA không đúng. Thử lại.");
    } finally { setLoading(false); }
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
    if (mode === "register") {
      if (!name.trim()) { setError("Vui lòng nhập tên"); return; }
      const trimmedName = name.trim();
      if (!trimmedName.includes(" ")) { setError("Tên phải có ít nhất 2 từ (ví dụ: Nguyễn Văn An)"); return; }
      const hasVietnamese = /[àáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹý]/i.test(trimmedName);
      if (!hasVietnamese) { setError("Tên phải là tiếng Việt có dấu (ví dụ: Nguyễn Văn An)"); return; }
      if (/[0-9!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(trimmedName)) { setError("Tên không được chứa số hoặc ký tự đặc biệt"); return; }
      if (!/^[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ]/.test(trimmedName)) { setError("Tên phải bắt đầu bằng chữ hoa"); return; }
      if (!/[A-Z]/.test(password)) { setError("Mật khẩu phải chứa ít nhất 1 chữ hoa"); return; }
      if (!captchaVerified) { setError("Vui lòng xác nhận bạn không phải robot"); return; }
    }
    setLoading(true);
    try {
      if (mode === "register") {
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
        // Check if user has 2FA enabled
        const { data: assuranceData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (assuranceData?.nextLevel === "aal2" && assuranceData?.currentLevel === "aal1") {
          // User has 2FA - need to verify
          const { data: factors } = await supabase.auth.mfa.listFactors();
          const totpFactor = factors?.totp?.[0];
          if (totpFactor) {
            setTwoFaFactorId(totpFactor.id);
            setStep("2fa");
            setLoading(false);
            return;
          }
        }
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

  const inputCls = "w-full rounded-2xl px-4 py-3.5 text-sm text-white placeholder-white/30 border border-white/10 focus:outline-none focus:border-purple-500/60 transition-all";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#04010f 0%,#0a0320 50%,#04010f 100%)" }}>
      <style>{`
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marqueeRev { from{transform:translateX(-50%)} to{transform:translateX(0)} }
        @keyframes glowPulse { 0%,100%{opacity:0.15;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.2)} }
        @keyframes beamPulse { 0%,100%{opacity:0.15} 50%{opacity:0.5} }
        @keyframes floatOrb { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes aiDot { 0%,100%{box-shadow:0 0 4px 1px #a78bfa} 50%{box-shadow:0 0 14px 4px #7c3aed} }
        @keyframes scanLine { 0%{transform:translateY(-100%)} 100%{transform:translateY(400%)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input { background-color: rgba(255,255,255,0.05) !important; color: white !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(30,15,60,0.95) inset !important;
          -webkit-text-fill-color: white !important;
          caret-color: white !important;
          border-color: rgba(139,92,246,0.4) !important;
          transition: background-color 9999s ease-in-out 0s;
        }
      `}</style>

      <GridBg />

      {/* Marquee top */}
      <div className="fixed top-0 left-0 right-0 z-20 pt-1.5 pb-1 flex flex-col gap-1"
        style={{ background: "linear-gradient(180deg,rgba(4,1,15,0.97) 60%,transparent)" }}>
        <MarqueeRow items={MARQUEE_ROW1} />
        <MarqueeRow items={MARQUEE_ROW2} reverse />
      </div>

      <div className="w-full max-w-sm relative z-10 mt-14" style={{ animation: "fadeUp 0.6s ease-out" }}>

        {/* ── LOGO HERO ── */}
        <div className="flex flex-col items-center mb-5">
          {/* Animated logo */}
          <div className="relative mb-3">
            <div className="absolute -inset-2 rounded-[22px] opacity-40"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1,#7c3aed)", animation: "glowPulse 3s ease-in-out infinite", filter: "blur(10px)" }} />
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute left-0 right-0 h-6 opacity-20"
                style={{ background: "linear-gradient(180deg,transparent,rgba(167,139,250,0.6),transparent)", animation: "scanLine 3s linear infinite" }} />
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative"
              style={{ background: "linear-gradient(135deg,#5b21b6,#4f46e5)", boxShadow: "0 0 0 1px rgba(139,92,246,0.4), 0 12px 32px rgba(124,58,237,0.5)" }}>
              <Sparkles className="w-7 h-7 text-white" />
              <div className="absolute inset-0 rounded-2xl" style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.15),transparent 60%)" }} />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight"
            style={{ background: "linear-gradient(135deg,#ffffff 20%,#c4b5fd 60%,#818cf8 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            LinguaAI
          </h1>

          <div className="text-xs h-5 flex items-center mt-0.5">
            <TypingText />
          </div>

          {/* AI live badge */}
          <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full"
            style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" style={{ animation: "aiDot 2s ease-in-out infinite" }} />
            <Zap className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-semibold text-purple-300">AI 100% · Tự động · 24/7</span>
          </div>
        </div>

        {/* ── CARD ── */}
        <div className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            backdropFilter: "blur(32px)",
            boxShadow: "0 0 0 1px rgba(139,92,246,0.1), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>

          {/* Tabs */}
          <div className="flex p-1.5 gap-1" style={{ background: "rgba(0,0,0,0.4)" }}>
            {(["login","register"] as Mode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={cn("flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300",
                  mode === m ? "text-white" : "text-white/30 hover:text-white/60")}
                style={mode === m ? {
                  background: "linear-gradient(135deg,#6d28d9,#4f46e5)",
                  boxShadow: "0 4px 16px rgba(109,40,217,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                } : {}}>
                {m === "login" ? "Đăng nhập" : "Đăng ký"}
              </button>
            ))}
          </div>

          <div className="p-4">
            {step === "2fa" ? (
              <div className="flex flex-col gap-5">
                <button onClick={() => { setStep("form"); setTwoFaCode(""); setError(""); }}
                  className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors w-fit">
                  <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
                </button>
                <div className="text-center">
                  <p className="text-white font-bold">Xác thực 2 lớp</p>
                  <p className="text-white/40 text-xs mt-1">Nhập mã 6 số từ Google Authenticator</p>
                </div>
                <OtpInput value={twoFaCode} onChange={setTwoFaCode} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button onClick={verify2FA} disabled={loading || twoFaCode.length < 6}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loading ? "Đang xác thực..." : "Xác nhận"}
                </button>
              </div>
            ) : step === "otp" ? (
              <div className="flex flex-col gap-5">
                <button onClick={() => { setStep("form"); setOtp(""); setError(""); }}
                  className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors w-fit">
                  <ArrowLeft className="w-3.5 h-3.5" /> Quay lại
                </button>
                <div className="text-center">
                  <p className="text-white font-bold">Nhập mã OTP</p>
                  <p className="text-white/40 text-xs mt-1">Mã 6 số đã gửi qua SMS</p>
                </div>
                <OtpInput value={otp} onChange={setOtp} />
                {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                <button onClick={verifyOtp} disabled={loading || otp.length < 6}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  {loading ? "Đang xác thực..." : "Xác nhận OTP"}
                </button>
                <div className="text-center">
                  {countdown > 0
                    ? <p className="text-white/30 text-xs">Gửi lại sau {countdown}s</p>
                    : <button onClick={sendOtp} className="text-purple-400 text-xs hover:text-purple-300">Gửi lại mã OTP</button>}
                </div>
              </div>
            ) : forgotMode ? (
              <div className="flex flex-col gap-4">
                <button onClick={() => { setForgotMode(false); setForgotSent(false); setError(""); }}
                  className="flex items-center gap-1.5 text-white/40 hover:text-white text-xs transition-colors w-fit">
                  ← Quay lại đăng nhập
                </button>
                {forgotSent ? (
                  <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.25)" }}>
                    <p className="text-2xl mb-2">📧</p>
                    <p className="text-white font-bold text-sm mb-1">Đã gửi email!</p>
                    <p className="text-gray-400 text-xs">Kiểm tra hộp thư và làm theo hướng dẫn.</p>
                  </div>
                ) : (
                  <form onSubmit={submitForgot} className="flex flex-col gap-3">
                    <p className="text-white/50 text-xs">Nhập email để nhận link đặt lại mật khẩu</p>
                    <input value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      type="email" placeholder="Email của bạn" className={inputCls} autoFocus
                      style={{ background: "rgba(255,255,255,0.05)" }} />
                    {error && <p className="text-red-400 text-xs">{error}</p>}
                    <button type="submit" disabled={loading}
                      className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)" }}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={submitEmail} className="flex flex-col gap-3">
                {mode === "register" && (
                  <input value={name} onChange={e => setName(e.target.value)}
                    placeholder="Họ và tên tiếng Việt (vd: Nguyễn Văn An)" className={inputCls}
                    style={{ background: "rgba(255,255,255,0.05)" }} />
                )}
                <input value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="Email" className={inputCls}
                  style={{ background: "rgba(255,255,255,0.05)" }} />
                <div className="relative">
                  <input value={password} onChange={e => setPassword(e.target.value)}
                    type={showPw ? "text" : "password"}
                    placeholder={mode === "register" ? "Mật khẩu (≥6 ký tự, có chữ hoa)" : "Mật khẩu"}
                    className={cn(inputCls, "pr-11")}
                    style={{ background: "rgba(255,255,255,0.05)" }} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {mode === "register" && (
                  <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <div className="flex-1">
                      <p className="text-white/40 text-xs mb-1">Xác nhận không phải robot:</p>
                      <p className="text-white font-semibold text-sm">{captchaQ.a} + {captchaQ.b} = ?</p>
                    </div>
                    {captchaVerified ? (
                      <div className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Đã xác nhận
                      </div>
                    ) : (
                      <input value={captchaAnswer}
                        onChange={e => { setCaptchaAnswer(e.target.value); if (e.target.value === captchaQ.answer) setCaptchaVerified(true); }}
                        placeholder="?" maxLength={2}
                        className="w-14 text-center rounded-xl px-2 py-2 text-sm text-white border border-white/10 bg-white/5 focus:outline-none focus:border-purple-500" />
                    )}
                  </div>
                )}

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <div onClick={() => { setAgreedToTerms(v => !v); setError(""); }}
                    className={cn("w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                      agreedToTerms ? "bg-purple-600 border-purple-600" : "bg-transparent border-white/15 hover:border-purple-500")}>
                    {agreedToTerms && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className="text-xs text-white/35 leading-relaxed">
                    Tôi đồng ý với <a href="/terms" target="_blank" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">điều khoản sử dụng</a>
                  </span>
                </label>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span className="text-red-400 text-xs">{error}</span>
                  </div>
                )}
                {successMsg && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <span className="text-green-400 text-xs">{successMsg}</span>
                  </div>
                )}

                <button type="submit" disabled={loading || !agreedToTerms}
                  className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 mt-1 relative overflow-hidden group"
                  style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 4px 24px rgba(109,40,217,0.45)" }}>
                  {/* Shimmer */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.1),transparent)" }} />
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  {loading ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                </button>

                {mode === "login" && (
                  <button type="button" onClick={() => { setForgotMode(true); setError(""); setForgotEmail(email); }}
                    className="text-center text-xs text-purple-400/70 hover:text-purple-300 transition-colors">
                    Quên mật khẩu?
                  </button>
                )}
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/15 mt-3">
          LinguaAI &copy; 2026 · <a href="/terms" className="hover:text-white/30 transition-colors">Điều khoản</a>
        </p>
      </div>

      {/* Marquee bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 pb-1.5 pt-1"
        style={{ background: "linear-gradient(0deg,rgba(4,1,15,0.97) 60%,transparent)" }}>
        <MarqueeRow items={MARQUEE_ROW2} />
      </div>
    </div>
  );
}
