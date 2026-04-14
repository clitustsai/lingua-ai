"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";
import { ArrowLeftRight, Loader2, Copy, Volume2, Plus } from "lucide-react";
import { speakText } from "@/components/VoiceButton";

export default function TranslatePage() {
  const { settings, addFlashcard, incrementTranslations } = useAppStore();
  const [fromLang, setFromLang] = useState(settings.nativeLanguage.code);
  const [toLang, setToLang] = useState(settings.targetLanguage.code);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<{ translation: string; alternatives?: string[]; notes?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fromObj = SUPPORTED_LANGUAGES.find(l => l.code === fromLang)!;
  const toObj = SUPPORTED_LANGUAGES.find(l => l.code === toLang)!;

  const swap = () => { setFromLang(toLang); setToLang(fromLang); setResult(null); };

  const translate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, fromLanguage: fromObj.name, toLanguage: toObj.name }),
      });
      setResult(await res.json());
      incrementTranslations();
    } finally { setLoading(false); }
  };

  const copy = () => {
    if (result?.translation) { navigator.clipboard.writeText(result.translation); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };

  const save = () => {
    if (!result?.translation || !input.trim()) return;
    addFlashcard({ id: Date.now().toString(), word: input.trim(), translation: result.translation, example: "", language: toLang });
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Translator</h1>
        <p className="text-sm text-gray-500 mt-1">Quick translation with cultural notes</p>
      </div>

      {/* Language selector */}
      <div className="flex items-center gap-3 mb-4">
        <select value={fromLang} onChange={e => { setFromLang(e.target.value); setResult(null); }}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500">
          {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
        </select>
        <button onClick={swap} className="p-2.5 bg-gray-800 border border-gray-700 rounded-xl text-gray-400 hover:text-white hover:border-gray-600 transition-colors">
          <ArrowLeftRight className="w-4 h-4" />
        </button>
        <select value={toLang} onChange={e => { setToLang(e.target.value); setResult(null); }}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary-500">
          {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
        </select>
      </div>

      {/* Input */}
      <textarea value={input} onChange={e => { setInput(e.target.value); setResult(null); }}
        onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) translate(); }}
        placeholder={`Type in ${fromObj.name}... (Ctrl+Enter to translate)`}
        rows={4}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-3"
      />
      <button onClick={translate} disabled={loading || !input.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors mb-4">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Translating...</> : "Translate"}
      </button>

      {result && (
        <div className="flex flex-col gap-3">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-white text-sm leading-relaxed flex-1">{result.translation}</p>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => speakText(result.translation, toLang)} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-gray-700 transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={copy} className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
                {input.trim().split(" ").length === 1 && (
                  <button onClick={save} className="p-1.5 rounded-lg text-gray-500 hover:text-accent-400 hover:bg-gray-700 transition-colors" title="Save to flashcards">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            {copied && <p className="text-xs text-green-400 mt-1">Copied!</p>}
          </div>

          {result.alternatives && result.alternatives.length > 0 && (
            <div className="bg-gray-800 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-2">Alternative translations:</p>
              <div className="flex flex-wrap gap-2">
                {result.alternatives.map((alt, i) => (
                  <span key={i} className="text-sm bg-gray-700 text-gray-300 px-2.5 py-1 rounded-lg">{alt}</span>
                ))}
              </div>
            </div>
          )}

          {result.notes && (
            <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 text-sm text-yellow-200">
              💡 {result.notes}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
