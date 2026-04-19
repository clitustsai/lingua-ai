"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { X, Sparkles, Brain, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const WELCOME_KEY = "lingua-welcomed";
const PLACEMENT_DONE_KEY = "lingua-placement-done";

export default function WelcomePopup() {
  const { user, isLoggedIn } = useAuthStore();
  const { settings } = useAppStore();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"welcome" | "experience">("welcome");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const welcomed = sessionStorage.getItem(WELCOME_KEY);
    if (welcomed) return;
    const t = setTimeout(() => {
      setShow(true);
      sessionStorage.setItem(WELCOME_KEY, "1");
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

  const handleExperienced = () => {
    // Đã học rồi → vào thẳng app
    close();
  };

  const handleBeginner = () => {
    // Chưa học → redirect placement test
    close();
    router.push("/placement");
  };

  if (!show || !user) return null;

  const isNew = !localStorage.getItem(`lingua-visited-${user.id}`);
  if (!localStorage.getItem(`lingua-visited-${user.id}`)) {
    localStorage.setItem(`lingua-visited-${user.id}`, "1");
  }

  const placementDone = !!localStorage.getItem(PLACEMENT_DONE_KEY);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden relative"
        style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)", border: "1px solid rgba(139,92,246,0.4)" }}
        onClick={e => e.stopPropagation()}>

        {/* Confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {["🎉","✨","🌟","💫","🎊","⭐"].map((e, i) => (
            <span key={i} className="absolute text-xl animate-bounce"
              style={{ left: `${10 + i * 15}%`, top: `${5 + (i % 3) * 10}%`, animationDelay: `${i * 0.2}s`, opacity: 0.6 }}>
              {e}
            </span>
          ))}
        </div>

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

          {step === "welcome" ? (
            <>
              <div>
                <p className="text-gray-400 text-sm mb-1">{isNew ? "Chào mừng bạn mới!" : "Chào mừng trở lại!"}</p>
                <h2 className="text-white font-black text-2xl">{user.name} 👋</h2>
              </div>

              <div className="rounded-2xl px-4 py-3 w-full"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {isNew
                    ? "Hành trình học ngôn ngữ của bạn bắt đầu từ đây. Cùng LinguaAI chinh phục ngôn ngữ mới nhé!"
                    : "Streak của bạn đang chờ! Hãy tiếp tục hành trình học tập hôm nay."}
                </p>
              </div>

              {isNew && (
                <div className="rounded-2xl px-4 py-3 text-center w-full"
                  style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <p className="text-green-400 font-bold text-sm">🎁 Dùng thử miễn phí 10 ngày</p>
                  <p className="text-gray-400 text-xs mt-0.5">Truy cập hầu hết tính năng</p>
                </div>
              )}

              <button onClick={() => isNew && !placementDone ? setStep("experience") : close()}
                className="w-full py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
                {isNew ? "Bắt đầu học ngay!" : "Vào học thôi!"}
              </button>
            </>
          ) : (
            <>
              {/* Experience question */}
              <div>
                <p className="text-gray-400 text-sm mb-1">Câu hỏi nhanh</p>
                <h2 className="text-white font-black text-xl">Bạn đã học {settings.targetLanguage.name} chưa?</h2>
              </div>

              <p className="text-gray-500 text-sm">Chúng tôi sẽ cá nhân hóa trải nghiệm phù hợp với bạn</p>

              <div className="flex flex-col gap-3 w-full">
                {/* Chưa học */}
                <button onClick={handleBeginner}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-700 bg-gray-800/60 hover:border-primary-500 hover:bg-primary-900/20 transition-all text-left">
                  <span className="text-3xl">🌱</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Chưa học bao giờ</p>
                    <p className="text-gray-500 text-xs">Bắt đầu từ đầu với test trình độ</p>
                  </div>
                </button>

                {/* Học một chút */}
                <button onClick={handleBeginner}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-700 bg-gray-800/60 hover:border-yellow-500 hover:bg-yellow-900/20 transition-all text-left">
                  <span className="text-3xl">📚</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Học một chút rồi</p>
                    <p className="text-gray-500 text-xs">Test để xác định đúng trình độ</p>
                  </div>
                </button>

                {/* Đã học nhiều */}
                <button onClick={handleExperienced}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-700 bg-gray-800/60 hover:border-green-500 hover:bg-green-900/20 transition-all text-left">
                  <span className="text-3xl">🚀</span>
                  <div>
                    <p className="text-white font-semibold text-sm">Đã học nhiều rồi</p>
                    <p className="text-gray-500 text-xs">Vào thẳng app, tự chọn trình độ</p>
                  </div>
                </button>
              </div>

              <button onClick={close} className="text-gray-600 text-xs hover:text-gray-400 transition-colors">
                Bỏ qua
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
