"use client";
import { useState, useRef, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { SUPPORTED_LANGUAGES } from "@ai-lang/shared";
import { Loader2, Play, Pause, Volume2, VolumeX, Youtube, Languages, Mic2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const LANG_MAP: Record<string, string> = {
  en:"en-US", ja:"ja-JP", ko:"ko-KR", zh:"zh-CN",
  fr:"fr-FR", es:"es-ES", de:"de-DE", vi:"vi-VN",
};

const VOICE_STYLES: Record<string, { pitch: number; rate: number }> = {
  neutral:  { pitch: 1.0, rate: 1.0 },
  happy:    { pitch: 1.2, rate: 1.05 },
  serious:  { pitch: 0.9, rate: 0.95 },
  excited:  { pitch: 1.3, rate: 1.1 },
};

interface DubSegment {
  id: number; start: number; end: number;
  original: string; dubbed: string; translation: string;
  speakerGender: string; emotion: string; lipSyncHint: string;
}

function extractYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
  return m ? m[1] : url.length === 11 ? url : null;
}

export default function DubPage() {
  const { settings } = useAppStore();
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [dubLang, setDubLang] = useState(settings.nativeLanguage.code);
  const [loading, setLoading] = useState(false);
  const [dubData, setDubData] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSeg, setActiveSeg] = useState<DubSegment | null>(null);
  const [dubEnabled, setDubEnabled] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const lastSpokenRef = useRef<number>(-1);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!videoId) return;
    const existing = document.getElementById("yt-dub-player");
    if (existing) existing.remove();

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.id = "yt-api-script";
    if (!document.getElementById("yt-api-script")) document.head.appendChild(tag);

    const init = () => {
      playerRef.current = new (window as any).YT.Player("yt-dub-player", {
        videoId,
        playerVars: { autoplay: 0, controls: 1, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === 1) startTracking();
            else { clearInterval(timerRef.current); if (e.data === 2) window.speechSynthesis.cancel(); }
          },
        },
      });
    };

    if ((window as any).YT?.Player) init();
    else (window as any).onYouTubeIframeAPIReady = init;

    return () => { clearInterval(timerRef.current); window.speechSynthesis.cancel(); };
  }, [videoId]);

  const startTracking = () => {
    timerRef.current = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.() ?? 0;
      setCurrentTime(t);
      if (!dubData?.segments) return;
      const seg = dubData.segments.find((s: DubSegment) => t >= s.start && t < s.end);
      if (seg) {
        setActiveSeg(seg);
        // Speak dubbed audio if not already spoken this segment
        if (dubEnabled && seg.id !== lastSpokenRef.current) {
          lastSpokenRef.current = seg.id;
          speakDub(seg);
        }
      } else {
        setActiveSeg(null);
      }
    }, 200);
  };

  const speakDub = (seg: DubSegment) => {
    if (!dubEnabled || typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(seg.dubbed);
    const dubLangObj = SUPPORTED_LANGUAGES.find(l => l.code === dubLang);
    u.lang = LANG_MAP[dubLang] ?? "vi-VN";
    const style = VOICE_STYLES[seg.emotion] ?? VOICE_STYLES.neutral;
    u.pitch = style.pitch + (seg.speakerGender === "female" ? 0.2 : 0);
    u.rate = style.rate;
    u.volume = 0.9;
    setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(u);
  };

  const generate = async () => {
    const id = extractYouTubeId(url.trim());
    if (!id) { alert("Link YouTube không hợp lệ"); return; }
    setLoading(true);
    setDubData(null);
    setVideoId(null);
    lastSpokenRef.current = -1;
    try {
      const res = await fetch("/api/dub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: id,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          dubLanguage: SUPPORTED_LANGUAGES.find(l => l.code === dubLang)?.name ?? "Vietnamese",
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDubData(data);
      setVideoId(id);
    } catch (e: any) {
      alert(e.message || "Lỗi tạo dub");
    } finally { setLoading(false); }
  };

  const exportScript = () => {
    if (!dubData) return;
    const lines = dubData.segments.map((s: DubSegment) =>
      `[${s.start}s-${s.end}s] ${s.dubbed}`
    ).join("\n");
    const blob = new Blob([`${dubData.title}\nDubbed: ${dubData.dubLanguage}\n\n${lines}`], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "dubbed-script.txt"; a.click();
  };

  const dubLangObj = SUPPORTED_LANGUAGES.find(l => l.code === dubLang);

  return (
    <div className="p-5 max-w-3xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Mic2 className="w-5 h-5 text-red-400" /> AI Dub Video
        </h1>
        <p className="text-sm text-gray-500 mt-1">YouTube → AI dịch + đọc lồng tiếng realtime · giống TikTok auto-dub</p>
      </div>

      {/* Config */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
            <input value={url} onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === "Enter" && generate()}
              placeholder="Dán link YouTube..."
              className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
              style={{ background: "rgba(26,16,53,0.8)" }}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Languages className="w-4 h-4 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Dub sang:</span>
          <select value={dubLang} onChange={e => setDubLang(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2 text-sm text-white border border-gray-700 focus:outline-none focus:border-primary-500"
            style={{ background: "rgba(26,16,53,0.8)" }}>
            {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
          </select>
          <button onClick={generate} disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Đang tạo..." : "Tạo Dub"}
          </button>
        </div>
      </div>

      {videoId && dubData && (
        <div className="flex flex-col gap-4">
          {/* Player */}
          <div className="rounded-2xl overflow-hidden bg-black aspect-video">
            <div id="yt-dub-player" className="w-full h-full" />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <button onClick={() => { setDubEnabled(!dubEnabled); if (dubEnabled) window.speechSynthesis.cancel(); }}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                  dubEnabled ? "border-red-500/40 bg-red-900/20 text-red-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
                {dubEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {dubEnabled ? `Dub ${dubLangObj?.flag} bật` : "Dub tắt"}
              </button>
              <button onClick={() => setShowOriginal(!showOriginal)}
                className={cn("px-3 py-2 rounded-xl border text-xs font-medium transition-colors",
                  showOriginal ? "border-primary-500 bg-primary-900/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
                {showOriginal ? "Ẩn gốc" : "Xem gốc"}
              </button>
              {isSpeaking && <span className="text-xs text-red-400 animate-pulse">🔊 Đang dub...</span>}
            </div>
            <button onClick={exportScript} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-xs transition-colors">
              <Download className="w-3.5 h-3.5" /> Export script
            </button>
          </div>

          {/* Live subtitle */}
          {activeSeg && (
            <div className="rounded-2xl p-4 text-center"
              style={{ background: "rgba(0,0,0,0.75)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <p className="text-white text-base font-medium leading-relaxed">{activeSeg.dubbed}</p>
              {showOriginal && <p className="text-gray-400 text-sm mt-1 italic">{activeSeg.original}</p>}
              <p className="text-gray-500 text-xs mt-1">{activeSeg.translation}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="text-xs bg-red-900/30 text-red-300 px-2 py-0.5 rounded-full">{activeSeg.emotion}</span>
                <span className="text-xs text-gray-600">{activeSeg.lipSyncHint}</span>
              </div>
            </div>
          )}

          {/* Full script */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Script đầy đủ · {dubData.segments?.length} đoạn</p>
              {dubData.dubNotes && <p className="text-xs text-gray-600 max-w-xs truncate">{dubData.dubNotes}</p>}
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-hide divide-y divide-white/5">
              {dubData.segments?.map((seg: DubSegment) => {
                const isActive = activeSeg?.id === seg.id;
                return (
                  <div key={seg.id} className={cn("px-4 py-3 transition-colors cursor-pointer hover:bg-white/5", isActive && "bg-red-900/20")}
                    onClick={() => { playerRef.current?.seekTo?.(seg.start, true); playerRef.current?.playVideo?.(); }}>
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-600 font-mono shrink-0 mt-0.5 w-12">
                        {Math.floor(seg.start / 60)}:{String(Math.floor(seg.start % 60)).padStart(2, "0")}
                      </span>
                      <div className="flex-1">
                        <p className={cn("text-sm font-medium", isActive ? "text-white" : "text-gray-300")}>{seg.dubbed}</p>
                        {showOriginal && <p className="text-xs text-gray-500 mt-0.5 italic">{seg.original}</p>}
                        <p className="text-xs text-gray-600 mt-0.5">{seg.translation}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <span className={cn("text-xs px-1.5 py-0.5 rounded",
                          seg.emotion === "happy" ? "bg-yellow-900/30 text-yellow-400" :
                          seg.emotion === "excited" ? "bg-orange-900/30 text-orange-400" :
                          seg.emotion === "serious" ? "bg-blue-900/30 text-blue-400" :
                          "bg-gray-800 text-gray-500")}>{seg.emotion}</span>
                        <button onClick={e => { e.stopPropagation(); speakDub(seg); }}
                          className="p-1 rounded text-gray-600 hover:text-red-400 transition-colors">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
