"use client";
import { useState } from "react";
import { Loader2, Flag, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

type Part = "p1" | "p2" | "p3" | "p4" | "p5" | "p6" | "p7";

const PARTS: { id: Part; label: string; count: number; type: "listening" | "reading" }[] = [
  { id: "p1", label: "P1", count: 6,  type: "listening" },
  { id: "p2", label: "P2", count: 25, type: "listening" },
  { id: "p3", label: "P3", count: 39, type: "listening" },
  { id: "p4", label: "P4", count: 30, type: "listening" },
  { id: "p5", label: "P5", count: 30, type: "reading" },
  { id: "p6", label: "P6", count: 16, type: "reading" },
  { id: "p7", label: "P7", count: 54, type: "reading" },
];

type Q = {
  id: number;
  question: string;
  options: string[];
  correct: number;
  imageUrl?: string;
  audioText?: string; // text to TTS for listening
  passage?: string;
  flagged?: boolean;
};

const PART_NAMES: Record<Part, string> = {
  p1: "Photos", p2: "Question-Response", p3: "Conversations",
  p4: "Talks", p5: "Incomplete Sentences", p6: "Text Completion", p7: "Reading Comprehension",
};

const PART_DESC: Record<Part, string> = {
  p1: "Nhìn ảnh, chọn mô tả đúng",
  p2: "Nghe câu hỏi, chọn câu trả lời phù hợp",
  p3: "Nghe đoạn hội thoại, trả lời câu hỏi",
  p4: "Nghe bài nói, trả lời câu hỏi",
  p5: "Điền từ vào chỗ trống trong câu",
  p6: "Điền từ vào đoạn văn",
  p7: "Đọc đoạn văn, trả lời câu hỏi",
};

export default function Toeic200Practice() {
  const { settings } = useAppStore();
  const [activePart, setActivePart] = useState<Part>("p1");
  const [questions, setQuestions] = useState<Q[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [flagged, setFlagged] = useState<Set<number>>(new Set());
  const [checked, setChecked] = useState(false);
  const [loadedParts, setLoadedParts] = useState<Set<Part>>(new Set());

  const partInfo = PARTS.find(p => p.id === activePart)!;
  const numQ = Math.min(partInfo.count, 6); // show 6 câu mẫu mỗi part

  const loadPart = async (part: Part) => {
    setActivePart(part);
    setAnswers({});
    setFlagged(new Set());
    setChecked(false);
    if (loadedParts.has(part)) return;
    setLoading(true);
    setQuestions([]);
    try {
      const res = await fetch("/api/toeic-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ part, count: numQ, nativeLanguage: settings.nativeLanguage.name }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setLoadedParts(prev => new Set([...prev, part]));
    } catch {
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFlag = (id: number) => setFlagged(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-white/5">
        <p className="text-white font-bold text-sm">📝 Luyện tập TOEIC 200 câu</p>
        <p className="text-gray-500 text-xs mt-0.5">AI tạo câu hỏi theo từng Part · Chọn đáp án · Kiểm tra</p>
      </div>

      {/* Part tabs */}
      <div className="flex items-center gap-1 px-3 py-2.5 border-b border-white/5 overflow-x-auto scrollbar-hide">
        <span className="text-gray-600 text-xs mr-1 shrink-0">🎧</span>
        {PARTS.filter(p => p.type === "listening").map(p => (
          <button key={p.id} onClick={() => loadPart(p.id)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all",
              activePart === p.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
            {p.label}
            <span className="ml-1 text-[10px] opacity-70">{p.count}</span>
          </button>
        ))}
        <span className="text-gray-600 text-xs mx-1 shrink-0">📖</span>
        {PARTS.filter(p => p.type === "reading").map(p => (
          <button key={p.id} onClick={() => loadPart(p.id)}
            className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all",
              activePart === p.id ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>
            {p.label}
            <span className="ml-1 text-[10px] opacity-70">{p.count}</span>
          </button>
        ))}
      </div>

      {/* Part info */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-white/5">
        <div>
          <span className="text-white text-xs font-semibold">{PART_NAMES[activePart]}</span>
          <span className="text-gray-500 text-xs ml-2">— {PART_DESC[activePart]}</span>
        </div>
        <button onClick={() => loadPart(activePart)}
          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
          <RotateCcw className="w-3 h-3" /> Tạo mới
        </button>
      </div>

      {/* Questions */}
      <div className="px-4 py-3 flex flex-col gap-4 max-h-[500px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
            <p className="text-gray-500 text-xs">AI đang tạo câu hỏi {PART_NAMES[activePart]}...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center py-8 gap-3">
            <p className="text-gray-500 text-xs">Bấm "Tạo mới" để AI tạo câu hỏi</p>
            <button onClick={() => loadPart(activePart)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl font-semibold transition-colors">
              Tạo câu hỏi {PART_NAMES[activePart]}
            </button>
          </div>
        ) : (
          <>
            {questions.map((q, i) => {
              const picked = answers[i];
              const isFlagged = flagged.has(i);
              const isCorrect = checked && picked === q.correct;
              const isWrong = checked && picked !== undefined && picked !== q.correct;
              return (
                <div key={i} className={cn("rounded-xl p-3 border transition-colors",
                  checked ? isCorrect ? "border-green-600/30 bg-green-900/10"
                    : isWrong ? "border-red-600/30 bg-red-900/10"
                    : "border-white/5"
                  : "border-white/5"
                )} style={{ background: "rgba(18,12,36,0.8)" }}>
                  {/* Image for P1 */}
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt={`Q${i+1}`} className="w-full max-w-xs rounded-lg mb-3 object-cover" style={{ maxHeight: 180 }} />
                  )}
                  {/* Audio text for listening */}
                  {q.audioText && partInfo.type === "listening" && (
                    <div className="mb-2 px-3 py-2 rounded-lg text-xs text-gray-400 italic"
                      style={{ background: "rgba(255,255,255,0.04)" }}>
                      🎧 {q.audioText}
                    </div>
                  )}
                  {/* Passage for P6/P7 */}
                  {q.passage && (
                    <div className="mb-3 px-3 py-2 rounded-lg text-xs text-gray-300 leading-relaxed"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      {q.passage}
                    </div>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm font-medium">
                      <span className="text-gray-500 mr-1.5">Câu {i + 1}.</span>{q.question}
                    </p>
                    <button onClick={() => toggleFlag(i)}
                      className={cn("shrink-0 transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt, j) => {
                      const isRight = j === q.correct;
                      const isPicked = picked === j;
                      return (
                        <button key={j} onClick={() => !checked && setAnswers(prev => ({ ...prev, [i]: j }))}
                          disabled={checked}
                          className={cn("px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all",
                            checked
                              ? isRight ? "border-green-500 bg-green-900/30 text-green-300"
                                : isPicked ? "border-red-500 bg-red-900/30 text-red-300"
                                : "border-gray-700 text-gray-600 opacity-40"
                              : isPicked ? "border-blue-500 bg-blue-900/30 text-white"
                              : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                          {["A","B","C","D"][j]}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {checked && isWrong && (
                    <p className="text-xs text-green-400 mt-1.5">✅ Đáp án: {["A","B","C","D"][q.correct]}. {q.options[q.correct]}</p>
                  )}
                </div>
              );
            })}

            {/* Check / Result */}
            {!checked ? (
              <button onClick={() => setChecked(true)}
                disabled={Object.keys(answers).length < questions.length}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold transition-colors">
                Kiểm tra ({Object.keys(answers).length}/{questions.length} câu)
              </button>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: score === questions.length ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <div className="flex items-center gap-2">
                  {score === questions.length ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-blue-400" />}
                  <span className="text-white text-sm font-bold">{score}/{questions.length} đúng</span>
                </div>
                <button onClick={() => { setAnswers({}); setChecked(false); setFlagged(new Set()); }}
                  className="text-xs text-gray-400 hover:text-white transition-colors">Làm lại</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
