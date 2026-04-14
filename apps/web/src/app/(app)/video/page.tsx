"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, Play, Plus, Volume2, X, Search, Youtube } from "lucide-react";
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
  x: number;
  y: number;
}

export default function VideoPage() {
  const { settings, addFlashcard } = useAppStore();
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [popup, setPopup] = useState<WordPopup | null>(null);
  const [activeSegId, setActiveSegId] = useState<number | null>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  // YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    (window as any).onYouTubeIframeAPIReady = () => {
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId,
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 1) startTracking();
            else stopTracking();
          },
        },
      });
    };
    return () => { stopTracking(); };
  }, [videoId]);

  const startTracking = () => {
    timerRef.current = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.() ?? 0;
      setCurrentTime(t);
      const seg = segments.find(s => t >= s.start && t < s.end);
      if (seg) {
        setActiveSegId(seg.id);
        // auto-scroll subtitle
        const el = document.getElementById(`seg-${seg.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 300);
  };

  const stopTracking = () => clearInterval(timerRef.current);

  const generate = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setSegments([]);
    setVideoId(null);
    setPopup(null);
    try {
      const res = await fetch("/api/subtitle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setVideoId(data.videoId);
      setTitle(data.title ?? "");
      setSegments(data.segments ?? []);
    } catch (e: any) {
      alert(e.message || "Không thể tải subtitle");
    } finally {
      setLoading(false);
    }
  };

  const seekTo = (start: number) => {
    playerRef.current?.seekTo?.(start, true);
    playerRef.current?.playVideo?.();
  };

  const handleWordClick = async (word: string, context: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const clean = word.replace(/[^a-zA-ZÀ-ỹ\u3040-\u9fff\uac00-\ud7af]/g, "").trim();
    if (!clean) return;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setPopup({ word: clean, context, data: null, loading: true, x: rect.left, y: rect.bottom + 8 });
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

  const renderClickableText = (text: string, seg: Segment) => {
    const words = text.split(/(\s+)/);
    return words.map((w, i) =>
      w.trim() ? (
        <span key={i} onClick={(e) => handleWordClick(w.trim(), text, e)}
          className="cursor-pointer hover:text-yellow-300 hover:underline decoration-dotted transition-colors rounded px-0.5">
          {w}
        </span>
      ) : <span key={i}>{w}</span>
    );
  };

  const activeSeg = segments.find(s => s.id === activeSegId);

  return (
    <div className="p-5 max-w-3xl" onClick={() => setPopup(null)}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-500" /> Video + Subtitle
        </h1>
        <p className="text-sm text-gray-500 mt-1">Dán link YouTube · Click từ để giải nghĩa · Dịch realtime</p>
      </div>

      {/* URL input */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={url} onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === "Enter" && generate()}
            placeholder="Dán link YouTube hoặc video ID..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
        </div>
        <button onClick={generate} disabled={loading || !url.trim()}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          {loading ? "Đang tải..." : "Tải subtitle"}
        </button>
      </div>

      {videoId && (
        <div className="flex flex-col gap-4">
          {/* YouTube player */}
          <div className="rounded-2xl overflow-hidden bg-black aspect-video">
            <div id="yt-player" className="w-full h-full" />
          </div>

          {title && <h2 className="text-white font-semibold">{title}</h2>}

          {/* Realtime subtitle overlay */}
          {activeSeg && (
            <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <p className="text-white text-base font-medium leading-relaxed">
                {renderClickableText(activeSeg.text, activeSeg)}
              </p>
              {showTranslation && (
                <p className="text-gray-400 text-sm mt-1.5 italic">{activeSeg.translation}</p>
              )}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">{segments.length} đoạn · Click từ để giải nghĩa</p>
            <button onClick={() => setShowTranslation(!showTranslation)}
              className={cn("text-xs px-3 py-1.5 rounded-lg border transition-colors",
                showTranslation ? "border-primary-500 text-primary-400 bg-primary-900/20" : "border-gray-700 text-gray-500 hover:border-gray-600")}>
              {showTranslation ? "Ẩn dịch" : "Hiện dịch"}
            </button>
          </div>

          {/* Full transcript */}
          <div ref={subtitleRef} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Transcript đầy đủ</p>
            </div>
            <div className="divide-y divide-white/5 max-h-96 overflow-y-auto scrollbar-hide">
              {segments.map(seg => {
                const isActive = seg.id === activeSegId;
                const mm = Math.floor(seg.start / 60).toString().padStart(2, "0");
                const ss = Math.floor(seg.start % 60).toString().padStart(2, "0");
                return (
                  <div id={`seg-${seg.id}`} key={seg.id}
                    className={cn("px-4 py-3 cursor-pointer transition-colors", isActive ? "bg-primary-900/30" : "hover:bg-white/5")}
                    onClick={() => seekTo(seg.start)}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-600 font-mono shrink-0 mt-0.5">{mm}:{ss}</span>
                      <div className="flex-1">
                        <p className={cn("text-sm leading-relaxed", isActive ? "text-white" : "text-gray-300")}>
                          {renderClickableText(seg.text, seg)}
                        </p>
                        {showTranslation && (
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
        </div>
      )}

      {/* Word popup */}
      {popup && (
        <div className="fixed z-50 w-72 rounded-2xl shadow-2xl p-4"
          style={{ left: Math.min(popup.x, window.innerWidth - 300), top: popup.y, background: "#1a1035", border: "1px solid rgba(139,92,246,0.4)" }}
          onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold">{popup.word}</span>
              <button onClick={() => speakText(popup.word, settings.targetLanguage.code)} className="p-1 rounded text-gray-500 hover:text-primary-400">
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <button onClick={() => setPopup(null)} className="text-gray-600 hover:text-gray-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {popup.loading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              <span className="text-sm text-gray-400">Đang tra từ...</span>
            </div>
          ) : popup.data ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                {popup.data.ipa && <span className="text-xs text-gray-400 font-mono">[{popup.data.ipa}]</span>}
                {popup.data.partOfSpeech && <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">{popup.data.partOfSpeech}</span>}
                {popup.data.level && <span className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{popup.data.level}</span>}
              </div>
              <p className="text-sm text-primary-300 font-medium">{popup.data.meaning}</p>
              {popup.data.exampleSentence && (
                <div className="bg-gray-800/60 rounded-lg p-2">
                  <p className="text-xs text-gray-300 italic">"{popup.data.exampleSentence}"</p>
                  <p className="text-xs text-gray-500 mt-0.5">{popup.data.exampleTranslation}</p>
                </div>
              )}
              {popup.data.synonyms?.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {popup.data.synonyms.map((s: string) => (
                    <span key={s} className="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">{s}</span>
                  ))}
                </div>
              )}
              <button onClick={saveWord}
                className="flex items-center justify-center gap-1.5 w-full py-2 bg-primary-600/30 hover:bg-primary-600/50 text-primary-300 rounded-xl text-xs font-medium transition-colors mt-1">
                <Plus className="w-3.5 h-3.5" /> Lưu vào Flashcard
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Không tìm thấy thông tin</p>
          )}
        </div>
      )}
    </div>
  );
}
