"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { CONVERSATION_TOPICS } from "@ai-lang/shared";
import { Loader2, BookOpen, Volume2, Plus, ChevronDown, ChevronUp, Eye, EyeOff, Lock, Crown, Sparkles } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import { READING_LESSONS } from "@/lib/readingLessons";
import type { ReadingLesson } from "@/lib/readingLessons";

interface ReadingData {
  title: string;
  passage: string;
  translation: string;
  vocabulary: { word: string; translation: string; example: string }[];
  questions: { question: string; answer: string; type?: string }[];
}

const EXTRA_TOPICS = [
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "history", label: "History", emoji: "📜" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "technology", label: "Technology", emoji: "💻" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "environment", label: "Environment", emoji: "🌍" },
  { id: "education", label: "Education", emoji: "🎓" },
];

const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;
type Level = typeof LEVELS[number];

const LEVEL_COLOR: Record<string, string> = {
  A1: "text-green-400 bg-green-900/30", A2: "text-blue-400 bg-blue-900/30",
  B1: "text-yellow-400 bg-yellow-900/30", B2: "text-orange-400 bg-orange-900/30",
  C1: "text-red-400 bg-red-900/30",
};

export default function ReadingPage() {
  const { settings, addFlashcard, incrementLessons, checkAchievements } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [topic, setTopic] = useState(CONVERSATION_TOPICS[1].id);
  const [level, setLevel] = useState<Level>((settings.level as Level) || "B1");
  const [data, setData] = useState<ReadingData | null>(null);
  const [activeLesson, setActiveLesson] = useState<ReadingLesson | null>(null);
  const [view, setView] = useState<"list" | "ai">("list");
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);

  const allTopics = [
    ...CONVERSATION_TOPICS.filter(t => t.id !== "free"),
    ...EXTRA_TOPICS,
  ];

  const generate = async () => {
    setLoading(true); setData(null); setShowTranslation(false); setShowAnswers({}); setCompleted(false);
    const t = allTopics.find(x => x.id === topic);
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: t?.label ?? topic, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name, level }),
      });
      setData(await res.json());
    } finally { setLoading(false); }
  };

  const markDone = () => {
    setCompleted(true);
    incrementLessons();
    checkAchievements();
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white">Reading Practice</h1>
        <p className="text-sm text-gray-500 mt-1">Đọc bài và trả lời câu hỏi — chọn trình độ và chủ đề</p>
      </div>

      {/* View toggle */}
      <div className="flex gap-1 p-1 rounded-2xl mb-5" style={{ background: "rgba(15,10,30,0.6)" }}>
        <button onClick={() => { setView("list"); setData(null); setActiveLesson(null); }}
          className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
            view === "list" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          📚 Bài học có sẵn
        </button>
        <button onClick={() => { setView("ai"); setData(null); setActiveLesson(null); }}
          className={cn("flex-1 py-2 rounded-xl text-sm font-semibold transition-all",
            view === "ai" ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
          ✨ AI tạo bài mới
        </button>
      </div>

      {view === "list" && !activeLesson && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500">3 bài đầu miễn phí · Bài còn lại yêu cầu Premium</p>
          {READING_LESSONS.filter(l => l.passage).map((lesson, idx) => {
            const isLocked = lesson.locked && !user?.isPremium;
            return (
              <button key={lesson.id} onClick={() => {
                if (isLocked) { router.push("/premium"); return; }
                setActiveLesson(lesson);
              }}
                className={cn("flex items-center gap-4 p-4 rounded-2xl text-left transition-all",
                  isLocked ? "opacity-70 cursor-pointer" : "hover:bg-white/5")}
                style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: "rgba(139,92,246,0.15)" }}>
                  {isLocked ? "🔒" : lesson.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-white font-semibold text-sm truncate">{lesson.title}</p>
                    {isLocked && <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs px-1.5 py-0.5 rounded font-medium", LEVEL_COLOR[lesson.level])}>{lesson.level}</span>
                    <span className="text-xs text-gray-500">{lesson.topic}</span>
                  </div>
                </div>
                {isLocked ? (
                  <span className="text-xs text-yellow-400 font-medium shrink-0">Premium</span>
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-600 -rotate-90 shrink-0" />
                )}
              </button>
            );
          })}
          <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <p className="text-white font-semibold text-sm mb-1">Mở khóa tất cả bài đọc</p>
            <p className="text-gray-400 text-xs mb-3">20+ bài đọc từ A1 đến C1 + AI tạo bài không giới hạn</p>
            <button onClick={() => router.push("/premium")}
              className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              Nâng cấp Premium
            </button>
          </div>
        </div>
      )}

      {view === "list" && activeLesson && (
        <div className="flex flex-col gap-5">
          <button onClick={() => setActiveLesson(null)} className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors w-fit">
            ← Quay lại danh sách
          </button>
          <ReadingContent data={activeLesson} settings={settings} addFlashcard={addFlashcard} incrementLessons={incrementLessons} checkAchievements={checkAchievements}
            onNext={() => {
              const idx = READING_LESSONS.findIndex(l => l.id === activeLesson.id);
              const next = READING_LESSONS[idx + 1];
              if (next && (!next.locked || user?.isPremium)) setActiveLesson(next);
              else setActiveLesson(null);
            }}
          />
        </div>
      )}

      {view === "ai" && (
      <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-gray-500 shrink-0">Trình độ:</span>
        <div className="flex gap-1.5">
          {LEVELS.map(l => (
            <button key={l} onClick={() => setLevel(l)}
              className={cn("px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
                level === l ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Topic selector */}
      <div className="flex gap-2 flex-wrap mb-4">
        {allTopics.map(t => (
          <button key={t.id} onClick={() => setTopic(t.id)}
            className={cn("px-3 py-1.5 rounded-xl border text-xs transition-colors",
              topic === t.id ? "border-primary-500 bg-primary-600/20 text-white" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <button onClick={generate} disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors mb-6">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo bài...</> : <><BookOpen className="w-4 h-4" /> New Passage</>}
      </button>

      {data && (
        <div className="flex flex-col gap-5">
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-white">{data.title}</h2>
                <span className="text-xs text-primary-400 font-medium">{level} · {allTopics.find(t => t.id === topic)?.label}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => speakText(data.passage, settings.targetLanguage.code)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button>
                <button onClick={() => setShowTranslation(!showTranslation)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
                  {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{data.passage}</p>
            {showTranslation && (
              <p className="text-gray-400 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-700 italic">{data.translation}</p>
            )}
          </div>

          {data.vocabulary?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-primary-400 mb-3">📚 Key Vocabulary ({data.vocabulary.length} từ)</h3>
              <div className="flex flex-col gap-2">
                {data.vocabulary.map((v, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)} className="font-semibold text-white hover:text-primary-300 transition-colors">{v.word}</button>
                      <span className="text-gray-400 text-sm ml-2">— {v.translation}</span>
                      {v.example && <p className="text-xs text-gray-500 mt-0.5 italic">{v.example}</p>}
                    </div>
                    <button onClick={() => addFlashcard({ id: Date.now().toString(), word: v.word, translation: v.translation, example: v.example, language: settings.targetLanguage.code })}
                      className="shrink-0 p-1.5 rounded-lg bg-accent-600/20 hover:bg-accent-600/40 text-accent-400 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.questions?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-green-400 mb-3">❓ Comprehension Questions ({data.questions.length} câu)</h3>
              <div className="flex flex-col gap-3">
                {data.questions.map((q, i) => (
                  <div key={i} className="border border-gray-700 rounded-xl p-3">
                    <p className="text-sm text-gray-200 mb-2">{i + 1}. {q.question}</p>
                    <button onClick={() => setShowAnswers(p => ({ ...p, [i]: !p[i] }))}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                      {showAnswers[i] ? <><ChevronUp className="w-3 h-3" /> Ẩn</> : <><ChevronDown className="w-3 h-3" /> Xem đáp án</>}
                    </button>
                    {showAnswers[i] && <p className="text-sm text-green-300 mt-2 pl-2 border-l-2 border-green-600">{q.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {!completed ? (
            <button onClick={markDone} className="w-full py-3 bg-green-700/30 hover:bg-green-700/50 border border-green-600/40 text-green-300 rounded-xl text-sm font-medium transition-colors">
              ✅ Hoàn thành bài học
            </button>
          ) : (
            <div className="text-center py-3 text-green-400 text-sm">🎉 Xuất sắc! Bài học hoàn thành.</div>
          )}
        </div>
      )}
      </div>
      )}
    </div>
  );
}

function ReadingContent({ data, settings, addFlashcard, incrementLessons, checkAchievements, onNext }: {
  data: any; settings: any; addFlashcard: any; incrementLessons: any; checkAchievements: any; onNext?: () => void;
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  const [completed, setCompleted] = useState(false);
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-gray-800 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white">{data.title}</h2>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={() => speakText(data.passage, settings.targetLanguage.code)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
              <Volume2 className="w-4 h-4" />
            </button>
            <button onClick={() => setShowTranslation(!showTranslation)} className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors">
              {showTranslation ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{data.passage}</p>
        {showTranslation && data.translation && (
          <p className="text-gray-400 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-700 italic">{data.translation}</p>
        )}
      </div>
      {data.vocabulary?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-primary-400 mb-3">📚 Key Vocabulary ({data.vocabulary.length} words)</h3>
          <div className="flex flex-col gap-2">
            {data.vocabulary.map((v: any, i: number) => (
              <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-700 last:border-0">
                <div>
                  <button onClick={() => speakText(v.word, settings.targetLanguage.code)} className="font-semibold text-white hover:text-primary-300 transition-colors">{v.word}</button>
                  <span className="text-gray-400 text-sm ml-2">— {v.translation}</span>
                  {v.example && <p className="text-xs text-gray-500 mt-0.5 italic">{v.example}</p>}
                </div>
                <button onClick={() => addFlashcard({ id: Date.now().toString(), word: v.word, translation: v.translation, example: v.example, language: settings.targetLanguage.code })}
                  className="shrink-0 p-1.5 rounded-lg bg-accent-600/20 hover:bg-accent-600/40 text-accent-400 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {data.questions?.length > 0 && (
        <div className="bg-gray-800 rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-green-400 mb-3">❓ Questions ({data.questions.length})</h3>
          <div className="flex flex-col gap-3">
            {data.questions.map((q: any, i: number) => (
              <div key={i} className="border border-gray-700 rounded-xl p-3">
                <p className="text-sm text-gray-200 mb-2">{i + 1}. {q.question}</p>
                <button onClick={() => setShowAnswers(p => ({ ...p, [i]: !p[i] }))}
                  className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                  {showAnswers[i] ? <><ChevronUp className="w-3 h-3" /> Hide</> : <><ChevronDown className="w-3 h-3" /> Show answer</>}
                </button>
                {showAnswers[i] && <p className="text-sm text-green-300 mt-2 pl-2 border-l-2 border-green-600">{q.answer}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {!completed ? (
        <button onClick={() => { setCompleted(true); incrementLessons(); checkAchievements(); }}
          className="w-full py-3 bg-green-700/30 hover:bg-green-700/50 border border-green-600/40 text-green-300 rounded-xl text-sm font-medium transition-colors">
          ✅ Mark as Completed
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="text-center py-3 text-green-400 text-sm">🎉 Great job! Lesson completed.</div>
          {onNext && (
            <button onClick={onNext}
              className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              Bài tiếp theo →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
