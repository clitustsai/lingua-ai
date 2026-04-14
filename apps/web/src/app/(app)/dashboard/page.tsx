"use client";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import {
  Flame, BookOpen, MessageCircle, Clock, Trophy,
  ChevronRight, Star, Target, Languages, TrendingUp,
  Zap, Brain, CheckSquare,
} from "lucide-react";
import { ACHIEVEMENTS, SUPPORTED_LANGUAGES } from "@ai-lang/shared";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────
function motivationMessage(streak: number, wordsToday: number, goal: number, langName: string) {
  if (streak >= 7) return `🔥 ${streak} ngày liên tiếp! Bạn đang học ${langName} cực kỳ tốt!`;
  if (streak >= 3) return `⚡ Bạn đang học tốt ${langName} – giữ vững nhé!`;
  if (wordsToday >= goal) return `🎯 Đã đạt mục tiêu hôm nay! Bạn thật xuất sắc 👏`;
  if (wordsToday > 0) return `📈 Tiếp tục học ${langName} – bạn đang tiến bộ rõ rệt 👍`;
  return `👋 Chào mừng trở lại! Hãy bắt đầu học ${langName} ngay hôm nay.`;
}

function topLanguage(usage: Record<string, number>) {
  const entries = Object.entries(usage);
  if (!entries.length) return null;
  const [code] = entries.sort((a, b) => b[1] - a[1])[0];
  return SUPPORTED_LANGUAGES.find(l => l.code === code) ?? null;
}

// ── sub-components ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: string | number; sub?: string; color: string; bg: string;
}) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bg)}>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <div>
        <p className={cn("text-2xl font-bold", color)}>{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-gray-600">{sub}</p>}
      </div>
    </div>
  );
}

function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-8 text-right">{value}</span>
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const {
    streak, stats, flashcards, totalMessages, settings,
    weeklyHistory, achievements, checkAchievements,
    lessonsCompleted, grammarChecks, translationCount,
    languageUsage, totalXp, courseProgress,
  } = useAppStore();
  const router = useRouter();

  const goal = settings.dailyGoal ?? 5;
  const goalPct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const topLang = topLanguage(languageUsage);
  const motivation = motivationMessage(streak, stats.wordsLearned, goal, settings.targetLanguage.name);

  useEffect(() => { checkAchievements(); }, []);

  // weekly chart
  const last7 = weeklyHistory.slice(0, 7).reverse();
  const maxWords = Math.max(...last7.map(w => w.wordsLearned), 1);

  const unlockedIds = new Set(achievements.map(a => a.id));
  const enrolledCount = courseProgress.length;

  return (
    <div className="p-5 max-w-2xl space-y-5">
      {/* Greeting + motivation */}
      <div className="pt-4">
        <h1 className="text-2xl font-bold text-white">Tiến độ của bạn</h1>
        <div className="mt-3 rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
          <span className="text-2xl">🧠</span>
          <p className="text-sm text-purple-100 font-medium">{motivation}</p>
        </div>
      </div>

      {/* Daily goal */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-semibold text-white">Mục tiêu hôm nay</span>
          </div>
          <span className="text-sm text-primary-300 font-bold">{stats.wordsLearned}/{goal} từ</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="h-3 rounded-full transition-all duration-500"
            style={{ width: `${goalPct}%`, background: "linear-gradient(90deg,#7c3aed,#6366f1)" }} />
        </div>
        {goalPct >= 100 && <p className="text-xs text-green-400 mt-2">🎉 Đã hoàn thành mục tiêu hôm nay!</p>}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Flame} label="Chuỗi ngày học" value={`${streak} ngày`} sub="liên tiếp 🔥" color="text-orange-400" bg="bg-orange-500/20" />
        <StatCard icon={Star} label="Tổng XP" value={totalXp} sub="điểm kinh nghiệm" color="text-yellow-400" bg="bg-yellow-500/20" />
        <StatCard icon={BookOpen} label="Flashcards" value={flashcards.length} sub="từ đã lưu" color="text-purple-400" bg="bg-purple-500/20" />
        <StatCard icon={MessageCircle} label="Tin nhắn" value={totalMessages} sub="tổng cộng" color="text-blue-400" bg="bg-blue-500/20" />
        <StatCard icon={Languages} label="Số lần dịch" value={translationCount} sub="đã dịch" color="text-green-400" bg="bg-green-500/20" />
        <StatCard icon={Brain} label="Khóa học" value={enrolledCount} sub="đang học" color="text-pink-400" bg="bg-pink-500/20" />
      </div>

      {/* Top language + activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Ngôn ngữ hay dùng */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Ngôn ngữ hay dùng</p>
          {Object.keys(languageUsage).length === 0 ? (
            <p className="text-gray-600 text-sm">Chưa có dữ liệu</p>
          ) : (
            <div className="flex flex-col gap-2">
              {SUPPORTED_LANGUAGES
                .filter(l => languageUsage[l.code])
                .sort((a, b) => (languageUsage[b.code] ?? 0) - (languageUsage[a.code] ?? 0))
                .slice(0, 4)
                .map(lang => (
                  <MiniBar
                    key={lang.code}
                    label={`${lang.flag} ${lang.name}`}
                    value={languageUsage[lang.code] ?? 0}
                    max={Math.max(...Object.values(languageUsage))}
                    color={lang.code === settings.targetLanguage.code ? "bg-primary-500" : "bg-gray-600"}
                  />
                ))}
            </div>
          )}
          {topLang && (
            <p className="text-xs text-primary-400 mt-3">
              ⭐ Hay dùng nhất: {topLang.flag} {topLang.name}
            </p>
          )}
        </div>

        {/* Activity summary */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Hoạt động hôm nay</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: MessageCircle, label: "Hội thoại", value: stats.messagesCount, color: "text-blue-400" },
              { icon: CheckSquare, label: "Kiểm tra ngữ pháp", value: grammarChecks, color: "text-green-400" },
              { icon: BookOpen, label: "Bài học hoàn thành", value: lessonsCompleted, color: "text-yellow-400" },
              { icon: Clock, label: "Thời gian luyện tập", value: `${stats.minutesPracticed ?? 0}p`, color: "text-purple-400" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-3.5 h-3.5", color)} />
                  <span className="text-xs text-gray-400">{label}</span>
                </div>
                <span className={cn("text-sm font-bold", color)}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          <p className="text-sm font-semibold text-white">Từ học được theo tuần</p>
        </div>
        {last7.length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-6">Chưa có dữ liệu. Hãy bắt đầu học!</p>
        ) : (
          <div className="flex items-end gap-2 h-28">
            {last7.map((w, i) => {
              const h = Math.max((w.wordsLearned / maxWords) * 96, 4);
              const isToday = i === last7.length - 1;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  {w.wordsLearned > 0 && (
                    <span className="text-xs text-gray-500">{w.wordsLearned}</span>
                  )}
                  <div className="w-full rounded-t-lg transition-all"
                    style={{
                      height: h,
                      background: isToday
                        ? "linear-gradient(180deg,#7c3aed,#6366f1)"
                        : "rgba(139,92,246,0.3)",
                    }} />
                  <span className="text-xs text-gray-600">{w.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <p className="text-sm font-semibold text-white">Thành tích</p>
          </div>
          <span className="text-xs text-gray-500">{achievements.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div key={a.id} title={`${a.title}: ${a.description}`}
                className={cn("flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all",
                  unlocked ? "border-yellow-600/40 bg-yellow-900/20" : "border-gray-800 bg-gray-900/50 opacity-35")}>
                <span className="text-xl">{a.emoji}</span>
                <span className="text-xs text-gray-400 leading-tight hidden sm:block">{a.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Bắt đầu nhanh</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Trò chuyện AI", emoji: "💬", href: "/" },
            { label: "Khóa học", emoji: "🎓", href: "/courses" },
            { label: "Ôn flashcard", emoji: "🔁", href: "/review" },
            { label: "Dịch thuật", emoji: "🌐", href: "/translate" },
          ].map(({ label, emoji, href }) => (
            <button key={href} onClick={() => router.push(href)}
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-colors hover:opacity-80"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-2">
                <span>{emoji}</span>
                <span className="text-sm text-gray-200">{label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
