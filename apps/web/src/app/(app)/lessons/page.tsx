"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CONVERSATION_TOPICS } from "@ai-lang/shared";
import { Loader2, BookOpen, ChevronDown, ChevronUp, Plus, Volume2, Star, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText } from "@/components/VoiceButton";

interface Vocab { word: string; translation: string; example: string; pronunciation?: string; }
interface DialogueLine { speaker: string; text: string; translation: string; }
interface Exercise { question: string; answer: string; type?: string; }
interface Lesson {
  title: string;
  objective: string;
  vocabulary: Vocab[];
  grammar: { rule: string; explanation: string; examples: string[] };
  dialogue: DialogueLine[];
  exercises: Exercise[];
  tips?: string[];
}

const LESSON_TOPICS = [
  { id: "travel", label: "Du lịch", emoji: "✈️", color: "#3b82f6" },
  { id: "food", label: "Ẩm thực", emoji: "🍜", color: "#f59e0b" },
  { id: "business", label: "Kinh doanh", emoji: "💼", color: "#8b5cf6" },
  { id: "shopping", label: "Mua sắm", emoji: "🛍️", color: "#ec4899" },
  { id: "health", label: "Sức khỏe", emoji: "🏥", color: "#10b981" },
  { id: "hobbies", label: "Sở thích", emoji: "🎨", color: "#f97316" },
  { id: "technology", label: "Công nghệ", emoji: "💻", color: "#06b6d4" },
  { id: "environment", label: "Môi trường", emoji: "🌿", color: "#22c55e" },
  { id: "education", label: "Giáo dục", emoji: "📚", color: "#a855f7" },
  { id: "sports", label: "Thể thao", emoji: "⚽", color: "#ef4444" },
  { id: "family", label: "Gia đình", emoji: "👨‍👩‍👧", color: "#f59e0b" },
  { id: "news", label: "Thời sự", emoji: "📰", color: "#64748b" },
];

type Tab = "vocab" | "grammar" | "dialogue" | "exercises";

export default function LessonsPage() {
  const { settings, addFlashcard, incrementLessons, checkAchievements } = useAppStore();
  const [selectedTopic, setSelectedTopic] = useState(LESSON_TOPICS[0]);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("vocab");
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);

  const generate = async () => {
    setLoading(true);
    setLesson(null);
    setShowAnswers({});
    setSavedWords(new Set());
    setCompleted(false);
    setTab("vocab");
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedTopic.label,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      setLesson(data);
    } finally {
      setLoading(false);
    }
  };

  const saveVocab = (v: Vocab) => {
    addFlashcard({ id: Date.now().toString(), word: v.word, translation: v.translation, example: v.example, language: settings.targetLanguage.code });
    setSavedWords(p => new Set([...p, v.word]));
  };

  const markComplete = () => {
    setCompleted(true);
    incrementLessons();
    checkAchievements();
  };

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: "vocab", label: "Từ vựng", emoji: "📚" },
    { id: "grammar", label: "Ngữ pháp", emoji: "📐" },
    { id: "dialogue", label: "Hội thoại", emoji: "💬" },
    { id: "exercises", label: "Bài tập", emoji: "✏️" },
  ];

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary-400" /> Bài học AI
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {settings.targetLanguage.flag} {settings.targetLanguage.name} · Cấp độ {settings.level}
        </p>
      </div>

      {/* Topic grid */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {LESSON_TOPICS.map(t => (
          <button key={t.id} onClick={() => setSelectedTopic(t)}
            className={cn("flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all",
              selectedTopic.id === t.id ? "border-primary-500 bg-primary-900/30 scale-105" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
            <span className="text-xl">{t.emoji}</span>
            <span className={cn("text-xs font-medium leading-tight text-center", selectedTopic.id === t.id ? "text-white" : "text-gray-400")}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Generate button */}
      <button onClick={generate} disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-50 mb-5"
        style={{ background: `linear-gradient(135deg, ${selectedTopic.color}, ${selectedTopic.color}cc)` }}>
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> AI đang tạo bài học...</>
          : <><Zap className="w-4 h-4" /> Tạo bài học: {selectedTopic.emoji} {selectedTopic.label}</>
        }
      </button>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang soạn bài học cho bạn...</p>
        </div>
      )}

      {/* Lesson content */}
      {lesson && !loading && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          {/* Header */}
          <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${selectedTopic.color}20, ${selectedTopic.color}10)`, border: `1px solid ${selectedTopic.color}40` }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{selectedTopic.emoji}</span>
              <h2 className="text-white font-bold text-lg">{lesson.title}</h2>
            </div>
            <p className="text-gray-400 text-sm flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" /> {lesson.objective}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-2xl" style={{ background: "rgba(15,10,30,0.6)" }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1",
                  tab === t.id ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>
                <span>{t.emoji}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* VOCAB TAB */}
          {tab === "vocab" && lesson.vocabulary?.length > 0 && (
            <div className="flex flex-col gap-2">
              {lesson.vocabulary.map((v, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                          className="text-white font-bold text-base hover:text-primary-300 transition-colors">
                          {v.word}
                        </button>
                        {v.pronunciation && <span className="text-xs text-gray-500 font-mono">{v.pronunciation}</span>}
                        <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                          className="p-1 rounded text-gray-600 hover:text-primary-400 transition-colors">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-primary-300 text-sm">{v.translation}</p>
                      {v.example && <p className="text-gray-500 text-xs mt-1 italic">&quot;{v.example}&quot;</p>}
                    </div>
                    <button onClick={() => saveVocab(v)} disabled={savedWords.has(v.word)}
                      className={cn("p-2 rounded-xl transition-colors shrink-0",
                        savedWords.has(v.word) ? "bg-green-900/30 text-green-400" : "bg-accent-600/20 hover:bg-accent-600/40 text-accent-400")}>
                      {savedWords.has(v.word) ? "✓" : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* GRAMMAR TAB */}
          {tab === "grammar" && lesson.grammar && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)" }}>
                <p className="text-yellow-400 font-bold mb-2">📐 {lesson.grammar.rule}</p>
                <p className="text-gray-300 text-sm leading-relaxed">{lesson.grammar.explanation}</p>
              </div>
              <div className="flex flex-col gap-2">
                {lesson.grammar.examples?.map((ex, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(26,16,53,0.6)" }}>
                    <button onClick={() => speakText(ex, settings.targetLanguage.code)}
                      className="p-1.5 rounded-lg text-gray-600 hover:text-primary-400 transition-colors shrink-0">
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-gray-200 text-sm">{ex}</span>
                  </div>
                ))}
              </div>
              {lesson.tips && lesson.tips.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <p className="text-primary-400 font-semibold text-sm mb-2">💡 Mẹo học</p>
                  {lesson.tips.map((tip, i) => <p key={i} className="text-gray-300 text-sm">{tip}</p>)}
                </div>
              )}
            </div>
          )}

          {/* DIALOGUE TAB */}
          {tab === "dialogue" && lesson.dialogue?.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500 text-center">Nhấn vào bong bóng để nghe phát âm</p>
              {lesson.dialogue.map((line, i) => (
                <div key={i} className={cn("flex gap-3", line.speaker === "B" && "flex-row-reverse")}>
                  <div className={cn("w-8 h-8 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5",
                    line.speaker === "A" ? "bg-primary-600" : "bg-accent-600")}>
                    {line.speaker}
                  </div>
                  <div className={cn("max-w-[78%]", line.speaker === "B" && "items-end flex flex-col")}>
                    <button onClick={() => speakText(line.text, settings.targetLanguage.code)}
                      className={cn("px-4 py-2.5 rounded-2xl text-sm text-left hover:opacity-80 transition-opacity shadow-md",
                        line.speaker === "A" ? "bg-gray-800 text-white rounded-tl-sm" : "bg-primary-600/40 text-white rounded-tr-sm")}>
                      {line.text}
                    </button>
                    <p className="text-xs text-gray-500 mt-1 px-1 italic">{line.translation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EXERCISES TAB */}
          {tab === "exercises" && lesson.exercises?.length > 0 && (
            <div className="flex flex-col gap-3">
              {lesson.exercises.map((ex, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <p className="text-white text-sm font-medium mb-3">{i + 1}. {ex.question}</p>
                  <button onClick={() => setShowAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                    className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    {showAnswers[i] ? <><ChevronUp className="w-3.5 h-3.5" /> Ẩn đáp án</> : <><ChevronDown className="w-3.5 h-3.5" /> Xem đáp án</>}
                  </button>
                  {showAnswers[i] && (
                    <div className="mt-2 pl-3 border-l-2 border-green-500">
                      <p className="text-green-300 text-sm">{ex.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Complete button */}
          <div className="mt-2">
            {!completed ? (
              <button onClick={markComplete}
                className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                <Star className="w-5 h-5" /> Hoàn thành bài học (+XP)
              </button>
            ) : (
              <div className="w-full py-3 rounded-2xl text-center font-semibold"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", color: "#4ade80" }}>
                ✅ Đã hoàn thành! Tuyệt vời!
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
