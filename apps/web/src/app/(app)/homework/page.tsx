"use client";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { GraduationCap, CheckCircle2, XCircle, Star, RefreshCw, ChevronRight, Timer, Volume2, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import AIErrorToast from "@/components/AIErrorToast";
import { speakText } from "@/components/VoiceButton";
import { canUseFeature, getRemainingUses, incrementUsage, FREE_LIMITS } from "@/lib/usageLimit";

type Exercise = {
  id: string; type: string; instruction: string; question: string;
  answer: string; hint?: string; points: number; options?: string[];
};

type GradeResult = {
  id: string; correct: boolean; score: number; feedback: string; correction?: string;
};

const SKILL_MODES = [
  { id: "mixed",      label: "Tổng hợp",  emoji: "🎯", color: "#8b5cf6", desc: "Kết hợp tất cả kỹ năng" },
  { id: "grammar",    label: "Ngữ pháp",  emoji: "📐", color: "#3b82f6", desc: "Tập trung ngữ pháp" },
  { id: "vocabulary", label: "Từ vựng",   emoji: "📚", color: "#10b981", desc: "Mở rộng vốn từ" },
  { id: "writing",    label: "Viết",      emoji: "✍️", color: "#f59e0b", desc: "Luyện viết câu" },
  { id: "listening",  label: "Nghe",      emoji: "🎧", color: "#ec4899", desc: "Luyện nghe hiểu" },
];

const DIFFICULTY = [
  { id: "easy",   label: "Dễ",    emoji: "🌱", exercises: 5 },
  { id: "medium", label: "Vừa",   emoji: "🔥", exercises: 8 },
  { id: "hard",   label: "Khó",   emoji: "💎", exercises: 10 },
];

const LESSON_TOPICS = [
  { emoji: "👋", label: "Chào hỏi",        topic: "greetings and introductions" },
  { emoji: "🛒", label: "Mua sắm",          topic: "shopping vocabulary and phrases" },
  { emoji: "🍜", label: "Nhà hàng",         topic: "ordering food at a restaurant" },
  { emoji: "✈️", label: "Du lịch",          topic: "travel and airport vocabulary" },
  { emoji: "💼", label: "Phỏng vấn",        topic: "job interview English" },
  { emoji: "🏥", label: "Sức khỏe",         topic: "medical and health vocabulary" },
  { emoji: "📞", label: "Điện thoại",       topic: "phone conversation skills" },
  { emoji: "🏠", label: "Nhà ở",            topic: "housing and renting vocabulary" },
  { emoji: "💰", label: "Tài chính",        topic: "banking and financial vocabulary" },
  { emoji: "🎓", label: "Học thuật",        topic: "academic English for school" },
  { emoji: "💻", label: "Công nghệ",        topic: "technology and IT vocabulary" },
  { emoji: "🤝", label: "Đàm phán",         topic: "negotiation and persuasion phrases" },
  { emoji: "😊", label: "Cảm xúc",          topic: "expressing emotions and feelings" },
  { emoji: "🌍", label: "Văn hóa",          topic: "culture and social conversation" },
  { emoji: "📰", label: "Thời sự",          topic: "news and current events vocabulary" },
  { emoji: "🎮", label: "Giải trí",         topic: "hobbies and entertainment" },
  { emoji: "👨‍👩‍👧", label: "Gia đình",    topic: "family and relationships" },
  { emoji: "🚗", label: "Giao thông",       topic: "transportation and directions" },
  { emoji: "📝", label: "Email văn phòng",  topic: "professional email writing" },
  { emoji: "🎤", label: "Thuyết trình",     topic: "presentations and public speaking" },
];

const GRADE_COLORS: Record<string, string> = {
  A: "text-green-400", B: "text-blue-400", C: "text-yellow-400", D: "text-orange-400", F: "text-red-400",
};

export default function HomeworkPage() {
  const { settings, tutorMemory, incrementWords, checkAchievements } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;
  const [homework, setHomework] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<any>(null);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [skill, setSkill] = useState(SKILL_MODES[0]);
  const [difficulty, setDifficulty] = useState(DIFFICULTY[1]);
  const [topic, setTopic] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [streak, setStreak] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const generate = async () => {
    if (!isPremium && !canUseFeature("homework", isPremium)) {
      setError(`Đã dùng hết ${FREE_LIMITS.homework} lần/ngày. Nâng cấp VIP để dùng không giới hạn!`);
      return;
    }
    setLoading(true); setHomework(null); setAnswers({}); setGradeResult(null);
    setElapsed(0); setTimerActive(false); setShowHints({}); setError(null);
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
          skill: skill.id,
          difficulty: difficulty.id,
          count: difficulty.exercises,
          topic: topic ?? undefined,
        }),
      });
      const data = await res.json();
      if (!data.exercises?.length) {
        setError("AI không tạo được bài tập. Thử lại nhé!");
        return;
      }
      setHomework(data);
      if (!isPremium) incrementUsage("homework");
      setTimerActive(true);
    } catch (e: any) {
      const msg = String(e?.message ?? "");
      const errText = msg.includes("429") ? "AI đang bận, thử lại sau 1 phút." : "Lỗi kết nối. Vui lòng thử lại!";
      setError(errText);
      setAiError(errText);
    } finally { setLoading(false); }
  };

  const grade = async () => {
    if (!homework) return;
    setGrading(true); setTimerActive(false);
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
          timeSpent: elapsed,
        }),
      });
      const data = await res.json();
      setGradeResult(data);
      if (data.xpEarned) { incrementWords(Math.floor(data.xpEarned / 5)); checkAchievements(); }
      if (data.totalScore >= 70) setStreak(s => s + 1);
    } finally { setGrading(false); }
  };

  const allAnswered = homework?.exercises?.every((ex: Exercise) => answers[ex.id]?.trim());
  const answeredCount = homework?.exercises?.filter((ex: Exercise) => answers[ex.id]?.trim()).length ?? 0;
  const totalCount = homework?.exercises?.length ?? 0;

  return (
    <div className="p-5 max-w-xl">
      <AIErrorToast error={aiError} onDismiss={() => setAiError(null)} onRetry={generate} />
      <div className="pt-2 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-yellow-400" /> AI Teacher
          </h1>
          <p className="text-sm text-gray-500 mt-1">Bài tập cá nhân hóa · AI chấm điểm · Theo dõi tiến độ</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-orange-900/30 text-orange-400 text-xs font-bold">
              � {streak}
            </div>
          )}
          {homework && (
            <button onClick={generate} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Setup screen */}
      {!homework && !loading && (
        <div className="flex flex-col gap-5">
          {/* Skill selector */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Kỹ năng luyện tập</p>
            <div className="grid grid-cols-5 gap-2">
              {SKILL_MODES.map(s => (
                <button key={s.id} onClick={() => setSkill(s)}
                  className={cn("flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all",
                    skill.id === s.id ? "border-primary-500 bg-primary-900/30 scale-105" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
                  <span className="text-xl">{s.emoji}</span>
                  <span className={cn("text-xs font-medium leading-tight text-center", skill.id === s.id ? "text-white" : "text-gray-400")}>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Độ khó</p>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY.map(d => (
                <button key={d.id} onClick={() => setDifficulty(d)}
                  className={cn("flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
                    difficulty.id === d.id ? "border-yellow-500 bg-yellow-900/20" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
                  <span className="text-2xl">{d.emoji}</span>
                  <span className={cn("text-sm font-bold", difficulty.id === d.id ? "text-yellow-300" : "text-gray-400")}>{d.label}</span>
                  <span className="text-xs text-gray-600">{d.exercises} câu</span>
                </button>
              ))}
            </div>
          </div>

          {/* Topic selector */}
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Chủ đề bài học <span className="text-gray-700 normal-case font-normal">(tuỳ chọn)</span></p>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5" style={{ touchAction: "pan-x" }}>
              <button onClick={() => setTopic(null)}
                className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all shrink-0",
                  topic === null ? "border-primary-500 bg-primary-900/30" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
                <span className="text-xl">🎯</span>
                <span className={cn("text-xs leading-tight", topic === null ? "text-white" : "text-gray-400")}>Tự do</span>
              </button>
              {LESSON_TOPICS.map(t => (
                <button key={t.topic} onClick={() => setTopic(t.topic)}
                  className={cn("flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all shrink-0",
                    topic === t.topic ? "border-primary-500 bg-primary-900/30" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}
                  style={{ minWidth: 68 }}>
                  <span className="text-xl">{t.emoji}</span>
                  <span className={cn("text-xs leading-tight text-center", topic === t.topic ? "text-white" : "text-gray-400")} style={{ maxWidth: 64 }}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <span className="text-3xl">{skill.emoji}</span>
            <div>
              <p className="text-white font-semibold text-sm">{skill.label} · {difficulty.label}</p>
              <p className="text-gray-400 text-xs">{skill.desc} · {difficulty.exercises} câu · Level {settings.level}</p>
              {topic && <p className="text-primary-400 text-xs mt-0.5">📌 {LESSON_TOPICS.find(t => t.topic === topic)?.label}</p>}
              <p className="text-gray-500 text-xs">{settings.targetLanguage.flag} {settings.targetLanguage.name}</p>            </div>
          </div>

          <button onClick={generate}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#ca8a04,#d97706)", boxShadow: "0 4px 20px rgba(202,138,4,0.3)" }}>
            <GraduationCap className="w-5 h-5" /> Nhận bài tập hôm nay
          </button>
          {!isPremium && (
            <p className="text-center text-xs text-gray-600 mt-1">
              Còn {getRemainingUses("homework", isPremium)}/{FREE_LIMITS.homework} lần hôm nay
              {getRemainingUses("homework", isPremium) === 0 && (
                <button onClick={() => router.push("/premium")} className="ml-1 text-yellow-500 underline">Nâng cấp VIP</button>
              )}
            </p>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-400 text-sm">AI đang tạo bài tập cho bạn...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}>
          <p className="text-red-400 text-sm mb-3">{error}</p>
          <button onClick={generate} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">
            Thử lại
          </button>
        </div>
      )}
      {/* Exercises */}
      {homework && !gradeResult && (
        <div className="flex flex-col gap-4">
          {/* Header with timer & progress */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-bold text-sm">{homework.title}</p>
                <p className="text-xs text-gray-400">{skill.emoji} {skill.label} · {difficulty.emoji} {difficulty.label}</p>
              </div>
              <div className="flex items-center gap-1.5 text-yellow-400 font-mono text-sm">
                <Timer className="w-4 h-4" /> {fmt(elapsed)}
              </div>
            </div>
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-800 rounded-full h-2">
                <div className="h-2 rounded-full transition-all bg-yellow-500"
                  style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-gray-500">{answeredCount}/{totalCount}</span>
            </div>
          </div>

          {homework.exercises?.map((ex: Exercise, i: number) => (
            <div key={ex.id} className="rounded-2xl p-4 animate-fade-in-up"
              style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${answers[ex.id] ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.12)"}` }}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">{ex.type.replace("-", " ")} · {ex.points}đ</span>
                  <p className="text-xs text-primary-400 mt-0.5">{ex.instruction}</p>
                </div>
                <div className={cn("w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0",
                  answers[ex.id] ? "bg-primary-600 text-white" : "bg-gray-800 text-gray-500")}>
                  {answers[ex.id] ? "✓" : i + 1}
                </div>
              </div>

              <p className="text-white font-medium text-sm mb-3">{ex.question}</p>
              <button onClick={() => speakText(ex.question, settings.targetLanguage.code, settings.speechRate)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-400 transition-colors mb-3">
                <Volume2 className="w-3.5 h-3.5" /> Nghe câu hỏi
              </button>

              {ex.type === "multiple-choice" && ex.options ? (
                <div className="grid grid-cols-2 gap-2">
                  {ex.options.map((opt, j) => (
                    <button key={j} onClick={() => setAnswers(p => ({ ...p, [ex.id]: opt }))}
                      className={cn("px-3 py-2.5 rounded-xl border text-xs font-medium text-left transition-all",
                        answers[ex.id] === opt
                          ? "border-primary-500 bg-primary-900/30 text-white"
                          : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
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
                  className="text-xs text-gray-600 hover:text-yellow-400 mt-2 transition-colors">
                  {showHints[ex.id] ? "Ẩn gợi ý" : "💡 Xem gợi ý"}
                </button>
              )}
              {showHints[ex.id] && ex.hint && (
                <p className="text-xs text-yellow-300 mt-1 bg-yellow-900/20 rounded-lg px-3 py-1.5">{ex.hint}</p>
              )}
            </div>
          ))}

          <button onClick={grade} disabled={!allAnswered || grading}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: allAnswered ? "linear-gradient(135deg,#ca8a04,#d97706)" : "rgba(107,114,128,0.3)" }}>
            {grading
              ? <><div className="ai-typing-dot" /><div className="ai-typing-dot" /><div className="ai-typing-dot" /></>
              : <><Star className="w-5 h-5" /> Nộp bài · {fmt(elapsed)}</>
            }
          </button>
        </div>
      )}

      {/* Grade result */}
      {gradeResult && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          <div className="rounded-2xl p-5 text-center"
            style={{ background: "linear-gradient(135deg,rgba(234,179,8,0.2),rgba(245,158,11,0.1))", border: "1px solid rgba(234,179,8,0.3)" }}>
            <div className={cn("text-6xl font-black mb-1", GRADE_COLORS[gradeResult.grade] ?? "text-white")}>
              {gradeResult.grade}
            </div>
            <p className="text-3xl font-black text-white">{gradeResult.totalScore}<span className="text-lg text-gray-400">/100</span></p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm">
              <span className="text-yellow-300 font-bold">+{gradeResult.xpEarned} XP</span>
              <span className="text-gray-500">⏱ {fmt(elapsed)}</span>
              <span className="text-gray-500">{gradeResult.results?.filter((r: GradeResult) => r.correct).length}/{gradeResult.results?.length} đúng</span>
            </div>
            {gradeResult.overallFeedback && (
              <p className="text-gray-300 text-sm mt-3 italic">"{gradeResult.overallFeedback}"</p>
            )}
          </div>

          {gradeResult.results?.map((r: GradeResult) => {
            const ex = homework.exercises.find((e: Exercise) => e.id === r.id);
            return (
              <div key={r.id} className={cn("rounded-2xl p-4 border",
                r.correct ? "border-green-600/30 bg-green-900/10" : "border-red-600/30 bg-red-900/10")}>
                <div className="flex items-start gap-3">
                  {r.correct
                    ? <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="text-sm text-gray-300 mb-1">{ex?.question}</p>
                    {!r.correct && r.correction && (
                      <p className="text-sm text-green-300 font-medium mb-1">Đáp án: {r.correction}</p>
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
            <div className="rounded-xl px-4 py-3 flex gap-2"
              style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <ChevronRight className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <p className="text-sm text-purple-200">{gradeResult.nextFocus}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={generate}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#ca8a04,#d97706)" }}>
              Bài tập mới
            </button>
            <button onClick={() => { setHomework(null); setGradeResult(null); }}
              className="flex-1 py-3 rounded-2xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 text-sm font-medium transition-colors">
              Đổi kỹ năng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
