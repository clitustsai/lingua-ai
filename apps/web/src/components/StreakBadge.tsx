"use client";
import { Flame } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

export default function StreakBadge() {
  const { streak, stats, settings } = useAppStore();
  const goal = settings.dailyGoal ?? 5;
  const progress = Math.min(stats.wordsLearned / goal, 1);
  const pct = Math.round(progress * 100);

  return (
    <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-3 py-2">
      <div className="flex items-center gap-1 text-orange-400">
        <Flame className="w-4 h-4" />
        <span className="text-sm font-bold">{streak}</span>
      </div>
      <div className="flex flex-col gap-1 min-w-[80px]">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Daily goal</span>
          <span>{stats.wordsLearned}/{goal}</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-1">
          <div
            className="bg-primary-500 h-1 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
