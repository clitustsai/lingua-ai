"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, Camera, CameraOff, Star, AlertCircle, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en: "en-US", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
  fr: "fr-FR", es: "es-ES", de: "de-DE", vi: "vi-VN",
};

const ROLEPLAY_MODES = [
  { id: "native",      emoji: "🌍", label: "Nguoi ban xu",       desc: "Chat tu nhien nhu ban be",          persona: "native",      color: "#8b5cf6" },
  { id: "interview",   emoji: "💼", label: "Job Interview",       desc: "Luyen phong van xin viec",          persona: "interviewer", color: "#3b82f6" },
  { id: "dating",      emoji: "💕", label: "Dating Conversation", desc: "Luyen noi chuyen lam quen",         persona: "friend",      color: "#ec4899" },
  { id: "travel",      emoji: "✈️", label: "Travel English",      desc: "San bay, khach san, du lich",       persona: "customer",    color: "#10b981" },
  { id: "business",    emoji: "📊", label: "Business Meeting",    desc: "Hop, thuyet trinh, dam phan",       persona: "interviewer", color: "#f59e0b" },
  { id: "tutor",       emoji: "🎓", label: "AI Teacher",          desc: "Giao vien day ngu phap, tu vung",   persona: "tutor",       color: "#06b6d4" },
];

type CallState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended";
type Turn = { role: "user" | "ai"; text: string; translation?: string; correction?: string; score?: number };

function SpeakingScore({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-10 h-10">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94} 94`} strokeLinecap="round" />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold" style={{ color }}>{score}</span>
      </div>
      <div>
        <p className="text-xs font-semibold" style={{ color }}>
          {score >= 80 ? "Excellent!" : score >= 60 ? "Good" : "Keep trying"}
        </p>
        <p className="text-xs text-gray-500">Speaking score</p>
      </div>
    </div>
  );
}

export default function SpeakingRoomPage() {
  const { settings, incrementMessages, checkAchievements } = useAppStore();
  const [callState, setCallState] = useState<CallState>("idle");
  const [mode, setMode] = useState(ROLEPLAY_MODES[0]);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [muted, setMuted] = useState(false);
  const [speakerOff, setSpeakerOff] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showModePicker, setShowModePicker] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [scoreCount, setScoreCount] = useState(0);
  const [liveCorrection, setLiveCorrection] = useState<string | null>(null);
  const [liveFeedback, setLiveFeedback] = useState<string | null>(null);

  const recRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const historyRef = useRef<{ role: string; content: string }[]>([]);
  const timerRef = useRef<any>(null);
  const callStateRef = useRef<CallState>("idle");
  const mutedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => { callStateRef.current = callState; }, [callState]);
  useEffect(() => { mutedRef.current = muted; }, [muted]);

  useEffect(() => {
    if (callState !== "idle" && callState !== "ended" && callState !== "connecting") {
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [callState]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (speakerOff) { onEnd?.(); return; }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    u.rate = settings.speechRate ?? 0.95;
    u.pitch = 1.05;
    u.onend = () => onEnd?.();
    u.onerror = () => onEnd?.();
    window.speechSynthesis.speak(u);
  }, [settings, speakerOff]);

  const startListening = useCallback(() => {
    if (mutedRef.current || callStateRef.current === "thinking" || callStateRef.current === "speaking") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript.trim();
      const confidence = e.results[0][0].confidence ?? 0.8;
      if (!transcript) { startListening(); return; }
      const score = Math.round(confidence * 100);
      setSessionScore(prev => Math.round((prev * scoreCount + score) / (scoreCount + 1)));
      setScoreCount(c => c + 1);
      setCallState("thinking");
      setTurns(prev => [...prev, { role: "user", text: transcript, score }]);
      historyRef.current.push({ role: "user", content: transcript });
      await getAIReply(transcript);
    };
    rec.onerror = (e: any) => { if (e.error === "no-speech" && callStateRef.current === "listening") startListening(); };
    rec.onend = () => { if (callStateRef.current === "listening") startListening(); };
    recRef.current = rec;
    rec.start();
    setCallState("listening");
  }, [settings.targetLanguage.code, scoreCount]);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraOn) {
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setCameraOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        cameraStreamRef.current = stream;
        if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); }
        setCameraOn(true);
      } catch { alert("Khong the bat camera"); }
    }
  }, [cameraOn]);

  const getAIReply = useCallback(async (transcript: string) => {
    try {
      const res = await fetch("/api/voice-call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          history: historyRef.current.slice(-8),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          persona: mode.persona,
          roleplay: mode.id,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "I see, tell me more.";
      historyRef.current.push({ role: "assistant", content: reply });

      if (data.correction) {
        setLiveCorrection(data.correction);
        setTimeout(() => setLiveCorrection(null), 5000);
      }
      if (data.betterWay) {
        setLiveFeedback(data.betterWay);
        setTimeout(() => setLiveFeedback(null), 5000);
      }

      setTurns(prev => [...prev, { role: "ai", text: reply, translation: data.translation, correction: data.correction }]);
      incrementMessages(); checkAchievements();
      setCallState("speaking");
      speak(reply, () => {
        if (callStateRef.current !== "ended") { setCallState("listening"); startListening(); }
      });
    } catch {
      setCallState("listening"); startListening();
    }
  }, [settings, mode, speak, startListening, incrementMessages, checkAchievements]);

  const startCall = useCallback(async () => {
    setCallState("connecting");
    setTurns([]); setDuration(0); setSessionScore(0); setScoreCount(0);
    setLiveCorrection(null); setLiveFeedback(null);
    historyRef.current = [];
    try { await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { /* ok */ }
    const greetings: Record<string, string> = {
      native: "Hey! How's it going? What's on your mind today?",
      interview: "Hello, thank you for joining. Please start by telling me about yourself.",
      dating: "Hi there! Nice to meet you. So, what do you like to do for fun?",
      travel: "Welcome! How can I help you today? Are you checking in or do you need directions?",
      business: "Good morning everyone. Let's get started. Can you walk us through your proposal?",
      tutor: "Hi! I'm your English teacher today. Let's start — tell me about your day in English!",
    };
    const greeting = greetings[mode.id] ?? greetings.native;
    setTurns([{ role: "ai", text: greeting }]);
    historyRef.current.push({ role: "assistant", content: greeting });
    setCallState("speaking");
    speak(greeting, () => { setCallState("listening"); startListening(); });
  }, [mode, speak, startListening]);

  const endCall = useCallback(() => {
    window.speechSynthesis.cancel();
    stopListening();
    setCallState("ended");
  }, [stopListening]);

  useEffect(() => () => {
    window.speechSynthesis.cancel();
    stopListening();
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(timerRef.current);
  }, [stopListening]);

  const isActive = callState !== "idle" && callState !== "ended";
  const avgScore = scoreCount > 0 ? sessionScore : 0;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#0a0718" }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-8 pb-3 shrink-0">
        <div>
          <h1 className="text-white font-black text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" /> AI Speaking Room
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Camera · Mic · Smart Feedback</p>
        </div>
        {isActive && (
          <div className="flex items-center gap-2">
            <SpeakingScore score={avgScore || 75} />
            <span className="text-gray-600 font-mono text-sm">{fmt(duration)}</span>
          </div>
        )}
      </div>

      {/* Camera / Avatar area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5 relative">

        {/* Camera feed or AI avatar */}
        <div className="relative w-full max-w-sm">
          {/* User camera */}
          <div className={cn("w-full aspect-video rounded-3xl overflow-hidden relative",
            cameraOn ? "bg-black" : "bg-gray-900")}
            style={{ border: `2px solid ${mode.color}40` }}>
            <video ref={videoRef} className={cn("w-full h-full object-cover", !cameraOn && "hidden")} muted playsInline />
            {!cameraOn && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                  style={{ background: `${mode.color}20`, border: `2px solid ${mode.color}40` }}>
                  {mode.emoji}
                </div>
                <p className="text-white font-bold">{mode.label}</p>
                <p className="text-gray-500 text-xs">{mode.desc}</p>
              </div>
            )}

            {/* Status overlay */}
            {isActive && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: "rgba(0,0,0,0.7)" }}>
                <div className={cn("w-2 h-2 rounded-full",
                  callState === "listening" ? "bg-green-400 animate-pulse"
                  : callState === "speaking" ? "bg-primary-400 animate-pulse"
                  : callState === "thinking" ? "bg-yellow-400 animate-pulse"
                  : "bg-gray-500")} />
                <span className="text-white">
                  {callState === "listening" ? "Listening..." : callState === "speaking" ? "AI Speaking" : callState === "thinking" ? "Thinking..." : "Connecting"}
                </span>
              </div>
            )}

            {/* Score badge */}
            {isActive && scoreCount > 0 && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(0,0,0,0.7)", color: avgScore >= 80 ? "#10b981" : avgScore >= 60 ? "#f59e0b" : "#ef4444" }}>
                {avgScore}pts
              </div>
            )}
          </div>

          {/* Live correction popup */}
          {liveCorrection && (
            <div className="absolute -bottom-2 left-0 right-0 mx-2 rounded-2xl px-3 py-2 flex items-start gap-2 animate-fade-in-up"
              style={{ background: "rgba(234,179,8,0.15)", border: "1px solid rgba(234,179,8,0.4)" }}>
              <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-200 text-xs leading-relaxed">{liveCorrection}</p>
            </div>
          )}
          {liveFeedback && !liveCorrection && (
            <div className="absolute -bottom-2 left-0 right-0 mx-2 rounded-2xl px-3 py-2 flex items-start gap-2 animate-fade-in-up"
              style={{ background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.4)" }}>
              <Sparkles className="w-4 h-4 text-primary-400 shrink-0 mt-0.5" />
              <p className="text-primary-200 text-xs leading-relaxed">{liveFeedback}</p>
            </div>
          )}
        </div>

        {/* Transcript */}
        {turns.length > 0 && (
          <div className="w-full max-w-sm max-h-32 overflow-y-auto scrollbar-hide flex flex-col gap-1.5">
            {turns.slice(-3).map((t, i) => (
              <div key={i} className={cn("flex gap-2", t.role === "user" ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("max-w-[85%] px-3 py-2 rounded-2xl text-xs leading-relaxed",
                  t.role === "user" ? "bg-primary-600/40 text-white rounded-tr-sm" : "bg-gray-800/80 text-gray-200 rounded-tl-sm")}>
                  {t.text}
                  {t.role === "user" && t.score && (
                    <span className="ml-2 text-xs font-bold" style={{ color: t.score >= 80 ? "#10b981" : t.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                      {t.score}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 pb-8 shrink-0">
        {!isActive ? (
          <div className="flex flex-col gap-3">
            {/* Mode picker */}
            <button onClick={() => setShowModePicker(!showModePicker)}
              className="flex items-center justify-between w-full px-4 py-3 rounded-2xl transition-colors"
              style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${mode.color}40` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{mode.emoji}</span>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">{mode.label}</p>
                  <p className="text-gray-500 text-xs">{mode.desc}</p>
                </div>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", showModePicker && "rotate-180")} />
            </button>

            {showModePicker && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(15,10,30,0.98)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <div className="grid grid-cols-2 gap-0">
                  {ROLEPLAY_MODES.map(m => (
                    <button key={m.id} onClick={() => { setMode(m); setShowModePicker(false); }}
                      className={cn("flex items-center gap-2 px-3 py-3 text-left transition-colors border-b border-r border-white/5",
                        mode.id === m.id ? "bg-primary-900/30" : "hover:bg-white/5")}>
                      <span className="text-xl">{m.emoji}</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{m.label}</p>
                        <p className="text-gray-500 text-xs">{m.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Camera toggle */}
            <button onClick={toggleCamera}
              className={cn("flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors border",
                cameraOn ? "border-primary-500 bg-primary-900/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
              {cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
              {cameraOn ? "Camera dang bat" : "Bat camera (tuy chon)"}
            </button>

            {/* Start */}
            <button onClick={startCall}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-3xl font-bold text-lg transition-all shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`, boxShadow: `0 8px 32px ${mode.color}40` }}>
              <Phone className="w-6 h-6 text-white" />
              <span className="text-white">Start Call</span>
            </button>

            {callState === "ended" && scoreCount > 0 && (
              <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <p className="text-white font-bold mb-1">Session Summary</p>
                <div className="flex justify-center gap-6 text-sm">
                  <div><p className="text-primary-400 font-black text-xl">{avgScore}</p><p className="text-gray-500 text-xs">Avg Score</p></div>
                  <div><p className="text-green-400 font-black text-xl">{scoreCount}</p><p className="text-gray-500 text-xs">Turns</p></div>
                  <div><p className="text-yellow-400 font-black text-xl">{fmt(duration)}</p><p className="text-gray-500 text-xs">Duration</p></div>
                </div>
                <div className="flex justify-center gap-0.5 mt-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className={cn("w-4 h-4", i <= Math.ceil(avgScore / 20) ? "text-yellow-400 fill-yellow-400" : "text-gray-700")} />)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-5">
              <button onClick={() => setMuted(!muted)}
                className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  muted ? "bg-red-600/30 ring-2 ring-red-500/50" : "bg-gray-800 hover:bg-gray-700")}>
                {muted ? <MicOff className="w-6 h-6 text-red-400" /> : <Mic className="w-6 h-6 text-gray-300" />}
              </button>

              <button onClick={endCall}
                className="w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg,#dc2626,#b91c1c)", boxShadow: "0 8px 32px rgba(220,38,38,0.5)" }}>
                <PhoneOff className="w-8 h-8 text-white" />
              </button>

              <button onClick={() => setSpeakerOff(!speakerOff)}
                className={cn("w-14 h-14 rounded-full flex items-center justify-center transition-all",
                  speakerOff ? "bg-gray-600/30 ring-2 ring-gray-500/50" : "bg-gray-800 hover:bg-gray-700")}>
                {speakerOff ? <VolumeX className="w-6 h-6 text-gray-500" /> : <Volume2 className="w-6 h-6 text-gray-300" />}
              </button>
            </div>
            <p className="text-center text-xs text-gray-600">
              {muted ? "Mic off" : callState === "listening" ? "Speak now..." : callState === "speaking" ? "AI is speaking..." : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
