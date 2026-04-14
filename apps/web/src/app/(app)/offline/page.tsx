"use client";
import { useAppStore } from "@/store/useAppStore";
import { useRouter } from "next/navigation";
import { WifiOff, BookOpen, RotateCcw, Bookmark } from "lucide-react";

export default function OfflinePage() {
  const { flashcards, savedPhrases, streak } = useAppStore();
  const router = useRouter();

  const offlineFeatures = [
    { icon: BookOpen, label: "Flashcards", desc: `${flashcards.length} từ đã lưu`, href: "/flashcards" },
    { icon: RotateCcw, label: "Ôn tập (SRS)", desc: "Spaced repetition", href: "/review" },
    { icon: Bookmark, label: "Câu hay", desc: `${savedPhrases.length} câu đã bookmark`, href: "/saved" },
  ];

  return (
    <div className="p-5 max-w-sm mx-auto flex flex-col items-center justify-center min-h-screen gap-6">
      <div className="text-center">
        <div className="w-20 h-20 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
          <WifiOff className="w-10 h-10 text-gray-500" />
        </div>
        <h1 className="text-xl font-bold text-white">Không có mạng</h1>
        <p className="text-gray-400 text-sm mt-2">Bạn đang offline. Một số tính năng vẫn hoạt động!</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Dùng được khi offline</p>
        {offlineFeatures.map(({ icon: Icon, label, desc, href }) => (
          <button key={href} onClick={() => router.push(href)}
            className="flex items-center gap-3 p-4 rounded-2xl text-left transition-colors hover:opacity-80"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">{label}</p>
              <p className="text-gray-500 text-xs">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 w-full text-center"
        style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}>
        <p className="text-orange-300 font-semibold">🔥 Streak: {streak} ngày</p>
        <p className="text-gray-400 text-xs mt-1">Kết nối mạng để tiếp tục học và giữ streak!</p>
      </div>
    </div>
  );
}
