"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  Flame, BookOpen, Trophy, ChevronRight, Star, Target,
  TrendingUp, Zap, Brain, Sparkles, Crown, Mic2,
  Headphones, PenLine, CheckSquare,
} from "lucide-react";
import { ACHIEVEMENTS } from "@ai-lang/shared";
import { cn } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";

function useAIInsight(streak: number, wordsToday: number, goal: number, weakAreas: string[], langName: string) {
  const [insight, setInsight] = useState({ msg: "", tip: "", action: "", href: "/" });
  useEffect(() => {
    const hour = new Date().getHours();
    const g = hour < 12 ? "Buổi sáng" : hour < 18 ? "Buổi chiều" : "Buổi tối";
    if (weakAreas.length > 0) {
      const area = weakAreas[0].toLowerCase();
      if (area.includes("grammar")) setInsight({ msg: g + "! AI phát hiện Grammar là điểm yếu.", tip: "Luyện 10 phút Grammar hôm nay sẽ tăng 15% điểm số.", action: "Luyện Grammar ngay", href: "/grammar" });
      else if (area.includes("speak") || area.includes("pronun")) setInsight({ msg: g + "! Phát âm của bạn cần cải thiện.", tip: "AI sẽ phân tích từng âm tiết và chỉ ra lỗi sai.", action: "Luyện phát âm", href: "/pronunciation" });
      else if (area.includes("listen")) setInsight({ msg: g + "! Kỹ năng nghe cần được luyện thêm.", tip: "Nghe 5 phút mỗi ngày giúp não quen với âm thanh tự nhiên.", action: "Luyện nghe", href: "/listening" });
      else setInsight({ msg: g + "! AI đã phân tích hành trình học của bạn.", tip: "Tiếp tục luyện " + langName + " để đạt mục tiêu.", action: "Chat với AI Tutor", href: "/tutor" });
    } else if (streak >= 7) {
      setInsight({ msg: "🔥 " + streak + " ngày streak! Bạn đang trong top 10% học viên.", tip: "Duy trì streak giúp não ghi nhớ từ vựng lâu hơn 3x.", action: "Tiếp tục học", href: "/" });
    } else if (wordsToday >= goal) {
      setInsight({ msg: "�� Đã đạt mục tiêu hôm nay! Xuất sắc.", tip: "Thử thách bản thân với bài học nâng cao hơn.", action: "Học nâng cao", href: "/tutor" });
    } else {
      setInsight({ msg: g + "! AI đang theo dõi tiến độ của bạn.", tip: "Còn " + Math.max(goal - wordsToday, 0) + " từ nữa để đạt mục tiêu hôm nay.", action: "Học ngay", href: "/" });
    }
  }, [streak, wordsToday, goal, weakAreas.join(","), langName]);
  return insight;
}

const QUICK_ACTIONS = [
  { label: "AI Chat", icon: "💬", href: "/", color: "#7c3aed" },
  { label: "AI Tutor", icon: "🎓", href: "/tutor", color: "#f59e0b" },
  { label: "Video", icon: "🎬", href: "/videos", color: "#ef4444" },
  { label: "Flashcard", icon: "🔁", href: "/review", color: "#10b981" },
  { label: "Phát âm", icon: "🎤", href: "/pronunciation", color: "#ec4899" },
  { label: "Dịch", icon: "🌐", href: "/translate", color: "#3b82f6" },
];

const SKILL_ITEMS = [
  { key: "speaking", icon: Mic2, label: "Nói", color: "#ec4899" },
  { key: "listening", icon: Headphones, label: "Nghe", color: "#3b82f6" },
  { key: "reading", icon: BookOpen, label: "Đọc", color: "#10b981" },
  { key: "writing", icon: PenLine, label: "Viết", color: "#f59e0b" },
  { key: "grammar", icon: CheckSquare, label: "Ngữ pháp", color: "#a78bfa" },
];

export default function DashboardPage() {
  const { tutorMemory, skillScore, streak, stats, flashcards, settings,
    weeklyHistory, achievements, checkAchievements, totalXp } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const goal = settings.dailyGoal ?? 5;
  const goalPct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const unlockedIds = new Set(achievements.map((a: any) => a.id));
  const insight = useAIInsight(streak, stats.wordsLearned, goal, tutorMemory.weakAreas ?? [], settings.targetLanguage.name);

  useEffect(() => { checkAchievements(); }, []);

  const last7 = weeklyHistory.slice(0, 7).reverse();
  const maxWords = Math.max(...last7.map((w: any) => w.wordsLearned), 1);

  return (
    <div className="max-w-2xl pb-24" style={{ background: "#06030f", minHeight: "100vh" }}>
      <style>{`
        @keyframes dashGlow { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes aiPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
      `}</style>

      {/* HERO */}
      <div className="relative overflow-hidden px-5 pt-8 pb-5"
        style={{ background: "linear-gradient(160deg,#120428 0%,#0a0320 70%,#06030f 100%)" }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/40 text-xs font-medium">Xin chào 👋</p>
              <h1 className="text-2xl font-black text-white mt-0.5 leading-none">
                {user?.name?.split(" ").slice(-1)[0] || "Bạn"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.isPremium && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.25),rgba(249,115,22,0.15))", border: "1px solid rgba(245,158,11,0.35)" }}>
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-300">VIP</span>
                </div>
              )}
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.25)" }}>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{totalXp} XP</span>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div className="rounded-2xl p-3.5 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,rgba(109,40,217,0.2),rgba(79,70,229,0.1))", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 4px 24px rgba(109,40,217,0.15)" }}>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(139,92,246,0.25)", border: "1px solid rgba(139,92,246,0.3)", animation: "aiPulse 3s ease-in-out infinite" }}>
                <Brain className="w-4 h-4 text-purple-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AI Insight</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ animation: "dashGlow 2s ease-in-out infinite" }} />
                </div>
                <p className="text-white text-xs font-semibold leading-snug">{insight.msg}</p>
                <p className="text-white/40 text-xs mt-0.5 leading-snug">{insight.tip}</p>
              </div>
            </div>
            <button onClick={() => router.push(insight.href)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold text-purple-200 transition-all hover:bg-white/5"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Zap className="w-3 h-3" /> {insight.action}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* DAILY GOAL */}
        <div className="rounded-2xl p-4 -mt-1"
          style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.18)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Mục tiêu hôm nay</span>
            </div>
            <span className="text-sm font-bold" style={{ color: goalPct >= 100 ? "#10b981" : "#a78bfa" }}>
              {stats.wordsLearned}/{goal} từ
            </span>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{ width: goalPct + "%", background: goalPct >= 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#6d28d9,#a78bfa)", boxShadow: goalPct > 0 ? "0 0 8px rgba(167,139,250,0.5)" : "none" }} />
          </div>
          {goalPct >= 100 && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Hoàn thành mục tiêu hôm nay!</p>}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Flame, value: streak, label: "Streak", unit: "ngày", color: "#f97316" },
            { icon: BookOpen, value: flashcards.length, label: "Flashcards", unit: "từ", color: "#a78bfa" },
            { icon: Trophy, value: achievements.length, label: "Thành tích", unit: "/" + ACHIEVEMENTS.length, color: "#fbbf24" },
          ].map(({ icon: Icon, value, label, unit, color }) => (
            <div key={label} className="rounded-2xl p-3.5 flex flex-col items-center gap-1 text-center"
              style={{ background: "rgba(15,8,30,0.98)", border: "1px solid " + color + "20" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                style={{ background: color + "15" }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <p className="text-xl font-black text-white leading-none">{value}<span className="text-xs font-normal text-white/30 ml-0.5">{unit}</span></p>
              <p className="text-[10px] text-white/30 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Học ngay</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_ACTIONS.map(({ label, icon, href, color }) => (
              <button key={href} onClick={() => router.push(href)}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: color + "10", border: "1px solid " + color + "20" }}>
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold text-white/70 leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* SKILL BARS */}
        {skillScore && Object.keys(skillScore).length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-semibold text-white">Phân tích kỹ năng AI</p>
              <span className="ml-auto text-[10px] text-purple-400/50">Tự động cập nhật</span>
            </div>
            <div className="flex flex-col gap-2">
              {SKILL_ITEMS.map(({ key, icon: Icon, label, color }) => {
                const score = (skillScore as any)[key] ?? 0;
                if (!score) return null;
                return (
                  <div key={key} className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color }} />
                    <span className="text-xs text-white/50 w-16 shrink-0">{label}</span>
                    <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: score + "%", background: "linear-gradient(90deg," + color + "80," + color + ")", boxShadow: "0 0 6px " + color + "60" }} />
                    </div>
                    <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEKLY CHART */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-sm font-semibold text-white">Hoạt động 7 ngày</p>
          </div>
          {last7.length === 0 ? (
            <p className="text-white/20 text-sm text-center py-6">Chưa có dữ liệu. Hãy bắt đầu học!</p>
          ) : (
            <div className="flex items-end gap-1.5 h-20">
              {last7.map((w: any, i: number) => {
                const h = Math.max((w.wordsLearned / maxWords) * 76, 3);
                const isToday = i === last7.length - 1;
                const days = ["CN","T2","T3","T4","T5","T6","T7"];
                const d = new Date(w.date);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {w.wordsLearned > 0 && <span className="text-[10px] text-white/30">{w.wordsLearned}</span>}
                    <div className="w-full rounded-t-lg transition-all"
                      style={{ height: h, background: isToday ? "linear-gradient(180deg,#c4b5fd,#7c3aed)" : w.wordsLearned > 0 ? "rgba(139,92,246,0.35)" : "rgba(255,255,255,0.03)", boxShadow: isToday ? "0 0 10px rgba(167,139,250,0.6)" : "none" }} />
                    <span className="text-[10px] text-white/25">{days[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI SUGGESTIONS */}
        {(tutorMemory.weakAreas?.length ?? 0) > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.18)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <p className="text-sm font-semibold text-white">AI gợi ý hôm nay</p>
            </div>
            <div className="flex flex-col gap-2">
              {tutorMemory.weakAreas.slice(0, 2).map((area: string, i: number) => {
                const map: Record<string, { href: string; emoji: string; label: string; desc: string }> = {
                  grammar: { href: "/grammar", emoji: "📐", label: "Luyện Grammar", desc: "AI phát hiện lỗi ngữ pháp" },
                  vocabulary: { href: "/flashcards", emoji: "📚", label: "Ôn từ vựng", desc: "Có từ sắp quên cần ôn" },
                  speaking: { href: "/pronunciation", emoji: "🎤", label: "Luyện phát âm", desc: "Phát âm cần cải thiện" },
                  listening: { href: "/listening", emoji: "🎧", label: "Luyện nghe", desc: "Kỹ năng nghe còn yếu" },
                  fluency: { href: "/tutor", emoji: "💬", label: "Chat AI Tutor", desc: "Luyện giao tiếp tự nhiên" },
                };
                const key = Object.keys(map).find(k => area.toLowerCase().includes(k)) ?? "fluency";
                const item = map[key];
                return (
                  <button key={i} onClick={() => router.push(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5 group"
                    style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <span className="text-lg">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-xs font-semibold">{item.label}</p>
                      <p className="text-white/30 text-[10px]">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.12)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-semibold text-white">Thành tích</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>
              {achievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {ACHIEVEMENTS.map((a: any) => {
              const unlocked = unlockedIds.has(a.id);
              return (
                <div key={a.id} title={a.title + ": " + a.description}
                  className={cn("flex items-center justify-center p-2 rounded-xl border transition-all",
                    unlocked ? "border-yellow-600/30 bg-yellow-900/15" : "border-white/4 opacity-20")}>
                  <span className="text-lg">{a.emoji}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* PREMIUM BANNER */}
        {!user?.isPremium && (
          <button onClick={() => router.push("/premium")}
            className="w-full rounded-2xl p-4 flex items-center gap-3 transition-all hover:opacity-90 active:scale-[0.99] relative overflow-hidden"
            style={{ background: "linear-gradient(135deg,#78350f,#92400e)", border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 8px 24px rgba(245,158,11,0.15)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,158,11,0.25)" }}>
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">Nâng cấp VIP</p>
              <p className="text-yellow-200/60 text-xs mt-0.5">Mở khóa tất cả · Không giới hạn · Không quảng cáo</p>
            </div>
            <ChevronRight className="w-4 h-4 text-yellow-400 shrink-0" />
          </button>
        )}

        <AdBanner slot="REPLACE_WITH_YOUR_SLOT_ID" format="horizontal" className="my-1" />
      </div>
    </div>
  );
}
