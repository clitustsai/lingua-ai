"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Volume2, Plus, Loader2, RefreshCw } from "lucide-react";
import { speakText } from "@/components/VoiceButton";

export default function WordOfDay() {
  const { settings, wordOfDay, setWordOfDay, addFlashcard } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const needsFetch = !wordOfDay || wordOfDay.date !== todayStr || wordOfDay.language !== settings.targetLanguage.code;

  const fetch_ = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await fetch("/api/word-of-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      setWordOfDay({ ...data, language: settings.targetLanguage.code, date: todayStr });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (needsFetch) fetch_();
  }, [settings.targetLanguage.code, settings.level]);

  const save = () => {
    if (!wordOfDay) return;
    addFlashcard({
      id: Date.now().toString(),
      word: wordOfDay.word,
      translation: wordOfDay.translation,
      example: wordOfDay.example,
      language: wordOfDay.language,
    });
    setSaved(true);
  };

  if (loading) return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-3">
      <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
      <span className="text-sm text-gray-400">Loading word of the day...</span>
    </div>
  );

  if (!wordOfDay) return null;

  return (
    <div className="bg-gradient-to-br from-primary-900/40 to-accent-900/30 border border-primary-700/40 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs text-primary-400 font-medium">
          <Sparkles className="w-3.5 h-3.5" /> Word of the Day
        </div>
        <button onClick={fetch_} className="p-1 rounded-lg text-gray-500 hover:text-gray-300 transition-colors" title="New word">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">{wordOfDay.word}</span>
            {wordOfDay.pronunciation && <span className="text-xs text-gray-400">[{wordOfDay.pronunciation}]</span>}
            {wordOfDay.partOfSpeech && <span className="text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">{wordOfDay.partOfSpeech}</span>}
          </div>
          <p className="text-sm text-primary-300 mt-0.5">{wordOfDay.translation}</p>
          <p className="text-xs text-gray-400 mt-1.5 italic">{wordOfDay.example}</p>
          {wordOfDay.exampleTranslation && <p className="text-xs text-gray-500 mt-0.5">{wordOfDay.exampleTranslation}</p>}
          {wordOfDay.mnemonic && (
            <p className="text-xs text-yellow-400/80 mt-2">💡 {wordOfDay.mnemonic}</p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button onClick={() => speakText(wordOfDay.word, wordOfDay.language)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
            <Volume2 className="w-4 h-4" />
          </button>
          <button onClick={save} disabled={saved} className="p-2 rounded-lg bg-accent-600/30 hover:bg-accent-600/50 text-accent-300 disabled:opacity-50 transition-colors" title="Save to flashcards">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
