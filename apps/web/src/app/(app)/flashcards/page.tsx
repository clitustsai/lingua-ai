"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import FlashcardItem from "@/components/FlashcardItem";
import QuizMode from "@/components/QuizMode";
import { BookOpen, Search, Trophy, X, Download } from "lucide-react";

function exportCSV(flashcards: any[]) {
  const header = "Word,Translation,Example,Language\n";
  const rows = flashcards.map(f =>
    `"${f.word}","${f.translation}","${f.example}","${f.language}"`
  ).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "flashcards.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function FlashcardsPage() {
  const { flashcards, removeFlashcard } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [quizOpen, setQuizOpen] = useState(false);

  const langs = Array.from(new Set(flashcards.map((f) => f.language)));

  const filtered = flashcards.filter((f) => {
    const matchLang = filterLang === "all" || f.language === filterLang;
    const matchSearch =
      !search ||
      f.word.toLowerCase().includes(search.toLowerCase()) ||
      f.translation.toLowerCase().includes(search.toLowerCase());
    return matchLang && matchSearch;
  });

  if (quizOpen) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <QuizMode flashcards={flashcards} onClose={() => setQuizOpen(false)} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Flashcards</h1>
          <p className="text-sm text-gray-500 mt-1">{flashcards.length} cards saved</p>
        </div>
        {flashcards.length >= 2 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(flashcards)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-xl text-sm hover:border-gray-600 transition-colors"
            >
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => setQuizOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-600/20 border border-yellow-500/30 text-yellow-300 rounded-xl text-sm font-medium hover:bg-yellow-600/30 transition-colors"
            >
              <Trophy className="w-4 h-4" /> Quiz Me
            </button>
          </div>
        )}
      </div>

      {flashcards.length > 0 && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search words..."
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Language filter */}
          {langs.length > 1 && (
            <select
              value={filterLang}
              onChange={(e) => setFilterLang(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-primary-500"
            >
              <option value="all">All languages</option>
              {langs.map((l) => (
                <option key={l} value={l}>{l.toUpperCase()}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {flashcards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
          <BookOpen className="w-12 h-12 text-gray-700" />
          <p className="text-gray-500 text-sm max-w-xs">
            No flashcards yet. Save words from your conversations to build your vocabulary.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-40 gap-2 text-center">
          <p className="text-gray-500 text-sm">No cards match your search.</p>
          <button onClick={() => { setSearch(""); setFilterLang("all"); }} className="text-xs text-primary-400 hover:underline">Clear filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((card) => (
            <FlashcardItem key={card.id} card={card} onDelete={removeFlashcard} />
          ))}
        </div>
      )}
    </div>
  );
}
