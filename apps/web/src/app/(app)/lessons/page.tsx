"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CONVERSATION_TOPICS } from "@ai-lang/shared";
import { Loader2, BookOpen, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText } from "@/components/VoiceButton";

interface Vocab { word: string; translation: string; example: string; }
interface DialogueLine { speaker: string; text: string; translation: string; }
interface Exercise { question: string; answer: string; }
interface Lesson {
  title: string;
  objective: string;
  vocabulary: Vocab[];
  grammar: { rule: string; explanation: string; examples: string[] };
  dialogue: DialogueLine[];
  exercises: Exercise[];
}

export default function LessonsPage() {
  const { settings, addFlashcard } = useAppStore();
  const [selectedTopic, setSelectedTopic] = useState(CONVERSATION_TOPICS[1].id);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});

  const generate = async () => {
    setLoading(true);
    setLesson(null);
    setShowAnswers({});
    const topic = CONVERSATION_TOPICS.find(t => t.id === selectedTopic);
    try {
      const res = await fetch("/api/lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic?.label ?? selectedTopic,
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
    addFlashcard({
      id: Date.now().toString(),
      word: v.word,
      translation: v.translation,
      example: v.example,
      language: settings.targetLanguage.code,
    });
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Lessons</h1>
        <p className="text-sm text-gray-500 mt-1">AI-generated structured lessons for {settings.targetLanguage.flag} {settings.targetLanguage.name}</p>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        {CONVERSATION_TOPICS.filter(t => t.id !== "free").map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTopic(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm transition-colors",
              selectedTopic === t.id
                ? "border-primary-500 bg-primary-600/20 text-white"
                : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <button
        onClick={generate}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors mb-6"
      >
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><BookOpen className="w-4 h-4" /> Generate Lesson</>}
      </button>

      {lesson && (
        <div className="flex flex-col gap-5">
          <div className="bg-gray-800 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-white">{lesson.title}</h2>
            <p className="text-sm text-gray-400 mt-1">🎯 {lesson.objective}</p>
          </div>

          {/* Vocabulary */}
          {lesson.vocabulary?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-primary-400 mb-3">📚 Vocabulary</h3>
              <div className="flex flex-col gap-2">
                {lesson.vocabulary.map((v, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-gray-700 last:border-0">
                    <div>
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)} className="font-semibold text-white hover:text-primary-300 transition-colors text-left">
                        {v.word}
                      </button>
                      <span className="text-gray-400 text-sm ml-2">— {v.translation}</span>
                      <p className="text-xs text-gray-500 mt-0.5 italic">{v.example}</p>
                    </div>
                    <button onClick={() => saveVocab(v)} className="shrink-0 p-1.5 rounded-lg bg-accent-600/20 hover:bg-accent-600/40 text-accent-400 transition-colors" title="Save to flashcards">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammar */}
          {lesson.grammar && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-yellow-400 mb-2">📐 Grammar: {lesson.grammar.rule}</h3>
              <p className="text-sm text-gray-300 mb-3">{lesson.grammar.explanation}</p>
              <div className="flex flex-col gap-1.5">
                {lesson.grammar.examples?.map((ex, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-primary-500 text-xs">▸</span>
                    <button onClick={() => speakText(ex, settings.targetLanguage.code)} className="text-sm text-gray-200 hover:text-primary-300 transition-colors text-left">
                      {ex}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dialogue */}
          {lesson.dialogue?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-green-400 mb-3">💬 Dialogue</h3>
              <div className="flex flex-col gap-3">
                {lesson.dialogue.map((line, i) => (
                  <div key={i} className={cn("flex gap-3", line.speaker === "B" && "flex-row-reverse")}>
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                      line.speaker === "A" ? "bg-primary-600" : "bg-accent-600")}>
                      {line.speaker}
                    </div>
                    <div className={cn("max-w-[75%]", line.speaker === "B" && "items-end flex flex-col")}>
                      <button
                        onClick={() => speakText(line.text, settings.targetLanguage.code)}
                        className={cn("px-3 py-2 rounded-xl text-sm text-left hover:opacity-80 transition-opacity",
                          line.speaker === "A" ? "bg-gray-700 text-white" : "bg-primary-600/30 text-white")}
                      >
                        {line.text}
                      </button>
                      <p className="text-xs text-gray-500 mt-0.5 px-1">{line.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          {lesson.exercises?.length > 0 && (
            <div className="bg-gray-800 rounded-2xl p-5">
              <h3 className="text-sm font-semibold text-orange-400 mb-3">✏️ Exercises</h3>
              <div className="flex flex-col gap-3">
                {lesson.exercises.map((ex, i) => (
                  <div key={i} className="border border-gray-700 rounded-xl p-3">
                    <p className="text-sm text-gray-200 mb-2">{i + 1}. {ex.question}</p>
                    <button
                      onClick={() => setShowAnswers(prev => ({ ...prev, [i]: !prev[i] }))}
                      className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      {showAnswers[i] ? <><ChevronUp className="w-3 h-3" /> Hide answer</> : <><ChevronDown className="w-3 h-3" /> Show answer</>}
                    </button>
                    {showAnswers[i] && (
                      <p className="text-sm text-green-300 mt-2 pl-2 border-l-2 border-green-600">{ex.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
