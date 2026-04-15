"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { GraduationCap, Loader2, CheckCircle2, XCircle, Star, RefreshCw, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Exercise = {
  id: string; type: string; instruction: string; question: string;
  answer: string; hint?: string; points: number; options?: string[];
};

type GradeResult = {
  id: string; correct: boolean; score: number; feedback: string; correction?: string;
};

export default function HomeworkPage() {
  const { settings, tutorMemory, totalXp, incrementWords, checkAchievements } = useAppStore();
  const [homework, setHomework] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const todayKey = new Date().toISOString().slice(0, 10);

  const generate = async () => {
    setLoading(true); setHomework(null); setAnswers({}); setGradeResult(null);
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          weakAreas: tutorMemory.weakAreas,
        }),
      });
      setHomework(await res.json());
    } finally { setLoading(false); }
  };

  const grade = async () => {
    if (!homework) return;
    setGrading(true);
    const answersArr = homework.exercises.map((ex: Exercise) => ({
      id: ex.id, question: ex.question, userAnswer: answers[ex.id] ?? "",
      correctAnswer: ex.answer, points: ex.points,
    }));
    try {
      const res = await fetch("/api/homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          answers: answersArr,
        }),
      });
      const data = await res.json();
      setGradeResult(data);
      if (data.xpEarned) { incrementWords(Math.floor(data.xpEarned / 5)); checkAchievements(); }
    } finally { setGrading(false); }
  };

  const allAnswered = homework?.exercises?.every((ex: Exercise) => answers[ex.id]?.trim());

  const GRADE_COLORS: Record<string, string> = {
    A: "text-green-400", B: "text-blue-400", C: "text-yellow-400", D: "text-orange-400", F: "text-red-400",
  };

  return (
    <div className="p-5 max-w-xl">
      <div className="pt-2 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-yellow-400" /> AI Teacher
          </h1>
          <p className="text-sm text-gray-500 mt-1">Bài tập hàng ngày · Chấm điểm · Điều chỉnh theo trình độ</p>
        </div>
        {homework && (
          <button onClick={generate} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {!homework && !loading && (
        <div className="flex flex-col items-center gap-5 py-10">
          <div className="w-20 h-20 rounded-2xl bg-yellow-600/20 flex items-center justify-center text-4xl">🎓</div>
          <div className="text-center">
            <p className="text-white font-bold text-lg">Bài tập hôm nay</p>
            <p className="text-gray-400 text-sm mt-1">AI tạo bài tập cá nhân hóa dựa trên trình độ và điểm yếu của bạn</p>
            <div className="flex items-center justify-center gap-3 mt-3 text-xs text-gray-500">
              <span>📊 Level: {settings.level}</span>
              <span>🎯 {settings.targetLanguage.flag} {settings.targetLanguage.name}</span>
              <span>⏱ ~10 phút</span>
            </div>
          </div>
          <button onClick={generate}
            className="flex items-center gap-2 px-6 py-3.5 bg-yellow-600 hover:bg-yellow-500 text-white rounded-2xl font-bold transition-colors">
            <GraduationCap className="w-5 h-5" /> Nhận bài tập hôm nay
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          <p className="text-gray-400 text-sm">AI đang tạo bài tập cho bạn...</p>
        </div>
      )}

      {homework && !gradeResult && (
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-bold">{homework.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {homework.exercises?.length} bài · {homework.estimatedMinutes} phút · {homework.totalPoints} điểm
                </p>
              </div>
              <span className="text-2xl">{homework.focusSkill === "grammar" ? "📐" : homework.focusSkill === "vocabulary" ? "📚" : homework.focusSkill === "writing" ? "✍️" : "🗣️"}</span>
            </div>
          </div>

          {/* Exercises */}
          {homework.exercises?.map((ex: Exercise, i: number) => {
            const answered = !!answers[ex.id]?.trim();
            const graded = gradeResult?.results?.find((r: GradeResult) => r.id === ex.id);
            return (
              <div key={ex.id} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">{ex.type.replace("-", " ")} · {ex.points}đ</span>
                    <p className="text-xs text-primary-400 mt-0.5">{ex.instruction}</p>
                  </div>
                  <span className="text-lg shrink-0">{i + 1}</span>
                </div>

                <p className="text-white font-medium text-sm mb-3">{ex.question}</p>

                {ex.type === "multiple-choice" && ex.options ? (
                  <div className="grid grid-cols-2 gap-2">
                    {ex.options.map((opt, j) => (
                      <button key={j} onClick={() => setAnswers(p => ({ ...p, [ex.id]: opt }))}
                        className={cn("px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all",
                          answers[ex.id] === opt ? "border-primary-500 bg-primary-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input value={answers[ex.id] ?? ""} onChange={e => setAnswers(p => ({ ...p, [ex.id]: e.target.value }))}
                    placeholder="Nhập câu trả lời..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500"
                    style={{ background: "rgba(15,10,30,0.8)" }}
                  />
                )}

                {ex.hint && (
                  <button onClick={() => setShowHints(p => ({ ...p, [ex.id]: !p[ex.id] }))}
                    className="text-xs text-gray-600 hover:text-gray-400 mt-2 transition-colors">
                    {showHints[ex.id] ? "Ẩn gợi ý" : "💡 Xem gợi ý"}
                  </button>
                )}
                {showHints[ex.id] && ex.hint && (
                  <p className="text-xs text-yellow-300 mt-1 bg-yellow-900/20 rounded-lg px-3 py-1.5">{ex.hint}</p>
                )}
              </div>
            );
          })}

          <button onClick={grade} disabled={!allAnswered || grading}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            style={{ background: allAnswered ? "linear-gradient(135deg,#ca8a04,#d97706)" : "rgba(107,114,128,0.3)" }}>
            {grading ? <><Loader2 className="w-5 h-5 animate-spin" /> Đang chấm điểm...</> : <><Star className="w-5 h-5" /> Nộp bài</>}
          </button>
        </div>
      )}

      {/* Grade result */}
      {gradeResult && (
        <div className="flex flex-col gap-4">
          {/* Score card */}
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(135deg,rgba(234,179,8,0.2),rgba(245,158,11,0.1))", border: "1px solid rgba(234,179,8,0.3)" }}>
            <div className={cn("text-6xl font-black mb-1", GRADE_COLORS[gradeResult.grade] ?? "text-white")}>
              {gradeResult.grade}
            </div>
            <p className="text-2xl font-bold text-white">{gradeResult.totalScore}/100</p>
            <p className="text-yellow-300 text-sm mt-1">+{gradeResult.xpEarned} XP</p>
            {gradeResult.overallFeedback && (
              <p className="text-gray-300 text-sm mt-3 italic">"{gradeResult.overallFeedback}"</p>
            )}
          </div>

          {/* Per-exercise results */}
          {gradeResult.results?.map((r: GradeResult) => {
            const ex = homework.exercises.find((e: Exercise) => e.id === r.id);
            return (
              <div key={r.id} className={cn("rounded-2xl p-4 border",
                r.correct ? "border-green-600/30 bg-green-900/10" : "border-red-600/30 bg-red-900/10")}>
                <div className="flex items-start gap-3">
                  {r.correct ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-1">{ex?.question}</p>
                    {!r.correct && r.correction && (
                      <p className="text-sm text-green-300 font-medium mb-1">✅ {r.correction}</p>
                    )}
                    <p className="text-xs text-gray-400">{r.feedback}</p>
                  </div>
                  <span className={cn("text-sm font-bold shrink-0", r.correct ? "text-green-400" : "text-red-400")}>
                    {r.score}/{ex?.points}
                  </span>
                </div>
              </div>
            );
          })}

          {gradeResult.nextFocus && (
            <div className="rounded-xl px-4 py-3 flex gap-2" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-sm text-purple-200">{gradeResult.nextFocus}</p>
            </div>
          )}

          <button onClick={generate}
            className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:border-yellow-600/50 hover:text-yellow-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Bài tập mới
          </button>
        </div>
      )}
    </div>
  );
}
