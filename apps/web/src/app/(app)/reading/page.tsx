"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, BookOpen, Volume2, Plus, ChevronDown, ChevronUp, Eye, EyeOff, Sparkles, RefreshCw } from "lucide-react";
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

export default function ReadingPage() {
  const { settings, addFlashcard, incrementLessons, checkAchievements } = useAppStore();
  const [level, setLevel] = useState<Level>((settings.level as Level) || "A1");
  const [customTopic, setCustomTopic] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const suggestions = TOPIC_SUGGESTIONS[level] ?? TOPIC_SUGGESTIONS.A1;

  const generate = async (topicOverride?: string) => {
    const topic = topicOverride ?? customTopic ?? selectedTopic ?? suggestions[0].topic;
    setLoading(true); setData(null); setShowTranslation(false); setShowAnswers({}); setCompleted(false);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level,
        }),
      });
      const json = await res.json();
      setData(json);
    } catch {
      setData({ error: "Không thể tạo bài. Thử lại nhé!" });
    } finally { setLoading(false); }
  };

  const activeTopic = customTopic || selectedTopic;

  return (
    <div className="p-5 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" /> Đọc hiểu
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI tạo bài đọc thật theo trình độ và chủ đề bạn chọn</p>
      </div>

      {/* Level selector */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {LEVELS.map(l => (
          <button key={l} onClick={() => { setLevel(l); setSelectedTopic(""); setData(null); }}
            className={cn("px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
              level === l ? LEVEL_COLOR[l] : "bg-white/4 text-gray-500 border-white/8 hover:text-white")}>
            {l}
          </button>
        ))}
      </div>

      {/* Topic suggestions */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Chủ đề gợi ý:</p>
        <div className="flex gap-2 flex-wrap">
          {suggestions.map(s => (
            <button key={s.topic} onClick={() => { setSelectedTopic(s.topic); setCustomTopic(""); }}
              className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                selectedTopic === s.topic
                  ? "border-purple-500 bg-purple-900/30 text-white"
                  : "border-white/8 bg-white/4 text-gray-400 hover:text-white hover:border-white/20")}>
              <span>{s.emoji}</span> {s.topic}
            </button>
          ))}
        </div>
      </div>

      {/* Custom topic */}
      <div className="flex gap-2 mb-5">
        <input value={customTopic} onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(""); }}
          placeholder="Hoặc nhập chủ đề tùy chỉnh..."
          className="flex-1 rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-purple-500/60 transition-all"
          style={{ background: "rgba(255,255,255,0.05)" }}
          onKeyDown={e => e.key === "Enter" && !loading && generate()} />
        <button onClick={() => generate()} disabled={loading || (!activeTopic)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-40"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Đang tạo..." : "Tạo bài"}
        </button>
      </div>

      {/* Result */}
      {data?.error && (
        <div className="rounded-2xl p-4 text-center text-red-400 text-sm"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {data.error}
        </div>
      )}

      {data && !data.error && (
        <div className="flex flex-col gap-4">
          {/* Passage */}
          <div className="rounded-2xl p-5"
            style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{data.title}</h2>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium border mt-1 inline-block", LEVEL_COLOR[level])}>{level}</span>
              </div>
              <div className="flex gap-2 shrink-0">
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
          </div>

          {/* Vocabulary */}
          {data.vocabulary?.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <h3 className="text-sm font-semibold text-purple-400 mb-3">📚 Từ vựng ({data.vocabulary.length} từ)</h3>
              <div className="flex flex-col gap-2">
                {data.vocabulary.map((v: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                    <div className="flex-1">
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                        className="font-semibold text-white hover:text-purple-300 transition-colors text-sm">
                        {v.word}
                      </button>
                      <span className="text-gray-400 text-sm ml-2">— {v.translation}</span>
                      {v.example && <p className="text-xs text-gray-500 mt-0.5 italic">{v.example}</p>}
                    </div>
                    <button onClick={() => addFlashcard({ id: Date.now().toString() + i, word: v.word, translation: v.translation, example: v.example, language: settings.targetLanguage.code })}
                      className="shrink-0 p-1.5 rounded-lg text-purple-400 hover:text-white transition-colors"
                      style={{ background: "rgba(139,92,246,0.15)" }}>
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          {data.questions?.length > 0 && (
            <div className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <h3 className="text-sm font-semibold text-green-400 mb-3">❓ Câu hỏi ({data.questions.length} câu)</h3>
              <div className="flex flex-col gap-3">
                {data.questions.map((q: any, i: number) => (
                  <div key={i} className="rounded-xl p-3"
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <p className="text-sm text-gray-200 mb-2">{i + 1}. {q.question}</p>
                    <button onClick={() => setShowAnswers(p => ({ ...p, [i]: !p[i] }))}
                      className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors">
                      {showAnswers[i] ? <><ChevronUp className="w-3 h-3" /> Ẩn đáp án</> : <><ChevronDown className="w-3 h-3" /> Xem đáp án</>}
                    </button>
                    {showAnswers[i] && (
                      <p className="text-sm text-green-300 mt-2 pl-3 border-l-2 border-green-600">{q.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete */}
          {!completed ? (
            <button onClick={() => { setCompleted(true); incrementLessons(); checkAchievements(); }}
              className="w-full py-3 rounded-2xl font-semibold text-green-300 transition-all"
              style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)" }}>
              ✅ Hoàn thành bài học
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="text-center py-3 text-green-400 text-sm font-semibold">🎉 Xuất sắc! Bài học hoàn thành.</div>
              <button onClick={() => generate()}
                className="w-full py-3 rounded-2xl font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                ✨ Tạo bài mới
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
