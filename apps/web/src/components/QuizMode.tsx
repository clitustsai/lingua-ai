"use client";
import { useState } from "react";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Flashcard } from "@ai-lang/shared";

interface Question {
  id: string;
  word: string;
  correct: string;
  options: string[];
}

interface Props {
  flashcards: Flashcard[];
  onClose: () => void;
}

export default function QuizMode({ flashcards, onClose }: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcards }),
    });
    const data = await res.json();
    setQuestions(data.questions || []);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setDone(false);
    setLoading(false);
  };

  const answer = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    if (opt === questions[current].correct) setScore((s) => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 900);
  };

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <Trophy className="w-16 h-16 text-yellow-400" />
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Flashcard Quiz</h2>
          <p className="text-gray-400 text-sm">Test your knowledge with {Math.min(flashcards.length, 10)} questions</p>
        </div>
        <button
          onClick={startQuiz}
          disabled={loading}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Loading..." : "Start Quiz"}
        </button>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-300">Cancel</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="text-6xl">{pct >= 80 ? "🏆" : pct >= 50 ? "👍" : "📚"}</div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white">{score}/{questions.length}</h2>
          <p className="text-gray-400 mt-1">{pct >= 80 ? "Excellent!" : pct >= 50 ? "Good job!" : "Keep studying!"}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={startQuiz} className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4" /> Retry
          </button>
          <button onClick={onClose} className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-sm font-medium transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  return (
    <div className="flex flex-col gap-6 py-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{current + 1} / {questions.length}</span>
        <span className="text-sm text-primary-400 font-medium">Score: {score}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${((current) / questions.length) * 100}%` }} />
      </div>
      <div className="bg-gray-800 rounded-2xl p-8 text-center">
        <p className="text-xs text-gray-500 mb-2">What does this mean?</p>
        <h3 className="text-3xl font-bold text-white">{q.word}</h3>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {q.options.map((opt) => {
          const isCorrect = opt === q.correct;
          const isSelected = opt === selected;
          return (
            <button
              key={opt}
              onClick={() => answer(opt)}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                !selected
                  ? "border-gray-700 bg-gray-800 text-gray-200 hover:border-primary-500 hover:bg-primary-900/20"
                  : isCorrect
                  ? "border-green-500 bg-green-900/30 text-green-300"
                  : isSelected
                  ? "border-red-500 bg-red-900/30 text-red-300"
                  : "border-gray-700 bg-gray-800 text-gray-500 opacity-60"
              )}
            >
              <span>{opt}</span>
              {selected && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              {selected && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
