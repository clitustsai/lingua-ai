"use client";
import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { X, Sparkles, Brain, Zap } from "lucide-react";

const WELCOME_KEY = "lingua-welcomed";

export default function WelcomePopup() {
  const { user, isLoggedIn } = useAuthStore();
  const [show, setShow] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const welcomed = sessionStorage.getItem(WELCOME_KEY);
    if (welcomed) return;
    // Show after short delay
    const t = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem(WELCOME_KEY, "1");
      // Play welcome sound
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
        audioRef.current = audio;
      } catch {}
    }, 800);
    return () => clearTimeout(t);
  }, [isLoggedIn, user]);

  const close = () => {
    setShow(false);
    audioRef.current?.pause();
  };

  if (!show || !user) return null;

  const isNew = !localStorage.getItem(`lingua-visited-${user.id}`);
  if (!localStorage.getItem(`lingua-visited-${user.id}`)) {
    localStorage.setItem(`lingua-visited-${user.id}`, "1");
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
      onClick={close}>
      <div
        className="w-full max-w-sm rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)", border: "1px solid rgba(139,92,246,0.4)" }}
        onClick={e => e.stopPropagation()}>

        {/* Confetti dots */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🎉","✨","🌟","💫","🎊","⭐"].map((e, i) => (
            <span key={i} className="absolute text-xl animate-bounce"
              style={{ left: `${10 + i * 15}%`, top: `${5 + (i % 3) * 10}%`, animationDelay: `${i * 0.2}s`, opacity: 0.6 }}>
              {e}
            </span>
          ))}
        </div>

        {/* Close */}
        <button onClick={close}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors z-10">
          <X className="w-4 h-4" />
        </button>

        <div className="p-7 flex flex-col items-center text-center gap-4 relative z-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary-600/30 flex items-center justify-center overflow-hidden"
              style={{ border: "2px solid rgba(139,92,246,0.5)", boxShadow: "0 0 30px rgba(139,92,246,0.4)" }}>
              {user.avatar?.startsWith("http")
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-4xl">{user.avatar}</span>
              }
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Text */}
          <div>
            <p className="text-gray-400 text-sm mb-1">{isNew ? "Chào mừng bạn mới!" : "Chào mừng trở lại!"}</p>
            <h2 className="text-white font-black text-2xl">{user.name} 👋</h2>
          </div>

          {/* Message */}
          <div className="rounded-2xl px-4 py-3 w-full"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-gray-300 text-sm leading-relaxed">
              {isNew
                ? "Hành trình học ngôn ngữ của bạn bắt đầu từ đây. Cùng LinguaAI chinh phục ngôn ngữ mới nhé!"
                : "Streak của bạn đang chờ! Hãy tiếp tục hành trình học tập hôm nay."}
            </p>
          </div>

          {/* Features */}
          {isNew && (
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { icon: Brain, label: "AI Tutor", color: "#8b5cf6" },
                { icon: Zap, label: "Streak", color: "#f59e0b" },
                { icon: Sparkles, label: "Video AI", color: "#10b981" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="rounded-xl p-2.5 flex flex-col items-center gap-1"
                  style={{ background: "rgba(15,10,30,0.6)", border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          )}

          <button onClick={close}
            className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
            {isNew ? "Bắt đầu học ngay!" : "Vào học thôi!"}
          </button>
        </div>
      </div>
    </div>
  );
}
