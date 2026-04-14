"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, BookOpen, Settings, Brain, Flame, GraduationCap, CheckSquare, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const nav = [
  { href: "/", icon: MessageCircle, label: "Chat" },
  { href: "/flashcards", icon: BookOpen, label: "Flashcards" },
  { href: "/lessons", icon: GraduationCap, label: "Lessons" },
  { href: "/grammar", icon: CheckSquare, label: "Grammar" },
  { href: "/history", icon: History, label: "History" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { streak, stats, settings } = useAppStore();
  const goal = settings.dailyGoal ?? 5;
  const pct = Math.min((stats.wordsLearned / goal) * 100, 100);

  return (
    <aside className="w-16 md:w-56 h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-2 md:px-4 fixed left-0 top-0 z-10 overflow-y-auto">
      <div className="flex items-center gap-2 mb-8 px-2">
        <Brain className="text-primary-500 w-7 h-7 shrink-0" />
        <span className="hidden md:block font-bold text-lg text-white">LinguaAI</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {nav.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors",
              pathname === href
                ? "bg-primary-600 text-white"
                : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="hidden md:block text-sm font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* Streak & daily goal */}
      <div className="hidden md:flex flex-col gap-2 mt-4 px-2">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold text-sm">{streak} day streak</span>
          </div>
          <span>{stats.wordsLearned}/{goal} words</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Mobile streak icon */}
      <div className="flex md:hidden justify-center mt-4">
        <div className="flex items-center gap-0.5 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold">{streak}</span>
        </div>
      </div>
    </aside>
  );
}
