"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MessageCircle, BookOpen, Settings, Brain, Flame,
  GraduationCap, CheckSquare, History, LayoutDashboard,
  Languages, BookMarked, Headphones, Mic2, RotateCcw,
  Compass, Youtube, Sparkles, Camera, TrendingUp, Bookmark, Share2, Phone, Users, Wand2, Globe, Target, Video, DollarSign, Banknote, Heart, Crown, Gamepad2, Star, PenLine, Trophy, Award, Zap, ChevronRight, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useT } from "@/lib/i18n";

// Nav groups
const NAV_GROUPS = (tr: any) => [
  {
    label: "Chính",
    items: [
      { href: "/dashboard",     icon: LayoutDashboard, label: tr.dashboard },
      { href: "/",              icon: MessageCircle,   label: tr.chat },
      { href: "/call",          icon: Phone,           label: tr.voiceCall },
      { href: "/tutor",         icon: Sparkles,        label: tr.aiTutor },
      { href: "/homework",      icon: GraduationCap,   label: tr.aiTeacher },
      { href: "/generate-lesson", icon: Brain,         label: "Tạo bài học AI" },
      { href: "/solve",         icon: Sparkles,        label: tr.solveExercise },
    ],
  },
  {
    label: "Luyện tập",
    items: [
      { href: "/flashcards",    icon: BookOpen,        label: tr.flashcards },
      { href: "/review",        icon: RotateCcw,       label: tr.review, badge: true },
      { href: "/pronunciation", icon: Mic2,            label: tr.pronunciation },
      { href: "/listening",     icon: Headphones,      label: tr.listening },
      { href: "/reading",       icon: BookMarked,      label: tr.reading },
      { href: "/writing",       icon: PenLine,         label: tr.writing },
      { href: "/grammar",       icon: CheckSquare,     label: tr.grammar },
      { href: "/translate",     icon: Languages,       label: tr.translate },
    ],
  },
  {
    label: "Nội dung",
    items: [
      { href: "/videos",        icon: Youtube,         label: tr.videoLessons },
      { href: "/courses",       icon: Compass,         label: tr.courses },
      { href: "/lessons",       icon: GraduationCap,   label: tr.lessons },
      { href: "/learning-path", icon: BookMarked,      label: tr.learningPath },
      { href: "/video",         icon: Youtube,         label: tr.videoSub },
    ],
  },
  {
    label: "Công cụ AI",
    items: [
      { href: "/brain",         icon: Brain,           label: tr.brainMode },
      { href: "/camera",        icon: Camera,          label: "Camera & OCR" },
      { href: "/rewrite",       icon: Wand2,           label: tr.rewrite },
      { href: "/dub",           icon: Video,           label: tr.aiDub },
    ],
  },
  {
    label: "Cộng đồng",
    items: [
      { href: "/leaderboard",   icon: Trophy,          label: tr.leaderboard },
      { href: "/streak",        icon: Flame,           label: tr.streak },
      { href: "/skills",        icon: TrendingUp,      label: tr.skills },
      { href: "/exam",          icon: Trophy,          label: "Thi chứng chỉ" },
      { href: "/partners",      icon: Users,           label: tr.partners },
      { href: "/community",     icon: Globe,           label: tr.community },
      { href: "/certificate",   icon: Award,           label: "Chứng chỉ" },
    ],
  },
  {
    label: "Khác",
    items: [
      { href: "/saved",         icon: Bookmark,        label: tr.saved },
      { href: "/notebook",      icon: BookOpen,        label: "Notebook" },
      { href: "/study-sets",    icon: BookOpen,        label: tr.studySets },
      { href: "/share",         icon: Share2,          label: tr.share },
      { href: "/affiliate",     icon: DollarSign,      label: tr.affiliate },
      { href: "/money",         icon: Banknote,        label: tr.moneyAI },
      { href: "/donate",        icon: Heart,           label: tr.donate },
      { href: "/premium",       icon: Crown,           label: tr.premium },
      { href: "/minigame",      icon: Gamepad2,        label: tr.miniGames },
      { href: "/reviews",       icon: Star,            label: tr.reviews },
      { href: "/history",       icon: History,         label: tr.history },
      { href: "/settings",      icon: Settings,        label: tr.settings },
    ],
  },
];

function BellDropdown() {
  const [open, setOpen] = useState(false);
  const { streak, stats, settings } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);
  const studiedToday = stats.date === today && stats.messagesCount > 0;

  const notifications = [
    !studiedToday && { id: "study", icon: "📚", text: `Hôm nay chưa học! Chỉ cần 5 phút thôi.`, time: "Hôm nay" },
    streak >= 3 && { id: "streak", icon: "🔥", text: `${streak} ngày streak! Tiếp tục duy trì nhé.`, time: "Streak" },
    { id: "tip", icon: "💡", text: `Mẹo: Học ${settings.targetLanguage.name} 15 phút/ngày hiệu quả hơn 2 tiếng/tuần.`, time: "Mẹo học" },
  ].filter(Boolean) as { id: string; icon: string; text: string; time: string }[];

  return (
    <div className="ml-auto hidden md:block relative">
      <button onClick={() => setOpen(o => !o)}
        className="flex items-center justify-center w-7 h-7 rounded-lg relative hover:bg-white/10 transition-colors">
        <Bell className="w-3.5 h-3.5 text-white/40" />
        {!studiedToday && <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-purple-400" />}
      </button>
      {open && (
        <div className="absolute top-9 right-0 w-72 rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ background: "rgba(15,8,30,0.98)", border: "1px solid rgba(139,92,246,0.25)" }}>
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-white text-xs font-bold">Thông báo</span>
            <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-white text-xs">✕</button>
          </div>
          <div className="flex flex-col">
            {notifications.map(n => (
              <div key={n.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/4 last:border-0">
                <span className="text-lg shrink-0">{n.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs leading-relaxed">{n.text}</p>
                  <p className="text-gray-600 text-[10px] mt-0.5">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { streak, stats, settings, flashcards } = useAppStore();
  const { user, logout, uiLang } = useAuthStore();
  const tr = useT(uiLang ?? "vi");

  const goal = settings.dailyGoal ?? 5;
  const pct = Math.min((stats.wordsLearned / goal) * 100, 100);
  const today = new Date().toISOString().slice(0, 10);
  const dueCount = flashcards.filter(f => !f.nextReview || f.nextReview <= today).length;
  const groups = NAV_GROUPS(tr);

  return (
    <aside className="w-16 md:w-60 h-screen flex flex-col fixed left-0 top-0 z-10 overflow-y-auto"
      style={{ background: "linear-gradient(180deg,#07030f 0%,#0d0520 100%)", borderRight: "1px solid rgba(139,92,246,0.12)" }}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 shrink-0">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 relative"
          style={{ background: "linear-gradient(135deg,#6d28d9,#4f46e5)", boxShadow: "0 0 16px rgba(109,40,217,0.5)" }}>
          <Sparkles className="w-4 h-4 text-white" />
          {/* AI live dot */}
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-400 border border-[#07030f]"
            style={{ animation: "sidebarDot 2s ease-in-out infinite" }} />
        </div>
        <div className="hidden md:flex flex-col">
          <span className="font-black text-white text-base leading-none">LinguaAI</span>
          <span className="text-[10px] text-purple-400/70 font-medium">AI · 100% tự động</span>
        </div>
        {/* Bell notification */}
        <BellDropdown />
      </div>

      {/* User card */}
      {user && (
        <div className="hidden md:flex items-center gap-2.5 mx-3 mb-3 px-3 py-2.5 rounded-2xl"
          style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="w-8 h-8 rounded-xl overflow-hidden bg-purple-600/30 flex items-center justify-center shrink-0">
            {user.avatar?.startsWith("http")
              ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <span className="text-lg">{user.avatar}</span>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user.name?.split(" ").slice(-1)[0]}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {user.isPremium
                ? <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" /> Premium</span>
                : <span className="text-[10px] text-purple-400/60">Free</span>}
            </div>
          </div>
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg"
            style={{ background: "rgba(139,92,246,0.15)" }}>
            <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
            <span className="text-[10px] font-bold text-white">{useAppStore.getState().totalXp}</span>
          </div>
        </div>
      )}

      {/* Streak + goal bar */}
      <div className="hidden md:flex flex-col gap-1.5 mx-3 mb-3 px-3 py-2.5 rounded-2xl"
        style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.15)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-bold text-orange-300">{streak} ngày streak</span>
          </div>
          <span className="text-[10px] text-gray-500">{stats.wordsLearned}/{goal} từ</span>
        </div>
        <div className="w-full rounded-full h-1" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-1 rounded-full transition-all"
            style={{ width: `${pct}%`, background: pct >= 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#f97316,#fb923c)" }} />
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex flex-col gap-0 flex-1 px-2 pb-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="hidden md:block text-[10px] font-bold text-white/20 uppercase tracking-widest px-2 py-1.5">{group.label}</p>
            {group.items.map(({ href, icon: Icon, label, badge: hasBadge }: any) => {
              const isActive = pathname === href;
              const badgeCount = hasBadge && dueCount > 0 ? dueCount : null;
              return (
                <Link key={href} href={href}
                  className={cn(
                    "flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all duration-200 relative group",
                    isActive
                      ? "text-white"
                      : "text-white/35 hover:text-white/80"
                  )}
                  style={isActive ? {
                    background: "linear-gradient(135deg,rgba(109,40,217,0.35),rgba(79,70,229,0.2))",
                    border: "1px solid rgba(139,92,246,0.3)",
                    boxShadow: "0 2px 12px rgba(109,40,217,0.2)",
                  } : {}}>
                  {/* Active indicator */}
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-purple-400" />}
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-purple-300" : "text-white/30 group-hover:text-white/60")} />
                  <span className="hidden md:block text-xs font-medium truncate">{label}</span>
                  {badgeCount && (
                    <span className="hidden md:flex ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 items-center justify-center font-bold shrink-0">
                      {badgeCount > 9 ? "9+" : badgeCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <style>{`
        @keyframes sidebarDot { 0%,100%{opacity:1;box-shadow:0 0 4px #4ade80} 50%{opacity:0.5;box-shadow:0 0 8px #4ade80} }
      `}</style>
    </aside>
  );
}
