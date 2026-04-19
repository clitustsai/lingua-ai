"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Loader2, Copy, Check, ChevronDown, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADES = [
  { id: "thcs6", label: "Lớp 6", level: "A1" },
  { id: "thcs7", label: "Lớp 7", level: "A1-A2" },
  { id: "thcs8", label: "Lớp 8", level: "A2" },
  { id: "thcs9", label: "Lớp 9", level: "A2-B1" },
  { id: "thpt10", label: "Lớp 10", level: "B1" },
  { id: "thpt11", label: "Lớp 11", level: "B1-B2" },
  { id: "thpt12", label: "Lớp 12", level: "B2" },
];

const TYPES = [
  { id: "grammar", label: "Ngữ pháp", emoji: "📐" },
  { id: "vocabulary", label: "Từ vựng", emoji: "📚" },
  { id: "reading", label: "Đọc hiểu", emoji: "📖" },
  { id: "writing", label: "Viết", emoji: "✍️" },
  { id: "pronunciation", label: "Phát âm", emoji: "🔊" },
  { id: "mixed", label: "Tổng hợp", emoji: "🎯" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function SolvePage() {
  const { settings } = useAppStore();
  const [grade, setGrade] = useState(GRADES[3]);
  const [type, setType] = useState(TYPES[0]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showExplain, setShowExplain] = useState(false);

  const solve = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setResult(null);
    setShowExplain(false);
    try {
      const res = await fetch("/api/solve-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          grade: grade.label,
          level: grade.level,
          type: type.id,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> AI Giải Bài Tập Tiếng Anh
        </h1>
        <p className="text-sm text-gray-400 mt-1">Giải bài tập từ THCS đến THPT · Giải thích chi tiết</p>
      </div>

      {/* Grade selector */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Lớp</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {GRADES.map(g => (
            <button key={g.id} onClick={() => setGrade(g)}
              className={cn("px-3 py-2 rounded-xl border text-sm font-medium shrink-0 transition-all",
                grade.id === g.id
                  ? "border-primary-500 bg-primary-900/30 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Type selector */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Loại bài tập</p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all",
                type.id === t.id
                  ? "border-primary-500 bg-primary-900/30 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
              <span>{t.emoji}</span>
              <span className="text-xs">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Question input */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-semibold text-white">Nhập bài tập</p>
          <span className="text-xs text-gray-500">{grade.label} · {type.label}</span>
        </div>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder={`Dán bài tập tiếng Anh vào đây...\n\nVí dụ:\nChoose the correct answer:\nShe ___ to school every day.\nA. go  B. goes  C. going  D. gone`}
          rows={6}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3"
          style={{ background: "rgba(15,10,30,0.8)" }}
        />
        <div className="flex gap-2">
          {question && (
            <button onClick={() => { setQuestion(""); setResult(null); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 text-xs hover:border-gray-600 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Xóa
            </button>
          )}
          <button onClick={solve} disabled={loading || !question.trim()}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang giải...</>
              : <><Sparkles className="w-4 h-4" /> Giải ngay</>
            }
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-8 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang phân tích và giải bài...</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="flex flex-col gap-3 animate-fade-in-up">
          {/* Answer */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">✅ Đáp án</p>
              <CopyBtn text={result.answer} />
            </div>
            <p className="text-white font-semibold text-base leading-relaxed whitespace-pre-wrap">{result.answer}</p>
          </div>

          {/* Step by step */}
          {result.steps?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-xs text-primary-400 font-semibold uppercase tracking-wide mb-3">📝 Các bước giải</p>
              <div className="flex flex-col gap-2">
                {result.steps.map((step: string, i: number) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary-600/30 text-primary-300 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>
                    <p className="text-sm text-gray-200 leading-relaxed">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar rule */}
          {result.rule && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-2">📐 Quy tắc ngữ pháp</p>
              <p className="text-sm text-gray-200 leading-relaxed">{result.rule}</p>
            </div>
          )}

          {/* Explanation toggle */}
          {result.explanation && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => setShowExplain(!showExplain)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                <span>💡 Giải thích chi tiết</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", showExplain && "rotate-180")} />
              </button>
              {showExplain && (
                <div className="px-4 pb-4">
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-2">🎯 Mẹo ghi nhớ</p>
              {result.tips.map((tip: string, i: number) => (
                <p key={i} className="text-sm text-gray-300 mb-1">• {tip}</p>
              ))}
            </div>
          )}

          <button onClick={() => { setResult(null); setQuestion(""); }}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
            Giải bài khác
          </button>
        </div>
      )}
    </div>
  );
}
