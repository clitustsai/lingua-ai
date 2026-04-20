"use client";
import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Award, Download, Share2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CERT_TYPES = [
  { id: "completion", label: "Hoàn thành khóa học", emoji: "🎓", color: "#7c3aed", desc: "Chứng nhận hoàn thành chương trình học" },
  { id: "streak", label: "Streak Champion", emoji: "🔥", color: "#f97316", desc: "Duy trì học liên tục xuất sắc" },
  { id: "vocabulary", label: "Từ vựng Master", emoji: "📚", color: "#10b981", desc: "Thành thạo từ vựng tiếng Anh" },
  { id: "speaking", label: "Speaking Excellence", emoji: "🎤", color: "#ec4899", desc: "Kỹ năng nói xuất sắc" },
];

const LEVELS_MAP: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper Intermediate", C1: "Advanced", C2: "Proficient",
};

export default function CertificatePage() {
  const { streak, totalXp, flashcards, lessonsCompleted, settings, examResults = {} } = useAppStore() as any;
  const { user } = useAuthStore();
  const [certType, setCertType] = useState(CERT_TYPES[0]);
  const certRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const today = new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const levelName = LEVELS_MAP[settings.level] ?? settings.level;
  const passedLevels = Object.entries(examResults as Record<string, any>).filter(([, r]) => r.passed).map(([l]) => l);
  const hasAnyPassed = passedLevels.length > 0;

  const downloadCert = async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#0a0614" });
      const link = document.createElement("a");
      link.download = `LinguaAI-Certificate-${user?.name ?? "User"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Không thể tải xuống. Hãy chụp màn hình thay thế.");
    }
  };

  const share = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Chứng chỉ LinguaAI",
        text: `Tôi vừa nhận chứng chỉ ${certType.label} từ LinguaAI! 🎓`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" /> Giấy khen & Chứng chỉ
        </h1>
        <p className="text-sm text-gray-400 mt-1">Tạo chứng chỉ học tập để chia sẻ thành tích</p>
      </div>

      {/* Gate: must pass exam first */}
      {!hasAnyPassed && (
        <div className="rounded-2xl p-5 mb-5 text-center"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-white font-bold mb-1">Chưa có chứng chỉ nào</p>
          <p className="text-gray-400 text-sm mb-4">Bạn cần hoàn thành bài thi trình độ (A1, A2...) và đạt điểm 60+ để nhận chứng chỉ.</p>
          <button onClick={() => router.push("/exam")}
            className="px-6 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            🏆 Thi ngay
          </button>
        </div>
      )}

      {/* Passed levels */}
      {hasAnyPassed && (
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <p className="text-sm font-semibold text-white mb-2">Trình độ đã đạt:</p>
          <div className="flex gap-2 flex-wrap">
            {passedLevels.map(lv => (
              <span key={lv} className="px-3 py-1 rounded-full text-xs font-bold text-green-300"
                style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                ✅ {lv} · {(examResults as any)[lv]?.score}/100
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Cert type selector */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {CERT_TYPES.map(c => (
          <button key={c.id} onClick={() => setCertType(c)}
            className={cn("flex flex-col gap-1 p-3 rounded-2xl border text-left transition-all",
              certType.id === c.id ? "border-primary-500 bg-primary-900/30" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
            <span className="text-2xl">{c.emoji}</span>
            <span className={cn("text-xs font-semibold", certType.id === c.id ? "text-white" : "text-gray-400")}>{c.label}</span>
            <span className="text-xs text-gray-600">{c.desc}</span>
          </button>
        ))}
      </div>

      {/* Certificate preview */}
      <div ref={certRef} className="rounded-3xl overflow-hidden mb-5 select-none"
        style={{
          background: "linear-gradient(135deg,#0a0614 0%,#1a0533 50%,#0a0614 100%)",
          border: `2px solid ${certType.color}60`,
          boxShadow: `0 0 40px ${certType.color}30`,
          padding: "40px 32px",
          minHeight: 400,
        }}>
        {/* Top decoration */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-1 h-12 rounded-full" style={{ background: certType.color }} />
            <div className="text-center">
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: certType.color }}>LinguaAI</p>
              <p className="text-white/40 text-xs">Certificate of Achievement</p>
            </div>
            <div className="w-1 h-12 rounded-full" style={{ background: certType.color }} />
          </div>
        </div>

        {/* Main content */}
        <div className="text-center mb-6">
          <p className="text-white/50 text-sm mb-2">Chứng nhận rằng</p>
          <h2 className="text-white font-black text-3xl mb-1">{user?.name ?? "Học viên"}</h2>
          <p className="text-white/40 text-sm mb-4">đã hoàn thành xuất sắc</p>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full mb-4"
            style={{ background: `${certType.color}20`, border: `1px solid ${certType.color}50` }}>
            <span className="text-2xl">{certType.emoji}</span>
            <span className="font-bold text-white text-lg">{certType.label}</span>
          </div>
          <p className="text-white/50 text-sm">
            Chương trình học {settings.targetLanguage.name} — Trình độ {levelName}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Streak", value: `${streak} ngày`, icon: "🔥" },
            { label: "Tổng XP", value: totalXp.toLocaleString(), icon: "⭐" },
            { label: "Bài học", value: lessonsCompleted, icon: "📚" },
          ].map(s => (
            <div key={s.label} className="text-center rounded-2xl py-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="text-xl mb-0.5">{s.icon}</p>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className="text-white/30 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Stars decoration */}
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/30 text-xs">Ngày cấp</p>
            <p className="text-white/60 text-sm font-medium">{today}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-1"
              style={{ background: `${certType.color}30`, border: `2px solid ${certType.color}` }}>
              <Award className="w-6 h-6" style={{ color: certType.color }} />
            </div>
            <p className="text-white/30 text-xs">LinguaAI Official</p>
          </div>
          <div className="text-right">
            <p className="text-white/30 text-xs">Mã chứng chỉ</p>
            <p className="text-white/60 text-xs font-mono">LA-{Date.now().toString(36).toUpperCase().slice(-8)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={downloadCert}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          <Download className="w-4 h-4" /> Tải xuống
        </button>
        <button onClick={share}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-gray-700 text-gray-300 hover:border-gray-600 transition-colors">
          <Share2 className="w-4 h-4" /> Chia sẻ
        </button>
      </div>

      <p className="text-xs text-gray-700 text-center mt-3">
        Chứng chỉ được tạo bởi LinguaAI · Dựa trên dữ liệu học tập thực tế của bạn
      </p>
    </div>
  );
}
