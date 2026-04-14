"use client";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES, LEVELS, type Language, type Level } from "@ai-lang/shared";

export default function SettingsPage() {
  const { settings, setSettings } = useAppStore();

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Settings</h1>

      <div className="flex flex-col gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Language I want to learn
          </label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSettings({ targetLanguage: lang })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  settings.targetLanguage.code === lang.code
                    ? "border-primary-500 bg-primary-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">My native language</label>
          <div className="grid grid-cols-2 gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSettings({ nativeLanguage: lang })}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  settings.nativeLanguage.code === lang.code
                    ? "border-accent-500 bg-accent-600/20 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">My level</label>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSettings({ level: lvl })}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  settings.level === lvl
                    ? "border-primary-500 bg-primary-600/20 text-primary-300"
                    : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-4 text-sm text-gray-400">
          <p className="font-medium text-white mb-1">Current setup</p>
          <p>
            Learning {settings.targetLanguage.flag} {settings.targetLanguage.name} at{" "}
            {settings.level} level
          </p>
          <p>
            Native: {settings.nativeLanguage.flag} {settings.nativeLanguage.name}
          </p>
        </div>
      </div>
    </div>
  );
}
