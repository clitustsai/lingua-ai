"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { COURSES } from "@ai-lang/shared";
import { ArrowLeft, Star, Loader2, Volume2, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

// ── Vocabulary Lesson ────────────────────────────────────────────────────────
function VocabLesson({ data, lang }: { data: any; lang: string }) {
  const [step, setStep] = useState<"learn" | "practice">("learn");
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const items = data.items ?? [];

  if (step === "learn") {
    const item = items[idx];
    return (
      <div className="flex flex-col gap-5">
        <p className="text-sm text-gray-400">{data.intro}</p>
        <div className="text-xs text-gray-500 text-right">{idx + 1}/{items.length}</div>
        <div className="cursor-pointer" onClick={() => setFlipped(!flipped)} style={{ perspective: 1000 }}>
          <div className="relative rounded-2xl transition-transform duration-500 min-h-[180px]"
            style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}>
            <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
              style={{ backfaceVisibility: "hidden", background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <div className="flex justify-between items-start">
                <span className="text-xs text-gray-500 uppercase">{lang}</span>
                <button onClick={e => { e.stopPropagation(); speakText(item.word, lang); }} className="p-1.5 rounded-lg bg-white/10 text-gray-300">
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-4xl font-bold text-white text-center">{item.word}</p>
              <p className="text-xs text-gray-500 text-center">Nhấn để xem nghĩa</p>
            </div>
            <div className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <p className="text-2xl font-bold text-purple-300 text-center mt-4">{item.translation}</p>
              <p className="text-sm text-gray-400 italic text-center">{item.example}</p>
              {item.tip && <p className="text-xs text-yellow-400 text-center">💡 {item.tip}</p>}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {idx > 0 && <button onClick={() => { setIdx(i => i - 1); setFlipped(false); }} className="flex-1 py-3 rounded-xl bg-gray-800 text-gray-300 text-sm font-medium">← Trước</button>}
          {idx < items.length - 1
            ? <button onClick={() => { setIdx(i => i + 1); setFlipped(false); }} className="flex-1 py-3 rounded-xl bg-primary-600 text-white text-sm font-medium">Tiếp →</button>
            : <button onClick={() => setStep("practice")} className="flex-1 py-3 rounded-xl bg-green-600 text-white text-sm font-medium">Luyện tập →</button>}
        </div>
      </div>
    );
  }

  // Practice: simple match quiz from vocab
  return <MatchQuiz items={items.map((i: any) => ({ question: i.word, answer: i.translation }))} lang={lang} />;
}

// ── Grammar Lesson ───────────────────────────────────────────────────────────
function GrammarLesson({ data, lang }: { data: any; lang: string }) {
  const [showEx, setShowEx] = useState<Record<number, boolean>>({});
  const examples = data.examples ?? [];
  const exercises = data.exercises ?? [];
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.2)" }}>
        <p className="text-yellow-400 font-bold text-sm mb-1">📐 {data.rule}</p>
        <p className="text-gray-300 text-sm">{data.explanation}</p>
      </div>
      {examples.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Ví dụ</p>
          {examples.map((ex: any, i: number) => (
            <div key={i} className="rounded-xl p-3" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => speakText(ex.sentence, lang)} className="text-white text-sm font-medium text-left hover:text-purple-300 transition-colors">{ex.sentence}</button>
              <p className="text-gray-400 text-xs mt-0.5">{ex.translation}</p>
            </div>
          ))}
        </div>
      )}
      {exercises.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Bài tập</p>
          {exercises.map((ex: any, i: number) => (
            <div key={i} className="rounded-xl p-3" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-white text-sm">{ex.question}</p>
              {ex.hint && <p className="text-xs text-gray-500 mt-0.5">Gợi ý: {ex.hint}</p>}
              <button onClick={() => setShowEx(p => ({ ...p, [i]: !p[i] }))} className="text-xs text-purple-400 mt-2 hover:underline">
                {showEx[i] ? "Ẩn đáp án" : "Xem đáp án"}
              </button>
              {showEx[i] && <p className="text-green-300 text-sm mt-1 pl-2 border-l-2 border-green-600">{ex.answer}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Listening Lesson ─────────────────────────────────────────────────────────
function ListeningLesson({ data, lang }: { data: any; lang: string }) {
  const [showScript, setShowScript] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-400">{data.intro}</p>
      <div className="rounded-2xl p-5 flex flex-col items-center gap-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <button onClick={() => speakText(data.script, lang)} className="w-16 h-16 rounded-full bg-primary-600 hover:bg-primary-500 flex items-center justify-center shadow-lg transition-colors">
          <Volume2 className="w-7 h-7 text-white" />
        </button>
        <p className="text-xs text-gray-500">Nhấn để nghe</p>
        <button onClick={() => setShowScript(!showScript)} className="text-xs text-purple-400 hover:underline">
          {showScript ? "Ẩn script" : "Xem script"}
        </button>
        {showScript && <p className="text-gray-200 text-sm text-center">{data.script}</p>}
        {showScript && data.translation && <p className="text-gray-400 text-xs italic text-center">{data.translation}</p>}
      </div>
      {(data.questions ?? []).map((q: any, i: number) => (
        <div key={i} className="rounded-xl p-3" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-white text-sm">{i + 1}. {q.question}</p>
          <button onClick={() => setShowAnswers(p => ({ ...p, [i]: !p[i] }))} className="text-xs text-purple-400 mt-2 hover:underline">
            {showAnswers[i] ? "Ẩn" : "Xem đáp án"}
          </button>
          {showAnswers[i] && <p className="text-green-300 text-sm mt-1 pl-2 border-l-2 border-green-600">{q.answer}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Reading Lesson ───────────────────────────────────────────────────────────
function ReadingLesson({ data, lang }: { data: any; lang: string }) {
  const [showTrans, setShowTrans] = useState(false);
  const [showAnswers, setShowAnswers] = useState<Record<number, boolean>>({});
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex justify-between items-center mb-3">
          <button onClick={() => speakText(data.passage, lang)} className="p-2 rounded-lg bg-white/10 text-gray-300"><Volume2 className="w-4 h-4" /></button>
          <button onClick={() => setShowTrans(!showTrans)} className="text-xs text-purple-400 hover:underline">{showTrans ? "Ẩn dịch" : "Xem dịch"}</button>
        </div>
        <p className="text-gray-200 text-sm leading-relaxed">{data.passage}</p>
        {showTrans && <p className="text-gray-400 text-xs italic mt-3 pt-3 border-t border-white/10">{data.translation}</p>}
      </div>
      {(data.vocabulary ?? []).map((v: any, i: number) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: "rgba(26,16,53,0.6)" }}>
          <button onClick={() => speakText(v.word, lang)} className="font-semibold text-white hover:text-purple-300 transition-colors text-sm">{v.word}</button>
          <span className="text-gray-400 text-sm">— {v.translation}</span>
        </div>
      ))}
      {(data.questions ?? []).map((q: any, i: number) => (
        <div key={i} className="rounded-xl p-3" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-white text-sm">{i + 1}. {q.question}</p>
          <button onClick={() => setShowAnswers(p => ({ ...p, [i]: !p[i] }))} className="text-xs text-purple-400 mt-2 hover:underline">
            {showAnswers[i] ? "Ẩn" : "Xem đáp án"}
          </button>
          {showAnswers[i] && <p className="text-green-300 text-sm mt-1 pl-2 border-l-2 border-green-600">{q.answer}</p>}
        </div>
      ))}
    </div>
  );
}

// ── Speaking Lesson ──────────────────────────────────────────────────────────
function SpeakingLesson({ data, lang }: { data: any; lang: string }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl p-4" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-purple-300 font-semibold text-sm mb-1">🎭 Tình huống</p>
        <p className="text-gray-300 text-sm">{data.scenario}</p>
      </div>
      {(data.usefulPhrases ?? []).map((p: any, i: number) => (
        <div key={i} className="rounded-xl p-3 flex items-start gap-3" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <button onClick={() => speakText(p.phrase, lang)} className="p-1.5 rounded-lg bg-white/10 text-gray-300 shrink-0 mt-0.5"><Volume2 className="w-3.5 h-3.5" /></button>
          <div>
            <p className="text-white font-medium text-sm">{p.phrase}</p>
            <p className="text-gray-400 text-xs">{p.translation}</p>
            {p.usage && <p className="text-yellow-400/70 text-xs mt-0.5">💡 {p.usage}</p>}
          </div>
        </div>
      ))}
      {(data.dialogue ?? []).map((line: any, i: number) => (
        <div key={i} className={cn("flex gap-3", line.speaker === "B" && "flex-row-reverse")}>
          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0", line.speaker === "A" ? "bg-primary-600" : "bg-accent-500")}>
            {line.speaker}
          </div>
          <div className={cn("max-w-[75%]", line.speaker === "B" && "items-end flex flex-col")}>
            <button onClick={() => speakText(line.text, lang)} className={cn("px-3 py-2 rounded-xl text-sm text-left hover:opacity-80", line.speaker === "A" ? "bg-gray-700 text-white" : "bg-primary-600/30 text-white")}>
              {line.text}
            </button>
            <p className="text-xs text-gray-500 mt-0.5 px-1">{line.translation}</p>
          </div>
        </div>
      ))}
      {(data.tasks ?? []).map((task: string, i: number) => (
        <div key={i} className="flex gap-2 items-start rounded-xl p-3" style={{ background: "rgba(26,16,53,0.6)" }}>
          <span className="text-purple-400 font-bold text-sm shrink-0">{i + 1}.</span>
          <p className="text-gray-300 text-sm">{task}</p>
        </div>
      ))}
    </div>
  );
}

// ── Quiz Lesson ──────────────────────────────────────────────────────────────
function QuizLesson({ data }: { data: any }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const questions = data.questions ?? [];

  const answer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === questions[current].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 900);
  };

  if (done) return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="text-5xl">{score === questions.length ? "🏆" : score >= questions.length / 2 ? "👍" : "📚"}</div>
      <p className="text-2xl font-bold text-white">{score}/{questions.length}</p>
      <p className="text-gray-400 text-sm">{score === questions.length ? "Hoàn hảo!" : "Cố gắng thêm nhé!"}</p>
    </div>
  );

  const q = questions[current];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Câu {current + 1}/{questions.length}</span>
        <span>Điểm: {score}</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-1.5">
        <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${(current / questions.length) * 100}%` }} />
      </div>
      <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-white font-semibold">{q.question}</p>
      </div>
      <div className="flex flex-col gap-2">
        {(q.options ?? []).map((opt: string, i: number) => {
          const isCorrect = i === q.correct;
          const isSelected = i === selected;
          return (
            <button key={i} onClick={() => answer(i)}
              className={cn("px-4 py-3 rounded-xl border text-sm font-medium text-left transition-all flex items-center justify-between",
                !selected ? "border-gray-700 bg-gray-800 text-gray-200 hover:border-purple-500 hover:bg-purple-900/20"
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
      {selected !== null && q.explanation && (
        <p className="text-xs text-yellow-300 bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2">💡 {q.explanation}</p>
      )}
    </div>
  );
}

// ── Match Quiz (used by vocab) ───────────────────────────────────────────────
function MatchQuiz({ items, lang }: { items: { question: string; answer: string }[]; lang: string }) {
  const shuffled = [...items].sort(() => Math.random() - 0.5).slice(0, 6);
  const [selected, setSelected] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const answers = [...shuffled].sort(() => Math.random() - 0.5).map(i => i.answer);

  const pick = (q: string) => { if (matched.includes(q)) return; setSelected(q); setWrong(null); };
  const pickAns = (ans: string) => {
    if (!selected) return;
    const correct = shuffled.find(i => i.question === selected)?.answer;
    if (ans === correct) { setMatched(m => [...m, selected]); setSelected(null); }
    else { setWrong(ans); setTimeout(() => setWrong(null), 600); }
  };

  const done = matched.length === shuffled.length;
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-400">Nối từ với nghĩa đúng</p>
      {done ? (
        <div className="text-center py-6">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-white font-bold">Hoàn thành!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            {shuffled.map(item => (
              <button key={item.question} onClick={() => pick(item.question)}
                className={cn("px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border",
                  matched.includes(item.question) ? "border-green-600/40 bg-green-900/20 text-green-400 opacity-50"
                    : selected === item.question ? "border-purple-500 bg-purple-900/30 text-white"
                    : "border-gray-700 bg-gray-800 text-gray-200 hover:border-purple-500")}>
                {item.question}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {answers.map(ans => {
              const isMatched = matched.some(q => shuffled.find(i => i.question === q)?.answer === ans);
              return (
                <button key={ans} onClick={() => pickAns(ans)}
                  className={cn("px-3 py-2.5 rounded-xl text-sm font-medium text-left transition-all border",
                    isMatched ? "border-green-600/40 bg-green-900/20 text-green-400 opacity-50"
                      : wrong === ans ? "border-red-500 bg-red-900/30 text-red-300"
                      : "border-gray-700 bg-gray-800 text-gray-200 hover:border-purple-500")}>
                  {ans}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LessonPlayerPage() {
  const { courseId, unitId, lessonId } = useParams<{ courseId: string; unitId: string; lessonId: string }>();
  const router = useRouter();
  const { settings, completeLesson, courseProgress, checkAchievements } = useAppStore();

  const course = COURSES.find(c => c.id === courseId);
  const unit = course?.units.find(u => u.id === unitId);
  const lesson = unit?.lessons.find(l => l.id === lessonId);

  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);

  const prog = courseProgress.find(p => p.courseId === courseId);
  const alreadyDone = prog?.completedLessons.includes(lessonId) ?? false;

  useEffect(() => {
    if (!lesson || !course) return;
    fetch("/api/course-lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lessonTitle: lesson.title,
        lessonType: lesson.type,
        courseTitle: course.title,
        targetLanguage: settings.targetLanguage.name,
        nativeLanguage: settings.nativeLanguage.name,
        level: settings.level,
      }),
    })
      .then(r => r.json())
      .then(d => setLessonData(d))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const markDone = () => {
    if (!lesson) return;
    completeLesson(courseId, lessonId, lesson.xp);
    checkAchievements();
    setCompleted(true);
  };

  // Find next lesson
  const nextLesson = (() => {
    let found = false;
    for (const u of course?.units ?? []) {
      for (const l of u.lessons) {
        if (found) return { unitId: u.id, lessonId: l.id, title: l.title };
        if (l.id === lessonId) found = true;
      }
    }
    return null;
  })();

  if (!course || !unit || !lesson) return <div className="p-6 text-white">Không tìm thấy bài học</div>;

  return (
    <div className="min-h-screen" style={{ background: "#0f0a1e" }}>
      {/* Header */}
      <div className="px-5 pt-10 pb-4 flex items-center gap-3" style={{ background: "rgba(26,16,53,0.8)", borderBottom: "1px solid rgba(139,92,246,0.15)" }}>
        <button onClick={() => router.back()} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 truncate">{course.title} · {unit.title}</p>
          <p className="text-white font-semibold text-sm truncate">{lesson.title}</p>
        </div>
        <div className="flex items-center gap-1 bg-yellow-500/20 px-2.5 py-1 rounded-full shrink-0">
          <Star className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-xs font-bold text-yellow-400">{lesson.xp} XP</span>
        </div>
      </div>

      <div className="px-5 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-sm">Đang tạo nội dung bài học...</p>
          </div>
        ) : lessonData?.error ? (
          <div className="text-red-400 text-sm p-4 rounded-xl bg-red-900/20 border border-red-700/30">
            Không thể tải bài học. Vui lòng thử lại.
          </div>
        ) : (
          <>
            {lesson.type === "vocabulary" && <VocabLesson data={lessonData} lang={settings.targetLanguage.code} />}
            {lesson.type === "grammar" && <GrammarLesson data={lessonData} lang={settings.targetLanguage.code} />}
            {lesson.type === "listening" && <ListeningLesson data={lessonData} lang={settings.targetLanguage.code} />}
            {lesson.type === "reading" && <ReadingLesson data={lessonData} lang={settings.targetLanguage.code} />}
            {lesson.type === "speaking" && <SpeakingLesson data={lessonData} lang={settings.targetLanguage.code} />}
            {lesson.type === "quiz" && <QuizLesson data={lessonData} />}

            <div className="mt-8">
              {completed || alreadyDone ? (
                <div className="flex flex-col gap-3">
                  <div className="w-full py-3 rounded-2xl bg-green-700/30 border border-green-600/40 text-green-300 font-bold text-center">
                    ✅ Hoàn thành!
                  </div>
                  {nextLesson ? (
                    <button onClick={() => router.push(`/courses/${courseId}/${nextLesson.unitId}/${nextLesson.lessonId}`)}
                      className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                      Bài tiếp theo: {nextLesson.title} <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button onClick={() => router.push(`/courses/${courseId}`)}
                      className="w-full py-3 rounded-2xl border border-gray-700 text-gray-400 hover:text-white text-sm font-medium transition-colors">
                      Quay lại khóa học
                    </button>
                  )}
                </div>
              ) : (
                <button onClick={markDone}
                  className="w-full py-3.5 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold flex items-center justify-center gap-2 transition-colors">
                  Hoàn thành bài học <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
