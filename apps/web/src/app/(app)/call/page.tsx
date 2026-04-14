"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CHAT_SCENARIOS } from "@ai-lang/shared";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en: "en-US", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
  fr: "fr-FR", es: "es-ES", de: "de-DE", vi: "vi-VN",
};

type CallState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended";

type Turn = {
  role: "user" | "ai";
  text: string;
  translation?: string;
  correction?: string;
};

export default function VoiceCallPage() {
  const { settings, incrementMessages, checkAchievements } = useAppStore();

  const [callState, setCallState] = useState<CallState>("idle");
  const [persona, setPersona] = useState(CHAT_SCENARIOS[1]); // native speaker default
  const [turns, setTurns] = useState<Turn[]>([]);
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [lastCorrection, setLastCorrection] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const timerRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);
  const callStateRef = useRef<CallState>("idle");
  const mutedRef = useRef(false);

  // keep refs in sync
  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  // Duration timer
  useEffect(() => {
    if (callState !== "idle" && callState !== "ended" && callState !== "connecting") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── TTS ──────────────────────────────────────────────────────────────────────
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (speakerOff || typeof window === "undefined") { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    u.rate = settings.speechRate ?? 0.95;
    u.pitch = 1.05;
    isSpeakingRef.current = true;
    u.onend = () => { isSpeakingRef.current = false; onEnd?.(); };
    u.onerror = () => { isSpeakingRef.current = false; onEnd?.(); };
    window.speechSynthesis.speak(u);
  }, [settings, speakerOff]);

  // ── STT ──────────────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (mutedRef.current || callStateRef.current === "thinking" || callStateRef.current === "speaking") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      if (!transcript) { startListening(); return; }
      setCallState("thinking");
      setTurns(prev => [...prev, { role: "user", text: transcript }]);
      historyRef.current.push({ role: "user", content: transcript });
      await getAIReply(transcript);
    };

    rec.onerror = (e: any) => {
      if (e.error === "no-speech" && callStateRef.current === "listening") {
        startListening(); // restart if no speech detected
      }
    };

    rec.onend = () => {
      if (callStateRef.current === "listening") startListening();
    };

    recRef.current = rec;
    rec.start();
    setCallState("listening");
  }, [settings.targetLanguage.code]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    setVolume(0);
  }, []);

  // ── Volume visualizer ────────────────────────────────────────────────────────
  const startVisualizer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const tick = () => {
        if (callStateRef.current === "ended") return;
        const d = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        setVolume(d.reduce((a: number, b: number) => a + b, 0) / d.length);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic denied */ }
  }, []);

  // ── AI reply ─────────────────────────────────────────────────────────────────
  const getAIReply = useCallback(async (transcript: string) => {
    try {
      const res = await fetch("/api/voice-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          history: historyRef.current.slice(-6),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          persona: persona.persona,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I see, tell me more.";

      historyRef.current.push({ role: "assistant", content: reply });
      setTurns(prev => [...prev, { role: "ai", text: reply, translation: data.translation, correction: data.correction }]);
      if (data.correction) setLastCorrection(data.correction);
      incrementMessages();
      checkAchievements();

      setCallState("speaking");
      speak(reply, () => {
        if (callStateRef.current !== "ended") {
          setCallState("listening");
          startListening();
        }
      });
    } catch {
      setCallState("listening");
      startListening();
    }
  }, [settings, persona, speak, startListening, incrementMessages, checkAchievements]);

  // ── Start / End call ─────────────────────────────────────────────────────────
  const startCall = useCallback(async () => {
    setCallState("connecting");
    setTurns([]);
    setDuration(0);
    setLastCorrection(null);
    historyRef.current = [];

    await startVisualizer();

    // AI speaks first
    setTimeout(() => {
      const greetings: Record<string, string> = {
        native: "Hey! How's it going?",
        interviewer: "Hello, thank you for joining the call today. Can you start by telling me a bit about yourself?",
        tutor: "Hi there! Ready to practice? Just start talking and I'll help you along the way.",
        friend: "Hey hey! What's up? Long time no talk!",
        customer: "Thank you for calling. How can I help you today?",
      };
      const greeting = greetings[persona.persona] ?? greetings.native;
      setTurns([{ role: "ai", text: greeting }]);
      historyRef.current.push({ role: "assistant", content: greeting });
      setCallState("speaking");
      speak(greeting, () => {
        setCallState("listening");
        startListening();
      });
    }, 800);
  }, [startVisualizer, speak, startListening, persona]);

  const endCall = useCallback(() => {
    window.speechSynthesis.cancel();
    stopListening();
    setCallState("ended");
    isSpeakingRef.current = false;
  }, [stopListening]);

  // cleanup on unmount
  useEffect(() => () => {
    window.speechSynthesis.cancel();
    stopListening();
    clearInterval(timerRef.current);
  }, [stopListening]);

  const ringScale = callState === "listening" ? 1 + (volume / 255) * 1.5 : 1;
  const isActive = callState !== "idle" && callState !== "ended";

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen" style={{ background: "#0f0a1e" }}>

      {/* Header */}
      <div className="px-5 pt-10 pb-4 text-center shrink-0">
        <h1 className="text-lg font-bold text-white">Voice Call</h1>
        <p className="text-xs text-gray-500 mt-0.5">Nói chuyện thật — AI trả lời ngay</p>
      </div>

      {/* Call UI */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-5">

        {/* Avatar + status */}
        <div className="flex flex-col items-center gap-3">
          {/* Animated rings */}
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            {isActive && (
              <>
                <div className={cn("absolute rounded-full transition-all duration-100",
                  callState === "listening" ? "bg-green-500/15" : callState === "speaking" ? "bg-primary-500/15 animate-pulse" : "bg-gray-500/10")}
                  style={{ width: 120 * ringScale, height: 120 * ringScale }} />
                <div className={cn("absolute rounded-full transition-all duration-150",
                  callState === "listening" ? "bg-green-500/08" : callState === "speaking" ? "bg-primary-500/08 animate-pulse" : "bg-gray-500/05")}
                  style={{ width: 150 * ringScale, height: 150 * ringScale }} />
              </>
            )}
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-300 shadow-2xl",
              callState === "idle" || callState === "ended" ? "bg-gray-800" :
              callState === "connecting" ? "bg-gray-700 animate-pulse" :
              callState === "listening" ? "bg-green-900/60 ring-4 ring-green-500/40" :
              callState === "thinking" ? "bg-yellow-900/60 ring-4 ring-yellow-500/40" :
              "bg-primary-900/60 ring-4 ring-primary-500/40"
            )}>
              {persona.emoji}
            </div>
          </div>

          <div className="text-center">
            <p className="text-white font-bold text-xl">{persona.label}</p>
            <p className="text-gray-400 text-sm mt-0.5">
              {callState === "idle" ? `${settings.targetLanguage.flag} ${settings.targetLanguage.name} · ${settings.level}` :
               callState === "connecting" ? "Đang kết nối..." :
               callState === "listening" ? "🎤 Đang nghe bạn..." :
               callState === "thinking" ? "💭 AI đang suy nghĩ..." :
               callState === "speaking" ? "🔊 AI đang nói..." :
               `Cuộc gọi kết thúc · ${formatDuration(duration)}`}
            </p>
            {isActive && <p className="text-gray-600 text-xs mt-1 font-mono">{formatDuration(duration)}</p>}
          </div>
        </div>

        {/* Correction badge */}
        {lastCorrection && isActive && (
          <div className="w-full max-w-sm rounded-2xl px-4 py-2.5 flex items-start gap-2"
            style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)" }}>
            <span className="text-yellow-400 text-sm shrink-0">✏️</span>
            <p className="text-yellow-200 text-xs leading-relaxed">{lastCorrection}</p>
          </div>
        )}

        {/* Transcript scroll */}
        {turns.length > 0 && (
          <div className="w-full max-w-sm max-h-40 overflow-y-auto scrollbar-hide flex flex-col gap-2">
            {turns.slice(-4).map((t, i) => (
              <div key={i} className={cn("flex gap-2", t.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed",
                  t.role === "user"
                    ? "bg-primary-600/40 text-white rounded-tr-sm"
                    : "bg-gray-800/80 text-gray-200 rounded-tl-sm")}>
                  {t.text}
                  {t.translation && <p className="text-gray-500 text-xs mt-0.5 italic">{t.translation}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 pb-10 shrink-0">
        {callState === "idle" || callState === "ended" ? (
          <div className="flex flex-col gap-4">
            {/* Persona picker */}
            <button onClick={() => setShowPersonaPicker(!showPersonaPicker)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-colors"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{persona.emoji}</span>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{persona.label}</p>
                  <p className="text-gray-500 text-xs">{persona.desc}</p>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showPersonaPicker && "rotate-180")} />
            </button>

            {showPersonaPicker && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
                {CHAT_SCENARIOS.map(s => (
                  <button key={s.id} onClick={() => { setPersona(s); setShowPersonaPicker(false); }}
                    className={cn("w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-white/5 last:border-0",
                      persona.id === s.id ? "bg-primary-900/30" : "hover:bg-white/5")}>
                    <span className="text-xl">{s.emoji}</span>
                    <div>
                      <p className={cn("text-sm font-medium", persona.id === s.id ? "text-white" : "text-gray-300")}>{s.label}</p>
                      <p className="text-xs text-gray-500">{s.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Start call button */}
            <button onClick={startCall}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-bold text-lg transition-all shadow-2xl"
              style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 8px 32px rgba(22,163,74,0.4)" }}>
              <Phone className="w-6 h-6 text-white" />
              <span className="text-white">Bắt đầu cuộc gọi</span>
            </button>

            {callState === "ended" && turns.length > 0 && (
              <p className="text-center text-gray-500 text-sm">
                {turns.filter(t => t.role === "user").length} lượt nói · {formatDuration(duration)}
              </p>
            )}
          </div>
        ) : (
          /* In-call controls */
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-6">
              {/* Mute */}
              <button onClick={() => setMuted(!muted)}
                className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  muted ? "bg-red-600/30 ring-2 ring-red-500/50" : "bg-gray-800 hover:bg-gray-700")}>
                {muted ? <MicOff className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-gray-300" />}
              </button>

              {/* End call */}
              <button onClick={endCall}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow: "0 8px 32px rgba(220,38,38,0.5)" }}>
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              {/* Speaker */}
              <button onClick={() => setSpeakerOff(!speakerOff)}
                className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  speakerOff ? "bg-gray-600/30 ring-2 ring-gray-500/50" : "bg-gray-800 hover:bg-gray-700")}>
                {speakerOff ? <VolumeX className="w-6 h-6 text-gray-500" /> : <Volume2 className="w-6 h-6 text-gray-300" />}
              </button>
            </div>

            <p className="text-center text-xs text-gray-600">
              {muted ? "🔇 Mic đang tắt" : callState === "listening" ? "Nói đi, AI đang nghe..." : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
