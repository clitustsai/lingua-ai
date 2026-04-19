"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import FlashcardItem from "@/components/FlashcardItem";
import QuizMode from "@/components/QuizMode";
import { BookOpen, Search, Trophy, X, Download, Bell, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

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

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function FlashcardsPage() {
  const { flashcards, removeFlashcard, updateFlashcard } = useAppStore();
  const [search, setSearch] = useState("");
  const [filterLang, setFilterLang] = useState("all");
  const [quizOpen, setQuizOpen] = useState(false);
  const [srsMode, setSrsMode] = useState(false);
  const [srsIdx, setSrsIdx] = useState(0);
  const [srsFlipped, setSrsFlipped] = useState(false);

  const langs = Array.from(new Set(flashcards.map((f) => f.language)));
  const today = todayStr();

  // SRS: cards due for review today
  const dueCards = flashcards.filter(f => !f.nextReview || f.nextReview <= today);

  const filtered = flashcards.filter((f) => {
    const matchLang = filterLang === "all" || f.language === filterLang;
    const matchSearch = !search || f.word.toLowerCase().includes(search.toLowerCase()) || f.translation.toLowerCase().includes(search.toLowerCase());
    return matchLang && matchSearch;
  });

  // SRS rating: update interval based on ease
  const rateSRS = (ease: "easy" | "good" | "hard") => {
    const card = dueCards[srsIdx];
    if (!card) return;
    const ef = card.easeFactor ?? 2.5;
    const rep = (card.repetitions ?? 0) + 1;
    let interval = card.interval ?? 1;
    let newEf = ef;
    if (ease === "easy") { interval = Math.round(interval * ef * 1.3); newEf = Math.min(ef + 0.15, 3); }
    else if (ease === "good") { interval = Math.round(interval * ef); }
    else { interval = 1; newEf = Math.max(ef - 0.2, 1.3); }
    const next = new Date(); next.setDate(next.getDate() + interval);
    updateFlashcard(card.id, { interval, easeFactor: newEf, repetitions: rep, nextReview: next.toISOString().slice(0, 10), lastReviewed: today });
    setSrsFlipped(false);
    if (srsIdx + 1 >= dueCards.length) { setSrsMode(false); setSrsIdx(0); }
    else setSrsIdx(i => i + 1);
  };

  if (srsMode && dueCards.length > 0) {
    const card = dueCards[srsIdx];
    return (
      <div className="p-6 max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold">Ôn tập hôm nay</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">{srsIdx + 1}/{dueCards.length}</span>
            <button onClick={() => { setSrsMode(false); setSrsIdx(0); }} className="text-gray-500 hover:text-gray-300 text-xs">Thoát</button>
          </div>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
          <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${(srsIdx / dueCards.length) * 100}%` }} />
        </div>
        <div className="rounded-2xl p-8 text-center cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-4"
          style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.3)" }}
          onClick={() => setSrsFlipped(f => !f)}>
          {!srsFlipped ? (
            <>
              <p className="text-3xl font-bold text-white">{card.word}</p>
              <p className="text-xs text-gray-500">Nhấn để xem nghĩa</p>
            </>
          ) : (
            <>
              <p className="text-xl text-primary-300 font-semibold">{card.translation}</p>
              {card.example && <p className="text-sm text-gray-400 italic">"{card.example}"</p>}
            </>
          )}
        </div>
        {srsFlipped && (
          <div className="flex gap-2 mt-4">
            {([
              { label: "Khó", ease: "hard" as const, color: "bg-red-600/20 border-red-600/40 text-red-300" },
              { label: "Được", ease: "good" as const, color: "bg-yellow-600/20 border-yellow-600/40 text-yellow-300" },
              { label: "Dễ", ease: "easy" as const, color: "bg-green-600/20 border-green-600/40 text-green-300" },
            ]).map(b => (
              <button key={b.ease} onClick={() => rateSRS(b.ease)}
                className={cn("flex-1 py-3 rounded-xl border text-sm font-semibold transition-all hover:opacity-80", b.color)}>
                {b.label}
              </button>
            ))}
          </div>
        )}
        {!srsFlipped && <p className="text-center text-xs text-gray-600 mt-3">Nhấn vào thẻ để lật</p>}
      </div>
    );
  }

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

      {/* SRS due cards banner */}
      {dueCards.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 rounded-2xl mb-5"
          style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)" }}>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-400" />
            <span className="text-sm text-white font-semibold">{dueCards.length} thẻ cần ôn hôm nay</span>
          </div>
          <button onClick={() => { setSrsMode(true); setSrsIdx(0); setSrsFlipped(false); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold transition-colors">
            <Zap className="w-3.5 h-3.5" /> Ôn ngay
          </button>
        </div>
      )}

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
