"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import ChatMessage from "@/components/ChatMessage";
import { speakText } from "@/components/VoiceButton";
import PronunciationScore from "@/components/PronunciationScore";
import { Trash2, Plus, Volume2, Mic, MicOff, Send, Keyboard } from "lucide-react";
import type { Message } from "@ai-lang/shared";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en:"en-US", ja:"ja-JP", ko:"ko-KR", zh:"zh-CN",
  fr:"fr-FR", es:"es-ES", de:"de-DE", vi:"vi-VN"
};

export default function ChatPage() {
  const { messages, addMessage, clearMessages, settings, isLoading, setLoading, addFlashcard } =
    useAppStore();
  const [input, setInput] = useState("");
  const [newWords, setNewWords] = useState<string[]>([]);
  const [lastVoice, setLastVoice] = useState<{ transcript: string; confidence: number } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const messagesRef = useRef(messages);
  const settingsRef = useRef(settings);
  const isLoadingRef = useRef(isLoading);
  // keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { isLoadingRef.current = isLoading; }, [isLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- stopListening (defined first so startListening can reference it) ---
  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    setIsListening(false);
    setVolume(0);
  }, []);

  // --- startListening ---
  const startListening = useCallback(async () => {
    if (isLoadingRef.current) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }

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

  // ref so sendMessage can call startListening without circular dep
  const sendMessageRef = useRef<(text?: string) => void>(() => {});

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoadingRef.current) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messagesRef.current, userMsg].map((m) => ({ role: m.role, content: m.content })),
          targetLanguage: settingsRef.current.targetLanguage.name,
          nativeLanguage: settingsRef.current.nativeLanguage.name,
          level: settingsRef.current.level,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Sorry, I couldn't respond.";
      addMessage({
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply,
        translation: data.translation || undefined,
        correction: data.correction || undefined,
        timestamp: new Date(),
      });
      if (data.newWords?.length) setNewWords(data.newWords);
      speakText(reply, settingsRef.current.targetLanguage.code);
      setIsSpeaking(true);
      // poll until TTS done → auto restart mic
      const checkEnd = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsSpeaking(false);
          clearInterval(checkEnd);
          setTimeout(() => startListening(), 600);
        }
      }, 300);
    } catch {
      addMessage({ id: (Date.now() + 1).toString(), role: "assistant", content: "Connection error.", timestamp: new Date() });
    } finally {
      setLoading(false);
    }
  }, [addMessage, setLoading, startListening, input]);

  // keep ref updated
  useEffect(() => { sendMessageRef.current = sendMessage; }, [sendMessage]);

  const toggleMic = () => isListening ? stopListening() : startListening();

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const saveFlashcard = async (word: string) => {
    const res = await fetch("/api/flashcard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name }),
    });
    const data = await res.json();
    addFlashcard({ id: Date.now().toString(), word: data.word, translation: data.translation, example: data.example, language: settings.targetLanguage.code });
    setNewWords((prev) => prev.filter((w) => w !== word));
  };

  const ringScale = isListening ? 1 + (volume / 255) * 1.2 : 1;

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div>
          <h1 className="font-semibold text-white">{settings.targetLanguage.flag} {settings.targetLanguage.name} Conversation</h1>
          <p className="text-xs text-gray-500">Level: {settings.level}</p>
        </div>
        <button onClick={clearMessages} className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-800 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="text-6xl">{settings.targetLanguage.flag}</div>
            <p className="text-gray-400 text-sm max-w-xs">Tap the mic and start speaking in {settings.targetLanguage.name}</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className="group relative">
            <ChatMessage message={m} />
            {m.role === "assistant" && (
              <button onClick={() => speakText(m.content, settings.targetLanguage.code)}
                className="absolute top-1 right-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-500 hover:text-blue-400 transition-all">
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-accent-600 flex items-center justify-center text-sm font-bold">AI</div>
            <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Pronunciation score */}
      {lastVoice && (
        <div className="px-6 py-2 border-t border-gray-800">
          <PronunciationScore confidence={lastVoice.confidence} transcript={lastVoice.transcript} />
        </div>
      )}

      {/* New words */}
      {newWords.length > 0 && (
        <div className="px-6 py-2 flex gap-2 flex-wrap border-t border-gray-800">
          <span className="text-xs text-gray-500 self-center">Save words:</span>
          {newWords.map((w) => (
            <button key={w} onClick={() => saveFlashcard(w)}
              className="flex items-center gap-1 text-xs bg-accent-600/20 border border-accent-500/30 text-accent-300 px-2 py-1 rounded-full hover:bg-accent-600/40 transition-colors">
              <Plus className="w-3 h-3" /> {w}
            </button>
          ))}
        </div>
      )}

      {/* Bottom voice area */}
      <div className="border-t border-gray-800 bg-gray-950 pb-6 pt-4 flex flex-col items-center gap-3">
        {showKeyboard && (
          <div className="flex gap-2 w-full px-6">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Type in ${settings.targetLanguage.name}...`}
              autoFocus
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button onClick={() => sendMessage()} disabled={isLoading || !input.trim()}
              className={cn("p-2.5 rounded-xl transition-colors", isLoading || !input.trim() ? "bg-gray-800 text-gray-600" : "bg-primary-600 hover:bg-primary-700 text-white")}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Big mic / stop button */}
        <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
          {isListening && (
            <>
              <div className="absolute rounded-full bg-red-500/20 transition-all duration-100"
                style={{ width: 80 * ringScale, height: 80 * ringScale }} />
              <div className="absolute rounded-full bg-red-500/10 transition-all duration-150"
                style={{ width: 100 * ringScale, height: 100 * ringScale }} />
            </>
          )}
          {isSpeaking && (
            <div className="absolute rounded-full bg-primary-500/20 animate-ping"
              style={{ width: 90, height: 90 }} />
          )}
          <button
            onClick={isSpeaking ? stopSpeaking : toggleMic}
            disabled={isLoading && !isSpeaking}
            className={cn(
              "relative w-20 h-20 flex items-center justify-center transition-all duration-200 shadow-2xl",
              isSpeaking
                ? "rounded-2xl bg-primary-600 hover:bg-primary-500 shadow-primary-500/40"
                : isListening
                ? "rounded-full bg-red-600 shadow-red-500/50 scale-110"
                : "rounded-full bg-primary-600 hover:bg-primary-500 shadow-primary-500/30",
              (isLoading && !isSpeaking) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSpeaking
              ? <div className="w-7 h-7 bg-white rounded-sm" />
              : isListening
              ? <MicOff className="w-8 h-8 text-white" />
              : <Mic className="w-8 h-8 text-white" />
            }
          </button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-500 w-28 text-center">
            {isLoading ? "AI is thinking..." : isSpeaking ? "Nhấn để ngắt" : isListening ? "Listening..." : "Tap to speak"}
          </span>
          <button onClick={() => setShowKeyboard(!showKeyboard)}
            className={cn("p-2 rounded-lg transition-colors", showKeyboard ? "text-primary-400 bg-primary-900/30" : "text-gray-500 hover:text-gray-300 hover:bg-gray-800")}>
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
