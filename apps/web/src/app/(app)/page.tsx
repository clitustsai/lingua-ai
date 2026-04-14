"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import ChatMessage from "@/components/ChatMessage";
import { speakText } from "@/components/VoiceButton";
import PronunciationScore from "@/components/PronunciationScore";
import WordOfDay from "@/components/WordOfDay";
import { Trash2, Plus, Mic, MicOff, Send, Keyboard, Save, ChevronDown, X } from "lucide-react";
import { CHAT_SCENARIOS } from "@ai-lang/shared";
import type { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en:"en-US", ja:"ja-JP", ko:"ko-KR", zh:"zh-CN",
  fr:"fr-FR", es:"es-ES", de:"de-DE", vi:"vi-VN",
};

export default function ChatPage() {
  const {
    messages, addMessage, clearMessages, settings,
    isLoading, setLoading, addFlashcard,
    incrementWords, incrementMessages, saveSession, checkAchievements,
  } = useAppStore();

  const [input, setInput] = useState("");
  const [newWords, setNewWords] = useState<string[]>([]);
  const [lastVoice, setLastVoice] = useState<{ transcript: string; confidence: number } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [scenario, setScenario] = useState(CHAT_SCENARIOS[0]);
  const [showScenarioPicker, setShowScenarioPicker] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const messagesRef = useRef(messages);
  const settingsRef = useRef(settings);
  const isLoadingRef = useRef(isLoading);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    setIsListening(false);
    setVolume(0);
  }, []);

  const startListening = useCallback(async () => {
    if (isLoadingRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Dùng Chrome để nhận diện giọng nói."); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const tick = () => {
        const d = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        setVolume(d.reduce((a: number, b: number) => a + b, 0) / d.length);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic denied */ }
    const rec = new SR();
    rec.lang = LANG_MAP[settingsRef.current.targetLanguage.code] ?? "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const r = e.results[0][0];
      setLastVoice({ transcript: r.transcript, confidence: r.confidence ?? 0.8 });
      stopListening();
      sendMessageRef.current(r.transcript);
    };
    rec.onerror = () => stopListening();
    rec.onend = () => stopListening();
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [stopListening]);

  const sendMessageRef = useRef<(text?: string) => void>(() => {});

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoadingRef.current) return;
    const userMsg: Message = {
      id: Date.now().toString(), role: "user", content, timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messagesRef.current, userMsg].map(m => ({ role: m.role, content: m.content })),
          targetLanguage: settingsRef.current.targetLanguage.name,
          nativeLanguage: settingsRef.current.nativeLanguage.name,
          level: settingsRef.current.level,
          topic: settingsRef.current.conversationTopic ?? "free",
          persona: scenario.persona,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "API error");

      const reply = data.reply || "Sorry, I couldn't respond.";
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        translation: data.translation || undefined,
        correction: data.correction || undefined,
        betterWay: data.betterWay || undefined,
        suggestions: data.suggestions || [],
        timestamp: new Date(),
      });

      // Also attach betterWay to the user message (update last user msg)
      if (data.betterWay || data.correction) {
        // We re-add with extra fields by updating via store
        // Simpler: store betterWay on the assistant message and display near user bubble
      }

      if (data.newWords?.length) {
        const filtered = data.newWords.filter((w: string) => w?.trim());
        setNewWords(filtered);
        incrementWords(filtered.length);
      }
      incrementMessages();
      checkAchievements();

      if (settingsRef.current.autoSpeak !== false) {
        speakText(reply, settingsRef.current.targetLanguage.code, settingsRef.current.speechRate);
        setIsSpeaking(true);
        const checkEnd = setInterval(() => {
          if (!window.speechSynthesis.speaking) {
            setIsSpeaking(false);
            clearInterval(checkEnd);
            setTimeout(() => startListening(), 600);
          }
        }, 300);
      }
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: "Lỗi kết nối. Thử lại nhé!", timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading, startListening, input, scenario]);

  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const toggleMic = () => isListening ? stopListening() : startListening();
  const stopSpeaking = () => { window.speechSynthesis.cancel(); setIsSpeaking(false); };

  const saveFlashcard = async (word: string) => {
    const res = await fetch("/api/flashcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name }),
    });
    const data = await res.json();
    addFlashcard({ id: Date.now().toString(), word: data.word, translation: data.translation, example: data.example, language: settings.targetLanguage.code });
    setNewWords(prev => prev.filter(w => w !== word));
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const ringScale = isListening ? 1 + (volume / 255) * 1.2 : 1;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0f0a1e" }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
        {/* Scenario picker */}
        <button onClick={() => setShowScenarioPicker(!showScenarioPicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-colors hover:bg-white/5">
          <span className="text-lg">{scenario.emoji}</span>
          <div className="text-left">
            <p className="text-white font-semibold text-sm leading-none">{scenario.label}</p>
            <p className="text-gray-500 text-xs mt-0.5">{settings.targetLanguage.flag} {settings.targetLanguage.name} · {settings.level}</p>
          </div>
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showScenarioPicker && "rotate-180")} />
        </button>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button onClick={() => saveSession(`${scenario.label} - ${new Date().toLocaleDateString()}`)}
              className="p-2 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-white/5 transition-colors" title="Lưu hội thoại">
              <Save className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => { clearMessages(); setNewWords([]); setLastVoice(null); }}
            className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Scenario picker dropdown ── */}
      {showScenarioPicker && (
        <div className="px-4 py-3 border-b border-white/5 shrink-0" style={{ background: "rgba(26,16,53,0.95)" }}>
          <div className="grid grid-cols-2 gap-2">
            {CHAT_SCENARIOS.map(s => (
              <button key={s.id} onClick={() => { setScenario(s); setShowScenarioPicker(false); clearMessages(); }}
                className={cn("flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all",
                  scenario.id === s.id
                    ? "border-primary-500 bg-primary-900/30"
                    : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
                <span className="text-xl shrink-0">{s.emoji}</span>
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate", scenario.id === s.id ? "text-white" : "text-gray-300")}>{s.label}</p>
                  <p className="text-xs text-gray-500 truncate">{s.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-5 h-full justify-center">
            {/* Scenario intro card */}
            <div className="rounded-2xl p-5 text-center mx-auto max-w-sm w-full"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="text-5xl mb-3">{scenario.emoji}</div>
              <p className="text-white font-bold text-lg">{scenario.label}</p>
              <p className="text-gray-400 text-sm mt-1">{scenario.desc}</p>
              <p className="text-gray-500 text-xs mt-3">
                {settings.targetLanguage.flag} {settings.targetLanguage.name} · Level {settings.level}
              </p>
            </div>
            <div className="max-w-sm mx-auto w-full">
              <WordOfDay />
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => (
              <ChatMessage
                key={m.id}
                message={m}
                langCode={settings.targetLanguage.code}
                onSuggestionClick={
                  // only show suggestions on last assistant message
                  m.role === "assistant" && i === messages.length - 1
                    ? handleSuggestion
                    : undefined
                }
              />
            ))}
          </>
        )}

        {isLoading && (
          <div className="flex gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-xs font-bold shrink-0">AI</div>
            <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center" style={{ background: "rgba(26,16,53,0.8)" }}>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Pronunciation score ── */}
      {lastVoice && (
        <div className="px-4 py-2 border-t border-white/5 shrink-0">
          <PronunciationScore confidence={lastVoice.confidence} transcript={lastVoice.transcript} />
        </div>
      )}

      {/* ── New words ── */}
      {newWords.length > 0 && (
        <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-white/5 shrink-0">
          <span className="text-xs text-gray-500 self-center">Lưu từ:</span>
          {newWords.map(w => (
            <button key={w} onClick={() => saveFlashcard(w)}
              className="flex items-center gap-1 text-xs bg-accent-600/20 border border-accent-500/30 text-accent-300 px-2 py-1 rounded-full hover:bg-accent-600/40 transition-colors">
              <Plus className="w-3 h-3" /> {w}
            </button>
          ))}
        </div>
      )}

      {/* ── Input area ── */}
      <div className="border-t border-white/5 px-4 pt-3 pb-4 shrink-0" style={{ background: "rgba(15,10,30,0.95)" }}>
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={`Nhắn tin bằng ${settings.targetLanguage.name}...`}
            className="flex-1 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 border border-gray-700 transition-colors"
            style={{ background: "rgba(26,16,53,0.8)" }}
          />

          {/* Mic button */}
          <div className="relative flex items-center justify-center shrink-0" style={{ width: 48, height: 48 }}>
            {isListening && (
              <>
                <div className="absolute rounded-full bg-red-500/20 transition-all duration-100"
                  style={{ width: 40 * ringScale, height: 40 * ringScale }} />
                <div className="absolute rounded-full bg-red-500/10 transition-all duration-150"
                  style={{ width: 52 * ringScale, height: 52 * ringScale }} />
              </>
            )}
            {isSpeaking && (
              <div className="absolute rounded-full bg-primary-500/20 animate-ping" style={{ width: 44, height: 44 }} />
            )}
            <button
              onClick={isSpeaking ? stopSpeaking : toggleMic}
              disabled={isLoading && !isSpeaking}
              className={cn(
                "relative w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg",
                isSpeaking ? "bg-primary-600 hover:bg-primary-500"
                  : isListening ? "bg-red-600 scale-110"
                  : "bg-primary-600 hover:bg-primary-500",
                isLoading && !isSpeaking && "opacity-50 cursor-not-allowed"
              )}>
              {isSpeaking
                ? <div className="w-4 h-4 bg-white rounded-sm" />
                : isListening
                ? <MicOff className="w-5 h-5 text-white" />
                : <Mic className="w-5 h-5 text-white" />}
            </button>
          </div>

          {/* Send button */}
          <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
            className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0",
              isLoading || !input.trim() ? "bg-gray-800 text-gray-600" : "bg-primary-600 hover:bg-primary-500 text-white")}>
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 text-center mt-2">
          {isLoading ? "AI đang trả lời..." : isSpeaking ? "Đang phát âm · nhấn mic để dừng" : isListening ? "🎤 Đang nghe..." : "Nhấn mic hoặc gõ để bắt đầu"}
        </p>
      </div>
    </div>
  );
}
