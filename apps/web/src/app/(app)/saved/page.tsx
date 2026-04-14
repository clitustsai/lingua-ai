"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Bookmark, Trash2, Volume2, Search, X, Share2 } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

export default function SavedPage() {
  const { savedPhrases, removePhrase, settings } = useAppStore();
  const [search, setSearch] = useState("");

  const filtered = savedPhrases.filter(p =>
    !search || p.text.toLowerCase().includes(search.toLowerCase()) || p.translation.toLowerCase().includes(search.toLowerCase())
  );

  const share = (phrase: typeof savedPhrases[0]) => {
    const text = `"${phrase.text}"\n${phrase.translation}\n\n— Học với LinguaAI 🧠`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      alert("Đã copy vào clipboard!");
    }
  };

  return (
    <div className="p-5 max-w-xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-yellow-400" /> Câu hay đã lưu
        </h1>
        <p className="text-sm text-gray-500 mt-1">{savedPhrases.length} câu đã bookmark</p>
      </div>

      {savedPhrases.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm kiếm câu..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <Bookmark className="w-12 h-12 text-gray-700" />
          <p className="text-gray-500 text-sm">
            {search ? "Không tìm thấy câu nào." : "Chưa có câu nào được lưu.\nNhấn 🔖 trong chat để bookmark câu hay."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(phrase => (
            <div key={phrase.id} className="rounded-2xl p-4"
              style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm leading-relaxed">{phrase.text}</p>
                  {phrase.translation && (
                    <p className="text-gray-400 text-xs mt-1 italic">{phrase.translation}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-1.5">
                    {new Date(phrase.savedAt).toLocaleDateString("vi-VN")} · {phrase.language.toUpperCase()}
                  </p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => speakText(phrase.text, phrase.language)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 hover:bg-gray-700 transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => share(phrase)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-gray-700 transition-colors">
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => removePhrase(phrase.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-gray-700 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
