"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, Copy, Volume2, CheckCircle2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

const REWRITE_MODES = [
  { key: "corrected", label: "✅ Sửa lỗi",       color: "text-green-400",  border: "border-green-600/30",  bg: "bg-green-900/10" },
  { key: "natural",   label: "💬 Tự nhiên hơn",   color: "text-blue-400",   border: "border-blue-600/30",   bg: "bg-blue-900/10" },
  { key: "formal",    label: "👔 Formal",          color: "text-purple-400", border: "border-purple-600/30", bg: "bg-purple-900/10" },
  { key: "informal",  label: "😊 Informal",        color: "text-yellow-400", border: "border-yellow-600/30", bg: "bg-yellow-900/10" },
  { key: "advanced",  label: "🚀 Nâng cao",        color: "text-orange-400", border: "border-orange-600/30", bg: "bg-orange-900/10" },
] as const;

const ISSUE_COLORS: Record<string, string> = {
  grammar: "text-red-400 bg-red-900/20 border-red-700/30",
  style: "text-blue-400 bg-blue-900/20 border-blue-700/30",
  "word-choice": "text-yellow-400 bg-yellow-900/20 border-yellow-700/30",
  punctuation: "text-gray-400 bg-gray-800 border-gray-700",
};

export default function RewritePage() {
  const { settings } = useAppStore();
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string>("corrected");
  const [copied, setCopied] = useState<string | null>(null);
  const [showIssues, setShowIssues] = useState(true);

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  const copy = (txt: string, key: string) => {
    navigator.clipboard.writeText(txt);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const avgScore = result ? Math.round((result.grammarScore + result.styleScore) / 2) : 0;
  const scoreColor = avgScore >= 80 ? "text-green-400" : avgScore >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-purple-400" /> AI Rewrite
        </h1>
        <p className="text-sm text-gray-500 mt-1">Grammarly + AI — sửa lỗi, viết lại formal/informal/nâng cao</p>
      </div>

      {/* Input */}
      <div className="flex flex-col gap-3 mb-5">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={`Nhập câu hoặc đoạn văn bằng ${settings.targetLanguage.name}...`}
          rows={5}
          className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 border border-gray-700 resize-none transition-colors"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-600">{text.length} ký tự</span>
          <button onClick={analyze} disabled={loading || !text.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</> : <><Wand2 className="w-4 h-4" /> Phân tích & Viết lại</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="flex flex-col gap-4">
          {/* Score */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className={cn("text-2xl font-bold", scoreColor)}>{avgScore}</p>
              <p className="text-xs text-gray-500 mt-0.5">Tổng điểm</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-2xl font-bold text-green-400">{result.grammarScore}</p>
              <p className="text-xs text-gray-500 mt-0.5">Ngữ pháp</p>
            </div>
            <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-2xl font-bold text-blue-400">{result.styleScore}</p>
              <p className="text-xs text-gray-500 mt-0.5">Văn phong</p>
            </div>
          </div>

          {/* Overall feedback */}
          {result.overallFeedback && (
            <div className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.25)" }}>
              <span className="text-xl shrink-0">🤖</span>
              <p className="text-gray-200 text-sm leading-relaxed">{result.overallFeedback}</p>
            </div>
          )}

          {/* Issues */}
          {result.issues?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => setShowIssues(!showIssues)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                <span className="text-sm font-semibold text-white">
                  ⚠️ Lỗi tìm thấy ({result.issues.length})
                </span>
                {showIssues ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showIssues && (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {result.issues.map((issue: any, i: number) => (
                    <div key={i} className={cn("rounded-xl p-3 border text-xs", ISSUE_COLORS[issue.type] ?? ISSUE_COLORS.grammar)}>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold uppercase tracking-wide opacity-70">{issue.type}</span>
                        <span className="line-through opacity-60">{issue.original}</span>
                        <span className="opacity-50">→</span>
                        <span className="font-semibold">{issue.fix}</span>
                      </div>
                      <p className="opacity-80">{issue.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Rewrite modes */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Phiên bản viết lại</p>
            {/* Mode tabs */}
            <div className="flex gap-1.5 flex-wrap mb-3">
              {REWRITE_MODES.map(m => (
                <button key={m.key} onClick={() => setActiveMode(m.key)}
                  className={cn("px-3 py-1.5 rounded-xl border text-xs font-medium transition-all",
                    activeMode === m.key
                      ? `${m.border} ${m.bg} ${m.color}`
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Active rewrite */}
            {result.rewrites && result.rewrites[activeMode] && (() => {
              const mode = REWRITE_MODES.find(m => m.key === activeMode)!;
              const rewriteText = result.rewrites[activeMode];
              return (
                <div className={cn("rounded-2xl p-4 border", mode.border, mode.bg)}>
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn("text-sm leading-relaxed flex-1", mode.color === "text-green-400" ? "text-gray-100" : "text-gray-100")}>
                      {rewriteText}
                    </p>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => speakText(rewriteText, settings.targetLanguage.code)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-gray-700 transition-colors">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => copy(rewriteText, activeMode)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-colors">
                        {copied === activeMode ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-xs text-primary-400 font-semibold mb-2">💡 Mẹo viết</p>
              {result.tips.map((tip: string, i: number) => (
                <div key={i} className="flex gap-2 text-xs text-gray-300 mb-1.5">
                  <span className="text-primary-500 shrink-0">▸</span>{tip}
                </div>
              ))}
            </div>
          )}

          {/* Try again */}
          <button onClick={() => { setResult(null); setText(""); }}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
            Viết câu mới
          </button>
        </div>
      )}
    </div>
  );
}
