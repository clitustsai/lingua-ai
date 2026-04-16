"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { VIDEO_LESSONS, CATEGORIES } from "@/lib/videoLessons";
import { Play, Search, X, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function countryFlag(code: string) {
  return code.toUpperCase().split("").map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
}

const LEVEL_COLOR: Record<string, string> = {
  "A1":    "bg-green-900/40 text-green-300",
  "A1-A2": "bg-green-900/40 text-green-300",
  "A2":    "bg-green-900/40 text-green-300",
  "A2-B1": "bg-blue-900/40 text-blue-300",
  "B1":    "bg-blue-900/40 text-blue-300",
  "B1-B2": "bg-purple-900/40 text-purple-300",
  "B2-C1": "bg-orange-900/40 text-orange-300",
  "B1-C1": "bg-orange-900/40 text-orange-300",
  "A2-B2": "bg-blue-900/40 text-blue-300",
  "A1-B1": "bg-green-900/40 text-green-300",
};

const CAT_GRADIENT: Record<string, string> = {
  grammar:      "from-yellow-900/60 to-yellow-800/30",
  conversation: "from-blue-900/60 to-blue-800/30",
  vocabulary:   "from-purple-900/60 to-purple-800/30",
  pronunciation:"from-pink-900/60 to-pink-800/30",
  listening:    "from-green-900/60 to-green-800/30",
};

const CAT_ICON: Record<string, string> = {
  grammar: "📐", conversation: "💬", vocabulary: "📚",
  pronunciation: "🎤", listening: "🎧",
};

// Verified working YouTube IDs for preview
const PREVIEW_IDS: Record<string, string> = {
  "v1": "LIfIFAMnJA0", "v2": "Yt5pBMFBMkA",
};

export default function VideosPage() {
  const router = useRouter();
  const { settings } = useAppStore();
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = VIDEO_LESSONS.filter(v => {
    // Filter by current target language
    if (v.language !== settings.targetLanguage.name) return false;
    if (category !== "all" && v.category !== category) return false;
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) &&
        !v.teacher.toLowerCase().includes(search.toLowerCase()) &&
        !v.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const previewVideo = previewId ? VIDEO_LESSONS.find(v => v.id === previewId) : null;

  return (
    <div className="p-5 max-w-3xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          🎬 Video Lessons
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {settings.targetLanguage.flag} {settings.targetLanguage.name} videos · Script · Quiz · Vocab · Grammar
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search videos, teachers, topics..."
          className="w-full rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategory(c.id)}
            className={cn("flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium shrink-0 transition-all",
              category === c.id
                ? "border-primary-500 bg-primary-900/30 text-white"
                : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
            {c.emoji} {c.label}
          </button>
        ))}
      </div>

      {/* Video grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map(v => (
          <div key={v.id} className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl group"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>

            {/* Thumbnail card */}
            <div className={cn("relative aspect-video overflow-hidden bg-gradient-to-br cursor-pointer", CAT_GRADIENT[v.category] ?? "from-gray-900 to-gray-800")}
              onClick={() => router.push(`/videos/${v.id}`)}>
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-4xl opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300">{CAT_ICON[v.category]}</span>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-4 h-4 text-white ml-0.5" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                {formatDuration(v.durationSec)}
              </div>
              <div className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-medium bg-black/40 text-white backdrop-blur-sm">
                {CAT_ICON[v.category]} {v.category}
              </div>
              {/* YouTube link */}
              <a href={`https://www.youtube.com/watch?v=${v.youtubeId}`}
                target="_blank" rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white transition-colors"
                title="Watch on YouTube">
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Info */}
            <div className="p-3 cursor-pointer" onClick={() => router.push(`/videos/${v.id}`)}>
              <h3 className="text-white font-semibold text-sm leading-tight mb-1.5 line-clamp-2">{v.title}</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">{countryFlag(v.flag)}</span>
                  <span className="text-xs text-gray-400">{v.teacher}</span>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", LEVEL_COLOR[v.level] ?? "bg-gray-800 text-gray-400")}>
                  {v.level}
                </span>
              </div>
              <div className="flex gap-1 mt-2 flex-wrap">
                {v.tags.slice(0, 3).map(t => (
                  <span key={t} className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">#{t}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-3">🎬</p>
          <p className="font-medium text-white mb-1">
            {search ? "Không tìm thấy video phù hợp" : `Chưa có video cho ${settings.targetLanguage.name}`}
          </p>
          {!search && (
            <p className="text-sm text-gray-600 mt-1">
              Đổi ngôn ngữ học trong Settings để xem video phù hợp
            </p>
          )}
        </div>
      )}
    </div>
  );
}
