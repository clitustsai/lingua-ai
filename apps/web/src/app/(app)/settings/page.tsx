"use client";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { SUPPORTED_LANGUAGES, LEVELS, CONVERSATION_TOPICS } from "@ai-lang/shared";
import { Volume2, Target, Sun, Moon, Camera, Check, X, Pencil, LogOut, HelpCircle, MessageCircle, ChevronRight, BookOpen, Crown, Lock, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { NotificationToggle } from "@/components/NotificationManager";
import TwoFactorAuth from "@/components/TwoFactorAuth";
import { useState, useRef } from "react";

const AVATARS = ["🦊","🐼","🦁","🐯","🦋","🐸","🦄","🐙","🦅","🐬","🌟","🎭","🐺","🦝","🐨","🦜","🐲","🧸","🎃","🤖","👾","🎯"];

export default function SettingsPage() {
  const router = useRouter();
  const { settings, setSettings, streak, stats, flashcards, totalMessages } = useAppStore();
  const { theme, setTheme, user, updateProfile, logout } = useAuthStore();
  const { uiLang, setUiLang } = useAuthStore();

  const handleLogout = () => { logout(); router.push("/auth"); };

  const [editingName, setEditingName] = useState(false);
  const [editingNick, setEditingNick] = useState(false);
  const [nameVal, setNameVal] = useState(user?.name ?? "");
  const [nickVal, setNickVal] = useState(user?.nickname ?? "");
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const saveName = () => {
    if (nameVal.trim()) updateProfile({ name: nameVal.trim() });
    setEditingName(false);
  };
  const saveNick = () => {
    updateProfile({ nickname: nickVal.trim() || undefined });
    setEditingNick(false);
  };

  // avatar là emoji hay URL ảnh
  const isAvatarUrl = user?.avatar?.startsWith("http");

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <div className="flex flex-col gap-6">

        {/* ── PROFILE ── */}
        {user && (
          <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Hồ sơ</p>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-primary-600/30 flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ border: "1px solid rgba(139,92,246,0.4)" }}
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                  {isAvatarUrl
                    ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                    : <span className="text-4xl">{user.avatar}</span>
                  }
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer"
                  onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
                  <Camera className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">{user.name}</p>
                {user.nickname && <p className="text-primary-400 text-sm">@{user.nickname}</p>}
                <p className="text-gray-500 text-xs">{user.email}</p>
              </div>
            </div>

            {/* Avatar grid */}
            {showAvatarPicker && (
              <div className="grid grid-cols-11 gap-1.5 mb-4 p-3 rounded-xl" style={{ background: "rgba(15,10,30,0.6)" }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => { updateProfile({ avatar: a }); setShowAvatarPicker(false); }}
                    className={cn("text-2xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors hover:bg-primary-600/30",
                      user.avatar === a ? "bg-primary-600/50 ring-1 ring-primary-400" : "")}>
                    {a}
                  </button>
                ))}
              </div>
            )}

            {/* Name */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-gray-500 w-16 shrink-0">Tên</span>
              {editingName ? (
                <div className="flex-1 flex gap-2">
                  <input value={nameVal} onChange={e => setNameVal(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                    onKeyDown={e => e.key === "Enter" && saveName()}
                    autoFocus
                  />
                  <button onClick={saveName} className="p-1.5 rounded-lg bg-primary-600/30 text-primary-300 hover:bg-primary-600/50"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingName(false)} className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-white text-sm">{user.name}</span>
                  <button onClick={() => { setNameVal(user.name); setEditingName(true); }}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Nickname */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-16 shrink-0">Nickname</span>
              {editingNick ? (
                <div className="flex-1 flex gap-2">
                  <input value={nickVal} onChange={e => setNickVal(e.target.value)}
                    placeholder="@nickname"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary-500"
                    onKeyDown={e => e.key === "Enter" && saveNick()}
                    autoFocus
                  />
                  <button onClick={saveNick} className="p-1.5 rounded-lg bg-primary-600/30 text-primary-300 hover:bg-primary-600/50"><Check className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setEditingNick(false)} className="p-1.5 rounded-lg bg-gray-800 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-sm">{user.nickname ? <span className="text-primary-400">@{user.nickname}</span> : <span className="text-gray-600">Chưa đặt</span>}</span>
                  <button onClick={() => { setNickVal(user.nickname ?? ""); setEditingNick(true); }}
                    className="p-1.5 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-gray-800 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-orange-400">{streak}</div>
            <div className="text-xs text-gray-500 mt-0.5">Day streak 🔥</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-primary-400">{flashcards.length}</div>
            <div className="text-xs text-gray-500 mt-0.5">Flashcards</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-3 text-center">
            <div className="text-2xl font-bold text-accent-400">{totalMessages}</div>
            <div className="text-xs text-gray-500 mt-0.5">Messages</div>
          </div>
        </div>

        {/* UI Language */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" /> Ngôn ngữ giao diện
          </label>
          <div className="flex gap-2">
            {([
              { id: "vi", flag: "🇻🇳", label: "Tiếng Việt" },
              { id: "en", flag: "🇺🇸", label: "English" },
            ] as const).map(l => (
              <button key={l.id} onClick={() => setUiLang(l.id)}
                className={cn("flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex-1 justify-center",
                  (uiLang ?? "vi") === l.id
                    ? "border-primary-500 bg-primary-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-600 mt-1.5">Thay đổi ngôn ngữ hiển thị của toàn bộ giao diện</p>
        </div>

        {/* Target language */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Language I want to learn</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang, idx) => {
              // English (index 0) là free, còn lại lock Premium
              const isLocked = idx > 0 && !user?.isPremium;
              const isSelected = settings.targetLanguage.code === lang.code;
              return (
                <button key={lang.code}
                  onClick={() => isLocked ? router.push("/premium") : setSettings({ targetLanguage: lang })}
                  className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors relative",
                    isSelected
                      ? "border-primary-500 bg-primary-600/20 text-white"
                      : isLocked
                        ? "border-gray-700 bg-gray-800/40 text-gray-600 cursor-pointer"
                        : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  <span>{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {isLocked && <Crown className="w-3.5 h-3.5 text-yellow-500 shrink-0" />}
                </button>
              );
            })}
          </div>
          {!user?.isPremium && (
            <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-600" />
              Nâng cấp Premium để học Japanese, Korean, Chinese và nhiều ngôn ngữ khác
            </p>
          )}
        </div>

        {/* Native language */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">My native language</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => setSettings({ nativeLanguage: lang })}
                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  settings.nativeLanguage.code === lang.code
                    ? "border-accent-500 bg-accent-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                <span>{lang.flag}</span><span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">My level</label>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((lvl) => (
              <button key={lvl} onClick={() => setSettings({ level: lvl })}
                className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-colors",
                  settings.level === lvl
                    ? "border-primary-500 bg-primary-600/20 text-primary-300"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Default conversation topic</label>
          <div className="grid grid-cols-2 gap-2">
            {CONVERSATION_TOPICS.map((t) => (
              <button key={t.id} onClick={() => setSettings({ conversationTopic: t.id })}
                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  settings.conversationTopic === t.id
                    ? "border-primary-500 bg-primary-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                <span>{t.emoji}</span><span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Daily goal */}
        {/* Daily goal */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Mục tiêu từ mỗi ngày: <span className="text-white">{settings.dailyGoal ?? 5}</span>
          </label>
          <input type="range" min={3} max={30} value={settings.dailyGoal ?? 5}
            onChange={(e) => setSettings({ dailyGoal: Number(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>3</span><span>30</span></div>
        </div>

        {/* Speech rate */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Tốc độ đọc: <span className="text-white">{settings.speechRate ?? 0.8}x</span>
          </label>
          <input type="range" min={0.5} max={1.2} step={0.05} value={settings.speechRate ?? 0.8}
            onChange={(e) => setSettings({ speechRate: Number(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>0.5x chậm</span><span>1.2x nhanh</span></div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          {/* User card + logout */}
          {user && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-xl px-4 py-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-600/30 flex items-center justify-center shrink-0">
                {user.avatar?.startsWith("http")
                  ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl">{user.avatar}</span>
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.email}</p>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors text-xs font-medium shrink-0">
                <LogOut className="w-3.5 h-3.5" />
                Đăng xuất
              </button>
            </div>
          )}
          {/* Theme toggle */}
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              {theme === "dark" ? <Moon className="w-4 h-4 text-primary-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
              <div>
                <p className="text-sm text-gray-300">Chế độ {theme === "dark" ? "tối" : "sáng"}</p>
                <p className="text-xs text-gray-500">{theme === "dark" ? "Dark mode đang bật" : "Light mode đang bật"}</p>
              </div>
            </div>
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", theme === "light" ? "bg-yellow-500" : "bg-primary-600")}>
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200", theme === "light" ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Auto-speak AI replies</span>
            </div>
            <button onClick={() => setSettings({ autoSpeak: !settings.autoSpeak })}
              className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", settings.autoSpeak ? "bg-primary-600" : "bg-gray-700")}>
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200", settings.autoSpeak ? "translate-x-6" : "translate-x-0.5")} />
            </button>
          </div>
          <NotificationToggle />
          <TwoFactorAuth />
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
          <p className="font-medium text-white mb-1">Cài đặt hiện tại</p>
          <p>Đang học {settings.targetLanguage.flag} {settings.targetLanguage.name} · Trình độ {settings.level}</p>
          <p>Tiếng mẹ đẻ: {settings.nativeLanguage.flag} {settings.nativeLanguage.name}</p>
          <p>Topic: {CONVERSATION_TOPICS.find(t => t.id === settings.conversationTopic)?.emoji} {CONVERSATION_TOPICS.find(t => t.id === settings.conversationTopic)?.label ?? "Free Talk"}</p>
        </div>

        {/* Hỗ trợ */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide px-4 pt-4 pb-2">Hỗ trợ</p>
          {[
            { icon: HelpCircle, label: "Trung tâm trợ giúp", href: "/help" },
            { icon: MessageCircle, label: "Liên hệ hỗ trợ", href: "/contact" },
            { icon: BookOpen, label: "Blog LinguaAI", href: "/blog" },
          ].map(({ icon: Icon, label, href }, i, arr) => (
            <Link key={label} href={href}
              className={cn("flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors",
                i < arr.length - 1 ? "border-b border-white/5" : "")}>
              <Icon className="w-5 h-5 text-gray-400 shrink-0" />
              <span className="flex-1 text-sm text-gray-200">{label}</span>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-700 pb-2">LinguaAI v1.0 · <Link href="/terms" className="hover:text-gray-500 transition-colors">Điều khoản</Link></p>
      </div>
    </div>
  );
}
