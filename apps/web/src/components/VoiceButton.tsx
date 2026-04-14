"use client";
import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string, confidence: number) => void;
  language: string; // e.g. "en-US"
  disabled?: boolean;
}

export default function VoiceButton({ onTranscript, language, disabled }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const startListening = async () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser doesn't support voice input. Try Chrome.");
      return;
    }

    // Visualizer
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const tick = () => {
        const data = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setVolume(avg);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}

    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US"
      : language === "ja" ? "ja-JP"
      : language === "ko" ? "ko-KR"
      : language === "zh" ? "zh-CN"
      : language === "fr" ? "fr-FR"
      : language === "es" ? "es-ES"
      : language === "de" ? "de-DE"
      : language === "vi" ? "vi-VN"
      : "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const result = e.results[0][0];
      onTranscript(result.transcript, result.confidence);
      stopListening();
    };

    recognition.onerror = () => stopListening();
    recognition.onend = () => stopListening();

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    analyserRef.current = null;
    setIsListening(false);
    setVolume(0);
  };

  const toggle = () => (isListening ? stopListening() : startListening());

  const scale = isListening ? 1 + (volume / 255) * 0.6 : 1;

  return (
    <button
      onClick={toggle}
      disabled={disabled}
      title={isListening ? "Stop recording" : "Speak"}
      className={cn(
        "relative p-3 rounded-xl transition-all duration-150",
        isListening
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gray-700 hover:bg-gray-600 text-gray-300",
        disabled && "opacity-40 cursor-not-allowed"
      )}
      style={{ transform: `scale(${scale})` }}
    >
      {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      {isListening && (
        <span className="absolute inset-0 rounded-xl animate-ping bg-red-500 opacity-30" />
      )}
    </button>
  );
}

export function speakText(text: string, langCode: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = langCode === "en" ? "en-US"
    : langCode === "ja" ? "ja-JP"
    : langCode === "ko" ? "ko-KR"
    : langCode === "zh" ? "zh-CN"
    : langCode === "fr" ? "fr-FR"
    : langCode === "es" ? "es-ES"
    : langCode === "de" ? "de-DE"
    : langCode === "vi" ? "vi-VN"
    : "en-US";
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
}
