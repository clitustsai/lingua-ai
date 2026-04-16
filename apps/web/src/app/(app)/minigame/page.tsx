"use client";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Trophy, Zap, RotateCcw, Star, Gift, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

// ── WORD SCRAMBLE DATA ──────────────────────────────────────────────────────
const SCRAMBLE_WORDS = [
  { word: "BEAUTIFUL", hint: "Very attractive / Rất đẹp", emoji: "🌸" },
  { word: "ADVENTURE", hint: "Exciting journey / Cuộc phiêu lưu", emoji: "🗺️" },
  { word: "KNOWLEDGE", hint: "Information learned / Kiến thức", emoji: "📚" },
  { word: "CHALLENGE", hint: "A difficult task / Thử thách", emoji: "💪" },
  { word: "WONDERFUL", hint: "Amazing / Tuyệt vời", emoji: "✨" },
  { word: "IMPORTANT", hint: "Very significant / Quan trọng", emoji: "⭐" },
  { word: "CONFIDENT", hint: "Sure of yourself / Tự tin", emoji: "😎" },
  { word: "EXCELLENT", hint: "Very good / Xuất sắc", emoji: "🏆" },
];

// ── WORD MATCH DATA ─────────────────────────────────────────────────────────
const MATCH_PAIRS = [
  { en: "Happy", vi: "Vui vẻ" }, { en: "Angry", vi: "Tức giận" },
  { en: "Hungry", vi: "Đói bụng" }, { en: "Tired", vi: "Mệt mỏi" },
  { en: "Excited", vi: "Hào hứng" }, { en: "Nervous", vi: "Lo lắng" },
  { en: "Proud", vi: "Tự hào" }, { en: "Bored", vi: "Chán nản" },
];

// ── SPEED QUIZ DATA ─────────────────────────────────────────────────────────
const SPEED_QS = [
  { q: "What is the past tense of 'go'?", a: "went", opts: ["goed", "went", "gone", "going"] },
  { q: "Choose the correct: 'She ___ to school every day'", a: "goes", opts: ["go", "goes", "going", "gone"] },
  { q: "What does 'enormous' mean?", a: "Very large", opts: ["Very small", "Very fast", "Very large", "Very old"] },
  { q: "Which is correct?", a: "I have been waiting", opts: ["I have been waiting", "I has been waiting", "I am been waiting", "I was been waiting"] },
  { q: "Synonym of 'happy'?", a: "Joyful", opts: ["Sad", "Angry", "Joyful", "Tired"] },
  { q: "What is the plural of 'child'?", a: "children", opts: ["childs", "childes", "children", "childrens"] },
  { q: "Choose the correct article: '___ apple'", a: "an", opts: ["a", "an", "the", "no article"] },
  { q: "What does 'persevere' mean?", a: "Keep trying", opts: ["Give up", "Keep trying", "Run fast", "Sleep well"] },
  { q: "Opposite of 'ancient'?", a: "Modern", opts: ["Old", "Modern", "Huge", "Tiny"] },
  { q: "'I ___ my homework yesterday'", a: "did", opts: ["do", "does", "did", "done"] },
];

const PRIZES = [
  { score: 0,  label: "Người mới bắt đầu", emoji: "🌱", xp: 10 },
  { score: 3,  label: "Học viên tiềm năng", emoji: "⚡", xp: 25 },
  { score: 6,  label: "Chiến binh tiếng Anh", emoji: "🔥", xp: 50 },
  { score: 8,  label: "Bậc thầy từ vựng", emoji: "🏆", xp: 100 },
  { score: 10, label: "Huyền thoại LinguaAI", emoji: "👑", xp: 200 },
];

function scramble(word: string): string {
  const arr = word.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const result = arr.join("");
  return result === word ? scramble(word) : result;
}

// ── GAME 1: WORD SCRAMBLE ───────────────────────────────────────────────────
function ScrambleGame({ onFinish }: { onFinish: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [scrambled, setScrambled] = useState(() => scramble(SCRAMBLE_WORDS[0].word));
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [timeLeft, setTimeLeft] = useState(20);

  const current = SCRAMBLE_WORDS[idx];

  useEffect(() => {
    if (timeLeft <= 0) { next(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  const next = (correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    if (idx + 1 >= SCRAMBLE_WORDS.length) { onFinish(newScore); return; }
    setScore(newScore);
    setIdx(i => i + 1);
    setScrambled(scramble(SCRAMBLE_WORDS[idx + 1].word));
    setInput("");
    setFeedback(null);
    setTimeLeft(20);
  };

  const check = () => {
    const correct = input.trim().toUpperCase() === current.word;
    setFeedback(correct ? "correct" : "wrong");
    setTimeout(() => next(correct), 800);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{idx + 1}/{SCRAMBLE_WORDS.length}</span>
        <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold", timeLeft <= 5 ? "bg-red-900/30 text-red-400" : "bg-gray-800 text-gray-300")}>
          <Timer className="w-4 h-4" /> {timeLeft}s
        </div>
        <span className="text-sm text-primary-400 font-bold">Score: {score}</span>
      </div>

      <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="text-4xl mb-2">{current.emoji}</div>
        <p className="text-gray-400 text-sm mb-4">{current.hint}</p>
        <div className="flex gap-2 justify-center flex-wrap mb-2">
          {scrambled.split("").map((c: string, i: number) => (
            <div key={i} className="w-9 h-9 rounded-xl bg-primary-900/40 border border-primary-500/30 flex items-center justify-center text-white font-bold text-lg">
              {c}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-1">Sắp xếp lại thành từ đúng</p>
      </div>

      <div className={cn("rounded-2xl p-1 border-2 transition-colors", feedback === "correct" ? "border-green-500" : feedback === "wrong" ? "border-red-500" : "border-gray-700")}>
        <input value={input} onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && check()}
          placeholder="Nhập từ..."
          className="w-full bg-transparent px-4 py-3 text-white text-center text-xl font-bold tracking-widest focus:outline-none placeholder-gray-600"
        />
      </div>

      <button onClick={check} disabled={!input.trim()}
        className="w-full py-3.5 rounded-2xl font-bold text-white transition-all disabled:opacity-40"
        style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
        Kiểm tra ✓
      </button>
    </div>
  );
}

// ── GAME 2: SPEED QUIZ ──────────────────────────────────────────────────────
function SpeedQuiz({ onFinish }: { onFinish: (score: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);

  const current = SPEED_QS[idx];

  useEffect(() => {
    if (selected) return;
    if (timeLeft <= 0) { next(false); return; }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, selected]);

  const next = (correct: boolean) => {
    const ns = correct ? score + 1 : score;
    if (idx + 1 >= SPEED_QS.length) { setTimeout(() => onFinish(ns), 600); return; }
    setScore(ns);
    setIdx(i => i + 1);
    setSelected(null);
    setTimeLeft(15);
  };

  const pick = (opt: string) => {
    if (selected) return;
    setSelected(opt);
    const correct = opt === current.a;
    setTimeout(() => next(correct), 700);
  };

  const pct = (timeLeft / 15) * 100;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-400">{idx + 1}/{SPEED_QS.length}</span>
        <span className="text-sm text-primary-400 font-bold">Score: {score}</span>
      </div>

      <div className="w-full bg-gray-800 rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: pct > 50 ? "#10b981" : pct > 25 ? "#f59e0b" : "#ef4444" }} />
      </div>

      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-white font-semibold text-base leading-relaxed">{current.q}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {current.opts.map(opt => {
          const isSelected = selected === opt;
          const isCorrect = opt === current.a;
          let style = "border-gray-700 bg-gray-800 text-gray-300";
          if (selected) {
            if (isCorrect) style = "border-green-500 bg-green-900/30 text-green-300";
            else if (isSelected) style = "border-red-500 bg-red-900/30 text-red-300";
          }
          return (
            <button key={opt} onClick={() => pick(opt)}
              className={cn("px-3 py-3 rounded-xl border text-sm font-medium text-left transition-all", style)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── GAME 3: WORD MATCH ──────────────────────────────────────────────────────
function WordMatch({ onFinish }: { onFinish: (score: number) => void }) {
  const pairs = MATCH_PAIRS.slice(0, 6);
  const [matched, setMatched] = useState<string[]>([]);
  const [selectedEn, setSelectedEn] = useState<string | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);

  const viWords = [...pairs.map(p => p.vi)].sort(() => Math.random() - 0.5);

  const pickEn = (en: string) => { if (matched.includes(en)) return; setSelectedEn(en); };

  const pickVi = (vi: string) => {
    if (!selectedEn) return;
    const pair = pairs.find(p => p.en === selectedEn);
    setMoves(m => m + 1);
    if (pair?.vi === vi) {
      const newMatched = [...matched, selectedEn];
      setMatched(newMatched);
      setSelectedEn(null);
      if (newMatched.length === pairs.length) {
        const score = Math.max(6 - Math.floor(moves / 2), 1);
        setTimeout(() => onFinish(score), 500);
      }
    } else {
      setWrong(vi);
      setTimeout(() => { setWrong(null); setSelectedEn(null); }, 600);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Nối từ tiếng Anh với nghĩa tiếng Việt</p>
        <span className="text-sm text-primary-400 font-bold">{matched.length}/{pairs.length}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">
          {pairs.map(p => {
            const done = matched.includes(p.en);
            const sel = selectedEn === p.en;
            return (
              <button key={p.en} onClick={() => pickEn(p.en)}
                className={cn("px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  done ? "border-green-500 bg-green-900/20 text-green-400 line-through"
                    : sel ? "border-primary-500 bg-primary-900/30 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
                {p.en}
              </button>
            );
          })}
        </div>
        <div className="flex flex-col gap-2">
          {viWords.map(vi => {
            const pair = pairs.find(p => p.vi === vi);
            const done = pair ? matched.includes(pair.en) : false;
            const isWrong = wrong === vi;
            return (
              <button key={vi} onClick={() => pickVi(vi)}
                className={cn("px-3 py-2.5 rounded-xl border text-sm font-medium transition-all",
                  done ? "border-green-500 bg-green-900/20 text-green-400 line-through"
                    : isWrong ? "border-red-500 bg-red-900/20 text-red-400"
                    : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
                {vi}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── MAIN PAGE ───────────────────────────────────────────────────────────────
const GAMES = [
  { id: "scramble", label: "Word Scramble", emoji: "🔤", desc: "Sắp xếp chữ cái thành từ đúng", color: "#8b5cf6" },
  { id: "speed",    label: "Speed Quiz",    emoji: "⚡", desc: "Trả lời nhanh 10 câu hỏi",      color: "#f59e0b" },
  { id: "match",    label: "Word Match",    emoji: "🎯", desc: "Nối từ Anh-Việt cho đúng",      color: "#10b981" },
];

export default function MiniGamePage() {
  const { totalXp, unlockAchievement } = useAppStore();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [result, setResult] = useState<{ score: number; game: string } | null>(null);
  const [todayPlayed, setTodayPlayed] = useState<string[]>([]);

  const getPrize = (score: number) => {
    return [...PRIZES].reverse().find(p => score >= p.score) || PRIZES[0];
  };

  const finish = (score: number) => {
    if (!activeGame) return;
    setResult({ score, game: activeGame });
    setTodayPlayed(p => [...p, activeGame]);
  };

  const reset = () => { setActiveGame(null); setResult(null); };

  if (result) {
    const prize = getPrize(result.score);
    const maxScore = result.game === "match" ? 6 : result.game === "scramble" ? SCRAMBLE_WORDS.length : SPEED_QS.length;
    return (
      <div className="p-5 max-w-lg flex flex-col items-center gap-5 pt-10">
        <div className="text-7xl animate-float">{prize.emoji}</div>
        <div className="text-center">
          <p className="text-white font-black text-2xl">{prize.label}</p>
          <p className="text-gray-400 mt-1">Score: {result.score}/{maxScore}</p>
        </div>
        <div className="rounded-2xl p-5 w-full text-center"
          style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
          <p className="text-yellow-400 font-bold text-lg">+{prize.xp} XP</p>
          <p className="text-gray-400 text-sm mt-1">Phần thưởng của bạn hôm nay</p>
          <div className="flex justify-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={cn("w-5 h-5", i < Math.ceil((result.score / maxScore) * 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-700")} />
            ))}
          </div>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={reset}
            className="flex-1 py-3 rounded-2xl font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            Chơi lại
          </button>
          <button onClick={() => { setResult(null); setActiveGame(null); }}
            className="flex-1 py-3 rounded-2xl font-bold border border-gray-700 text-gray-300 hover:text-white transition-colors">
            Chọn game khác
          </button>
        </div>
      </div>
    );
  }

  if (activeGame) {
    const game = GAMES.find(g => g.id === activeGame)!;
    return (
      <div className="p-5 max-w-lg">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={reset} className="text-gray-400 hover:text-white transition-colors text-sm">← Quay lại</button>
          <div className="flex items-center gap-2">
            <span className="text-xl">{game.emoji}</span>
            <p className="text-white font-bold">{game.label}</p>
          </div>
        </div>
        {activeGame === "scramble" && <ScrambleGame onFinish={finish} />}
        {activeGame === "speed" && <SpeedQuiz onFinish={finish} />}
        {activeGame === "match" && <WordMatch onFinish={finish} />}
      </div>
    );
  }

  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" /> Mini Games
        </h1>
        <p className="text-sm text-gray-400 mt-1">Chơi game học tiếng Anh · Nhận XP · Mở huy hiệu</p>
      </div>

      {/* Daily reward banner */}
      <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
        style={{ background: "linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.1))", border: "1px solid rgba(245,158,11,0.3)" }}>
        <Gift className="w-8 h-8 text-yellow-400 shrink-0" />
        <div>
          <p className="text-white font-semibold text-sm">Phần thưởng hàng ngày</p>
          <p className="text-gray-400 text-xs">Chơi đủ 3 game hôm nay để nhận 500 XP bonus!</p>
        </div>
        <div className="ml-auto flex gap-1">
          {GAMES.map(g => (
            <div key={g.id} className={cn("w-3 h-3 rounded-full", todayPlayed.includes(g.id) ? "bg-green-400" : "bg-gray-700")} />
          ))}
        </div>
      </div>

      {/* Game cards */}
      <div className="flex flex-col gap-3 mb-6">
        {GAMES.map(game => (
          <button key={game.id} onClick={() => setActiveGame(game.id)}
            className="flex items-center gap-4 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] group"
            style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${game.color}30` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 transition-transform"
              style={{ background: `${game.color}20` }}>
              {game.emoji}
            </div>
            <div className="flex-1">
              <p className="text-white font-bold">{game.label}</p>
              <p className="text-gray-400 text-sm">{game.desc}</p>
              {todayPlayed.includes(game.id) && (
                <span className="text-xs text-green-400 font-medium">Đã chơi hôm nay ✓</span>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-500">Phần thưởng</p>
              <p className="font-bold text-sm" style={{ color: game.color }}>+200 XP</p>
            </div>
          </button>
        ))}
      </div>

      {/* Prize table */}
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Bảng phần thưởng</p>
        <div className="flex flex-col gap-2">
          {PRIZES.map(p => (
            <div key={p.score} className="flex items-center gap-3">
              <span className="text-xl w-8">{p.emoji}</span>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{p.label}</p>
                <p className="text-gray-500 text-xs">Đạt từ {p.score} điểm</p>
              </div>
              <span className="text-yellow-400 font-bold text-sm">+{p.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



