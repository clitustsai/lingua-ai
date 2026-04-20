"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Trophy, Mic, Headphones, BookOpen, PenLine, CheckSquare, ChevronRight, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText } from "@/components/VoiceButton";

function MicButton({ onTranscript }: { onTranscript: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useState<any>(null);
  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Dùng Chrome để dùng mic."); return; }
    if (listening) { recRef[0]?.stop(); setListening(false); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.interimResults = false;
    rec.onresult = (e: any) => { onTranscript(e.results[0][0].transcript); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef[0] = rec; rec.start(); setListening(true);
  };
  return (
    <button onClick={toggle} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={listening ? { background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.5)", color: "#f9a8d4" }
        : { background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#ec4899" }}>
      <Mic className={cn("w-3.5 h-3.5", listening && "animate-pulse")} />
      {listening ? "Đang nghe... (bấm dừng)" : "Bấm để nói"}
    </button>
  );
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const SECTIONS = [
  { key: "listening", label: "Nghe",     icon: Headphones,   color: "#3b82f6" },
  { key: "reading",   label: "Đọc",      icon: BookOpen,     color: "#10b981" },
  { key: "grammar",   label: "Ngữ pháp", icon: CheckSquare,  color: "#a78bfa" },
  { key: "writing",   label: "Viết",     icon: PenLine,      color: "#f59e0b" },
  { key: "speaking",  label: "Nói",      icon: Mic,          color: "#ec4899" },
];

type SectionResult = { score: number; passed: boolean; feedback: string; corrections: any[] };

export default function ExamPage() {
  const { settings, examResults = {}, saveExamResult } = useAppStore() as any;
  const { user } = useAuthStore();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState(settings.level ?? "A1");
  const [phase, setPhase] = useState<"intro" | "loading" | "section" | "result">("intro");
  const [currentSection, setCurrentSection] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
  const [sectionResults, setSectionResults] = useState<Record<string, SectionResult>>({});
  const [grading, setGrading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [allResults, setAllResults] = useState<Record<string, SectionResult>>({});

  const alreadyPassed = (examResults as any)?.[selectedLevel]?.passed;

  // Load AI questions for current section
  const loadSection = async (sectionIdx: number, level: string) => {
    setPhase("loading");
    setQuestions([]);
    setAnswers({});
    setWritingAnswers({});
    const section = SECTIONS[sectionIdx];
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level, section: section.label, generateQuestions: true }),
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setQuestions([]);
    }
    setPhase("section");
  };

  const startExam = () => {
    setSectionResults({});
    setAllResults({});
    setCurrentSection(0);
    loadSection(0, selectedLevel);
  };

  const submitSection = async () => {
    setGrading(true);
    const section = SECTIONS[currentSection];
    const qs = questions;

    let payload: any[] = [];
    if (section.key === "writing") {
      payload = qs.map((q: any) => ({ question: q.prompt, answer: writingAnswers[q.id] ?? "" }));
    } else if (section.key === "speaking") {
      payload = qs.map((q: any) => ({ question: q.prompt, answer: answers[q.id] ?? "(no answer)" }));
    } else {
      payload = qs.map((q: any) => ({ question: q.question ?? q.audio, answer: answers[q.id] ?? "", correct: q.answer }));
    }

    let result: SectionResult;
    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel, section: section.label, answers: payload }),
      });
      result = await res.json();
    } catch {
      // fallback local grading for MCQ
      if (section.key !== "writing" && section.key !== "speaking") {
        const correct = qs.filter((q: any) => answers[q.id] === q.answer).length;
        const score = qs.length ? Math.round((correct / qs.length) * 100) : 50;
        result = { score, passed: score >= 60, feedback: "", corrections: [] };
      } else {
        result = { score: 65, passed: true, feedback: "Không thể chấm điểm tự động.", corrections: [] };
      }
    }

    const newResults = { ...allResults, [section.key]: result };
    setAllResults(newResults);
    setSectionResults(newResults);
    setGrading(false);

    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(s => s + 1);
      loadSection(currentSection + 1, selectedLevel);
    } else {
      const scores = Object.values(newResults).map((r: any) => r.score);
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      setFinalScore(avg);
      setPhase("result");
      if (avg >= 60 && saveExamResult) {
        saveExamResult(selectedLevel, { passed: true, score: avg, date: new Date().toISOString() });
      }
    }
  };

  // INTRO
  if (phase === "intro") {
    return (
      <div className="p-5 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" /> Thi chứng chỉ
          </h1>
          <p className="text-sm text-gray-400 mt-1">AI tạo đề thi thật theo trình độ — thi đạt mới nhận chứng chỉ</p>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {LEVELS.map((lv, i) => {
            const prev = i === 0 ? true : (examResults as any)?.[LEVELS[i-1]]?.passed;
            const passed = (examResults as any)?.[lv]?.passed;
            const locked = !prev && lv !== "A1";
            return (
              <button key={lv} onClick={() => !locked && setSelectedLevel(lv)}
                className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all",
                  locked ? "opacity-40 cursor-not-allowed border-gray-700 bg-gray-800/40" :
                  selectedLevel === lv ? "border-purple-500 bg-purple-900/30" :
                  "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
                {locked ? <Lock className="w-4 h-4 text-gray-500" /> :
                 passed ? <CheckCircle2 className="w-4 h-4 text-green-400" /> :
                 <Trophy className="w-4 h-4 text-yellow-400" />}
                <span className="font-bold text-white text-sm">{lv}</span>
                {passed && <span className="text-[10px] text-green-400">Đã đạt · {(examResults as any)[lv]?.score}đ</span>}
                {locked && <span className="text-[10px] text-gray-500">Khóa</span>}
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl p-4 mb-5"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <p className="text-white font-semibold text-sm">Bài thi {selectedLevel} — AI tạo đề thật</p>
          </div>
          <div className="flex flex-col gap-2">
            {SECTIONS.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: s.color + "20" }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <span className="text-sm text-gray-300 flex-1">{s.label}</span>
                <span className="text-xs text-gray-500">AI tạo câu hỏi thật</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500">Điểm đạt: <span className="text-green-400 font-semibold">60/100</span> · Thi lại không giới hạn</p>
          </div>
        </div>

        {alreadyPassed && (
          <div className="rounded-2xl p-3 mb-4 flex items-center gap-3"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-green-300 text-sm font-semibold">Bạn đã đạt {selectedLevel}!</p>
              <p className="text-green-400/60 text-xs">Điểm: {(examResults as any)[selectedLevel]?.score}/100 · Có thể thi lại để cải thiện</p>
            </div>
          </div>
        )}

        <button onClick={startExam}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          <Trophy className="w-4 h-4" /> Bắt đầu thi {selectedLevel}
        </button>
      </div>
    );
  }

  // LOADING AI QUESTIONS
  if (phase === "loading") {
    const section = SECTIONS[currentSection];
    return (
      <div className="p-5 max-w-2xl flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: section.color + "20" }}>
          <section.icon className="w-7 h-7" style={{ color: section.color }} />
        </div>
        <div className="text-center">
          <p className="text-white font-semibold">AI đang tạo đề thi {section.label}...</p>
          <p className="text-gray-500 text-sm mt-1">Đề thi thật cho trình độ {selectedLevel}</p>
        </div>
        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
      </div>
    );
  }

  // SECTION
  if (phase === "section") {
    const section = SECTIONS[currentSection];
    const sKey = section.key;

    return (
      <div className="p-5 max-w-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: section.color + "20" }}>
            <section.icon className="w-5 h-5" style={{ color: section.color }} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Phần {currentSection + 1}/{SECTIONS.length} · {selectedLevel}</p>
            <h2 className="text-white font-bold">{section.label}</h2>
          </div>
          <div className="ml-auto flex gap-1">
            {SECTIONS.map((s, i) => (
              <div key={s.key} className="w-2 h-2 rounded-full"
                style={{ background: i < currentSection ? "#10b981" : i === currentSection ? section.color : "rgba(255,255,255,0.1)" }} />
            ))}
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Không tải được câu hỏi. <button onClick={() => loadSection(currentSection, selectedLevel)} className="text-purple-400 underline">Thử lại</button></div>
        ) : (
          <div className="flex flex-col gap-4 mb-6">
            {sKey === "listening" && questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl p-4"
                style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <button onClick={() => speakText(q.audio, "en")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold mb-3 transition-all"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", color: "#93c5fd" }}>
                  <Headphones className="w-3.5 h-3.5" /> Nghe đoạn hội thoại
                </button>
                <p className="text-white text-sm font-medium mb-3">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map((opt: string) => (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      className="py-2 px-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={answers[q.id] === opt
                        ? { background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.5)", color: "white" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {sKey === "reading" && questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl p-4"
                style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                  <p className="text-green-200 text-sm italic leading-relaxed">{q.text}</p>
                </div>
                <p className="text-white text-sm font-medium mb-3">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map((opt: string) => (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      className="py-2 px-3 rounded-xl text-sm font-medium transition-all text-left"
                      style={answers[q.id] === opt
                        ? { background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.5)", color: "white" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {sKey === "grammar" && questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl p-4"
                style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(167,139,250,0.2)" }}>
                <p className="text-white text-sm font-medium mb-3">{q.question}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options?.map((opt: string) => (
                    <button key={opt} onClick={() => setAnswers(p => ({ ...p, [q.id]: opt }))}
                      className="py-2 px-3 rounded-xl text-sm font-medium transition-all"
                      style={answers[q.id] === opt
                        ? { background: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.5)", color: "white" }
                        : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#9ca3af" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {sKey === "writing" && questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl p-4"
                style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="text-yellow-300 text-sm font-medium mb-2">✍️ {q.prompt}</p>
                {q.example && (
                  <div className="rounded-xl p-2.5 mb-3" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <p className="text-xs text-yellow-400/60 mb-1">Ví dụ:</p>
                    <p className="text-xs text-gray-400 italic">{q.example}</p>
                  </div>
                )}
                <textarea value={writingAnswers[q.id] ?? ""} onChange={e => setWritingAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Viết câu trả lời của bạn ở đây..." rows={4}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-yellow-500/50 resize-none"
                  style={{ background: "rgba(255,255,255,0.05)" }} />
                <p className="text-xs text-gray-600 mt-1">{(writingAnswers[q.id] ?? "").split(" ").filter(Boolean).length} từ {q.minWords ? `(tối thiểu ${q.minWords})` : ""}</p>
              </div>
            ))}

            {sKey === "speaking" && questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl p-4"
                style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(236,72,153,0.2)" }}>
                <p className="text-pink-300 text-sm font-medium mb-2">🎤 {q.prompt}</p>
                {q.example && (
                  <div className="rounded-xl p-2.5 mb-2" style={{ background: "rgba(236,72,153,0.06)", border: "1px solid rgba(236,72,153,0.15)" }}>
                    <p className="text-xs text-pink-400/60 mb-1">Ví dụ câu trả lời:</p>
                    <p className="text-xs text-gray-400 italic">"{q.example}"</p>
                  </div>
                )}
                {q.tips && <p className="text-xs text-yellow-400/70 mb-3">💡 {q.tips}</p>}
                <div className="flex gap-2 mb-2">
                  <MicButton onTranscript={(t) => setAnswers(p => ({ ...p, [q.id]: (p[q.id] ? p[q.id] + " " : "") + t }))} />
                </div>
                <textarea value={answers[q.id] ?? ""} onChange={e => setAnswers(p => ({ ...p, [q.id]: e.target.value }))}
                  placeholder="Nói vào mic hoặc gõ câu trả lời..." rows={3}
                  className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-pink-500/50 resize-none"
                  style={{ background: "rgba(255,255,255,0.05)" }} />
              </div>
            ))}
          </div>
        )}

        <button onClick={submitSection} disabled={grading || questions.length === 0}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          {grading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          {grading ? "Đang chấm điểm AI..." : currentSection < SECTIONS.length - 1 ? "Tiếp theo" : "Nộp bài"}
        </button>
      </div>
    );
  }

  // RESULT
  const passed = finalScore >= 60;
  return (
    <div className="p-5 max-w-2xl">
      <div className="text-center mb-6">
        <div className="text-6xl mb-3">{passed ? "🏆" : "📚"}</div>
        <h1 className="text-2xl font-black text-white mb-1">
          {passed ? `Chúc mừng! Đạt ${selectedLevel}` : `Chưa đạt ${selectedLevel}`}
        </h1>
        <p className="text-gray-400 text-sm">
          {passed ? "Bạn đã vượt qua bài thi và có thể nhận chứng chỉ!" : "Cần ôn luyện thêm và thi lại."}
        </p>
      </div>

      <div className="rounded-2xl p-5 mb-5 text-center"
        style={{ background: passed ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${passed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
        <p className="text-5xl font-black mb-1" style={{ color: passed ? "#10b981" : "#ef4444" }}>{finalScore}</p>
        <p className="text-gray-400 text-sm">Điểm trung bình / 100</p>
        <p className="text-xs mt-1 font-bold" style={{ color: passed ? "#10b981" : "#ef4444" }}>
          {passed ? "PASSED" : "FAILED"} · Điểm đạt: 60
        </p>
      </div>

      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-sm font-semibold text-white mb-3">Chi tiết từng phần</p>
        <div className="flex flex-col gap-2">
          {SECTIONS.map(s => {
            const r = allResults[s.key];
            if (!r) return null;
            return (
              <div key={s.key} className="flex items-center gap-3">
                <s.icon className="w-4 h-4 shrink-0" style={{ color: s.color }} />
                <span className="text-sm text-gray-300 flex-1">{s.label}</span>
                <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-1.5 rounded-full" style={{ width: r.score + "%", background: r.passed ? "#10b981" : "#ef4444" }} />
                </div>
                <span className="text-sm font-bold w-10 text-right" style={{ color: r.passed ? "#10b981" : "#ef4444" }}>{r.score}</span>
                {r.passed ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
              </div>
            );
          })}
        </div>
        {Object.values(allResults).some((r: any) => r.feedback) && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500 mb-2">Nhận xét từ AI:</p>
            {SECTIONS.map(s => {
              const r = allResults[s.key];
              if (!r?.feedback) return null;
              return <p key={s.key} className="text-xs text-gray-400 mb-1"><span style={{ color: s.color }}>{s.label}:</span> {r.feedback}</p>;
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        {passed && (
          <button onClick={() => router.push("/certificate")}
            className="flex-1 py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}>
            🏅 Nhận chứng chỉ
          </button>
        )}
        <button onClick={() => setPhase("intro")}
          className={cn("py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90", passed ? "px-5" : "flex-1")}
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {passed ? "Thi tiếp" : "Thi lại"}
        </button>
      </div>
    </div>
  );
}
