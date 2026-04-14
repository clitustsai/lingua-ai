"use client";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES, LEVELS, CONVERSATION_TOPICS } from "@ai-lang/shared";
import { Volume2, Mic, Target, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { settings, setSettings, streak, stats, flashcards, totalMessages } = useAppStore();

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <div className="flex flex-col gap-6">
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

        {/* Target language */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Language I want to learn</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button key={lang.code} onClick={() => setSettings({ targetLanguage: lang })}
                className={cn("flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors",
                  settings.targetLanguage.code === lang.code
                    ? "border-primary-500 bg-primary-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                <span>{lang.flag}</span><span>{lang.name}</span>
              </button>
            ))}
          </div>
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
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" /> Daily word goal: <span className="text-white">{settings.dailyGoal ?? 5}</span>
          </label>
          <input type="range" min={3} max={30} value={settings.dailyGoal ?? 5}
            onChange={(e) => setSettings({ dailyGoal: Number(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>3</span><span>30</span></div>
        </div>

        {/* Speech rate */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Speech rate: <span className="text-white">{settings.speechRate ?? 0.9}x</span>
          </label>
          <input type="range" min={0.5} max={1.5} step={0.1} value={settings.speechRate ?? 0.9}
            onChange={(e) => setSettings({ speechRate: Number(e.target.value) })}
            className="w-full accent-primary-500" />
          <div className="flex justify-between text-xs text-gray-600 mt-1"><span>0.5x slow</span><span>1.5x fast</span></div>
        </div>

        {/* Toggles */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">Auto-speak AI replies</span>
            </div>
            <button onClick={() => setSettings({ autoSpeak: !settings.autoSpeak })}
              className={cn("w-11 h-6 rounded-full transition-colors relative", settings.autoSpeak ? "bg-primary-600" : "bg-gray-700")}>
              <span className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", settings.autoSpeak ? "translate-x-5" : "translate-x-0.5")} />
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
          <p className="font-medium text-white mb-1">Current setup</p>
          <p>Learning {settings.targetLanguage.flag} {settings.targetLanguage.name} at {settings.level} level</p>
          <p>Native: {settings.nativeLanguage.flag} {settings.nativeLanguage.name}</p>
          <p>Topic: {CONVERSATION_TOPICS.find(t => t.id === settings.conversationTopic)?.emoji} {CONVERSATION_TOPICS.find(t => t.id === settings.conversationTopic)?.label ?? "Free Talk"}</p>
        </div>
      </div>
    </div>
  );
}
