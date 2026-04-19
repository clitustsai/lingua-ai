"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
  Flame, BookOpen, MessageCircle, Trophy,
  ChevronRight, Star, Target, TrendingUp,
  Zap, Brain, Sparkles, Crown, GraduationCap,
  Headphones, Mic2, Languages, Video,
} from "lucide-react";
import { ACHIEVEMENTS } from "@ai-lang/shared";
import { cn } from "@/lib/utils";
import AdBanner from "@/components/AdBanner";

function motivationMessage(streak: number, wordsToday: number, goal: number, langName: string) {
  if (streak >= 7) return `🔥 ${streak} ngày liên tiếp! Bạn đang chinh phục ${langName}!`;
  if (streak >= 3) return `⚡ ${streak} ngày streak! Tiếp tục học ${langName} nhé!`;
  if (wordsToday >= goal) return `🎯 Đã đạt mục tiêu hôm nay! Xuất sắc 👏`;
  if (wordsToday > 0) return `📈 Đang tiến bộ! Tiếp tục học ${langName} nào!`;
  return `✨ Chào mừng trở lại! Học ${langName} ngay hôm nay.`;
}

export default function DashboardPage() {
  const { tutorMemory, skillScore } = useAppStore();
  const {
    streak, stats, flashcards, totalMessages, settings,
    weeklyHistory, achievements, checkAchievements,
    lessonsCompleted, translationCount, totalXp, courseProgress,
  } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();

  const goal = settings.dailyGoal ?? 5;
  const goalPct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const motivation = motivationMessage(streak, stats.wordsLearned, goal, settings.targetLanguage.name);
  const enrolledCount = courseProgress.length;
  const unlockedIds = new Set(achievements.map(a => a.id));

  useEffect(() => { checkAchievements(); }, []);

  const last7 = weeklyHistory.slice(0, 7).reverse();
  const maxWords = Math.max(...last7.map(w => w.wordsLearned), 1);

  const QUICK_ACTIONS = [
    { label: "AI Chat", emoji: "💬", href: "/", color: "#7c3aed", bg: "rgba(124,58,237,0.15)" },
    { label: "AI Tutor", emoji: "🎓", href: "/tutor", color: "#f59e0b", bg: "rgba(245,158,11,0.15)" },
    { label: "Video Lessons", emoji: "🎬", href: "/videos", color: "#ef4444", bg: "rgba(239,68,68,0.15)" },
    { label: "Flashcards", emoji: "🔁", href: "/review", color: "#10b981", bg: "rgba(16,185,129,0.15)" },
    { label: "Phát âm", emoji: "🎤", href: "/pronunciation", color: "#ec4899", bg: "rgba(236,72,153,0.15)" },
    { label: "Dịch thuật", emoji: "🌐", href: "/translate", color: "#3b82f6", bg: "rgba(59,130,246,0.15)" },
  ];

  return (
    <div className="max-w-2xl" style={{ background: "#0a0614", minHeight: "100vh" }}>
      {/* ── HERO HEADER ── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-6"
        style={{ background: "linear-gradient(135deg,#1a0533 0%,#0f0a1e 60%,#0a0614 100%)" }}>
        {/* Glow orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#7c3aed,transparent)" }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: "radial-gradient(circle,#6366f1,transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">Xin chào 👋</p>
              <h1 className="text-2xl font-black text-white mt-0.5">
                {user?.name?.split(" ").slice(-1)[0] || "Bạn"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {user?.isPremium && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.3),rgba(249,115,22,0.2))", border: "1px solid rgba(245,158,11,0.4)" }}>
                  <Crown className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-xs font-bold text-yellow-300">Premium</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-bold text-white">{totalXp} XP</span>
              </div>
            </div>
          </div>

          {/* Motivation banner */}
          <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <div className="w-8 h-8 rounded-xl bg-primary-600/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-primary-400" />
            </div>
            <p className="text-sm text-purple-100 font-medium leading-snug">{motivation}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pb-8 space-y-5">
        {/* ── DAILY GOAL ── */}
        <div className="rounded-2xl p-4 -mt-2"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-semibold text-white">Mục tiêu hôm nay</span>
            </div>
            <span className="text-sm font-bold"
              style={{ color: goalPct >= 100 ? "#10b981" : "#a78bfa" }}>
              {stats.wordsLearned}/{goal} từ
            </span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${goalPct}%`, background: goalPct >= 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#7c3aed,#a78bfa)" }} />
          </div>
          {goalPct >= 100 && <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Hoàn thành mục tiêu hôm nay!</p>}
        </div>

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Flame, value: streak, label: "Streak", unit: "ngày", color: "#f97316", glow: "rgba(249,115,22,0.3)" },
            { icon: BookOpen, value: flashcards.length, label: "Flashcards", unit: "từ", color: "#a78bfa", glow: "rgba(167,139,250,0.3)" },
            { icon: Trophy, value: achievements.length, label: "Thành tích", unit: `/${ACHIEVEMENTS.length}`, color: "#fbbf24", glow: "rgba(251,191,36,0.3)" },
          ].map(({ icon: Icon, value, label, unit, color, glow }) => (
            <div key={label} className="rounded-2xl p-4 flex flex-col items-center gap-1 text-center"
              style={{ background: "rgba(20,12,40,0.95)", border: `1px solid ${color}30`, boxShadow: `0 4px 20px ${glow}` }}>
              <Icon className="w-5 h-5 mb-1" style={{ color }} />
              <p className="text-2xl font-black text-white">{value}<span className="text-sm font-normal text-gray-500 ml-0.5">{unit}</span></p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest mb-3">Học ngay</p>
          <div className="grid grid-cols-3 gap-2.5">
            {QUICK_ACTIONS.map(({ label, emoji, href, color, bg }) => (
              <button key={href} onClick={() => router.push(href)}
                className="flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
                style={{ background: bg, border: `1px solid ${color}30` }}>
                <span className="text-2xl">{emoji}</span>
                <span className="text-xs font-semibold text-gray-200 leading-tight text-center">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── WEEKLY CHART ── */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <p className="text-sm font-semibold text-white">Hoạt động 7 ngày</p>
          </div>
          {last7.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-6">Chưa có dữ liệu. Hãy bắt đầu học!</p>
          ) : (
            <div className="flex items-end gap-1.5 h-24">
              {last7.map((w, i) => {
                const h = Math.max((w.wordsLearned / maxWords) * 88, 4);
                const isToday = i === last7.length - 1;
                const days = ["CN","T2","T3","T4","T5","T6","T7"];
                const d = new Date(w.date);
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {w.wordsLearned > 0 && (
                      <span className="text-xs text-gray-600">{w.wordsLearned}</span>
                    )}
                    <div className="w-full rounded-t-lg transition-all"
                      style={{
                        height: h,
                        background: isToday
                          ? "linear-gradient(180deg,#a78bfa,#7c3aed)"
                          : w.wordsLearned > 0 ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.04)",
                        boxShadow: isToday ? "0 0 12px rgba(167,139,250,0.5)" : "none",
                      }} />
                    <span className="text-xs text-gray-600">{days[d.getDay()]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── ACHIEVEMENTS ── */}
        <div className="rounded-2xl p-4"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <p className="text-sm font-semibold text-white">Thành tích</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
              {achievements.length}/{ACHIEVEMENTS.length}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedIds.has(a.id);
              return (
                <div key={a.id} title={`${a.title}: ${a.description}`}
                  className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all",
                    unlocked
                      ? "border-yellow-600/40 bg-yellow-900/20 shadow-lg shadow-yellow-900/20"
                      : "border-white/5 bg-white/2 opacity-25")}>
                  <span className="text-xl">{a.emoji}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI GỢI Ý HÔM NAY ── */}
        {tutorMemory.weakAreas?.length > 0 && (
          <div className="rounded-2xl p-4"
            style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <p className="text-sm font-semibold text-white">AI gợi ý học hôm nay</p>
            </div>
            <div className="flex flex-col gap-2">
              {tutorMemory.weakAreas.slice(0, 2).map((area, i) => {
                const map: Record<string, { href: string; emoji: string; label: string }> = {
                  grammar: { href: "/grammar", emoji: "📐", label: "Luyện Grammar" },
                  vocabulary: { href: "/flashcards", emoji: "📚", label: "Ôn từ vựng" },
                  speaking: { href: "/pronunciation", emoji: "🎤", label: "Luyện phát âm" },
                  listening: { href: "/listening", emoji: "🎧", label: "Luyện nghe" },
                  fluency: { href: "/tutor", emoji: "💬", label: "Chat AI Tutor" },
                };
                const key = Object.keys(map).find(k => area.toLowerCase().includes(k)) ?? "fluency";
                const item = map[key];
                return (
                  <button key={i} onClick={() => router.push(item.href)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all hover:bg-white/5"
                    style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                    <span className="text-xl">{item.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{item.label}</p>
                      <p className="text-gray-500 text-xs">Điểm yếu: {area}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PREMIUM BANNER (nếu chưa premium) ── */}
        {!user?.isPremium && (
          <button onClick={() => router.push("/premium")}
            className="w-full rounded-2xl p-4 flex items-center gap-4 transition-all hover:opacity-90 active:scale-[0.99]"
            style={{ background: "linear-gradient(135deg,#92400e,#78350f)", border: "1px solid rgba(245,158,11,0.4)", boxShadow: "0 8px 32px rgba(245,158,11,0.2)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(245,158,11,0.3)" }}>
              <Crown className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold text-sm">Nâng cấp Premium</p>
              <p className="text-yellow-200/70 text-xs mt-0.5">Mở khóa tất cả tính năng · Học không giới hạn</p>
            </div>
            <ChevronRight className="w-5 h-5 text-yellow-400 shrink-0" />
          </button>
        )}

        {/* ── AD BANNER (chỉ hiện cho free users, giữa các section) ── */}
        <AdBanner slot="REPLACE_WITH_YOUR_SLOT_ID" format="horizontal" className="my-2" />
      </div>
    </div>
  );
}
