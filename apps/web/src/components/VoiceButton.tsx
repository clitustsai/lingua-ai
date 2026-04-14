"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string, confidence: number) => void;
  language: string;
  disabled?: boolean;
}

function toLangTag(code: string) {
  const map: Record<string, string> = {
    en: "en-US", ja: "ja-JP", ko: "ko-KR", zh: "zh-CN",
    fr: "fr-FR", es: "es-ES", de: "de-DE", vi: "vi-VN",
  };
  return map[code] ?? "en-US";
}

export default function VoiceButton({ onTranscript, language, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const recRef = useRef<any>(null);
  const animRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);

  useEffect(() => () => { cleanup(); }, []);

  const cleanup = () => {
    recRef.current?.stop();
    recRef.current = null;
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
  };

  const start = useCallback(async () => {
    if (disabled) return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      analyserRef.current = analyser;
      const tick = () => {
        const d = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(d);
        setVolume(d.reduce((a: number, b: number) => a + b, 0) / d.length);
        animRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* mic denied */ }

    const rec = new SR();
    rec.lang = toLangTag(language);
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const r = e.results[0][0];
      onTranscript(r.transcript, r.confidence ?? 0.8);
    };
    rec.onerror = () => cleanup();
    rec.onend = () => cleanup();
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [disabled, language, onTranscript]);

  const stop = useCallback(() => {
    recRef.current?.stop();
  }, []);

  const scale = isListening ? 1 + (volume / 255) * 0.8 : 1;
  const ringSize = isListening ? Math.round((volume / 255) * 40) : 0;

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Ripple rings */}
      <div className="relative flex items-center justify-center">
        {isListening && (
          <>
            <span
              className="absolute rounded-full bg-red-500 opacity-20 transition-all duration-100"
              style={{ width: 56 + ringSize, height: 56 + ringSize }}
            />
            <span
              className="absolute rounded-full bg-red-500 opacity-10 transition-all duration-150"
              style={{ width: 72 + ringSize, height: 72 + ringSize }}
            />
          </>
        )}
        <button
          onMouseDown={start}
          onMouseUp={stop}
          onTouchStart={(e) => { e.preventDefault(); start(); }}
          onTouchEnd={(e) => { e.preventDefault(); stop(); }}
          disabled={disabled}
          className={cn(
            "relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-100 select-none",
            isListening
              ? "bg-red-600 shadow-lg shadow-red-500/40 scale-110"
              : "bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30",
            disabled && "opacity-40 cursor-not-allowed"
          )}
          style={{ transform: `scale(${scale})` }}
        >
          <Mic className={cn("w-6 h-6 text-white", isListening && "animate-pulse")} />
        </button>
      </div>
      <span className="text-xs text-gray-500 select-none">
        {isListening ? "Listening..." : disabled ? "Waiting..." : "Hold to speak"}
      </span>
    </div>
  );
}

export function speakText(text: string, langCode: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = toLangTag(langCode);
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}
