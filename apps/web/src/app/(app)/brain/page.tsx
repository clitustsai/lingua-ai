"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Brain, Loader2, Volume2, Plus, Zap, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

export default function BrainPage() {
  const { settings, addFlashcard } = useAppStore();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"simple" | "deep">("simple");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedWord, setExpandedWord] = useState<number | null>(null);

  const analyze = async () => {
    if (!text.trim() || loading) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/brain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), mode, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name, level: settings.level }),
      });
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  const save = (word: string, meaning: string) => {
    addFlashcard({ id: Date.now().toString(), word, translation: meaning, example: text, language: settings.targetLanguage.code });
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-400" /> Brain Mode
        </h1>
        <p className="text-sm text-gray-500 mt-1">Không chỉ dịch — giải thích sâu tại sao dùng từ đó, phân tích ngữ pháp</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-4 p-1 rounded-2xl" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <button onClick={() => setMode("simple")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === "simple" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300")}>
          <Zap className="w-4 h-4" /> Simple
        </button>
        <button onClick={() => setMode("deep")}
          className={cn("flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all",
            mode === "deep" ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-300")}>
          <Brain className="w-4 h-4" /> Deep Learning Mode
        </button>
      </div>

      {mode === "deep" && (
        <div className="rounded-xl px-3 py-2 mb-4 flex items-center gap-2"
          style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <span className="text-purple-400 text-sm">🧠</span>
          <p className="text-xs text-purple-300">Deep mode: phân tích từng từ, ngữ pháp, văn hóa, ví dụ tương tự</p>
        </div>
      )}

      <textarea value={text} onChange={e => setText(e.target.value)}
        placeholder={`Nhập câu hoặc đoạn văn ${settings.targetLanguage.name}...`}
        rows={4}
        className="w-full rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3"
        style={{ background: "rgba(26,16,53,0.8)" }}
      />

      <button onClick={analyze} disabled={loading || !text.trim()}
        className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all mb-5",
          mode === "deep"
            ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white disabled:opacity-50"
            : "bg-primary-600 hover:bg-primary-500 text-white disabled:opacity-50")}>
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang phân tích...</> : mode === "deep" ? <><Brain className="w-4 h-4" /> Phân tích sâu</> : <><Zap className="w-4 h-4" /> Dịch nhanh</>}
      </button>

      {result && (
        <div className="flex flex-col gap-4">
          {/* Translation */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Bản dịch</p>
                <p className="text-white text-sm leading-relaxed">{result.translation}</p>
              </div>
              <button onClick={() => speakText(text, settings.targetLanguage.code)} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 transition-colors shrink-0">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Simple mode: key words + tip */}
          {mode === "simple" && (
            <>
              {result.keyWords?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <p className="text-xs text-primary-400 font-semibold mb-3">📚 Từ khóa</p>
                  <div className="flex flex-wrap gap-2">
                    {result.keyWords.map((kw: any, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 bg-gray-800 rounded-xl px-3 py-1.5">
                        <button onClick={() => speakText(kw.word, settings.targetLanguage.code)} className="text-white font-medium text-sm hover:text-primary-300 transition-colors">{kw.word}</button>
                        <span className="text-gray-500 text-xs">— {kw.meaning}</span>
                        <button onClick={() => save(kw.word, kw.meaning)} className="p-0.5 text-gray-600 hover:text-accent-400 transition-colors"><Plus className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.oneTip && (
                <div className="rounded-xl px-4 py-3 flex gap-2" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <span className="text-yellow-400 shrink-0">💡</span>
                  <p className="text-yellow-200 text-sm">{result.oneTip}</p>
                </div>
              )}
            </>
          )}

          {/* Deep mode */}
          {mode === "deep" && (
            <>
              {/* Word-by-word */}
              {result.wordByWord?.length > 0 && (
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs text-purple-400 font-semibold uppercase tracking-wide">🔬 Phân tích từng từ</p>
                  </div>
                  <div className="divide-y divide-white/5">
                    {result.wordByWord.map((w: any, i: number) => (
                      <div key={i}>
                        <button onClick={() => setExpandedWord(expandedWord === i ? null : i)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left">
                          <button onClick={e => { e.stopPropagation(); speakText(w.word, settings.targetLanguage.code); }}
                            className="p-1 rounded text-gray-600 hover:text-primary-400 shrink-0">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-white font-semibold text-sm">{w.word}</span>
                              <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">{w.partOfSpeech}</span>
                              <span className="text-primary-300 text-sm">{w.translation}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button onClick={e => { e.stopPropagation(); save(w.word, w.translation); }}
                              className="p-1 rounded text-gray-600 hover:text-accent-400 transition-colors">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            {expandedWord === i ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                          </div>
                        </button>
                        {expandedWord === i && (
                          <div className="px-4 pb-4 flex flex-col gap-2 bg-purple-900/10">
                            {w.whyThisWord && (
                              <div className="flex gap-2 text-xs">
                                <span className="text-purple-400 shrink-0">❓ Tại sao:</span>
                                <span className="text-gray-300">{w.whyThisWord}</span>
                              </div>
                            )}
                            {w.nuance && (
                              <div className="flex gap-2 text-xs">
                                <span className="text-yellow-400 shrink-0">✨ Sắc thái:</span>
                                <span className="text-gray-300">{w.nuance}</span>
                              </div>
                            )}
                            {w.alternatives?.length > 0 && (
                              <div className="flex gap-2 text-xs items-start">
                                <span className="text-blue-400 shrink-0">🔄 Thay thế:</span>
                                <div className="flex gap-1 flex-wrap">
                                  {w.alternatives.map((alt: string, j: number) => (
                                    <button key={j} onClick={() => speakText(alt, settings.targetLanguage.code)}
                                      className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-lg hover:text-primary-300 transition-colors">{alt}</button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Grammar analysis */}
              {result.grammarAnalysis && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <p className="text-xs text-yellow-400 font-semibold mb-3">📐 Phân tích ngữ pháp</p>
                  <div className="flex flex-col gap-2">
                    {result.grammarAnalysis.structure && (
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-500 shrink-0 w-20">Cấu trúc:</span>
                        <span className="text-white font-medium">{result.grammarAnalysis.structure}</span>
                      </div>
                    )}
                    {result.grammarAnalysis.tense && (
                      <div className="flex gap-2 text-sm">
                        <span className="text-gray-500 shrink-0 w-20">Thì:</span>
                        <span className="text-gray-300">{result.grammarAnalysis.tense}</span>
                      </div>
                    )}
                    {result.grammarAnalysis.patterns?.map((p: string, i: number) => (
                      <div key={i} className="flex gap-2 text-xs">
                        <span className="text-yellow-500 shrink-0">▸</span>
                        <span className="text-gray-300">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar examples */}
              {result.similarExamples?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <p className="text-xs text-blue-400 font-semibold mb-3">📝 Ví dụ tương tự</p>
                  {result.similarExamples.map((ex: string, i: number) => (
                    <button key={i} onClick={() => speakText(ex, settings.targetLanguage.code)}
                      className="flex items-center gap-2 text-sm text-gray-200 hover:text-primary-300 transition-colors mb-2 text-left w-full">
                      <span className="text-blue-500 shrink-0">▸</span>{ex}
                    </button>
                  ))}
                </div>
              )}

              {/* Cultural context + memory tip */}
              <div className="grid grid-cols-1 gap-3">
                {result.culturalContext && (
                  <div className="rounded-xl px-4 py-3 flex gap-2" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <span className="shrink-0">🌏</span>
                    <p className="text-xs text-green-200">{result.culturalContext}</p>
                  </div>
                )}
                {result.commonMistakes && (
                  <div className="rounded-xl px-4 py-3 flex gap-2" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <span className="shrink-0">⚠️</span>
                    <p className="text-xs text-red-200">{result.commonMistakes}</p>
                  </div>
                )}
                {result.memoryTip && (
                  <div className="rounded-xl px-4 py-3 flex gap-2" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                    <span className="shrink-0">💡</span>
                    <p className="text-xs text-yellow-200">{result.memoryTip}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
