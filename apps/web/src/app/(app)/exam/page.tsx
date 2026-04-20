"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, Trophy, Mic, Headphones, BookOpen, PenLine, CheckSquare, ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { speakText } from "@/components/VoiceButton";

// Inline mic button for speaking section
function MicButton({ qId, onTranscript }: { qId: string; onTranscript: (t: string) => void }) {
  const [listening, setListening] = useState(false);
  const recRef = useState<any>(null);

  const toggle = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Dùng Chrome để dùng mic."); return; }
    if (listening) {
      recRef[0]?.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.onresult = (e: any) => { onTranscript(e.results[0][0].transcript); };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef[0] = rec;
    rec.start();
    setListening(true);
  };

  return (
    <button onClick={toggle}
      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={listening
        ? { background: "rgba(236,72,153,0.25)", border: "1px solid rgba(236,72,153,0.5)", color: "#f9a8d4" }
        : { background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)", color: "#ec4899" }}>
      <Mic className={cn("w-3.5 h-3.5", listening && "animate-pulse")} />
      {listening ? "Đang nghe... (bấm dừng)" : "Bấm để nói"}
    </button>
  );
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

const EXAM_QUESTIONS: Record<string, Record<string, any[]>> = {
  A1: {
    listening: [
      { id: "l1", audio: "Hello, my name is Tom. I am from England.", question: "Where is Tom from?", options: ["France", "England", "America", "Germany"], answer: "England" },
      { id: "l2", audio: "I have a cat and two dogs.", question: "How many pets does the speaker have?", options: ["1", "2", "3", "4"], answer: "3" },
      { id: "l3", audio: "The shop opens at nine o'clock.", question: "What time does the shop open?", options: ["8:00", "9:00", "10:00", "11:00"], answer: "9:00" },
    ],
    reading: [
      { id: "r1", text: "Anna is a student. She studies English every day. She likes reading books.", question: "What does Anna study?", options: ["Math", "English", "Science", "History"], answer: "English" },
      { id: "r2", text: "The weather today is sunny and warm. It is a good day for a walk.", question: "What is the weather like?", options: ["Rainy", "Cold", "Sunny and warm", "Windy"], answer: "Sunny and warm" },
      { id: "r3", text: "My brother works in a hospital. He is a doctor.", question: "What is the brother's job?", options: ["Teacher", "Doctor", "Engineer", "Chef"], answer: "Doctor" },
    ],
    grammar: [
      { id: "g1", question: "She ___ a teacher.", options: ["am", "is", "are", "be"], answer: "is" },
      { id: "g2", question: "I ___ to school every day.", options: ["go", "goes", "going", "went"], answer: "go" },
      { id: "g3", question: "There ___ two cats in the garden.", options: ["is", "am", "are", "be"], answer: "are" },
      { id: "g4", question: "He ___ not like coffee.", options: ["do", "does", "did", "is"], answer: "does" },
      { id: "g5", question: "___ you speak English?", options: ["Do", "Does", "Are", "Is"], answer: "Do" },
    ],
    writing: [
      { id: "w1", prompt: "Write 2-3 sentences about yourself (name, age, where you live).", minWords: 10 },
      { id: "w2", prompt: "Describe your favorite food in 2-3 sentences.", minWords: 10 },
    ],
    speaking: [
      { id: "s1", prompt: "Introduce yourself: say your name and where you are from." },
      { id: "s2", prompt: "Describe what you can see around you right now." },
    ],
  },
};

// Fill other levels with A1 data for now
["A2","B1","B2","C1","C2"].forEach(l => { EXAM_QUESTIONS[l] = EXAM_QUESTIONS.A1; });

const SECTIONS = [
  { key: "listening", label: "Nghe", icon: Headphones, color: "#3b82f6" },
  { key: "reading",   label: "Đọc",  icon: BookOpen,   color: "#10b981" },
  { key: "grammar",   label: "Ngữ pháp", icon: CheckSquare, color: "#a78bfa" },
  { key: "writing",   label: "Viết", icon: PenLine,    color: "#f59e0b" },
  { key: "speaking",  label: "Nói",  icon: Mic,        color: "#ec4899" },
];

type SectionResult = { score: number; passed: boolean; feedback: string; corrections: any[] };

export default function ExamPage() {
  const { settings, examResults = {}, saveExamResult } = useAppStore() as any;
  const { user } = useAuthStore();
  const router = useRouter();

  const [selectedLevel, setSelectedLevel] = useState(settings.level ?? "A1");
  const [phase, setPhase] = useState<"intro" | "section" | "result">("intro");
  const [currentSection, setCurrentSection] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [writingAnswers, setWritingAnswers] = useState<Record<string, string>>({});
  const [sectionResults, setSectionResults] = useState<Record<string, SectionResult>>({});
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const levelExam = EXAM_QUESTIONS[selectedLevel] ?? EXAM_QUESTIONS.A1;
  const section = SECTIONS[currentSection];
  const questions = levelExam[section?.key] ?? [];
  const alreadyPassed = examResults?.[selectedLevel]?.passed;

  const handleAnswer = (qId: string, val: string) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const submitSection = async () => {
    setLoading(true);
    const sectionKey = section.key;
    const qs = questions;

    let payload: any[] = [];
    if (sectionKey === "writing") {
      payload = qs.map((q: any) => ({ question: q.prompt, answer: writingAnswers[q.id] ?? "" }));
    } else if (sectionKey === "speaking") {
      payload = qs.map((q: any) => ({ question: q.prompt, answer: answers[q.id] ?? "(no answer)" }));
    } else {
      payload = qs.map((q: any) => ({ question: q.question, answer: answers[q.id] ?? "", correct: q.answer }));
    }

    try {
      const res = await fetch("/api/exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel, section: section.label, answers: payload }),
      });
      const data = await res.json();
      setSectionResults(prev => ({ ...prev, [sectionKey]: data }));
    } catch {
      // fallback: auto-grade MCQ locally
      if (sectionKey !== "writing" && sectionKey !== "speaking") {
        const correct = qs.filter((q: any) => answers[q.id] === q.answer).length;
        const score = Math.round((correct / qs.length) * 100);
        setSectionResults(prev => ({ ...prev, [sectionKey]: { score, passed: score >= 60, feedback: "", corrections: [] } }));
      } else {
        setSectionResults(prev => ({ ...prev, [sectionKey]: { score: 70, passed: true, feedback: "Không thể chấm điểm tự động.", corrections: [] } }));
      }
    }
    setLoading(false);

    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(s => s + 1);
    } else {
      // Calculate final
      const allResults = { ...sectionResults };
      const scores = Object.values(allResults).map((r: any) => r.score);
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
          <p className="text-sm text-gray-400 mt-1">Hoàn thành bài thi để nhận chứng chỉ trình độ</p>
        </div>

        {/* Level selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {LEVELS.map((lv, i) => {
            const prev = i === 0 ? true : examResults?.[LEVELS[i-1]]?.passed;
            const passed = examResults?.[lv]?.passed;
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
                {passed && <span className="text-[10px] text-green-400">Đã đạt</span>}
                {locked && <span className="text-[10px] text-gray-500">Khóa</span>}
              </button>
            );
          })}
        </div>

        {/* Exam info */}
        <div className="rounded-2xl p-4 mb-5"
          style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-white font-semibold mb-3">Bài thi {selectedLevel} gồm 5 phần:</p>
          <div className="flex flex-col gap-2">
            {SECTIONS.map(s => (
              <div key={s.key} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: s.color + "20" }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <span className="text-sm text-gray-300">{s.label}</span>
                <span className="ml-auto text-xs text-gray-500">{levelExam[s.key]?.length ?? 0} câu</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/5">
            <p className="text-xs text-gray-500">Điểm đạt: <span className="text-green-400 font-semibold">60/100</span> mỗi phần · Thi lại không giới hạn</p>
          </div>
        </div>

        {alreadyPassed && (
          <div className="rounded-2xl p-3 mb-4 flex items-center gap-3"
            style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
            <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            <div>
              <p className="text-green-300 text-sm font-semibold">Bạn đã đạt {selectedLevel}!</p>
              <p className="text-green-400/60 text-xs">Điểm: {examResults[selectedLevel]?.score}/100 · Có thể thi lại để cải thiện</p>
            </div>
          </div>
        )}

        <button onClick={() => { setPhase("section"); setCurrentSection(0); setAnswers({}); setWritingAnswers({}); setSectionResults({}); }}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          <Trophy className="w-4 h-4" /> Bắt đầu thi {selectedLevel}
        </button>
      </div>
    );
  }

  // SECTION
  if (phase === "section") {
    const sKey = section.key;
    const qs = questions;

    return (
      <div className="p-5 max-w-2xl">
        {/* Header */}
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

        {/* Questions */}
        <div className="flex flex-col gap-4 mb-6">
          {sKey === "listening" && qs.map((q: any) => (
            <div key={q.id} className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => speakText(q.audio, "en")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-blue-300 transition-all hover:bg-blue-500/10"
                  style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <Headphones className="w-3.5 h-3.5" /> Nghe đoạn hội thoại
                </button>
              </div>
              <p className="text-white text-sm font-medium mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: string) => (
                  <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                    className={cn("py-2 px-3 rounded-xl text-sm font-medium transition-all text-left",
                      answers[q.id] === opt ? "text-white" : "text-gray-400 hover:text-white")}
                    style={answers[q.id] === opt ? { background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.5)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {sKey === "reading" && qs.map((q: any) => (
            <div key={q.id} className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
                <p className="text-green-200 text-sm italic leading-relaxed">{q.text}</p>
              </div>
              <p className="text-white text-sm font-medium mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: string) => (
                  <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                    className={cn("py-2 px-3 rounded-xl text-sm font-medium transition-all text-left",
                      answers[q.id] === opt ? "text-white" : "text-gray-400 hover:text-white")}
                    style={answers[q.id] === opt ? { background: "rgba(16,185,129,0.25)", border: "1px solid rgba(16,185,129,0.5)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {sKey === "grammar" && qs.map((q: any) => (
            <div key={q.id} className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-white text-sm font-medium mb-3">{q.question}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt: string) => (
                  <button key={opt} onClick={() => handleAnswer(q.id, opt)}
                    className={cn("py-2 px-3 rounded-xl text-sm font-medium transition-all",
                      answers[q.id] === opt ? "text-white" : "text-gray-400 hover:text-white")}
                    style={answers[q.id] === opt ? { background: "rgba(167,139,250,0.25)", border: "1px solid rgba(167,139,250,0.5)" } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {sKey === "writing" && qs.map((q: any) => (
            <div key={q.id} className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-yellow-300 text-sm font-medium mb-3">✍️ {q.prompt}</p>
              <textarea value={writingAnswers[q.id] ?? ""} onChange={e => setWritingAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Viết câu trả lời của bạn ở đây..."
                rows={4}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-yellow-500/50 resize-none"
                style={{ background: "rgba(255,255,255,0.05)" }} />
              <p className="text-xs text-gray-600 mt-1">{(writingAnswers[q.id] ?? "").split(" ").filter(Boolean).length} từ (tối thiểu {q.minWords})</p>
            </div>
          ))}

          {sKey === "speaking" && qs.map((q: any) => (
            <div key={q.id} className="rounded-2xl p-4"
              style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <p className="text-pink-300 text-sm font-medium mb-3">🎤 {q.prompt}</p>
              <div className="flex gap-2 mb-2">
                <MicButton qId={q.id} onTranscript={(t) => handleAnswer(q.id, (answers[q.id] ? answers[q.id] + " " : "") + t)} />
              </div>
              <textarea value={answers[q.id] ?? ""} onChange={e => handleAnswer(q.id, e.target.value)}
                placeholder="Nói vào mic hoặc gõ câu trả lời..."
                rows={3}
                className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/25 border border-white/10 focus:outline-none focus:border-pink-500/50 resize-none"
                style={{ background: "rgba(255,255,255,0.05)" }} />
              {answers[q.id] && <p className="text-xs text-pink-400/60 mt-1">{answers[q.id].split(" ").filter(Boolean).length} từ</p>}
            </div>
          ))}
        </div>

        <button onClick={submitSection} disabled={loading}
          className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" }}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronRight className="w-4 h-4" />}
          {loading ? "Đang chấm điểm..." : currentSection < SECTIONS.length - 1 ? "Tiếp theo" : "Nộp bài"}
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

      {/* Score */}
      <div className="rounded-2xl p-5 mb-5 text-center"
        style={{ background: passed ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${passed ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}` }}>
        <p className="text-5xl font-black mb-1" style={{ color: passed ? "#10b981" : "#ef4444" }}>{finalScore}</p>
        <p className="text-gray-400 text-sm">Điểm trung bình / 100</p>
        <p className="text-xs mt-1" style={{ color: passed ? "#10b981" : "#ef4444" }}>
          {passed ? "PASSED" : "FAILED"} · Điểm đạt: 60
        </p>
      </div>

      {/* Section breakdown */}
      <div className="rounded-2xl p-4 mb-5"
        style={{ background: "rgba(20,12,40,0.95)", border: "1px solid rgba(139,92,246,0.15)" }}>
        <p className="text-sm font-semibold text-white mb-3">Chi tiết từng phần</p>
        <div className="flex flex-col gap-2">
          {SECTIONS.map(s => {
            const r = sectionResults[s.key];
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
