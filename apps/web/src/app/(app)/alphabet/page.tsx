"use client";
import { useState } from "react";
import { Volume2, X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

const VOWELS = [
  { symbol: "ɑ",  example: "hot",   audio: "hot" },
  { symbol: "æ",  example: "cat",   audio: "cat" },
  { symbol: "ʌ",  example: "but",   audio: "but" },
  { symbol: "ɛ",  example: "bed",   audio: "bed" },
  { symbol: "eɪ", example: "say",   audio: "say" },
  { symbol: "ɜ",  example: "bird",  audio: "bird" },
  { symbol: "ɪ",  example: "ship",  audio: "ship" },
  { symbol: "i",  example: "sheep", audio: "sheep" },
  { symbol: "ə",  example: "about", audio: "about" },
  { symbol: "oʊ", example: "boat",  audio: "boat" },
  { symbol: "ʊ",  example: "foot",  audio: "foot" },
  { symbol: "u",  example: "food",  audio: "food" },
  { symbol: "aʊ", example: "cow",   audio: "cow" },
  { symbol: "aɪ", example: "time",  audio: "time" },
  { symbol: "ɔɪ", example: "boy",   audio: "boy" },
];

const CONSONANTS = [
  { symbol: "b",  example: "book",    audio: "book" },
  { symbol: "tʃ", example: "chair",   audio: "chair" },
  { symbol: "d",  example: "day",     audio: "day" },
  { symbol: "f",  example: "fish",    audio: "fish" },
  { symbol: "g",  example: "go",      audio: "go" },
  { symbol: "h",  example: "home",    audio: "home" },
  { symbol: "dʒ", example: "job",     audio: "job" },
  { symbol: "k",  example: "key",     audio: "key" },
  { symbol: "l",  example: "lion",    audio: "lion" },
  { symbol: "m",  example: "moon",    audio: "moon" },
  { symbol: "n",  example: "nose",    audio: "nose" },
  { symbol: "ŋ",  example: "sing",    audio: "sing" },
  { symbol: "p",  example: "pig",     audio: "pig" },
  { symbol: "r",  example: "red",     audio: "red" },
  { symbol: "s",  example: "see",     audio: "see" },
  { symbol: "ʒ",  example: "measure", audio: "measure" },
  { symbol: "ʃ",  example: "shoe",    audio: "shoe" },
  { symbol: "t",  example: "time",    audio: "time" },
  { symbol: "ð",  example: "then",    audio: "then" },
  { symbol: "θ",  example: "think",   audio: "think" },
  { symbol: "v",  example: "very",    audio: "very" },
  { symbol: "w",  example: "water",   audio: "water" },
  { symbol: "j",  example: "you",     audio: "you" },
  { symbol: "z",  example: "zoo",     audio: "zoo" },
];

type Sound = { symbol: string; example: string; audio: string };

function buildQuiz(sound: Sound, allSounds: Sound[]) {
  const others = allSounds.filter(s => s.symbol !== sound.symbol);
  const wrong = others[Math.floor(Math.random() * others.length)];
  return Math.random() > 0.5 ? [sound, wrong] : [wrong, sound];
}

export default function AlphabetPage() {
  const { incrementWords, checkAchievements } = useAppStore();
  const allSounds = [...VOWELS, ...CONSONANTS];

  const [quiz, setQuiz] = useState<{ sound: Sound; options: Sound[] } | null>(null);
  const [answered, setAnswered] = useState<"correct" | "wrong" | null>(null);
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState(0);
  const [quizQueue, setQuizQueue] = useState<Sound[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);

  const speak = (word: string) => {
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.85;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const startSession = () => {
    const shuffled = [...allSounds].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizQueue(shuffled);
    setQuizIdx(0);
    setXp(0);
    setProgress(0);
    setAnswered(null);
    setQuiz({ sound: shuffled[0], options: buildQuiz(shuffled[0], allSounds) });
    speak(shuffled[0].audio);
  };

  const answer = (opt: Sound) => {
    if (answered || !quiz) return;
    const correct = opt.symbol === quiz.sound.symbol;
    setAnswered(correct ? "correct" : "wrong");
    if (correct) {
      setXp(x => x + 10);
      incrementWords(1);
      checkAchievements();
    }
    setProgress(Math.round(((quizIdx + 1) / quizQueue.length) * 100));
  };

  const next = () => {
    const nextIdx = quizIdx + 1;
    if (nextIdx >= quizQueue.length) {
      setQuiz(null);
      setAnswered(null);
      return;
    }
    setQuizIdx(nextIdx);
    const nextSound = quizQueue[nextIdx];
    setQuiz({ sound: nextSound, options: buildQuiz(nextSound, allSounds) });
    setAnswered(null);
    speak(nextSound.audio);
  };

  // ── Quiz screen ──────────────────────────────────────────────────────────────
  if (quiz) return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "#111827" }}>
      <div className="flex items-center gap-3 px-5 pt-5 pb-3">
        <button onClick={() => { setQuiz(null); setAnswered(null); }}
          className="p-2 rounded-full hover:bg-gray-800 text-gray-400 transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 h-3 rounded-full bg-gray-800 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="text-yellow-400 text-sm font-bold">+{xp} KN</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
        <h2 className="text-white text-2xl font-bold">Bạn nghe được gì?</h2>

        <button onClick={() => speak(quiz.sound.audio)}
          className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl transition-transform active:scale-95"
          style={{ background: "#38bdf8" }}>
          <Volume2 className="w-12 h-12 text-gray-900" />
        </button>

        <div className="flex gap-4 w-full max-w-sm">
          {quiz.options.map((opt, i) => {
            const isCorrect = opt.symbol === quiz.sound.symbol;
            const picked = answered !== null;
            return (
              <button key={i} onClick={() => answer(opt)} disabled={!!answered}
                className={cn(
                  "flex-1 flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 text-left transition-all font-semibold text-sm",
                  !picked
                    ? "border-gray-600 bg-gray-800 text-white hover:border-blue-400"
                    : isCorrect
                    ? "border-green-500 bg-green-900/30 text-green-300"
                    : picked && !isCorrect
                    ? "border-red-500 bg-red-900/30 text-red-300"
                    : "border-gray-700 bg-gray-800/50 text-gray-500 opacity-60"
                )}>
                <span className="w-6 h-6 rounded-md border border-gray-600 flex items-center justify-center text-xs text-gray-400 shrink-0">{i + 1}</span>
                <span>{opt.example}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className={cn("w-full max-w-sm rounded-2xl p-4 flex items-center justify-between",
            answered === "correct" ? "bg-green-900/30 border border-green-600/40" : "bg-red-900/30 border border-red-600/40")}>
            <div>
              <p className={cn("font-bold text-sm", answered === "correct" ? "text-green-400" : "text-red-400")}>
                {answered === "correct" ? "🎉 Chính xác!" : "❌ Sai rồi!"}
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Đáp án: <span className="text-white font-mono font-bold">{quiz.sound.symbol}</span> — {quiz.sound.example}
              </p>
            </div>
            <button onClick={next}
              className={cn("px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1",
                answered === "correct" ? "bg-green-600 hover:bg-green-500 text-white" : "bg-red-600 hover:bg-red-500 text-white")}>
              Tiếp <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // ── Main grid ────────────────────────────────────────────────────────────────
  const SoundCard = ({ s }: { s: Sound }) => (
    <button onClick={() => speak(s.audio)}
      className="flex flex-col items-center gap-1 p-3 rounded-2xl border border-gray-700 bg-gray-800/80 hover:border-blue-500 hover:bg-gray-700/80 active:scale-95 transition-all group">
      <span className="text-white font-bold text-xl leading-none">{s.symbol}</span>
      <span className="text-gray-500 text-xs">{s.example}</span>
      <div className="w-8 h-1 rounded-full bg-gray-700 group-hover:bg-blue-500 transition-colors mt-0.5" />
    </button>
  );

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-6">
        <h1 className="text-2xl font-black text-white">Cùng học phát âm tiếng Anh!</h1>
        <p className="text-sm text-gray-400 mt-1">Tập nghe và học phát âm các âm trong tiếng Anh</p>
        <button onClick={startSession}
          className="mt-4 px-8 py-3 rounded-full font-black text-gray-900 text-sm tracking-widest uppercase transition-all hover:brightness-110 active:scale-95"
          style={{ background: "#38bdf8", boxShadow: "0 4px 0 #0284c7" }}>
          BẮT ĐẦU +10 KN
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-400 text-sm font-semibold">Nguyên âm</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {VOWELS.map(s => <SoundCard key={s.symbol} s={s} />)}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-700" />
          <span className="text-gray-400 text-sm font-semibold">Phụ âm</span>
          <div className="flex-1 h-px bg-gray-700" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {CONSONANTS.map(s => <SoundCard key={s.symbol} s={s} />)}
        </div>
      </div>
    </div>
  );
}
