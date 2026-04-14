"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
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
  const recognitionRef = useRef<any>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<any>(null);
  const analyserRef = useRef<any>(null);

  useEffect(() => () => { stopListening(); }, []);

  const startListening = async () => {
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
        animFrameRef.current = requestAnimationFrame(tick);
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
      stopListening();
    };
    rec.onerror = () => stopListening();
    rec.onend = () => stopListening();
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t: MediaStreamTrack) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
  };

  const scale = isListening ? 1 + (volume / 255) * 0.5 : 1;

  return (
    <button
      onClick={() => isListening ? stopListening() : startListening()}
      disabled={disabled}
      title={isListening ? "Stop" : "Speak"}
      className={cn(
        "relative p-3 rounded-xl transition-all duration-100",
        isListening ? "bg-red-600 hover:bg-red-700 text-white" : "bg-gray-700 hover:bg-gray-600 text-gray-300",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      {isListening && <span className="absolute inset-0 rounded-xl animate-ping bg-red-500 opacity-25" />}
    </button>
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
