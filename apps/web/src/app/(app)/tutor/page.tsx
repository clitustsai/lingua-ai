"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Send, Mic, MicOff, Sparkles, Plus, Zap, BookOpen, Loader2 } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en:"en-US", ja:"ja-JP", ko:"ko-KR", zh:"zh-CN",
  fr:"fr-FR", es:"es-ES", de:"de-DE", vi:"vi-VN",
};

type TutorMsg = {
  id: string;
  role: "user" | "tutor";
  text: string;
  translation?: string;
  correction?: string;
  exercise?: string;
  exerciseType?: string;
  encouragement?: string;
};

export default function TutorPage() {
  const { settings, tutorMemory, addFlashcard, incrementMessages, incrementWords, checkAchievements } = useAppStore();
  const [msgs, setMsgs] = useState<TutorMsg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoFlashcards, setAutoFlashcards] = useState<any[]>([]);
  const [showAutoFC, setShowAutoFC] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Start with tutor greeting
  useEffect(() => {
    const greeting: TutorMsg = {
      id: "0", role: "tutor",
      text: `Hello! I'm your personal ${settings.targetLanguage.name} tutor. I'll teach you actively — asking questions, giving exercises, and testing you. Ready? Let's start! 🎓`,
      translation: `Xin chào! Tôi là gia sư ${settings.targetLanguage.name} cá nhân của bạn. Tôi sẽ dạy chủ động — đặt câu hỏi, cho bài tập và kiểm tra bạn. Sẵn sàng chưa?`,
      exercise: `First, tell me: What do you want to learn today? (Answer in ${settings.targetLanguage.name} if you can!)`,
      exerciseType: "open",
    };
    setMsgs([greeting]);
    historyRef.current = [{ role: "assistant", content: greeting.text }];
  }, []);

  const send = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    setInput("");
    const userMsg: TutorMsg = { id: Date.now().toString(), role: "user", text: content };
    setMsgs(prev => [...prev, userMsg]);
    historyRef.current.push({ role: "user", content });
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyRef.current.slice(-10),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          tutorMemory,
        }),
      });
      const data = await res.json();
      const tutorMsg: TutorMsg = {
        id: (Date.now() + 1).toString(),
        role: "tutor",
        text: data.reply || "Let me think...",
        translation: data.translation,
        correction: data.correction,
        exercise: data.exercise,
        exerciseType: data.exerciseType,
        encouragement: data.encouragement,
      };
      setMsgs(prev => [...prev, tutorMsg]);
      historyRef.current.push({ role: "assistant", content: data.reply });
      if (data.newWords?.length) incrementWords(data.newWords.length);
      incrementMessages();
      checkAchievements();
      if (settings.autoSpeak !== false) speakText(data.reply, settings.targetLanguage.code, settings.speechRate);

      // Auto-generate flashcards every 5 tutor messages
      if (historyRef.current.filter(m => m.role === "assistant").length % 5 === 0) {
        generateAutoFlashcards();
      }
    } finally { setLoading(false); }
  }, [input, loading, settings, tutorMemory]);

  const generateAutoFlashcards = async () => {
    const res = await fetch("/api/auto-flashcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: historyRef.current,
        targetLanguage: settings.targetLanguage.name,
        nativeLanguage: settings.nativeLanguage.name,
      }),
    });
    const data = await res.json();
    if (data.flashcards?.length) {
      setAutoFlashcards(data.flashcards);
      setShowAutoFC(true);
    }
  };

  const saveAllFlashcards = () => {
    autoFlashcards.forEach(f => addFlashcard({
      id: Date.now().toString() + Math.random(),
      word: f.word, translation: f.translation, example: f.example,
      language: settings.targetLanguage.code,
    }));
    setShowAutoFC(false);
    setAutoFlashcards([]);
  };

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    rec.onresult = (e: any) => { send(e.results[0][0].transcript); setIsListening(false); };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopListening = () => { recRef.current?.stop(); setIsListening(false); };

  const EXERCISE_ICONS: Record<string, string> = {
    translate: "🔄", "fill-blank": "✏️", roleplay: "🎭", "vocab-test": "📝", open: "💬",
  };

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0f0a1e" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-3 flex items-center justify-between shrink-0 border-b border-white/5">
        <div>
          <h1 className="text-white font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> AI Tutor
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Dạy chủ động · Kiểm tra · Sửa lỗi</p>
        </div>
        <button onClick={generateAutoFlashcards}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
          style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
          <BookOpen className="w-3.5 h-3.5" /> Tạo flashcard
        </button>
      </div>

      {/* Auto flashcard popup */}
      {showAutoFC && autoFlashcards.length > 0 && (
        <div className="mx-4 mt-3 rounded-2xl p-4 shrink-0"
          style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-purple-300 flex items-center gap-2">
              <Zap className="w-4 h-4" /> AI tạo {autoFlashcards.length} flashcard từ bài học
            </p>
            <button onClick={() => setShowAutoFC(false)} className="text-gray-500 text-xs hover:text-gray-300">✕</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {autoFlashcards.map((f, i) => (
              <span key={i} className="text-xs bg-purple-900/40 text-purple-200 px-2 py-1 rounded-lg border border-purple-700/30">
                {f.word} — {f.translation}
              </span>
            ))}
          </div>
          <button onClick={saveAllFlashcards}
            className="w-full py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Lưu tất cả vào Flashcard
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {msgs.map(m => (
          <div key={m.id} className={cn("flex gap-3 mb-4", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5",
              m.role === "user" ? "bg-primary-600" : "bg-yellow-600")}>
              {m.role === "user" ? "U" : "🎓"}
            </div>
            <div className={cn("flex flex-col gap-1.5 max-w-[78%]", m.role === "user" ? "items-end" : "items-start")}>
              {/* Main bubble */}
              <div className={cn("px-4 py-3 rounded-2xl text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-primary-600 text-white rounded-tr-sm"
                  : "text-gray-100 rounded-tl-sm"
                )}
                style={m.role === "tutor" ? { background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" } : {}}>
                <div className="flex items-start justify-between gap-2">
                  <span>{m.text}</span>
                  {m.role === "tutor" && (
                    <button onClick={() => speakText(m.text, settings.targetLanguage.code)}
                      className="shrink-0 p-1 text-gray-500 hover:text-primary-400 transition-colors">
                      🔊
                    </button>
                  )}
                </div>
                {m.translation && (
                  <p className="mt-2 text-xs text-gray-400 border-t border-white/10 pt-2">{m.translation}</p>
                )}
              </div>

              {/* Correction */}
              {m.correction && (
                <div className="flex gap-2 px-3 py-2 rounded-xl text-xs w-full"
                  style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
                  <span className="text-yellow-400 shrink-0">✏️</span>
                  <p className="text-yellow-200">{m.correction}</p>
                </div>
              )}

              {/* Exercise */}
              {m.exercise && (
                <div className="flex gap-2 px-3 py-2.5 rounded-xl text-xs w-full cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
                  onClick={() => setInput("")}>
                  <span className="shrink-0">{EXERCISE_ICONS[m.exerciseType ?? "open"] ?? "📝"}</span>
                  <p className="text-indigo-200 font-medium">{m.exercise}</p>
                </div>
              )}

              {/* Encouragement */}
              {m.encouragement && (
                <p className="text-xs text-green-400 px-1">✨ {m.encouragement}</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-sm">🎓</div>
            <div className="px-4 py-3 rounded-2xl flex gap-1 items-center" style={{ background: "rgba(26,16,53,0.9)" }}>
              <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
              <span className="text-xs text-gray-400 ml-1">Tutor đang soạn bài...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pt-3 pb-5 shrink-0 border-t border-white/5" style={{ background: "rgba(15,10,30,0.95)" }}>
        <div className="flex gap-2 items-end">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder={`Trả lời bằng ${settings.targetLanguage.name}...`}
            className="flex-1 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 border border-gray-700 transition-colors"
            style={{ background: "rgba(26,16,53,0.8)" }}
          />
          <button onClick={isListening ? stopListening : startListening}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0",
              isListening ? "bg-red-600 scale-110" : "bg-gray-700 hover:bg-gray-600")}>
            {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-gray-300" />}
          </button>
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
              loading || !input.trim() ? "bg-gray-800 text-gray-600" : "bg-primary-600 hover:bg-primary-500 text-white")}>
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
