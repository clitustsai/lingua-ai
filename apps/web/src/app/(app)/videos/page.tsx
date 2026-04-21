"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { VIDEO_LESSONS, CATEGORIES } from "@/lib/videoLessons";
import { Clock, Users, ChevronRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

function fmt(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function fmtViews(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(0) + "k";
  return String(n);
}

const LEVEL_COLOR: Record<string, string> = {
  A1:"bg-green-500", A2:"bg-green-500", "A1-A2":"bg-green-500",
  B1:"bg-blue-500",  "A2-B1":"bg-blue-500", "B1-B2":"bg-blue-500",
  B2:"bg-purple-500","B2-C1":"bg-purple-500",
  C1:"bg-orange-500","C2":"bg-red-500",
};

function VideoCard({ v, locked, onDictation, onShadowing, onClick }: {
  v: ReturnType<typeof VIDEO_LESSONS[0]["id"] extends string ? () => typeof VIDEO_LESSONS[0] : never>;
  locked: boolean; onDictation: () => void; onShadowing: () => void; onClick: () => void;
}) {
  const thumb = `https://img.youtube.com/vi/${(v as any).youtubeId}/mqdefault.jpg`;
  const isAudio = (v as any).teacher === "Audio";
  return (
    <div className={cn("rounded-xl overflow-hidden border transition-all hover:border-gray-600 cursor-pointer group",
      locked ? "border-yellow-700/40" : "border-gray-700/60")}
      style={{ background: "rgba(18,12,36,0.9)" }}>
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gray-900" onClick={onClick}>
        {isAudio ? (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1e3a5f,#0f2040)" }}>
            <div className="text-center">
              <div className="text-4xl font-black text-white opacity-80">{(v as any).category.split(" ")[0]}</div>
              <div className="text-blue-300 text-sm mt-1">🎧 Audio</div>
            </div>
          </div>
        ) : (
          <img src={thumb} alt={(v as any).title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {/* Overlays */}
        {locked && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Crown className="w-8 h-8 text-yellow-400" />
          </div>
        )}
        {(v as any).isPro && (
          <div className="absolute top-1.5 left-1.5 bg-yellow-500 text-black text-xs font-black px-1.5 py-0.5 rounded">PRO</div>
        )}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 text-white text-xs"
          style={{ left: (v as any).isPro ? "44px" : "6px" }}>
          <Users className="w-3 h-3 opacity-70" />
          <span className="opacity-80">{fmtViews((v as any).views)}</span>
        </div>
        <div className="absolute top-1.5 right-1.5 text-xs font-bold text-white px-1.5 py-0.5 rounded"
          style={{ background: LEVEL_COLOR[(v as any).level] ?? "#6b7280" }}>
          {(v as any).level}
        </div>
        <div className="absolute bottom-1.5 left-1.5 bg-red-600/90 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          {isAudio ? "🎧 Audio" : "▶ Youtube"}
        </div>
        <div className="absolute bottom-1.5 right-1.5 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />{fmt((v as any).durationSec)}
        </div>
      </div>
      {/* Info */}
      <div className="px-2.5 pt-2 pb-1" onClick={onClick}>
        <p className="text-white text-xs font-medium leading-tight line-clamp-2 min-h-[2.5rem]"
          style={{ color: (v as any).isPro ? "#fbbf24" : "white" }}>
          {(v as any).title}
        </p>
      </div>
      {/* Dictation / Shadowing */}
      <div className="flex items-center justify-between px-2.5 pb-2.5 pt-1">
        <button onClick={onDictation}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors">
          <Clock className="w-3 h-3" /> Dictation
        </button>
        <button onClick={onShadowing}
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

  // Group by category
  const grouped = CATEGORIES.map(cat => ({
    cat,
    videos: VIDEO_LESSONS.filter(v => v.category === cat && v.language === "English"),
  })).filter(g => g.videos.length > 0);

  const displayed = activeTag
    ? grouped.filter(g => g.cat === activeTag)
    : grouped;

  const handleVideo = (v: typeof VIDEO_LESSONS[0]) => {
    router.push(`/videos/${v.id}`);
  };

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
              {videos.slice(0, 4).map((v, idx) => {
                const locked = !isPremium && idx >= 2 && v.isPro;
                return (
                  <VideoCard key={v.id} v={v as any} locked={!!locked}
                    onClick={() => locked ? router.push("/premium") : handleVideo(v)}
                    onDictation={() => locked ? router.push("/premium") : handleVideo(v)}
                    onShadowing={() => locked ? router.push("/premium") : handleVideo(v)}
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
