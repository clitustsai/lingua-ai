"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, ChevronRight, CheckCircle2, XCircle, Target, Map, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Placement test questions per language
const QUESTIONS = [
  {
    id: 1, type: "multiple-choice",
    question: "Choose the correct sentence:",
    options: ["She don't like coffee.", "She doesn't like coffee.", "She not like coffee.", "She isn't like coffee."],
    correct: 1, level: "A1",
  },
  {
    id: 2, type: "multiple-choice",
    question: "Which is correct? 'I ___ to the gym every day.'",
    options: ["am going", "go", "goes", "gone"],
    correct: 1, level: "A1",
  },
  {
    id: 3, type: "multiple-choice",
    question: "Complete: 'If I ___ rich, I would travel the world.'",
    options: ["am", "was", "were", "be"],
    correct: 2, level: "B1",
  },
  {
    id: 4, type: "multiple-choice",
    question: "Choose the most formal version:",
    options: ["I wanna talk to you.", "I need to speak with you.", "Can we chat?", "Got a sec?"],
    correct: 1, level: "B2",
  },
  {
    id: 5, type: "multiple-choice",
    question: "'Despite ___ tired, she finished the project.'",
    options: ["be", "being", "been", "to be"],
    correct: 1, level: "B2",
  },
  {
    id: 6, type: "multiple-choice",
    question: "The word 'ubiquitous' means:",
    options: ["rare and unusual", "present everywhere", "extremely large", "very old"],
    correct: 1, level: "C1",
  },
  {
    id: 7, type: "multiple-choice",
    question: "'Had I known earlier, I ___ differently.'",
    options: ["would act", "would have acted", "will act", "acted"],
    correct: 1, level: "C1",
  },
  {
    id: 8, type: "fill-blank",
    question: "Fill in: 'The report was ___ (write) by the team last week.'",
    correct: "written", level: "B1",
    hint: "passive voice, past participle",
  },
];

type Answer = { question: string; userAnswer: string; correctAnswer: string; type: string; correct: boolean };

export default function PlacementPage() {
  const { settings, setSettings } = useAppStore();
  const [step, setStep] = useState<"intro" | "test" | "analyzing" | "result">("intro");
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [fillInput, setFillInput] = useState("");
  const [result, setResult] = useState<any>(null);

  const q = QUESTIONS[current];

  const submitAnswer = async (answer: string, isCorrect: boolean) => {
    const newAnswers = [...answers, {
      question: q.question,
      userAnswer: answer,
      correctAnswer: q.type === "multiple-choice" ? q.options![q.correct as number] : q.correct as string,
      type: q.type,
      correct: isCorrect,
    }];
    setAnswers(newAnswers);

    if (current + 1 >= QUESTIONS.length) {
      setStep("analyzing");
      try {
        const res = await fetch("/api/placement-test", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: newAnswers,
            targetLanguage: settings.targetLanguage.name,
            nativeLanguage: settings.nativeLanguage.name,
          }),
        });
        const data = await res.json();
        setResult(data);
        if (data.level) setSettings({ level: data.level });
        setStep("result");
      } catch { setStep("result"); }
    } else {
      setTimeout(() => { setCurrent(c => c + 1); setSelected(null); setFillInput(""); }, 700);
    }
  };

  const handleMC = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === q.correct;
    setTimeout(() => submitAnswer(q.options![idx], isCorrect), 700);
  };

  const handleFill = () => {
    const isCorrect = fillInput.trim().toLowerCase() === (q.correct as string).toLowerCase();
    setSelected(fillInput);
    setTimeout(() => submitAnswer(fillInput, isCorrect), 700);
  };

  const score = answers.filter(a => a.correct).length;
  const pct = Math.round((score / QUESTIONS.length) * 100);

  if (step === "intro") return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-primary-400" /> Kiểm tra trình độ
        </h1>
        <p className="text-sm text-gray-500 mt-1">AI xác định level và tạo lộ trình học cá nhân</p>
      </div>

      <div className="rounded-2xl p-5 mb-5" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="text-4xl mb-3">🎯</div>
        <h2 className="text-white font-bold text-lg mb-2">Placement Test</h2>
        <p className="text-gray-300 text-sm mb-4">
          {QUESTIONS.length} câu hỏi · ~5 phút · AI phân tích kết quả và tạo roadmap học tập cá nhân hóa cho bạn.
        </p>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-400" /> Xác định chính xác trình độ A1-C2</div>
          <div className="flex items-center gap-2"><Map className="w-4 h-4 text-blue-400" /> Tạo roadmap học 8 tuần</div>
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-400" /> Kế hoạch học mỗi ngày</div>
        </div>
      </div>

      <button onClick={() => setStep("test")}
        className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors">
        Bắt đầu kiểm tra <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );

  if (step === "analyzing") return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      <p className="text-white font-semibold">AI đang phân tích kết quả...</p>
      <p className="text-gray-400 text-sm">Tạo lộ trình học cá nhân hóa cho bạn</p>
    </div>
  );

  if (step === "result" && result) return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white">Kết quả kiểm tra</h1>
      </div>

      {/* Score + Level */}
      <div className="rounded-2xl p-5 mb-4 text-center"
        style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.25),rgba(99,102,241,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="text-5xl font-black text-white mb-1">{result.level}</div>
        <p className="text-gray-300 text-sm">{score}/{QUESTIONS.length} câu đúng · {pct}%</p>
        {result.motivationalMessage && (
          <p className="text-primary-300 text-sm mt-3 italic">"{result.motivationalMessage}"</p>
        )}
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {result.strengths?.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
            <p className="text-xs text-green-400 font-semibold mb-2">✅ Điểm mạnh</p>
            {result.strengths.slice(0, 2).map((s: string, i: number) => (
              <p key={i} className="text-xs text-gray-300 mb-1">• {s}</p>
            ))}
          </div>
        )}
        {result.weaknesses?.length > 0 && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <p className="text-xs text-red-400 font-semibold mb-2">⚠️ Cần cải thiện</p>
            {result.weaknesses.slice(0, 2).map((w: string, i: number) => (
              <p key={i} className="text-xs text-gray-300 mb-1">• {w}</p>
            ))}
          </div>
        )}
      </div>

      {/* Daily plan */}
      {result.dailyPlan && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-primary-400 font-semibold mb-3">📅 Kế hoạch học mỗi ngày</p>
          {[
            { time: "🌅 Sáng", plan: result.dailyPlan.morning },
            { time: "☀️ Chiều", plan: result.dailyPlan.afternoon },
            { time: "🌙 Tối", plan: result.dailyPlan.evening },
          ].map(({ time, plan }) => plan && (
            <div key={time} className="flex gap-2 mb-2">
              <span className="text-xs text-gray-500 w-16 shrink-0">{time}</span>
              <p className="text-xs text-gray-300">{plan}</p>
            </div>
          ))}
        </div>
      )}

      {/* 8-week roadmap */}
      {result.roadmap?.length > 0 && (
        <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-yellow-400 font-semibold mb-3">🗺️ Lộ trình 8 tuần</p>
          <div className="flex flex-col gap-3">
            {result.roadmap.slice(0, 4).map((week: any) => (
              <div key={week.week} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-600/30 flex items-center justify-center text-xs font-bold text-primary-300 shrink-0">
                  W{week.week}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">{week.focus}</p>
                  <p className="text-xs text-gray-500">{week.estimatedHours}h · {week.goals?.[0]}</p>
                </div>
              </div>
            ))}
            {result.roadmap.length > 4 && (
              <p className="text-xs text-gray-600 text-center">+ {result.roadmap.length - 4} tuần nữa...</p>
            )}
          </div>
        </div>
      )}

      <button onClick={() => { setStep("intro"); setCurrent(0); setAnswers([]); setSelected(null); setResult(null); }}
        className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
        Làm lại bài test
      </button>
    </div>
  );

  // Test UI
  return (
    <div className="p-5 max-w-lg">
      <div className="pt-2 mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-500">Câu {current + 1}/{QUESTIONS.length}</p>
          <p className="text-sm text-primary-400 font-medium">{score} đúng</p>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2">
          <div className="bg-primary-500 h-2 rounded-full transition-all" style={{ width: `${(current / QUESTIONS.length) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">{q.level} · {q.type === "fill-blank" ? "Điền vào chỗ trống" : "Trắc nghiệm"}</p>
        <p className="text-white font-semibold text-base leading-relaxed">{q.question}</p>
        {q.type === "fill-blank" && q.hint && (
          <p className="text-xs text-gray-500 mt-1">💡 Gợi ý: {q.hint}</p>
        )}
      </div>

      {q.type === "multiple-choice" ? (
        <div className="flex flex-col gap-2">
          {q.options!.map((opt, i) => {
            const isCorrect = i === q.correct;
            const isSelected = selected === i;
            return (
              <button key={i} onClick={() => handleMC(i)} disabled={selected !== null}
                className={cn("px-4 py-3.5 rounded-xl border text-sm font-medium text-left transition-all flex items-center justify-between",
                  selected === null
                    ? "border-gray-700 bg-gray-800 text-gray-200 hover:border-primary-500 hover:bg-primary-900/20"
                    : isCorrect ? "border-green-500 bg-green-900/30 text-green-300"
                    : isSelected ? "border-red-500 bg-red-900/30 text-red-300"
                    : "border-gray-700 bg-gray-800 text-gray-500 opacity-50")}>
                <span>{opt}</span>
                {selected !== null && isCorrect && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                {selected !== null && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <input value={fillInput} onChange={e => setFillInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fillInput.trim() && handleFill()}
            placeholder="Nhập câu trả lời..."
            disabled={selected !== null}
            className="w-full rounded-xl px-4 py-3 text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 text-sm"
            style={{ background: "rgba(26,16,53,0.8)" }}
          />
          <button onClick={handleFill} disabled={!fillInput.trim() || selected !== null}
            className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors">
            Xác nhận
          </button>
        </div>
      )}
    </div>
  );
}
