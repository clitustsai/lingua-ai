"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, Play, Plus, Volume2, X, Search, ExternalLink } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
  translation: string;
}

interface WordPopup {
  word: string;
  context: string;
  data: any | null;
  loading: boolean;
}

function extractVideoId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = input.match(p);
    if (m) return m[1];
  }
  return null;
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function VideoPage() {
  const { settings, addFlashcard } = useAppStore();
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [popup, setPopup] = useState<WordPopup | null>(null);
  const [activeSegId, setActiveSegId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const generate = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const vid = extractVideoId(trimmed);
    if (!vid) { setError("Link YouTube không hợp lệ"); return; }
    setError("");
    setLoading(true);
    setSegments([]);
    setVideoId(null);
    setPopup(null);
    try {
      const res = await fetch("/api/subtitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: trimmed,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideoId(data.videoId ?? vid);
      setTitle(data.title ?? "");
      setSegments(data.segments ?? []);
    } catch (e: any) {
      setError(e.message || "Không thể tải subtitle. Thử video khác nhé.");
    } finally {
      setLoading(false);
    }
  };

  const handleWordClick = async (word: string, context: string) => {
    const clean = word.replace(/[^a-zA-Z']/g, "").trim();
    if (!clean || clean.length < 2) return;
    setPopup({ word: clean, context, data: null, loading: true });
    try {
      const res = await fetch("/api/word-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: clean, context,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      const data = await res.json();
      setPopup(p => p ? { ...p, data, loading: false } : null);
    } catch {
      setPopup(p => p ? { ...p, loading: false } : null);
    }
  };

  const saveWord = () => {
    if (!popup?.data) return;
    addFlashcard({
      id: Date.now().toString(),
      word: popup.data.word,
      translation: popup.data.meaning,
      example: popup.data.exampleSentence ?? "",
      language: settings.targetLanguage.code,
    });
    setPopup(null);
  };

  const renderClickable = (text: string, seg: Segment) =>
    text.split(/(\s+)/).map((w, i) =>
      w.trim() ? (
        <span key={i} onClick={() => handleWordClick(w.trim(), text)}
          className="cursor-pointer hover:text-yellow-300 hover:underline decoration-dotted transition-colors rounded px-0.5">
          {w}
        </span>
      ) : <span key={i}>{w}</span>
    );

  // Quick demo videos
  const DEMOS = [
    { label: "English in a Minute", id: "LIfIFAMnJA0" },
    { label: "BBC 6 Minute English", id: "Yt5pBMFBMkA" },
    { label: "EngVid Grammar", id: "WlM_8bFMoAg" },
  ];

  return (
    <div className="p-5 max-w-3xl" onClick={() => setPopup(null)}>
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          📺 Video + Subtitle AI
        </h1>
        <p className="text-sm text-gray-500 mt-1">Paste YouTube link · AI generates subtitle + translation · Click words to look up</p>
      </div>

      {/* URL input */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="https://youtube.com/watch?v=... or video ID"
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
            style={{ background: "rgba(26,16,53,0.8)" }}
          />
        </div>
        <button onClick={generate} disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shrink-0">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {error && (
        <div className="mb-3 px-4 py-2.5 rounded-xl text-sm text-red-300"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          {error}
        </div>
      )}

      {/* Quick demo */}
      {!videoId && !loading && (
        <div className="mb-5">
          <p className="text-xs text-gray-600 mb-2">Quick demo:</p>
          <div className="flex gap-2 flex-wrap">
            {DEMOS.map(d => (
              <button key={d.id} onClick={() => { setUrl(d.id); }}
                className="text-xs px-3 py-1.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 hover:border-primary-500 hover:text-white transition-colors">
                {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
          <div className="text-center">
            <p className="text-white font-medium">AI is generating subtitles...</p>
            <p className="text-gray-500 text-sm mt-1">This may take 10-20 seconds</p>
          </div>
          <div className="flex gap-1">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
        </div>
      )}

      {videoId && !loading && (
        <div className="flex flex-col gap-4">
          {/* YouTube iframe */}
          <div className="rounded-2xl overflow-hidden bg-black aspect-video relative">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-500 text-white transition-colors shadow-lg"
              style={{ zIndex: 10 }}>
              <ExternalLink className="w-3 h-3" /> YouTube
            </a>
          </div>

          {title && <h2 className="text-white font-semibold text-base">{title}</h2>}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{segments.length} segments · Click any word to look up</p>
            <button onClick={() => setShowTranslation(!showTranslation)}
              className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                showTranslation
                  ? "border-primary-500 text-primary-400 bg-primary-900/20"
                  : "border-gray-700 text-gray-500 hover:border-gray-600")}>
              {showTranslation ? "Hide translation" : "Show translation"}
            </button>
          </div>

          {/* Transcript */}
          {segments.length > 0 ? (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Full Transcript</p>
                <p className="text-xs text-gray-600">Click segment to jump</p>
              </div>
              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto scrollbar-hide">
                {segments.map(seg => {
                  const isActive = seg.id === activeSegId;
                  return (
                    <div id={`seg-${seg.id}`} key={seg.id}
                      className={cn("px-4 py-3 cursor-pointer transition-colors", isActive ? "bg-primary-900/30" : "hover:bg-white/5")}
                      onClick={() => setActiveSegId(seg.id)}>
                      <div className="flex items-start gap-3">
                        <span className="text-xs text-gray-600 font-mono shrink-0 mt-0.5">{formatTime(seg.start)}</span>
                        <div className="flex-1">
                          <p className={cn("text-sm leading-relaxed", isActive ? "text-white" : "text-gray-300")}>
                            {renderClickable(seg.text, seg)}
                          </p>
                          {showTranslation && seg.translation && (
                            <p className="text-xs text-gray-500 mt-0.5 italic">{seg.translation}</p>
                          )}
                        </div>
                        <button onClick={e => { e.stopPropagation(); speakText(seg.text, settings.targetLanguage.code); }}
                          className="p-1.5 rounded-lg text-gray-600 hover:text-primary-400 hover:bg-gray-700 transition-colors shrink-0">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-gray-400 text-sm">No subtitle data. The video may not have captions available.</p>
              <a href={`https://youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-xs text-red-400 hover:text-red-300 underline">
                <ExternalLink className="w-3 h-3" /> Watch on YouTube directly
              </a>
            </div>
          )}
        </div>
      )}

      {/* Word popup */}
      {popup && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setPopup(null)}>
          <div className="w-full max-w-sm rounded-3xl p-5 animate-fade-in-scale"
            style={{ background: "#1a1035", border: "1px solid rgba(139,92,246,0.4)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-lg">{popup.word}</span>
                <button onClick={() => speakText(popup.word, settings.targetLanguage.code)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-white/5 transition-colors">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => setPopup(null)} className="p-1.5 rounded-lg text-gray-600 hover:text-white hover:bg-white/10 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {popup.loading ? (
              <div className="flex items-center gap-3 py-4">
                <div className="flex gap-1">
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                  <div className="ai-typing-dot" />
                </div>
                <span className="text-sm text-gray-400">Looking up...</span>
              </div>
            ) : popup.data ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {popup.data.ipa && <span className="text-xs text-gray-400 font-mono">[{popup.data.ipa}]</span>}
                  {popup.data.partOfSpeech && <span className="text-xs bg-purple-900/40 text-purple-300 px-2 py-0.5 rounded-full">{popup.data.partOfSpeech}</span>}
                  {popup.data.level && <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{popup.data.level}</span>}
                </div>
                <p className="text-primary-300 font-medium">{popup.data.meaning}</p>
                {popup.data.exampleSentence && (
                  <div className="rounded-xl p-3" style={{ background: "rgba(15,10,30,0.6)" }}>
                    <p className="text-xs text-gray-300 italic">"{popup.data.exampleSentence}"</p>
                    {popup.data.exampleTranslation && <p className="text-xs text-gray-500 mt-1">{popup.data.exampleTranslation}</p>}
                  </div>
                )}
                {popup.data.synonyms?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {popup.data.synonyms.map((s: string) => (
                      <span key={s} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{s}</span>
                    ))}
                  </div>
                )}
                <button onClick={saveWord}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-colors"
                  style={{ background: "rgba(139,92,246,0.2)", border: "1px solid rgba(139,92,246,0.3)", color: "#c4b5fd" }}>
                  <Plus className="w-4 h-4" /> Save to Flashcards
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-2">No definition found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
