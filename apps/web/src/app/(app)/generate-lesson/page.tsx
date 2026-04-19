"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Sparkles, Loader2, Volume2, Copy, Check, BookOpen, Mic, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

const QUICK_TOPICS = [
  { label: "IELTS Speaking Part 1", emoji: "🎤" },
  { label: "IELTS Speaking Part 2", emoji: "🗣️" },
  { label: "IELTS Writing Task 2", emoji: "✍️" },
  { label: "TOEIC Listening", emoji: "🎧" },
  { label: "Business Email", emoji: "📧" },
  { label: "Job Interview", emoji: "💼" },
  { label: "Travel English", emoji: "✈️" },
  { label: "Daily Conversation", emoji: "💬" },
  { label: "Grammar: Present Perfect", emoji: "📐" },
  { label: "Vocabulary: Technology", emoji: "💻" },
  { label: "Pronunciation: TH sound", emoji: "🔊" },
  { label: "Phrasal Verbs", emoji: "📚" },
];

export default function GenerateLessonPage() {
  const { settings, addFlashcard } = useAppStore();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [showSection, setShowSection] = useState<Record<string, boolean>>({ questions: true, vocab: true, answers: false });
  const [copied, setCopied] = useState("");

  const generate = async (t?: string) => {
    const finalTopic = t ?? topic.trim();
    if (!finalTopic) return;
    setTopic(finalTopic);
    setLoading(true);
    setLesson(null);
    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      setLesson(await res.json());
    } finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const toggle = (key: string) => setShowSection(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> Tạo bài học tự động
        </h1>
        <p className="text-sm text-gray-400 mt-1">Nhập chủ đề → AI tạo câu hỏi, sample answer, vocab ngay</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder='Ví dụ: "IELTS Speaking Part 1", "Grammar: Past Perfect"...'
          className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none mb-3"
        />
        <button onClick={() => generate()} disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo bài học...</> : <><Sparkles className="w-4 h-4" /> Tạo bài học</>}
        </button>
      </div>

      {/* Quick topics */}
      {!lesson && !loading && (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Chủ đề phổ biến</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TOPICS.map(t => (
              <button key={t.label} onClick={() => generate(t.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/60 hover:border-primary-500 hover:bg-primary-900/20 text-left transition-all">
                <span>{t.emoji}</span>
                <span className="text-xs text-gray-300 leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang tạo bài học cho "{topic}"...</p>
        </div>
      )}

      {/* Lesson result */}
      {lesson && !loading && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          {/* Header */}
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <h2 className="text-white font-black text-lg">{lesson.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {lesson.tags?.map((tag: string) => (
                <span key={tag} className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Questions */}
          {lesson.questions?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("questions")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-pink-400" /> Câu hỏi luyện tập ({lesson.questions.length})</span>
                {showSection.questions ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.questions && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {lesson.questions.map((q: any, i: number) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(15,10,30,0.6)" }}>
                      <p className="text-white text-sm font-medium">{i + 1}. {q.question}</p>
                      {q.tip && <p className="text-gray-500 text-xs mt-1">💡 {q.tip}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sample Answers */}
          {lesson.sampleAnswers?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("answers")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-400" /> Sample Answers</span>
                {showSection.answers ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.answers && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {lesson.sampleAnswers.map((a: any, i: number) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-green-400 font-semibold">Q{i + 1}: {a.question}</p>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => speakText(a.answer, settings.targetLanguage.code)}
                            className="p-1 rounded text-gray-600 hover:text-primary-400 transition-colors">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => copy(a.answer, `ans-${i}`)}
                            className="p-1 rounded text-gray-600 hover:text-green-400 transition-colors">
                            {copied === `ans-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">{a.answer}</p>
                      {a.keyPhrases?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.keyPhrases.map((p: string) => (
                            <span key={p} className="text-xs bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vocabulary */}
          {lesson.vocabulary?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("vocab")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Từ vựng quan trọng ({lesson.vocabulary.length})</span>
                {showSection.vocab ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.vocab && (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {lesson.vocabulary.map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(15,10,30,0.6)" }}>
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                        className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-primary-400 shrink-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{v.word}</p>
                        {v.example && <p className="text-gray-600 text-xs italic">"{v.example}"</p>}
                      </div>
                      <p className="text-primary-300 text-sm shrink-0">{v.meaning}</p>
                      <button onClick={() => addFlashcard({ id: Date.now().toString() + i, word: v.word, translation: v.meaning, example: v.example ?? "", language: settings.targetLanguage.code })}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-accent-400 transition-colors shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grammar tips */}
          {lesson.grammarTips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-3">📐 Ngữ pháp cần nhớ</p>
              {lesson.grammarTips.map((tip: string, i: number) => (
                <p key={i} className="text-gray-300 text-sm mb-1.5">• {tip}</p>
              ))}
            </div>
          )}

          <button onClick={() => { setLesson(null); setTopic(""); }}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm transition-colors hover:border-gray-600">
            Tạo bài học khác
          </button>
        </div>
      )}
    </div>
  );
}
