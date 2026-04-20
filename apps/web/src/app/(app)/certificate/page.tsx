"use client";
import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Award, Download, Share2, Star, Trophy, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const LEVELS_MAP: Record<string, string> = {
  A1: "Beginner", A2: "Elementary", B1: "Intermediate",
  B2: "Upper Intermediate", C1: "Advanced", C2: "Proficient",
};

const LEVEL_COLORS: Record<string, string> = {
  A1: "#7c3aed", A2: "#3b82f6", B1: "#10b981",
  B2: "#f59e0b", C1: "#ef4444", C2: "#ec4899",
};

export default function CertificatePage() {
  const { streak, totalXp, settings, examResults = {} } = useAppStore() as any;
  const { user } = useAuthStore();
  const router = useRouter();
  const certRef = useRef<HTMLDivElement>(null);

  const passedLevels = Object.entries(examResults as Record<string, any>)
    .filter(([, r]) => r.passed)
    .sort((a, b) => ["A1","A2","B1","B2","C1","C2"].indexOf(a[0]) - ["A1","A2","B1","B2","C1","C2"].indexOf(b[0]));

  const [selectedLevel, setSelectedLevel] = useState<string>(passedLevels[passedLevels.length - 1]?.[0] ?? "");

  const hasAnyPassed = passedLevels.length > 0;
  const examData = selectedLevel ? (examResults as any)[selectedLevel] : null;
  const color = LEVEL_COLORS[selectedLevel] ?? "#7c3aed";
  const levelName = LEVELS_MAP[selectedLevel] ?? selectedLevel;
  const today = examData?.date
    ? new Date(examData.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
    : new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const downloadCert = async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#0a0614" });
      const link = document.createElement("a");
      link.download = `LinguaAI-${selectedLevel}-${user?.name ?? "User"}.png`;
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
        text: `Tôi vừa đạt chứng chỉ ${selectedLevel} (${levelName}) từ LinguaAI! 🎓`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-yellow-400" /> Chứng chỉ
        </h1>
        <p className="text-sm text-gray-400 mt-1">Chứng chỉ được cấp sau khi thi đạt trình độ</p>
      </div>

      {/* Chưa thi đạt */}
      {!hasAnyPassed && (
        <div className="rounded-2xl p-6 text-center"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <Lock className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Chưa có chứng chỉ nào</p>
          <p className="text-gray-400 text-sm mb-4">Thi đạt trình độ A1, A2... để nhận chứng chỉ chính thức.</p>
          <button onClick={() => router.push("/exam")}
            className="px-6 py-3 rounded-2xl font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
            🏆 Thi ngay
          </button>
        </div>
      )}

      {/* Đã có chứng chỉ */}
      {hasAnyPassed && (
        <>
          {/* Level tabs */}
          {passedLevels.length > 1 && (
            <div className="flex gap-2 mb-5 flex-wrap">
              {passedLevels.map(([lv]) => (
                <button key={lv} onClick={() => setSelectedLevel(lv)}
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all"
                  style={selectedLevel === lv
                    ? { background: LEVEL_COLORS[lv] + "30", border: `1px solid ${LEVEL_COLORS[lv]}60`, color: "white" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                  {lv}
                </button>
              ))}
            </div>
          )}

          {/* Certificate */}
          <div ref={certRef} className="rounded-3xl overflow-hidden mb-5 select-none"
            style={{
              background: "linear-gradient(135deg,#0a0614 0%,#1a0533 50%,#0a0614 100%)",
              border: `2px solid ${color}60`,
              boxShadow: `0 0 40px ${color}30`,
              padding: "40px 32px",
              minHeight: 400,
            }}>
            {/* Header */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-12 rounded-full" style={{ background: color }} />
                <div className="text-center">
                  <p className="text-xs font-bold tracking-widest uppercase" style={{ color }}>LinguaAI</p>
                  <p className="text-white/40 text-xs">Certificate of Achievement</p>
                </div>
                <div className="w-1 h-12 rounded-full" style={{ background: color }} />
              </div>
            </div>

            {/* Main */}
            <div className="text-center mb-6">
              <p className="text-white/50 text-sm mb-2">Chứng nhận rằng</p>
              <h2 className="text-white font-black text-3xl mb-1">{user?.name ?? "Học viên"}</h2>
              <p className="text-white/40 text-sm mb-4">đã vượt qua kỳ thi trình độ</p>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4"
                style={{ background: `${color}20`, border: `1px solid ${color}50` }}>
                <Trophy className="w-6 h-6" style={{ color }} />
                <div className="text-left">
                  <p className="font-black text-white text-xl">{selectedLevel}</p>
                  <p className="text-xs font-medium" style={{ color }}>{levelName}</p>
                </div>
                <div className="text-right ml-4 pl-4" style={{ borderLeft: `1px solid ${color}30` }}>
                  <p className="font-black text-white text-xl">{examData?.score ?? 0}</p>
                  <p className="text-xs text-white/40">Điểm thi</p>
                </div>
              </div>
              <p className="text-white/50 text-sm">
                {settings.targetLanguage.name} · Kỳ thi 5 kỹ năng: Nghe · Đọc · Ngữ pháp · Viết · Nói
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: "Điểm thi", value: `${examData?.score ?? 0}/100`, icon: "🏆" },
                { label: "Tổng XP", value: totalXp.toLocaleString(), icon: "⭐" },
                { label: "Streak", value: `${streak} ngày`, icon: "🔥" },
              ].map(s => (
                <div key={s.label} className="text-center rounded-2xl py-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xl mb-0.5">{s.icon}</p>
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-white/30 text-xs">{s.label}</p>
                </div>
              ))}
            </div>

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
                  style={{ background: `${color}30`, border: `2px solid ${color}` }}>
                  <Award className="w-6 h-6" style={{ color }} />
                </div>
                <p className="text-white/30 text-xs">LinguaAI Official</p>
              </div>
              <div className="text-right">
                <p className="text-white/30 text-xs">Mã chứng chỉ</p>
                <p className="text-white/60 text-xs font-mono">LA-{selectedLevel}-{(examData?.date ?? Date.now().toString()).slice(-6).replace(/\D/g,"").padEnd(6,"0")}</p>
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

          <button onClick={() => router.push("/exam")}
            className="w-full mt-3 py-2.5 rounded-2xl text-sm font-medium text-gray-400 hover:text-white transition-colors"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            🏆 Thi thêm trình độ khác
          </button>

          <p className="text-xs text-gray-700 text-center mt-3">
            Chứng chỉ được cấp bởi LinguaAI · Dựa trên kết quả thi thực tế
          </p>
        </>
      )}
    </div>
  );
}
