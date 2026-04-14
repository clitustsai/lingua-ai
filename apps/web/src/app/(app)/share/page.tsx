"use client";
import { useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Share2, Download, Copy, Flame, Star, BookOpen, Trophy } from "lucide-react";

export default function SharePage() {
  const { streak, totalXp, flashcards, settings, skillScore, achievements, totalMessages } = useAppStore();
  const cardRef = useRef<HTMLDivElement>(null);

  const overall = skillScore.updatedAt
    ? Math.round((skillScore.speaking + skillScore.grammar + skillScore.fluency + skillScore.vocabulary) / 4)
    : 0;

  const shareText = `🧠 LinguaAI - Tiến độ học ${settings.targetLanguage.name} của tôi:
🔥 ${streak} ngày streak
⭐ ${totalXp} XP
📚 ${flashcards.length} từ vựng
💬 ${totalMessages} tin nhắn
${overall > 0 ? `📊 Điểm kỹ năng: ${overall}/100` : ""}
🏆 ${achievements.length} thành tích

Học cùng tôi tại LinguaAI! 🚀`;

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ text: shareText, title: "LinguaAI - Tiến độ học ngôn ngữ" });
    } else {
      await navigator.clipboard.writeText(shareText);
      alert("Đã copy vào clipboard!");
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    alert("Đã copy!");
  };

  const STATS = [
    { icon: Flame, label: "Day Streak", value: streak, color: "text-orange-400", bg: "bg-orange-500/20" },
    { icon: Star, label: "Tổng XP", value: totalXp, color: "text-yellow-400", bg: "bg-yellow-500/20" },
    { icon: BookOpen, label: "Từ vựng", value: flashcards.length, color: "text-purple-400", bg: "bg-purple-500/20" },
    { icon: Trophy, label: "Thành tích", value: achievements.length, color: "text-blue-400", bg: "bg-blue-500/20" },
  ];

  return (
    <div className="p-5 max-w-sm mx-auto">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-green-400" /> Khoe thành tích
        </h1>
        <p className="text-sm text-gray-500 mt-1">Chia sẻ tiến độ học ngôn ngữ của bạn</p>
      </div>

      {/* Share card */}
      <div ref={cardRef} className="rounded-3xl p-6 mb-5"
        style={{ background: "linear-gradient(135deg,#1a0533 0%,#0f0a1e 50%,#1a1035 100%)", border: "1px solid rgba(139,92,246,0.4)" }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-primary-600/30 flex items-center justify-center text-2xl">🧠</div>
          <div>
            <p className="text-white font-bold text-lg">LinguaAI</p>
            <p className="text-gray-400 text-sm">Học {settings.targetLanguage.flag} {settings.targetLanguage.name}</p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {STATS.map(({ icon: Icon, label, value, color, bg }) => (
            <div key={label} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Skill score */}
        {overall > 0 && (
          <div className="rounded-2xl p-3 mb-4" style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <p className="text-xs text-gray-400 mb-2">Điểm kỹ năng tổng thể</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${overall}%` }} />
              </div>
              <span className="text-white font-bold text-sm">{overall}/100</span>
            </div>
          </div>
        )}

        {/* Streak highlight */}
        <div className="flex items-center justify-center gap-2 py-3 rounded-2xl"
          style={{ background: "rgba(251,146,60,0.15)", border: "1px solid rgba(251,146,60,0.2)" }}>
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-orange-300 font-bold">{streak} ngày học liên tiếp!</span>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-4">lingua-ai.vercel.app</p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-3">
        <button onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 hover:bg-primary-500 text-white rounded-2xl font-semibold transition-colors">
          <Share2 className="w-5 h-5" /> Chia sẻ ngay
        </button>
        <button onClick={copyText}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-2xl font-medium text-sm transition-colors">
          <Copy className="w-4 h-4" /> Copy text
        </button>
      </div>

      {/* Preview text */}
      <div className="mt-4 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
        <p className="text-xs text-gray-500 mb-1">Preview:</p>
        <p className="text-xs text-gray-400 whitespace-pre-line">{shareText}</p>
      </div>
    </div>
  );
}
