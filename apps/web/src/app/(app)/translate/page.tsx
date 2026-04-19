"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";
import { ArrowLeftRight, Loader2, Copy, Volume2, Plus, BookOpen, Zap, Check, ChevronDown, ChevronUp } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

type Mode = "translate" | "explain" | "practice";

export default function TranslatePage() {
  const { settings, addFlashcard, incrementTranslations } = useAppStore();
  const [fromLang, setFromLang] = useState(settings.nativeLanguage.code);
  const [toLang, setToLang] = useState(settings.targetLanguage.code);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<Mode>("translate");
  const [showExplain, setShowExplain] = useState(false);
  // Practice quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  const fromObj = SUPPORTED_LANGUAGES.find(l => l.code === fromLang)!;
  const toObj = SUPPORTED_LANGUAGES.find(l => l.code === toLang)!;

  const swap = () => { setFromLang(toLang); setToLang(fromLang); setResult(null); };

  const translate = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setQuizAnswers({});
    setQuizChecked(false);
    setShowExplain(false);
    try {
      const endpoint = mode === "practice" ? "/api/translate-practice" : "/api/translate";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          fromLanguage: fromObj.name,
          toLanguage: toObj.name,
          explain: mode === "explain",
          nativeLanguage: settings.nativeLanguage.name,
        }),
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

  const MODES = [
    { id: "translate", label: "Dịch", emoji: "🌐" },
    { id: "explain", label: "Giải thích", emoji: "📖" },
    { id: "practice", label: "Luyện tập", emoji: "🎯" },
  ] as const;

  return (
    <div className="p-5 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Dịch thuật AI</h1>
        <p className="text-sm text-gray-500 mt-1">Dịch · Giải thích ngữ pháp · Luyện tập</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: "rgba(15,10,30,0.6)" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); setResult(null); }}
            className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5",
              mode === m.id ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
            <span>{m.emoji}</span> {m.label}
          </button>
        ))}
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
        placeholder={mode === "explain" ? "Nhập câu để AI giải thích ngữ pháp..." : mode === "practice" ? "Nhập câu để tạo bài luyện tập..." : `Nhập ${fromObj.name}... (Ctrl+Enter)`}
        rows={4}
        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none mb-3"
      />
      <button onClick={translate} disabled={loading || !input.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors mb-4">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...</>
          : mode === "explain" ? <><BookOpen className="w-4 h-4" /> Giải thích</>
          : mode === "practice" ? <><Zap className="w-4 h-4" /> Tạo bài tập</>
          : "Dịch ngay"
        }
      </button>

      {/* Results */}
      {result && (
        <div className="flex flex-col gap-3">
          {/* Translation */}
          {result.translation && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-white text-base leading-relaxed flex-1 font-medium">{result.translation}</p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => speakText(result.translation, toLang)} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={copy} className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 transition-colors">
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={save} className="p-1.5 rounded-lg text-gray-500 hover:text-accent-400 transition-colors" title="Lưu flashcard">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Word breakdown */}
          {result.wordBreakdown?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-3">📝 Nghĩa từng từ</p>
              <div className="flex flex-wrap gap-2">
                {result.wordBreakdown.map((w: any, i: number) => (
                  <div key={i} className="px-3 py-1.5 rounded-xl text-center"
                    style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.2)" }}>
                    <p className="text-white text-sm font-semibold">{w.word}</p>
                    <p className="text-indigo-300 text-xs">{w.meaning}</p>
                    {w.pos && <p className="text-gray-600 text-xs">{w.pos}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar structure */}
          {result.grammar && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-2">📐 Cấu trúc ngữ pháp</p>
              <p className="text-white font-semibold text-sm mb-1">{result.grammar.name}</p>
              <p className="text-gray-300 text-sm">{result.grammar.explanation}</p>
              {result.grammar.usage && (
                <p className="text-yellow-300 text-xs mt-2 bg-yellow-900/20 rounded-lg px-3 py-1.5">💡 {result.grammar.usage}</p>
              )}
            </div>
          )}

          {/* Alternatives */}
          {result.alternatives?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-gray-500 mb-2">Cách dịch khác:</p>
              <div className="flex flex-wrap gap-2">
                {result.alternatives.map((alt: string, i: number) => (
                  <span key={i} className="text-sm bg-gray-700 text-gray-300 px-2.5 py-1 rounded-lg">{alt}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {result.notes && (
            <div className="rounded-2xl p-3 text-sm text-yellow-200"
              style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              💡 {result.notes}
            </div>
          )}

          {/* Practice Quiz */}
          {result.quiz?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-xs text-primary-400 font-semibold uppercase tracking-wide mb-4">🎯 Luyện tập nhanh</p>
              <div className="flex flex-col gap-4">
                {result.quiz.map((q: any, i: number) => (
                  <div key={i}>
                    <p className="text-white text-sm font-medium mb-2">{i + 1}. {q.question}</p>
                    {q.type === "fill" ? (
                      <div>
                        <input
                          value={quizAnswers[i] ?? ""}
                          onChange={e => setQuizAnswers(p => ({ ...p, [i]: e.target.value }))}
                          disabled={quizChecked}
                          placeholder="Nhập câu trả lời..."
                          className="w-full rounded-xl px-3 py-2 text-sm text-white border border-gray-700 focus:outline-none focus:border-primary-500 bg-gray-900"
                        />
                        {quizChecked && (
                          <p className={cn("text-xs mt-1", quizAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase() ? "text-green-400" : "text-red-400")}>
                            {quizAnswers[i]?.toLowerCase().trim() === q.answer.toLowerCase() ? "✅ Đúng!" : `❌ Đáp án: ${q.answer}`}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options?.map((opt: string, j: number) => {
                          const isSelected = quizAnswers[i] === opt;
                          const isCorrect = quizChecked && opt === q.answer;
                          const isWrong = quizChecked && isSelected && opt !== q.answer;
                          return (
                            <button key={j} onClick={() => !quizChecked && setQuizAnswers(p => ({ ...p, [i]: opt }))}
                              className={cn("px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all",
                                isCorrect ? "border-green-500 bg-green-900/30 text-green-300"
                                  : isWrong ? "border-red-500 bg-red-900/30 text-red-300"
                                  : isSelected ? "border-primary-500 bg-primary-900/30 text-white"
                                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
                {!quizChecked ? (
                  <button onClick={() => setQuizChecked(true)}
                    disabled={Object.keys(quizAnswers).length < result.quiz.length}
                    className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 disabled:opacity-40 text-white text-sm font-medium transition-colors">
                    Kiểm tra đáp án
                  </button>
                ) : (
                  <button onClick={() => { setQuizAnswers({}); setQuizChecked(false); }}
                    className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm transition-colors">
                    Làm lại
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
