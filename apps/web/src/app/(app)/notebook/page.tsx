"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { speakText } from "@/components/VoiceButton";
import { Star, Trash2, Volume2, Search, BookOpen, Copy, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const IMPORTANT_WORDS = [
  "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could", "should",
  "may", "might", "must", "shall", "can", "need", "dare", "ought",
];

function highlightImportant(text: string): React.ReactNode[] {
  const words = text.split(/(\s+)/);
  return words.map((word, i) => {
    const clean = word.toLowerCase().replace(/[^a-z]/g, "");
    const isImportant = clean.length > 3 && !IMPORTANT_WORDS.includes(clean);
    return isImportant && /^[a-zA-Z]/.test(word)
      ? <mark key={i} className="bg-yellow-500/20 text-yellow-200 rounded px-0.5">{word}</mark>
      : <span key={i}>{word}</span>;
  });
}

export default function NotebookPage() {
  const { translateHistory, toggleStarTranslation, clearTranslateHistory, flashcards, addFlashcard } = useAppStore();
  const [tab, setTab] = useState<"history" | "starred" | "vocab">("history");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const filtered = translateHistory.filter(t =>
    tab === "starred" ? t.starred : true
  ).filter(t =>
    !search || t.original.toLowerCase().includes(search.toLowerCase()) || t.translation.toLowerCase().includes(search.toLowerCase())
  );

  const vocabFiltered = flashcards.filter(f =>
    !search || f.word.toLowerCase().includes(search.toLowerCase()) || f.translation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-yellow-400" /> Notebook học
        </h1>
        <p className="text-sm text-gray-400 mt-1">Lịch sử dịch · Từ đã lưu · Highlight từ quan trọng</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl mb-4" style={{ background: "rgba(15,10,30,0.6)" }}>
        {([
          { id: "history", label: `Lịch sử (${translateHistory.length})` },
          { id: "starred", label: `⭐ Đã ghim (${translateHistory.filter(t => t.starred).length})` },
          { id: "vocab", label: `📚 Từ vựng (${flashcards.length})` },
        ] as const).map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 py-2 rounded-xl text-xs font-semibold transition-all",
              tab === t.id ? "bg-primary-600 text-white" : "text-gray-400 hover:text-gray-200")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm..."
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />
        {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {/* History / Starred */}
      {(tab === "history" || tab === "starred") && (
        <div className="flex flex-col gap-3">
          {tab === "history" && translateHistory.length > 0 && (
            <div className="flex justify-end">
              <button onClick={clearTranslateHistory}
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Xóa tất cả
              </button>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">{tab === "starred" ? "Chưa ghim câu nào" : "Chưa có lịch sử dịch"}</p>
              <p className="text-xs mt-1 text-gray-700">Dịch câu nào đó để lưu vào đây</p>
            </div>
          ) : (
            filtered.map(t => (
              <div key={t.id} className="rounded-2xl p-4"
                style={{ background: "rgba(26,16,53,0.8)", border: t.starred ? "1px solid rgba(251,191,36,0.3)" : "1px solid rgba(139,92,246,0.15)" }}>
                {/* Original */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-gray-400 text-xs">{t.fromLang} → {t.toLang}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleStarTranslation(t.id)}
                      className={cn("p-1 rounded transition-colors", t.starred ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                      <Star className="w-3.5 h-3.5" fill={t.starred ? "currentColor" : "none"} />
                    </button>
                    <button onClick={() => copy(t.translation, t.id)}
                      className="p-1 rounded text-gray-600 hover:text-green-400 transition-colors">
                      {copied === t.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2 leading-relaxed">{t.original}</p>
                <div className="border-t border-white/5 pt-2">
                  <p className="text-white font-medium text-sm leading-relaxed">
                    {highlightImportant(t.translation)}
                  </p>
                  <button onClick={() => speakText(t.translation, "en")}
                    className="mt-1.5 p-1 rounded text-gray-600 hover:text-primary-400 transition-colors">
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-gray-700 mt-2">{new Date(t.savedAt).toLocaleDateString("vi-VN")}</p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Vocab */}
      {tab === "vocab" && (
        <div className="flex flex-col gap-2">
          {vocabFiltered.length === 0 ? (
            <div className="text-center py-12 text-gray-600">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Chưa có từ vựng nào</p>
              <p className="text-xs mt-1 text-gray-700">Lưu từ từ trang Dịch thuật hoặc Video</p>
            </div>
          ) : (
            vocabFiltered.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.1)" }}>
                <button onClick={() => speakText(f.word, f.language)}
                  className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-primary-400 transition-colors shrink-0">
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm">{f.word}</p>
                  {f.example && <p className="text-gray-600 text-xs italic truncate">"{f.example}"</p>}
                </div>
                <p className="text-primary-300 text-sm shrink-0">{f.translation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
