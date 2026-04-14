"use client";
import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, Volume2, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

interface ListeningData {
  sentence: string;
  translation: string;
  blanks: { index: number; word: string; hint: string }[];
  displaySentence: string;
  difficulty: string;
}

export default function ListeningPage() {
  const { settings } = useAppStore();
  const [data, setData] = useState<ListeningData | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const inputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const generate = async () => {
    setLoading(true); setData(null); setAnswers({}); setChecked(false); setShowTranslation(false);
    try {
      const res = await fetch("/api/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name, level: settings.level }),
      });
      const d = await res.json();
      setData(d);
      setTimeout(() => speakText(d.sentence, settings.targetLanguage.code), 500);
    } finally { setLoading(false); }
  };

  const check = () => setChecked(true);

  const score = data ? data.blanks.filter(b => answers[b.index]?.trim().toLowerCase() === b.word.toLowerCase()).length : 0;

  // Build display parts from displaySentence
  const renderSentence = () => {
    if (!data) return null;
    const parts = data.displaySentence.split("___");
    return (
      <p className="text-lg text-white leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && data.blanks[i] && (
              <span className="inline-flex flex-col items-center mx-1">
                <input
                  ref={el => { inputRefs.current[i] = el; }}
                  value={answers[i] ?? ""}
                  onChange={e => setAnswers(p => ({ ...p, [i]: e.target.value }))}
                  disabled={checked}
                  placeholder="___"
                  className={cn(
                    "w-24 text-center border-b-2 bg-transparent text-sm px-1 py-0.5 focus:outline-none transition-colors",
                    !checked ? "border-gray-500 focus:border-primary-400 text-white"
                      : answers[i]?.trim().toLowerCase() === data.blanks[i].word.toLowerCase()
                      ? "border-green-500 text-green-300"
                      : "border-red-500 text-red-300"
                  )}
                />
                {checked && answers[i]?.trim().toLowerCase() !== data.blanks[i].word.toLowerCase() && (
                  <span className="text-xs text-green-400 mt-0.5">{data.blanks[i].word}</span>
                )}
              </span>
            )}
          </span>
        ))}
      </p>
    );
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Listening Exercise</h1>
        <p className="text-sm text-gray-500 mt-1">Listen and fill in the missing words</p>
      </div>

      <button onClick={generate} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors mb-6">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> : <><RefreshCw className="w-4 h-4" /> New Exercise</>}
      </button>

      {data && (
        <div className="flex flex-col gap-5">
          {/* Play button */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {data.difficulty} · {settings.targetLanguage.flag} {settings.targetLanguage.name}
              </span>
              <button onClick={() => speakText(data.sentence, settings.targetLanguage.code)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 rounded-xl text-sm transition-colors">
                <Volume2 className="w-4 h-4" /> Play Again
              </button>
            </div>
            <div className="mb-4">{renderSentence()}</div>

            {/* Hints */}
            {data.blanks.map((b, i) => (
              <p key={i} className="text-xs text-gray-500 mt-1">Blank {i + 1} hint: {b.hint}</p>
            ))}
          </div>

          {!checked ? (
            <button onClick={check} disabled={Object.keys(answers).length === 0}
              className="w-full py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
              Check Answers
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <div className={cn("flex items-center gap-3 p-4 rounded-xl border",
                score === data.blanks.length ? "border-green-600/40 bg-green-900/20" : "border-yellow-600/40 bg-yellow-900/20")}>
                {score === data.blanks.length
                  ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                  : <XCircle className="w-5 h-5 text-yellow-400" />}
                <span className="text-sm text-white font-medium">
                  {score}/{data.blanks.length} correct {score === data.blanks.length ? "🎉 Perfect!" : ""}
                </span>
              </div>
              <button onClick={() => setShowTranslation(!showTranslation)} className="text-xs text-primary-400 hover:underline text-left">
                {showTranslation ? "Hide" : "Show"} translation
              </button>
              {showTranslation && <p className="text-sm text-gray-400 italic">{data.translation}</p>}
              <button onClick={generate} className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
                Next Exercise
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
