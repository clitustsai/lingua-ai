"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Lock, CheckCircle2, ChevronRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARD_KEY = "lingua-onboarded-v2";

const LEVELS = [
  { id: "A1", label: "A1 - Beginner", desc: "Chưa biết gì, bắt đầu từ đầu", emoji: "🌱", color: "#10b981" },
  { id: "A2", label: "A2 - Elementary", desc: "Biết một chút cơ bản", emoji: "📗", color: "#3b82f6" },
  { id: "B1", label: "B1 - Intermediate", desc: "Giao tiếp được những chủ đề quen", emoji: "📘", color: "#8b5cf6" },
  { id: "B2", label: "B2 - Upper Intermediate", desc: "Khá thành thạo, đọc hiểu tốt", emoji: "📙", color: "#f59e0b" },
  { id: "C1", label: "C1 - Advanced", desc: "Gần như thành thạo", emoji: "📕", color: "#ef4444" },
  { id: "C2", label: "C2 - Proficient", desc: "Thành thạo như người bản ngữ", emoji: "🏆", color: "#ec4899" },
];

export default function WelcomePopup() {
  const { user, isLoggedIn } = useAuthStore();
  const { settings, setSettings, examResults = {} } = useAppStore() as any;
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [step, setStep] = useState<"choose" | "confirm">("choose");
  const [picked, setPicked] = useState("A1");

  useEffect(() => {
    if (!isLoggedIn || !user) return;
    const done = localStorage.getItem(`${ONBOARD_KEY}-${user.id}`);
    if (done) return;
    const t = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(t);
  }, [isLoggedIn, user]);

  const confirm = (level: string) => {
    setSettings({ level });
    localStorage.setItem(`${ONBOARD_KEY}-${user!.id}`, level);
    setShow(false);
    if (level === "A1") {
      router.push("/exam");
    }
  };

  const goTest = () => {
    localStorage.setItem(`${ONBOARD_KEY}-${user!.id}`, "tested");
    setShow(false);
    router.push("/placement");
  };

  if (!show || !user) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#0d0520,#1a0533)", border: "1px solid rgba(139,92,246,0.4)", boxShadow: "0 32px 64px rgba(0,0,0,0.6)" }}>

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 8px 24px rgba(109,40,217,0.4)" }}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-white font-black text-xl">Chào {user.name?.split(" ").slice(-1)[0]}! 👋</h2>
            <p className="text-gray-400 text-sm mt-1">Trình độ {settings.targetLanguage.name} của bạn hiện tại?</p>
          </div>

          {/* Level options */}
          <div className="flex flex-col gap-2">
            {LEVELS.map((lv) => {
              const examPassed = (examResults as any)?.[lv.id]?.passed;
              return (
                <button key={lv.id} onClick={() => setPicked(lv.id)}
                  className={cn("flex items-center gap-3 p-3 rounded-2xl border text-left transition-all",
                    picked === lv.id
                      ? "border-purple-500 bg-purple-900/30"
                      : "border-white/8 bg-white/3 hover:border-white/20")}>
                  <span className="text-xl shrink-0">{lv.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", picked === lv.id ? "text-white" : "text-gray-300")}>{lv.label}</p>
                    <p className="text-xs text-gray-500 truncate">{lv.desc}</p>
                  </div>
                  {examPassed && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />}
                  {picked === lv.id && !examPassed && <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Info box */}
          <div className="rounded-2xl p-3 text-xs text-gray-400"
            style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <p>📌 Bạn sẽ học từ trình độ <span className="text-purple-300 font-semibold">{picked}</span>. Để lên trình độ cao hơn, cần <span className="text-yellow-300 font-semibold">thi đạt</span> trình độ hiện tại trước.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <button onClick={() => confirm(picked)}
              className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 4px 20px rgba(109,40,217,0.4)" }}>
              <ChevronRight className="w-4 h-4" /> Bắt đầu học {picked}
            </button>
            <button onClick={goTest}
              className="w-full py-3 rounded-2xl font-semibold text-purple-300 flex items-center justify-center gap-2 transition-all hover:bg-white/5"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Trophy className="w-4 h-4" /> Test trình độ để xác định chính xác
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
