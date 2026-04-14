"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CheckCircle2, XCircle, Lightbulb, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

interface GrammarResult {
  isCorrect: boolean;
  corrected: string;
  errors: GrammarError[];
  score: number;
  tip: string;
}

export default function GrammarPage() {
  const { settings, incrementGrammarChecks, checkAchievements } = useAppStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      setResult(data);
      incrementGrammarChecks();
      checkAchievements();
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = result
    ? result.score >= 80 ? "text-green-400" : result.score >= 50 ? "text-yellow-400" : "text-red-400"
    : "";

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Grammar Checker</h1>
        <p className="text-sm text-gray-500 mt-1">
          Write in {settings.targetLanguage.flag} {settings.targetLanguage.name} and get instant feedback
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Write a sentence or paragraph in ${settings.targetLanguage.name}...`}
          rows={5}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
        />
        <button
          onClick={check}
          disabled={loading || !text.trim()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Checking...</> : "Check Grammar"}
        </button>

        {result && (
          <div className="flex flex-col gap-4 mt-2">
            {/* Score */}
            <div className="flex items-center gap-4 bg-gray-800 rounded-xl p-4">
              <div className={cn("text-4xl font-bold", scoreColor)}>{result.score}</div>
              <div>
                <div className="text-white font-medium text-sm">
                  {result.isCorrect ? "✅ Looks correct!" : "❌ Found some issues"}
                </div>
                <div className="w-40 bg-gray-700 rounded-full h-1.5 mt-2">
                  <div
                    className={cn("h-1.5 rounded-full transition-all", result.score >= 80 ? "bg-green-500" : result.score >= 50 ? "bg-yellow-500" : "bg-red-500")}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Corrected version */}
            {!result.isCorrect && (
              <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4">
                <p className="text-xs text-green-400 font-medium mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Corrected version
                </p>
                <p className="text-green-200 text-sm">{result.corrected}</p>
              </div>
            )}

            {/* Errors */}
            {result.errors?.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-500 font-medium">Errors found:</p>
                {result.errors.map((err, i) => (
                  <div key={i} className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-red-300 line-through">{err.original}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-green-300">{err.correction}</span>
                    </div>
                    <p className="text-gray-400 text-xs ml-5">{err.explanation}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Tip */}
            {result.tip && (
              <div className="flex gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-3 text-sm">
                <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <p className="text-yellow-200">{result.tip}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
