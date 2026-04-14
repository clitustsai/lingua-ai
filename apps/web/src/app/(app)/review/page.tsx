"use client";
import { useState, useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Volume2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@ai-lang/shared";

// SM-2 algorithm
function sm2(card: Flashcard, quality: 0 | 1 | 2 | 3 | 4 | 5): Partial<Flashcard> {
  const ef = Math.max(1.3, (card.easeFactor ?? 2.5) + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const reps = quality >= 3 ? (card.repetitions ?? 0) + 1 : 0;
  let interval = 1;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 6;
  else interval = Math.round((card.interval ?? 1) * ef);
  const next = new Date();
  next.setDate(next.getDate() + interval);
  return { easeFactor: ef, repetitions: reps, interval, nextReview: next.toISOString().slice(0, 10), lastReviewed: new Date().toISOString().slice(0, 10), reviewCount: (card.reviewCount ?? 0) + 1 };
}

export default function ReviewPage() {
  const { flashcards, updateFlashcard, incrementWords, checkAchievements } = useAppStore();
  const today = new Date().toISOString().slice(0, 10);

  const due = useMemo(() =>
    flashcards.filter(f => !f.nextReview || f.nextReview <= today)
      .sort((a, b) => (a.nextReview ?? "").localeCompare(b.nextReview ?? "")),
    [flashcards, today]
  );

  const [queue, setQueue] = useState<Flashcard[]>(() => [...due]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const card = queue[current];

  const rate = (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!card) return;
    updateFlashcard(card.id, sm2(card, quality));
    if (quality >= 3) {
      incrementWords(1);
      checkAchievements();
    }
    setReviewed(r => r + 1);
    if (current + 1 >= queue.length) setDone(true);
    else { setCurrent(c => c + 1); setFlipped(false); }
  };

  if (due.length === 0) return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-2">Spaced Repetition Review</h1>
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="text-5xl">🎉</div>
        <p className="text-white font-semibold">All caught up!</p>
        <p className="text-gray-400 text-sm">No cards due for review today. Come back tomorrow.</p>
        <p className="text-xs text-gray-600">{flashcards.length} total cards in your deck</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="p-6 max-w-lg">
      <h1 className="text-xl font-bold text-white mb-2">Review Complete</h1>
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <div className="text-5xl">✅</div>
        <p className="text-white font-semibold">Session done!</p>
        <p className="text-gray-400 text-sm">Reviewed {reviewed} cards</p>
        <button onClick={() => { setQueue([...due]); setCurrent(0); setFlipped(false); setDone(false); setReviewed(0); }}
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
          Review Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Spaced Repetition</h1>
          <p className="text-sm text-gray-500 mt-1">{current + 1} / {queue.length} cards due</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          <span>{queue.length - current} remaining</span>
        </div>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${(current / queue.length) * 100}%` }} />
      </div>

      {/* Card */}
      <div className="relative cursor-pointer mb-6" style={{ perspective: "1000px" }} onClick={() => setFlipped(!flipped)}>
        <div className="relative w-full transition-transform duration-500" style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)", minHeight: 200 }}>
          {/* Front */}
          <div className="absolute inset-0 bg-gray-800 border border-gray-700 rounded-2xl p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden" }}>
            <div className="flex items-start justify-between">
              <span className="text-xs text-gray-500 uppercase">{card.language}</span>
              <button onClick={e => { e.stopPropagation(); speakText(card.word, card.language); }} className="p-1.5 rounded-lg text-gray-500 hover:text-primary-400 transition-colors">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-white">{card.word}</p>
            </div>
            <p className="text-xs text-gray-500 text-center">Tap to reveal translation</p>
          </div>
          {/* Back */}
          <div className="absolute inset-0 bg-accent-600/10 border border-accent-500/30 rounded-2xl p-6 flex flex-col justify-between" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
            <div className="text-xs text-gray-500 uppercase">{card.language}</div>
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-300">{card.translation}</p>
              {card.example && <p className="text-sm text-gray-400 mt-3 italic">{card.example}</p>}
            </div>
            <p className="text-xs text-gray-500 text-center">How well did you know this?</p>
          </div>
        </div>
      </div>

      {/* Rating buttons */}
      {flipped && (
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Again", q: 0 as const, color: "bg-red-900/40 border-red-700/50 text-red-300 hover:bg-red-900/60" },
            { label: "Hard", q: 2 as const, color: "bg-orange-900/40 border-orange-700/50 text-orange-300 hover:bg-orange-900/60" },
            { label: "Good", q: 3 as const, color: "bg-blue-900/40 border-blue-700/50 text-blue-300 hover:bg-blue-900/60" },
            { label: "Easy", q: 5 as const, color: "bg-green-900/40 border-green-700/50 text-green-300 hover:bg-green-900/60" },
          ].map(({ label, q, color }) => (
            <button key={label} onClick={() => rate(q)}
              className={cn("py-3 rounded-xl border text-sm font-medium transition-colors", color)}>
              {label}
            </button>
          ))}
        </div>
      )}

      {!flipped && (
        <button onClick={() => setFlipped(true)} className="w-full py-3 bg-primary-600/20 border border-primary-500/30 text-primary-300 rounded-xl text-sm font-medium hover:bg-primary-600/30 transition-colors">
          Show Answer
        </button>
      )}
    </div>
  );
}
