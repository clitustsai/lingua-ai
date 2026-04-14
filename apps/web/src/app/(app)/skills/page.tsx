"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, TrendingUp, Mic, BookOpen, Zap, Brain, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const SKILL_CONFIG = [
  { key: "speaking",   label: "Speaking",    icon: Mic,       color: "from-pink-500 to-rose-600",    bg: "bg-pink-500/20",   text: "text-pink-400" },
  { key: "grammar",    label: "Grammar",     icon: BookOpen,  color: "from-yellow-500 to-orange-500", bg: "bg-yellow-500/20", text: "text-yellow-400" },
  { key: "fluency",    label: "Fluency",     icon: Zap,       color: "from-blue-500 to-cyan-500",     bg: "bg-blue-500/20",   text: "text-blue-400" },
  { key: "vocabulary", label: "Vocabulary",  icon: Brain,     color: "from-purple-500 to-violet-600", bg: "bg-purple-500/20", text: "text-purple-400" },
] as const;

function RadialScore({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth="6"
        stroke="url(#g)" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }} />
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function SkillsPage() {
  const { messages, settings, skillScore, tutorMemory, updateSkillScore, updateTutorMemory } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const hasData = skillScore.updatedAt !== "";

  const analyze = async () => {
    if (messages.length < 3) { alert("Hãy chat ít nhất 3 tin nhắn để phân tích kỹ năng!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/skill-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.slice(-20),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
      updateSkillScore({ speaking: data.speaking, grammar: data.grammar, fluency: data.fluency, vocabulary: data.vocabulary });
      updateTutorMemory({
        commonErrors: data.commonErrors ?? [],
        weakAreas: data.weakAreas ?? [],
        strongAreas: data.strongAreas ?? [],
        totalSessions: (tutorMemory.totalSessions ?? 0) + 1,
        lastFeedback: data.feedback ?? "",
      });
    } finally { setLoading(false); }
  };

  const displayScore = analysis ?? (hasData ? skillScore : null);
  const overall = displayScore
    ? Math.round((displayScore.speaking + displayScore.grammar + displayScore.fluency + displayScore.vocabulary) / 4)
    : 0;

  return (
    <div className="p-5 max-w-xl">
      <div className="pt-2 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-400" /> Phân tích kỹ năng
          </h1>
          <p className="text-sm text-gray-500 mt-1">AI đánh giá Speaking · Grammar · Fluency · Vocabulary</p>
        </div>
        {hasData && (
          <button onClick={analyze} disabled={loading} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
        )}
      </div>

      {!displayScore ? (
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="w-20 h-20 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary-400" />
          </div>
          <div className="text-center">
            <p className="text-white font-semibold">Chưa có dữ liệu phân tích</p>
            <p className="text-gray-400 text-sm mt-1">Chat ít nhất 3 tin nhắn rồi nhấn phân tích</p>
          </div>
          <button onClick={analyze} disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl font-semibold transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</> : "🔍 Phân tích ngay"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Overall score */}
          <div className="rounded-2xl p-5 flex items-center gap-5"
            style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <div className="relative shrink-0">
              <RadialScore score={overall} color="" size={90} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">{overall}</span>
              </div>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Điểm tổng thể</p>
              <p className="text-gray-400 text-sm mt-0.5">
                {overall >= 80 ? "🏆 Xuất sắc!" : overall >= 60 ? "👍 Khá tốt!" : overall >= 40 ? "📈 Đang tiến bộ" : "💪 Cần cố gắng thêm"}
              </p>
              {skillScore.updatedAt && (
                <p className="text-xs text-gray-600 mt-1">Cập nhật: {new Date(skillScore.updatedAt).toLocaleDateString("vi-VN")}</p>
              )}
            </div>
          </div>

          {/* Skill bars */}
          <div className="grid grid-cols-2 gap-3">
            {SKILL_CONFIG.map(({ key, label, icon: Icon, bg, text }) => {
              const score = (displayScore as any)[key] ?? 0;
              return (
                <div key={key} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center mb-3", bg)}>
                    <Icon className={cn("w-4 h-4", text)} />
                  </div>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={cn("text-2xl font-bold", text)}>{score}</p>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2">
                    <div className={cn("h-1.5 rounded-full transition-all duration-700", text.replace("text-", "bg-"))}
                      style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Feedback */}
          {(analysis?.feedback || tutorMemory.lastFeedback) && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-xs text-purple-400 font-semibold mb-2">🤖 Nhận xét từ AI Tutor</p>
              <p className="text-gray-200 text-sm leading-relaxed">{analysis?.feedback || tutorMemory.lastFeedback}</p>
            </div>
          )}

          {/* Weak / Strong areas */}
          <div className="grid grid-cols-2 gap-3">
            {tutorMemory.weakAreas?.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <p className="text-xs text-red-400 font-semibold mb-2">⚠️ Cần cải thiện</p>
                {tutorMemory.weakAreas.slice(0, 3).map((w, i) => (
                  <p key={i} className="text-xs text-gray-300 mb-1">• {w}</p>
                ))}
              </div>
            )}
            {tutorMemory.strongAreas?.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <p className="text-xs text-green-400 font-semibold mb-2">✅ Điểm mạnh</p>
                {tutorMemory.strongAreas.slice(0, 3).map((s, i) => (
                  <p key={i} className="text-xs text-gray-300 mb-1">• {s}</p>
                ))}
              </div>
            )}
          </div>

          {/* Common errors */}
          {tutorMemory.commonErrors?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold mb-2">📝 Lỗi hay gặp</p>
              {tutorMemory.commonErrors.slice(0, 4).map((e, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="text-yellow-500 text-xs shrink-0 mt-0.5">▸</span>
                  <p className="text-xs text-gray-300">{e}</p>
                </div>
              ))}
            </div>
          )}

          {/* Next steps */}
          {analysis?.nextSteps?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-primary-400 font-semibold mb-2">🎯 Bước tiếp theo</p>
              {analysis.nextSteps.map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-primary-600/30 text-primary-300 text-xs flex items-center justify-center shrink-0 font-bold">{i+1}</span>
                  <p className="text-xs text-gray-300">{s}</p>
                </div>
              ))}
            </div>
          )}

          <button onClick={analyze} disabled={loading}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-primary-500 hover:text-primary-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</> : <><RefreshCw className="w-4 h-4" /> Phân tích lại</>}
          </button>
        </div>
      )}
    </div>
  );
}
