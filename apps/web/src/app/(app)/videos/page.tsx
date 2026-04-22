"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { VIDEO_LESSONS, CATEGORIES, VideoLesson } from "@/lib/videoLessons";
import { Clock, Users, ChevronRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function fmtViews(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return String(n);
}

const LEVEL_COLOR: Record<string, string> = {
  A1:"#22c55e", A2:"#22c55e", "A1-A2":"#22c55e",
  B1:"#3b82f6", "A2-B1":"#3b82f6", "B1-B2":"#3b82f6",
  B2:"#a855f7", "B2-C1":"#a855f7",
  C1:"#f97316", C2:"#ef4444",
};

function VideoCard({ v, locked, onClick }: {
  v: VideoLesson; locked: boolean; onClick: () => void;
}) {
  const isAudio = v.teacher === "Audio";
  const thumb = `https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg`;
  const [imgError, setImgError] = useState(false);

  return (
    <div className={cn("rounded-xl overflow-hidden border transition-all hover:border-gray-500 cursor-pointer group",
      locked ? "border-yellow-700/40" : "border-gray-700/60")}
      style={{ background: "rgba(18,12,36,0.9)" }}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-900" onClick={onClick}>
        {isAudio || imgError ? (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1e3a5f,#0f2040)" }}>
            <div className="text-center px-2">
              <div className="text-3xl mb-1">{isAudio ? "🎧" : "🎬"}</div>
              <div className="text-white text-xs font-medium opacity-70 line-clamp-2">{v.title}</div>
            </div>
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={v.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImgError(true)}
          />
        )}

        {/* Gradient overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Lock overlay */}
        {locked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        )}

        {/* PRO badge - top left */}
        {v.isPro && (
          <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-black text-xs font-black px-1.5 py-0.5 rounded z-10">
            PRO
          </div>
        )}

        {/* View count - top left (after PRO) */}
        <div className="absolute top-1.5 flex items-center gap-0.5 text-white text-xs bg-black/50 px-1.5 py-0.5 rounded"
          style={{ left: v.isPro ? "44px" : "6px" }}>
          <Users className="w-2.5 h-2.5 opacity-70" />
          <span>{fmtViews(v.views)}</span>
        </div>

        {/* Level badge - top right */}
        <div className="absolute top-1.5 right-1.5 text-xs font-bold text-white px-1.5 py-0.5 rounded"
          style={{ background: LEVEL_COLOR[v.level] ?? "#6b7280" }}>
          {v.level}
        </div>

        {/* Source - bottom left */}
        <div className="absolute bottom-1.5 left-1.5 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1"
          style={{ background: isAudio ? "#1d4ed8" : "#dc2626" }}>
          {isAudio ? "🎧 Audio" : "▶ Youtube"}
        </div>

        {/* Duration - bottom right */}
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />{fmt(v.durationSec)}
        </div>
      </div>

      {/* Title - fixed 2 lines with min-height for uniform layout */}
      <div className="px-2.5 pt-2 pb-1" onClick={onClick}>
        <p className="text-xs font-medium leading-tight line-clamp-2"
          style={{ color: v.isPro ? "#fbbf24" : "white", minHeight: "2.5rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {v.title}
        </p>
      </div>

      {/* Dictation / Shadowing - always at same position */}
      <div className="flex items-center justify-between px-2.5 pb-2.5 pt-0.5 border-t border-white/5 mt-1">
        <button onClick={onClick}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          <Clock className="w-3 h-3" /> Dictation
        </button>
        <button onClick={onClick}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          <Clock className="w-3 h-3" /> Shadowing
        </button>
      </div>
    </div>
  );
}

export default function VideosPage() {
  const router = useRouter();
  const { completedVideos } = useAppStore();
  const { user } = useAuthStore();
  const isPremium = user?.isPremium ?? false;
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const grouped = CATEGORIES.map(cat => ({
    cat,
    videos: VIDEO_LESSONS.filter(v => v.category === cat && v.language === "English"),
  })).filter(g => g.videos.length > 0);

  const displayed = activeTag ? grouped.filter(g => g.cat === activeTag) : grouped;

  const handleVideo = (v: VideoLesson) => router.push(`/videos/${v.id}`);

  return (
    <div className="p-5 max-w-5xl">
      <div className="pt-2 mb-4">
        <h1 className="text-xl font-bold text-white">Video Lessons</h1>
        <p className="text-sm text-gray-500 mt-0.5">Luyện nghe · Dictation · Shadowing</p>
      </div>

      {/* Hashtag filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveTag(activeTag === cat ? null : cat)}
            className={cn("px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
              activeTag === cat
                ? "border-blue-500 bg-blue-900/30 text-white"
                : "border-gray-700 bg-gray-800/60 text-gray-400 hover:border-gray-600 hover:text-gray-200")}>
            # {cat}
          </button>
        ))}
      </div>

      {/* Category sections */}
      <div className="flex flex-col gap-8">
        {displayed.map(({ cat, videos }) => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                {cat}
                <span className="text-gray-500 text-sm font-normal">({videos.length} bài học)</span>
              </h2>
              <button className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs font-medium transition-colors">
                Xem tất cả <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {videos.slice(0, 4).map((v) => {
                const locked = !isPremium && !!v.isPro;
                return (
                  <VideoCard key={v.id} v={v} locked={locked}
                    onClick={() => locked ? router.push("/premium") : handleVideo(v)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
