"use client";
import { useAppStore } from "@/store/useAppStore";
import { Flame, Star, Trophy, Gift, CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const LEVEL_THRESHOLDS = [
  { min: 0,    max: 99,   label: "Beginner",    color: "text-gray-400",   bg: "bg-gray-700" },
  { min: 100,  max: 299,  label: "Learner",     color: "text-green-400",  bg: "bg-green-700" },
  { min: 300,  max: 699,  label: "Explorer",    color: "text-blue-400",   bg: "bg-blue-700" },
  { min: 700,  max: 1499, label: "Scholar",     color: "text-purple-400", bg: "bg-purple-700" },
  { min: 1500, max: 2999, label: "Expert",      color: "text-yellow-400", bg: "bg-yellow-700" },
  { min: 3000, max: Infinity, label: "Master",  color: "text-orange-400", bg: "bg-orange-700" },
];

function getLevel(xp: number) {
  return LEVEL_THRESHOLDS.find(l => xp >= l.min && xp <= l.max) ?? LEVEL_THRESHOLDS[0];
}

function xpToNextLevel(xp: number) {
  const idx = LEVEL_THRESHOLDS.findIndex(l => xp >= l.min && xp <= l.max);
  if (idx === LEVEL_THRESHOLDS.length - 1) return { current: xp, needed: xp, pct: 100 };
  const next = LEVEL_THRESHOLDS[idx + 1];
  const curr = LEVEL_THRESHOLDS[idx];
  const range = next.min - curr.min;
  const progress = xp - curr.min;
  return { current: progress, needed: range, pct: Math.round((progress / range) * 100) };
}

export default function StreakPage() {
  const { streak, totalXp, streakRewards, claimStreakReward, achievements, stats, settings } = useAppStore();
  const level = getLevel(totalXp);
  const xpInfo = xpToNextLevel(totalXp);
  const goal = settings.dailyGoal ?? 5;
  const todayDone = stats.wordsLearned >= goal;

  // Build 7-day streak calendar
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const isToday = i === 6;
    const isPast = i < 6;
    // Simulate: last `streak` days are done
    const isDone = isPast ? i >= (6 - Math.min(streak - 1, 6)) : todayDone;
    return { date: d, isToday, isDone, label: ["CN","T2","T3","T4","T5","T6","T7"][d.getDay()] };
  });

  const claimable = streakRewards.filter(r => !r.claimed && streak >= r.day);

  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" /> Streak & Phần thưởng
        </h1>
        <p className="text-sm text-gray-500 mt-1">Học mỗi ngày để nhận thưởng và lên cấp</p>
      </div>

      {/* Streak hero */}
      <div className="rounded-3xl p-6 mb-5 text-center"
        style={{ background: "linear-gradient(135deg,rgba(251,146,60,0.2),rgba(239,68,68,0.15))", border: "1px solid rgba(251,146,60,0.3)" }}>
        <div className="text-7xl font-black text-orange-400 leading-none">{streak}</div>
        <p className="text-orange-300 font-semibold mt-1">ngày liên tiếp 🔥</p>
        <p className="text-gray-400 text-xs mt-2">
          {todayDone ? "✅ Hôm nay đã học xong!" : `📚 Còn ${Math.max(0, goal - stats.wordsLearned)} từ nữa để giữ streak`}
        </p>
      </div>

      {/* 7-day calendar */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Tuần này</p>
        <div className="flex justify-between gap-1">
          {days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs text-gray-500">{d.label}</span>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all",
                d.isDone ? "bg-orange-500 shadow-lg shadow-orange-500/30" :
                d.isToday ? "bg-gray-700 ring-2 ring-orange-500/50" :
                "bg-gray-800")}>
                {d.isDone ? "🔥" : d.isToday ? "📅" : "○"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP & Level */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-semibold text-sm">Level: <span className={level.color}>{level.label}</span></span>
          </div>
          <span className="text-yellow-400 font-bold">{totalXp} XP</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 mb-1">
          <div className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${xpInfo.pct}%`, background: "linear-gradient(90deg,#f59e0b,#f97316)" }} />
        </div>
        <p className="text-xs text-gray-500">{xpInfo.current}/{xpInfo.needed} XP đến level tiếp theo</p>
      </div>

      {/* Streak rewards */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
          <Gift className="w-3.5 h-3.5" /> Phần thưởng streak
        </p>
        <div className="flex flex-col gap-2">
          {streakRewards.map(r => {
            const unlocked = streak >= r.day;
            const canClaim = unlocked && !r.claimed;
            return (
              <div key={r.day} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all",
                r.claimed ? "border-green-600/30 bg-green-900/10 opacity-60" :
                canClaim ? "border-yellow-500/40 bg-yellow-900/15" :
                "border-gray-700 bg-gray-800/50 opacity-50")}>
                <span className="text-2xl">{r.emoji}</span>
                <div className="flex-1">
                  <p className={cn("text-sm font-semibold", r.claimed ? "text-gray-400" : canClaim ? "text-white" : "text-gray-500")}>
                    {r.day} ngày streak
                  </p>
                  <p className="text-xs text-yellow-400">+{r.xp} XP</p>
                </div>
                {r.claimed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                ) : canClaim ? (
                  <button onClick={() => claimStreakReward(r.day)}
                    className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold transition-colors shrink-0">
                    Nhận!
                  </button>
                ) : (
                  <div className="flex items-center gap-1 text-gray-600 shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                    <span className="text-xs">{r.day}d</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" /> Thành tích ({achievements.length}/10)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {[
            { id: "first_message", emoji: "💬", title: "First Words" },
            { id: "streak_3",      emoji: "🔥", title: "3 ngày" },
            { id: "streak_7",      emoji: "⚡", title: "7 ngày" },
            { id: "streak_30",     emoji: "🏆", title: "30 ngày" },
            { id: "flashcard_10",  emoji: "📚", title: "10 từ" },
            { id: "flashcard_50",  emoji: "🧠", title: "50 từ" },
            { id: "quiz_perfect",  emoji: "⭐", title: "Quiz 100%" },
            { id: "messages_50",   emoji: "🗣️", title: "50 tin" },
            { id: "grammar_check", emoji: "✅", title: "Grammar" },
            { id: "lesson_complete",emoji: "🎓", title: "Lesson" },
          ].map(a => {
            const unlocked = achievements.some(x => x.id === a.id);
            return (
              <div key={a.id} title={a.title}
                className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border text-center",
                  unlocked ? "border-yellow-600/40 bg-yellow-900/20" : "border-gray-800 opacity-30")}>
                <span className="text-xl">{a.emoji}</span>
                <span className="text-xs text-gray-500 leading-tight">{a.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
