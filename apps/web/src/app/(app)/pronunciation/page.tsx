"use client";
import { useState, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, Volume2, Mic, MicOff, Search } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

interface PronData {
  word: string;
  ipa: string;
  syllables: string;
  tips: string[];
  commonMistakes: string;
  similarSounds: string[];
}

const LANG_MAP: Record<string, string> = { en:"en-US", ja:"ja-JP", ko:"ko-KR", zh:"zh-CN", fr:"fr-FR", es:"es-ES", de:"de-DE", vi:"vi-VN" };

export default function PronunciationPage() {
  const { settings } = useAppStore();
  const [word, setWord] = useState("");
  const [data, setData] = useState<PronData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [userScore, setUserScore] = useState<number | null>(null);
  const [userTranscript, setUserTranscript] = useState("");
  const recRef = useRef<any>(null);

  const lookup = async (w?: string) => {
    const target = (w ?? word).trim();
    if (!target || loading) return;
    setLoading(true); setData(null); setUserScore(null); setUserTranscript("");
    try {
      const res = await fetch("/api/pronunciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word: target, targetLanguage: settings.targetLanguage.name, nativeLanguage: settings.nativeLanguage.name }),
      });
      setData(await res.json());
    } finally { setLoading(false); }
  };

  const practice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Use Chrome for voice input."); return; }
    const rec = new SR();
    rec.lang = LANG_MAP[settings.targetLanguage.code] ?? "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const r = e.results[0][0];
      setUserTranscript(r.transcript);
      const conf = r.confidence ?? 0.7;
      const match = r.transcript.toLowerCase().includes((data?.word ?? word).toLowerCase()) ? 1 : 0.5;
      setUserScore(Math.round(Math.min(conf * match * 100 + (match === 1 ? 20 : 0), 100)));
      setIsListening(false);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    recRef.current = rec;
    rec.start();
    setIsListening(true);
  };

  const stopPractice = () => { recRef.current?.stop(); setIsListening(false); };

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Pronunciation Guide</h1>
        <p className="text-sm text-gray-500 mt-1">Look up any word and practice speaking it</p>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={word} onChange={e => setWord(e.target.value)}
            onKeyDown={e => e.key === "Enter" && lookup()}
            placeholder={`Enter a ${settings.targetLanguage.name} word...`}
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button onClick={() => lookup()} disabled={loading || !word.trim()}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Look up"}
        </button>
      </div>

      {data && (
        <div className="flex flex-col gap-4">
          {/* Main card */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-3xl font-bold text-white">{data.word}</h2>
                {data.syllables && <p className="text-sm text-gray-400 mt-0.5">{data.syllables}</p>}
                {data.ipa && <p className="text-primary-400 font-mono mt-1">[{data.ipa}]</p>}
              </div>
              <button onClick={() => speakText(data.word, settings.targetLanguage.code)}
                className="p-3 bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 rounded-xl transition-colors">
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            {data.tips?.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                <p className="text-xs text-gray-500 font-medium">Pronunciation tips:</p>
                {data.tips.map((tip, i) => (
                  <div key={i} className="flex gap-2 text-sm text-gray-300">
                    <span className="text-primary-400 shrink-0">▸</span>{tip}
                  </div>
                ))}
              </div>
            )}

            {data.commonMistakes && (
              <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-3 text-sm text-red-200 mb-4">
                ⚠️ {data.commonMistakes}
              </div>
            )}

            {data.similarSounds?.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Similar sounds to practice:</p>
                <div className="flex gap-2 flex-wrap">
                  {data.similarSounds.map((s, i) => (
                    <button key={i} onClick={() => { setWord(s); lookup(s); }}
                      className="text-sm bg-gray-700 hover:bg-gray-600 text-gray-300 px-2.5 py-1 rounded-lg transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Practice section */}
          <div className="bg-gray-800 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">🎤 Practice Speaking</h3>
            <div className="flex flex-col items-center gap-4">
              <button onClick={isListening ? stopPractice : practice}
                className={cn("w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg",
                  isListening ? "bg-red-600 shadow-red-500/40 scale-110" : "bg-primary-600 hover:bg-primary-500 shadow-primary-500/30")}>
                {isListening ? <MicOff className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
              </button>
              <p className="text-xs text-gray-500">{isListening ? "Listening... say the word" : "Tap to practice"}</p>

              {userScore !== null && (
                <div className={cn("w-full p-4 rounded-xl border text-center",
                  userScore >= 80 ? "border-green-600/40 bg-green-900/20" : userScore >= 50 ? "border-yellow-600/40 bg-yellow-900/20" : "border-red-600/40 bg-red-900/20")}>
                  <div className={cn("text-3xl font-bold mb-1", userScore >= 80 ? "text-green-400" : userScore >= 50 ? "text-yellow-400" : "text-red-400")}>
                    {userScore}%
                  </div>
                  <p className="text-sm text-gray-300">You said: "{userTranscript}"</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userScore >= 80 ? "🎉 Excellent!" : userScore >= 50 ? "👍 Good, keep practicing!" : "🎤 Try again, speak clearly"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
