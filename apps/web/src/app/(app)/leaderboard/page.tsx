"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Trophy, Flame, Star, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_USERS = [
  { rank: 1, name: "Nguyen Minh Tuan", avatar: "🦁", xp: 4820, streak: 32, level: "B2" },
  { rank: 2, name: "Tran Thi Lan Anh", avatar: "🦋", xp: 3950, streak: 21, level: "B1" },
  { rank: 3, name: "Le Van Hung", avatar: "🐯", xp: 3210, streak: 18, level: "B1" },
  { rank: 4, name: "Pham Thu Ha", avatar: "🦊", xp: 2780, streak: 14, level: "A2" },
  { rank: 5, name: "Vo Duc Thanh", avatar: "🐺", xp: 2340, streak: 11, level: "A2" },
  { rank: 6, name: "Hoang Thi Mai", avatar: "🦄", xp: 1980, streak: 9, level: "A1" },
  { rank: 7, name: "Bui Quang Huy", avatar: "🐸", xp: 1650, streak: 7, level: "A1" },
  { rank: 8, name: "Dang Thi Ngoc", avatar: "🌸", xp: 1320, streak: 5, level: "A1" },
];

const LEVEL_THRESHOLDS = [
  { level: "Beginner", min: 0, max: 500, color: "#6b7280" },
  { level: "Elementary", min: 500, max: 1500, color: "#10b981" },
  { level: "Intermediate", min: 1500, max: 3000, color: "#3b82f6" },
  { level: "Advanced", min: 3000, max: 6000, color: "#8b5cf6" },
  { level: "Master", min: 6000, max: 99999, color: "#f59e0b" },
];

function getUserLevel(xp: number) {
  return LEVEL_THRESHOLDS.find(l => xp >= l.min && xp < l.max) ?? LEVEL_THRESHOLDS[0];
}

export default function LeaderboardPage() {
  const { totalXp, streak } = useAppStore();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<"week" | "all">("week");

  const myXp = totalXp;
  const myLevel = getUserLevel(myXp);
  const nextLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(myLevel) + 1];
  const progressToNext = nextLevel ? ((myXp - myLevel.min) / (nextLevel.min - myLevel.min)) * 100 : 100;

  const myEntry = { rank: 0, name: user?.name || "Ban", avatar: user?.avatar || "⭐", xp: myXp, streak, level: "A1", isMe: true };
  const allUsers = [...MOCK_USERS, { ...myEntry, rank: MOCK_USERS.length + 1 }]
    .sort((a, b) => b.xp - a.xp)
    .map((u, i) => ({ ...u, rank: i + 1 }));

  const top3 = allUsers.slice(0, 3);
  const rest = allUsers.slice(3);

  return (
    <div className="max-w-lg" style={{ background: "#0a0614", minHeight: "100vh" }}>
      <div className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(135deg,#1a0533,#0f0a1e)" }}>
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#f59e0b,transparent)" }} />
        <h1 className="text-2xl font-black text-white flex items-center gap-2 relative z-10">
          <Trophy className="w-6 h-6 text-yellow-400" /> Bang xep hang
        </h1>
        <p className="text-gray-400 text-sm mt-1 relative z-10">Top hoc vien tuan nay</p>
      </div>

      <div className="px-5 pb-8 space-y-5">
        {/* My level card */}
        <div className="rounded-2xl p-4 -mt-2"
          style={{ background: "rgba(20,12,40,0.95)", border: `1px solid ${myLevel.color}40`, boxShadow: `0 4px 20px ${myLevel.color}20` }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Cap do cua ban</p>
              <p className="text-white font-black text-lg" style={{ color: myLevel.color }}>{myLevel.level}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-white">{myXp.toLocaleString()}</p>
              <p className="text-xs text-gray-500">XP tong</p>
            </div>
          </div>
          {nextLevel && (
            <>
              <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${progressToNext}%`, background: `linear-gradient(90deg,${myLevel.color},${nextLevel.color})` }} />
              </div>
              <p className="text-xs text-gray-600 mt-1.5">{nextLevel.min - myXp} XP nua de len {nextLevel.level}</p>
            </>
          )}
        </div>

        {/* Tab */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.6)" }}>
          {(["week", "all"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
                tab === t ? "bg-primary-600 text-white" : "text-gray-400")}>
              {t === "week" ? "Tuan nay" : "Tat ca"}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className="flex items-end justify-center gap-3 py-4">
          {[top3[1], top3[0], top3[2]].map((u, i) => {
            if (!u) return null;
            const heights = [80, 100, 70];
            const isFirst = u.rank === 1;
            return (
              <div key={u.rank} className="flex flex-col items-center gap-2" style={{ width: 90 }}>
                {isFirst && <Crown className="w-5 h-5 text-yellow-400" />}
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: isFirst ? "rgba(245,158,11,0.2)" : "rgba(139,92,246,0.15)", border: isFirst ? "2px solid rgba(245,158,11,0.5)" : "1px solid rgba(139,92,246,0.3)" }}>
                  {u.avatar}
                </div>
                <p className="text-white text-xs font-semibold text-center leading-tight">{u.name.split(" ").slice(-1)[0]}</p>
                <div className="w-full rounded-t-xl flex items-center justify-center"
                  style={{ height: heights[i], background: isFirst ? "linear-gradient(180deg,rgba(245,158,11,0.3),rgba(245,158,11,0.1))" : "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <div className="text-center">
                    <p className="text-2xl font-black" style={{ color: isFirst ? "#fbbf24" : "#a78bfa" }}>#{u.rank}</p>
                    <p className="text-xs text-gray-400">{(u.xp / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rest of leaderboard */}
        <div className="flex flex-col gap-2">
          {rest.map(u => {
            const isMe = (u as any).isMe;
            return (
              <div key={u.rank}
                className={cn("flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                  isMe ? "ring-2 ring-primary-500" : "")}
                style={{ background: isMe ? "rgba(124,58,237,0.15)" : "rgba(20,12,40,0.8)", border: isMe ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.05)" }}>
                <span className="text-gray-500 font-bold text-sm w-6 text-center">#{u.rank}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)" }}>
                  {u.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", isMe ? "text-primary-300" : "text-white")}>
                    {u.name} {isMe && "(Ban)"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-0.5 text-xs text-orange-400">
                      <Flame className="w-3 h-3" />{u.streak}
                    </span>
                    <span className="text-xs text-gray-600">{u.level}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white font-bold text-sm">{u.xp.toLocaleString()}</p>
                  <p className="text-xs text-gray-600">XP</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to earn XP */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(20,12,40,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Cach kiem XP</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { action: "Hoan thanh bai hoc", xp: "+20 XP" },
              { action: "Chat voi AI", xp: "+5 XP" },
              { action: "Streak hang ngay", xp: "+10 XP" },
              { action: "Hoan thanh quiz", xp: "+15 XP" },
            ].map(({ action, xp }) => (
              <div key={action} className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: "rgba(139,92,246,0.08)" }}>
                <span className="text-xs text-gray-400">{action}</span>
                <span className="text-xs font-bold text-yellow-400">{xp}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
