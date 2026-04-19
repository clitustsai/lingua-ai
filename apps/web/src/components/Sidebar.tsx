"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle, BookOpen, Settings, Brain, Flame,
  GraduationCap, CheckSquare, History, LayoutDashboard,
  Languages, BookMarked, Headphones, Mic2, RotateCcw,
  Compass, Youtube, Sparkles, Camera, TrendingUp, Bookmark, Share2, Phone, Users, Wand2, Globe, Target, Video, DollarSign, Banknote, Heart, Crown, Gamepad2, Star, PenLine, Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const { streak, stats, settings, flashcards } = useAppStore();
  const { user, logout, uiLang } = useAuthStore();
  const tr = useT(uiLang ?? "vi");

  const nav = [
    { href: "/dashboard",     icon: LayoutDashboard, label: tr.dashboard },
    { href: "/",              icon: MessageCircle,   label: tr.chat },
    { href: "/call",          icon: Phone,           label: tr.voiceCall },
    { href: "/tutor",         icon: Sparkles,        label: tr.aiTutor },
    { href: "/homework",      icon: GraduationCap,   label: tr.aiTeacher },
    { href: "/solve",         icon: Sparkles,        label: tr.solveExercise },
    { href: "/videos",        icon: Youtube,         label: tr.videoLessons },
    { href: "/partners",      icon: Users,           label: tr.partners },
    { href: "/community",     icon: Globe,           label: tr.community },
    { href: "/streak",        icon: Flame,           label: tr.streak },
    { href: "/placement",     icon: Target,          label: tr.placement },
    { href: "/rewrite",       icon: Wand2,           label: tr.rewrite },
    { href: "/brain",         icon: Brain,           label: tr.brainMode },
    { href: "/camera",        icon: Camera,          label: tr.cameraAI },
    { href: "/dub",           icon: Video,           label: tr.aiDub },
    { href: "/courses",       icon: Compass,         label: tr.courses },
    { href: "/learning-path", icon: BookMarked,      label: tr.learningPath },
    { href: "/skills",        icon: TrendingUp,      label: tr.skills },
    { href: "/leaderboard",   icon: Trophy,          label: tr.leaderboard },
    { href: "/video",         icon: Youtube,         label: tr.videoSub },
    { href: "/ocr",           icon: Camera,          label: tr.ocr },
    { href: "/flashcards",    icon: BookOpen,        label: tr.flashcards },
    { href: "/study-sets",    icon: BookOpen,        label: tr.studySets },
    { href: "/review",        icon: RotateCcw,       label: tr.review },
    { href: "/saved",         icon: Bookmark,        label: tr.saved },
    { href: "/lessons",       icon: GraduationCap,   label: tr.lessons },
    { href: "/reading",       icon: BookMarked,      label: tr.reading },
    { href: "/listening",     icon: Headphones,      label: tr.listening },
    { href: "/pronunciation", icon: Mic2,            label: tr.pronunciation },
    { href: "/writing",       icon: PenLine,         label: tr.writing },
    { href: "/grammar",       icon: CheckSquare,     label: tr.grammar },
    { href: "/translate",     icon: Languages,       label: tr.translate },
    { href: "/share",         icon: Share2,          label: tr.share },
    { href: "/affiliate",     icon: DollarSign,      label: tr.affiliate },
    { href: "/money",         icon: Banknote,        label: tr.moneyAI },
    { href: "/donate",        icon: Heart,           label: tr.donate },
    { href: "/premium",       icon: Crown,           label: tr.premium },
    { href: "/minigame",      icon: Gamepad2,        label: tr.miniGames },
    { href: "/reviews",       icon: Star,            label: tr.reviews },
    { href: "/history",       icon: History,         label: tr.history },
    { href: "/settings",      icon: Settings,        label: tr.settings },
  ];
  const goal = settings.dailyGoal ?? 5;
  const pct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const today = new Date().toISOString().slice(0, 10);
  const dueCount = flashcards.filter(f => !f.nextReview || f.nextReview <= today).length;

  return (
    <aside className="w-16 md:w-56 h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-4 px-2 md:px-3 fixed left-0 top-0 z-10 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6 px-2">
        <Brain className="text-primary-500 w-7 h-7 shrink-0" />
        <span className="hidden md:block font-bold text-lg text-white">LinguaAI</span>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          const badge = href === "/review" && dueCount > 0 ? dueCount : null;
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2 rounded-lg transition-colors relative",
                isActive ? "bg-primary-600 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              )}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden md:block text-sm font-medium">{label}</span>
              {badge && (
                <span className="hidden md:flex ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 items-center justify-center font-bold">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Streak & daily goal */}
      <div className="hidden md:flex flex-col gap-2 mt-4 px-2 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-orange-400">
            <Flame className="w-3.5 h-3.5" />
            <span className="font-bold">{streak}d streak</span>
          </div>
          <span className="text-gray-500">{stats.wordsLearned}/{goal}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="flex md:hidden justify-center pb-2">
        <div className="flex items-center gap-0.5 text-orange-400">
          <Flame className="w-4 h-4" />
          <span className="text-xs font-bold">{streak}</span>
        </div>
      </div>

      {/* Mobile: avatar only */}
      <div className="flex md:hidden flex-col items-center pb-2 gap-2">
        {user && (
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-600/30 flex items-center justify-center" title={user.name}>
            {user.avatar?.startsWith("http")
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-xl">{user.avatar}</span>
            }
          </div>
        )}
      </div>
    </aside>
  );
}
