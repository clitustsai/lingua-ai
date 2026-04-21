"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, BookOpen, Volume2, Plus, Eye, EyeOff, Sparkles, RefreshCw, Bookmark, BookmarkCheck, CheckCircle2 } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import { TOPIC_SUGGESTIONS } from "@/lib/readingLessons";

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
type Level = typeof LEVELS[number];

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-green-900/40 text-green-300 border-green-700/40",
  A2: "bg-blue-900/40 text-blue-300 border-blue-700/40",
  B1: "bg-yellow-900/40 text-yellow-300 border-yellow-700/40",
  B2: "bg-orange-900/40 text-orange-300 border-orange-700/40",
  C1: "bg-red-900/40 text-red-300 border-red-700/40",
  C2: "bg-pink-900/40 text-pink-300 border-pink-700/40",
};

const OPT_LABELS = ["A", "B", "C", "D"];

export default function ReadingPage() {
  const { settings, addFlashcard, incrementLessons, checkAchievements, canAccessLevel } = useAppStore() as any;
  const [level, setLevel] = useState<Level>((settings.level as Level) || "A1");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [bookmarked, setBookmarked] = useState<Set<number>>(new Set());
  const [completed, setCompleted] = useState(false);

  const suggestions = TOPIC_SUGGESTIONS[level] ?? TOPIC_SUGGESTIONS.A1;

  const generate = async (topicOverride?: string) => {
    const topic = topicOverride ?? customTopic ?? selectedTopic ?? suggestions[0].topic;
    setLoading(true); setData(null); setShowTranslation(false);
    setAnswers({}); setChecked(false); setBookmarked(new Set()); setCompleted(false);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name, level }),
      });
      setData(await res.json());
    } catch {
      setData({ error: "Không thể tạo bài. Thử lại nhé!" });
    } finally { setLoading(false); }
  };

  const toggleBookmark = (i: number) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const score = checked && data?.questions
    ? data.questions.filter((q: any, i: number) => answers[i] === q.correct).length
    : 0;

  const activeTopic = customTopic || selectedTopic;

  return (
    <div className="p-5 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Đọc hiểu
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI tạo bài đọc trắc nghiệm theo trình độ</p>
      </div>

      {/* Controls */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {LEVELS.map(l => {
          const locked = !canAccessLevel(l);
          return (
            <button key={l} onClick={() => !locked && setLevel(l)} disabled={locked}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                locked ? "bg-white/3 text-gray-600 border-white/5 cursor-not-allowed opacity-40" :
                level === l ? LEVEL_COLOR[l] : "bg-white/4 text-gray-500 border-white/8 hover:text-white")}>
              {locked ? "🔒" : ""}{l}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {suggestions.map((s: any) => (
          <button key={s.topic} onClick={() => { setSelectedTopic(s.topic); setCustomTopic(""); }}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
              selectedTopic === s.topic ? "border-purple-500 bg-purple-900/30 text-white" : "border-white/8 bg-white/4 text-gray-400 hover:text-white hover:border-white/20")}>
            <span>{s.emoji}</span> {s.topic}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
          placeholder="Hoặc nhập chủ đề tùy chỉnh..."
          className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-purple-500/60 transition-all"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onKeyDown={e => e.key === "Enter" && !loading && generate()} />
        <button onClick={() => generate()} disabled={loading || !activeTopic}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Đang tạo..." : "Tạo bài"}
        </button>
      </div>

      {loading && (
        <div className="flex flex-col items-center py-16 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" /><div className="ai-typing-dot" /><div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang soạn bài đọc...</p>
        </div>
      )}

      {data?.error && (
        <div className="rounded-2xl p-4 text-center text-red-400 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {data.error}
        </div>
      )}

      {data && !data.error && !loading && (
        <div className="flex flex-col gap-4">
          {/* 2-column layout: passage left, questions right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
            {/* LEFT: Passage */}
            <div className="rounded-2xl p-5 sticky top-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">{data.title}</h2>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border mt-1 inline-block", LEVEL_COLOR[level])}>{level}</span>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => speakText(data.passage, settings.targetLanguage.code)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setShowTranslation(!showTranslation)}
                    className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => generate()}
                    className="p-2 rounded-xl text-gray-400 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.06)" }}>
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{data.passage}</p>
              {showTranslation && data.translation && (
                <p className="text-gray-400 text-sm leading-relaxed mt-4 pt-4 border-t border-white/8 italic">{data.translation}</p>
              )}

              {/* Vocabulary */}
              {data.vocabulary?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/8">
                  <p className="text-xs font-semibold text-purple-400 mb-2">📚 Từ vựng</p>
                  <div className="flex flex-col gap-1.5">
                    {data.vocabulary.map((v: any, i: number) => (
                      <div key={i} className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                            className="font-semibold text-white hover:text-purple-300 text-xs transition-colors">
                            {v.word}
                          </button>
                          <span className="text-gray-500 text-xs ml-1.5">— {v.translation}</span>
                        </div>
                        <button onClick={() => addFlashcard({ id: Date.now().toString() + i, word: v.word, translation: v.translation, example: v.example, language: settings.targetLanguage.code })}
                          className="shrink-0 p-1 rounded-lg text-purple-400 hover:text-white transition-colors"
                          style={{ background: "rgba(139,92,246,0.15)" }}>
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Questions */}
            <div className="flex flex-col gap-3">
              {data.questions?.map((q: any, i: number) => {
                const picked = answers[i];
                const isCorrect = picked === q.correct;
                return (
                  <div key={i} className="rounded-2xl p-4"
                    style={{ background: "rgba(20,12,40,0.95)", border: `1px solid ${checked ? (isCorrect ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)") : "rgba(139,92,246,0.15)"}` }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="text-sm text-white font-medium leading-snug">
                        <span className="text-gray-500 mr-1.5">Câu {i + 1}</span>{q.question}
                      </p>
                      <button onClick={() => toggleBookmark(i)}
                        className={cn("shrink-0 p-1 rounded transition-colors", bookmarked.has(i) ? "text-yellow-400" : "text-gray-600 hover:text-gray-400")}>
                        {bookmarked.has(i) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex flex-col gap-2">
                      {q.options?.map((opt: string, oi: number) => {
                        const isPicked = picked === oi;
                        const isRight = oi === q.correct;
                        return (
                          <button key={oi} onClick={() => !checked && setAnswers(p => ({ ...p, [i]: oi }))}
                            disabled={checked}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-sm transition-all",
                              checked
                                ? isRight ? "border-green-500 bg-green-900/20 text-green-300"
                                  : isPicked ? "border-red-500 bg-red-900/20 text-red-300"
                                  : "border-white/5 bg-white/2 text-gray-600 opacity-50"
                                : isPicked ? "border-purple-500 bg-purple-900/30 text-white"
                                : "border-white/8 bg-white/3 text-gray-300 hover:border-purple-400 hover:text-white"
                            )}>
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              checked
                                ? isRight ? "bg-green-600 text-white"
                                  : isPicked ? "bg-red-600 text-white"
                                  : "bg-gray-800 text-gray-500"
                                : isPicked ? "bg-purple-600 text-white" : "bg-gray-800 text-gray-400"
                            )}>
                              {OPT_LABELS[oi]}
                            </span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {checked && q.explanation && (
                      <div className={cn("mt-3 px-3 py-2 rounded-xl text-xs",
                        isCorrect ? "bg-green-900/20 text-green-300" : "bg-yellow-900/20 text-yellow-300")}>
                        💡 {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Submit / Score */}
              {data.questions?.length > 0 && !checked && (
                <button
                  onClick={() => setChecked(true)}
                  disabled={Object.keys(answers).length < data.questions.length}
                  className="w-full py-3 rounded-2xl font-bold text-white text-sm transition-all disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                  Kiểm tra đáp án ({Object.keys(answers).length}/{data.questions.length} câu)
                </button>
              )}

              {checked && (
                <div className="rounded-2xl p-4 text-center"
                  style={{ background: score >= data.questions.length * 0.8 ? "rgba(34,197,94,0.1)" : "rgba(234,179,8,0.1)", border: `1px solid ${score >= data.questions.length * 0.8 ? "rgba(34,197,94,0.3)" : "rgba(234,179,8,0.3)"}` }}>
                  <p className={cn("text-2xl font-black mb-1", score >= data.questions.length * 0.8 ? "text-green-400" : "text-yellow-400")}>
                    {score}/{data.questions.length}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {score === data.questions.length ? "🎉 Hoàn hảo!" : score >= data.questions.length * 0.8 ? "👍 Rất tốt!" : score >= data.questions.length * 0.5 ? "📖 Ôn lại đoạn văn nhé!" : "💪 Đọc lại và thử lại!"}
                  </p>
                  {!completed && (
                    <button onClick={() => { setCompleted(true); incrementLessons(); checkAchievements(); }}
                      className="mt-3 flex items-center gap-2 mx-auto px-5 py-2 rounded-xl bg-green-700/30 hover:bg-green-700/50 text-green-300 text-sm font-semibold transition-colors">
                      <CheckCircle2 className="w-4 h-4" /> Hoàn thành bài học
                    </button>
                  )}
                  <button onClick={() => generate()}
                    className="mt-2 text-xs text-gray-500 hover:text-gray-300 transition-colors block mx-auto">
                    Tạo bài mới
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
