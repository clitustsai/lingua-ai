"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  MessageCircle, BookOpen, Settings, Brain, Flame,
  GraduationCap, CheckSquare, History, LayoutDashboard,
  Languages, BookMarked, Headphones, Mic2, RotateCcw,
  Compass, Youtube, Sparkles, Camera, TrendingUp, Bookmark, Share2, Phone, Users, Wand2, Globe, Target, Video, Sun, Moon, LogOut, DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";

const nav = [
  { href: "/dashboard",     icon: LayoutDashboard, label: "Dashboard" },
  { href: "/",              icon: MessageCircle,   label: "Chat" },
  { href: "/call",          icon: Phone,           label: "Voice Call" },
  { href: "/tutor",         icon: Sparkles,        label: "AI Tutor" },
  { href: "/homework",      icon: GraduationCap,   label: "AI Teacher" },
  { href: "/videos",        icon: Youtube,         label: "Video Lessons" },
  { href: "/partners",      icon: Users,           label: "Partners" },
  { href: "/community",     icon: Globe,           label: "Community" },
  { href: "/streak",        icon: Flame,           label: "Streak" },
  { href: "/placement",     icon: Target,          label: "Test trình độ" },
  { href: "/rewrite",       icon: Wand2,           label: "AI Rewrite" },
  { href: "/brain",         icon: Brain,           label: "Brain Mode" },
  { href: "/camera",        icon: Camera,          label: "Camera AI" },
  { href: "/dub",           icon: Video,           label: "AI Dub" },
  { href: "/courses",       icon: Compass,         label: "Khóa học" },
  { href: "/learning-path", icon: BookMarked,      label: "Lộ trình AI" },
  { href: "/skills",        icon: TrendingUp,      label: "Kỹ năng" },
  { href: "/video",         icon: Youtube,         label: "Video Sub" },
  { href: "/ocr",           icon: Camera,          label: "Quét ảnh" },
  { href: "/flashcards",    icon: BookOpen,        label: "Flashcards" },
  { href: "/review",        icon: RotateCcw,       label: "Review" },
  { href: "/saved",         icon: Bookmark,        label: "Câu hay" },
  { href: "/lessons",       icon: GraduationCap,   label: "Lessons" },
  { href: "/reading",       icon: BookMarked,      label: "Reading" },
  { href: "/listening",     icon: Headphones,      label: "Listening" },
  { href: "/pronunciation", icon: Mic2,            label: "Pronunciation" },
  { href: "/grammar",       icon: CheckSquare,     label: "Grammar" },
  { href: "/translate",     icon: Languages,       label: "Translate" },
  { href: "/share",         icon: Share2,          label: "Chia sẻ" },
  { href: "/affiliate",     icon: DollarSign,      label: "Affiliate" },
  { href: "/history",       icon: History,         label: "History" },
  { href: "/settings",      icon: Settings,        label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { streak, stats, settings, flashcards } = useAppStore();
  const { user, theme, setTheme, logout } = useAuthStore();
  const goal = settings.dailyGoal ?? 5;
  const pct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const today = new Date().toISOString().slice(0, 10);
  const dueCount = flashcards.filter(f => !f.nextReview || f.nextReview <= today).length;

  const handleLogout = () => { logout(); router.push("/auth"); };

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

      {/* Theme toggle + User */}
      <div className="hidden md:flex flex-col gap-2 mt-3 px-2 pb-2 border-t border-white/5 pt-3">
        {/* Theme toggle */}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-2 px-2 py-2 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-colors w-full">
          {theme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
          <span className="text-sm">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
        </button>
        {/* User info */}
        {user && (
          <div className="flex items-center gap-2 px-2 py-2 rounded-lg" style={{ background: "rgba(139,92,246,0.1)" }}>
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-primary-600/30 flex items-center justify-center shrink-0">
              {user.avatar?.startsWith("http")
                ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                : <span className="text-xl">{user.avatar}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-gray-500 text-xs truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors shrink-0" title="Đăng xuất">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Mobile: avatar + theme + logout */}
      <div className="flex md:hidden flex-col items-center pb-2 gap-2">
        {user && (
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-600/30 flex items-center justify-center" title={user.name}>
            {user.avatar?.startsWith("http")
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-xl">{user.avatar}</span>
            }
          </div>
        )}
        <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button onClick={handleLogout} className="p-2 rounded-lg text-gray-500 hover:text-red-400 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
