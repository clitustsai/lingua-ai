"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { Flame, BookOpen, MessageCircle, Clock, Trophy, ChevronRight, Star, Target } from "lucide-react";
import { ACHIEVEMENTS } from "@ai-lang/shared";
import { cn } from "@/lib/utils";

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-4 flex flex-col gap-1">
      <span className="text-xs text-gray-500">{label}</span>
      <span className={cn("text-3xl font-bold", color)}>{value}</span>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

export default function DashboardPage() {
  const { streak, stats, flashcards, totalMessages, settings, weeklyHistory, achievements, checkAchievements, lessonsCompleted, grammarChecks } = useAppStore();
  const router = useRouter();
  const goal = settings.dailyGoal ?? 5;
  const goalPct = Math.min((stats.wordsLearned / goal) * 100, 100);

  useEffect(() => { checkAchievements(); }, []);

  const last7 = weeklyHistory.slice(0, 7);
  const maxWords = Math.max(...last7.map(w => w.wordsLearned), 1);

  const unlockedIds = new Set(achievements.map(a => a.id));
  const recentAchievements = achievements.slice(-3).reverse();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {settings.targetLanguage.flag} {settings.targetLanguage.name} · Level {settings.level}
        </p>
      </div>

      {/* Daily goal banner */}
      <div className="bg-gradient-to-r from-primary-900/60 to-accent-900/40 border border-primary-700/40 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            <span className="font-semibold text-white">Daily Goal</span>
          </div>
          <span className="text-sm text-primary-300">{stats.wordsLearned}/{goal} words</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%` }} />
        </div>
        {goalPct >= 100 && <p className="text-xs text-green-400 mt-2">🎉 Goal reached today!</p>}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Day Streak 🔥" value={streak} sub="days in a row" color="text-orange-400" />
        <StatCard label="Words Today" value={stats.wordsLearned} sub={`goal: ${goal}`} color="text-primary-400" />
        <StatCard label="Total Flashcards" value={flashcards.length} sub="saved words" color="text-accent-400" />
        <StatCard label="Messages Sent" value={totalMessages} sub="all time" color="text-green-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Weekly chart */}
        <div className="bg-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Words Learned (Weekly)</h2>
          {last7.length === 0 ? (
            <div className="flex items-end justify-center h-24 text-gray-600 text-sm">No data yet</div>
          ) : (
            <div className="flex items-end gap-2 h-24">
              {last7.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary-600/30 rounded-t-sm transition-all"
                    style={{ height: `${(w.wordsLearned / maxWords) * 80}px`, minHeight: 4 }} />
                  <span className="text-xs text-gray-600">{w.date.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activity summary */}
        <div className="bg-gray-800 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-gray-300 mb-4">Activity Summary</h2>
          <div className="flex flex-col gap-3">
            {[
              { icon: MessageCircle, label: "Conversations", value: stats.messagesCount, sub: "today", color: "text-blue-400" },
              { icon: BookOpen, label: "Lessons Done", value: lessonsCompleted, sub: "total", color: "text-yellow-400" },
              { icon: Star, label: "Grammar Checks", value: grammarChecks, sub: "total", color: "text-green-400" },
              { icon: Clock, label: "Practice Time", value: `${stats.minutesPracticed ?? 0}m`, sub: "today", color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, sub, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-4 h-4", color)} />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
                <div className="text-right">
                  <span className={cn("text-sm font-semibold", color)}>{value}</span>
                  <span className="text-xs text-gray-600 ml-1">{sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-gray-800 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" /> Achievements ({achievements.length}/{ACHIEVEMENTS.length})
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div key={a.id} className={cn(
                "flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all",
                unlocked ? "border-yellow-600/40 bg-yellow-900/20" : "border-gray-700 bg-gray-900 opacity-40"
              )}>
                <span className="text-2xl">{a.emoji}</span>
                <span className="text-xs font-medium text-white leading-tight">{a.title}</span>
                <span className="text-xs text-gray-500 leading-tight">{a.description}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Start Chat", emoji: "💬", href: "/" },
          { label: "Flashcards", emoji: "📚", href: "/flashcards" },
          { label: "New Lesson", emoji: "🎓", href: "/lessons" },
          { label: "Grammar Check", emoji: "✅", href: "/grammar" },
        ].map(({ label, emoji, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl px-4 py-3 transition-colors">
            <div className="flex items-center gap-2">
              <span>{emoji}</span>
              <span className="text-sm text-gray-200">{label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        ))}
      </div>
    </div>
  );
}
