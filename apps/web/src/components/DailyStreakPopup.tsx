"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Flame, Star, X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

const STREAK_REWARDS = [
  { day: 1,  xp: 10,  emoji: "🌱" },
  { day: 3,  xp: 25,  emoji: "🔥" },
  { day: 7,  xp: 50,  emoji: "⚡" },
  { day: 14, xp: 100, emoji: "💎" },
  { day: 30, xp: 250, emoji: "🏆" },
];

export default function DailyStreakPopup() {
  const { streak, stats, settings, totalXp, claimStreakReward, streakRewards } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const key = `streak-popup-${today}`;
    if (localStorage.getItem(key)) return;
    // Show popup once per day after 1 second
    const t = setTimeout(() => {
      setShow(true);
      localStorage.setItem(key, "1");
    }, 1500);
    return () => clearTimeout(t);
  }, [user]);

  if (!show) return null;

  const claimable = STREAK_REWARDS.find(r => {
    const storeReward = streakRewards.find(sr => sr.day === r.day);
    return storeReward && !storeReward.claimed && streak >= r.day;
  });

  const todayGoalDone = stats.wordsLearned >= (settings.dailyGoal ?? 5);

  const handleClaim = () => {
    if (claimable) {
      claimStreakReward(claimable.day);
      setClaimed(true);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-6 sm:pb-0"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)", border: "1px solid rgba(245,158,11,0.3)", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>

        {/* Glow top */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg,#f59e0b,#f97316,#f59e0b)" }} />

        <div className="p-6">
          <button onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>

          {/* Streak hero */}
          <div className="text-center mb-5">
            <div className="text-6xl font-black text-orange-400 leading-none mb-1">{streak}</div>
            <p className="text-orange-300 font-bold text-lg">ngày liên tiếp 🔥</p>
            <p className="text-gray-500 text-sm mt-1">
              {todayGoalDone ? "✅ Hôm nay đã hoàn thành mục tiêu!" : "📚 Hãy học hôm nay để giữ streak!"}
            </p>
          </div>

          {/* XP display */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-black text-lg">{totalXp.toLocaleString()} XP</span>
            </div>
          </div>

          {/* Claimable reward */}
          {claimable && !claimed && (
            <div className="rounded-2xl p-4 mb-4 text-center"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)" }}>
              <p className="text-yellow-300 text-sm font-semibold mb-1">🎁 Phần thưởng streak {claimable.day} ngày!</p>
              <p className="text-3xl mb-2">{claimable.emoji}</p>
              <button onClick={handleClaim}
                className="px-6 py-2 rounded-xl font-bold text-black text-sm transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                Nhận +{claimable.xp} XP
              </button>
            </div>
          )}

          {claimed && (
            <div className="rounded-2xl p-3 mb-4 text-center"
              style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
              <p className="text-green-400 text-sm font-semibold">✅ Đã nhận +{claimable?.xp} XP!</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => { setShow(false); router.push("/streak"); }}
              className="flex-1 py-3 rounded-2xl font-bold text-white text-sm transition-all"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              <Zap className="w-4 h-4 inline mr-1" /> Xem phần thưởng
            </button>
            <button onClick={() => setShow(false)}
              className="flex-1 py-3 rounded-2xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors">
              Bắt đầu học
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
