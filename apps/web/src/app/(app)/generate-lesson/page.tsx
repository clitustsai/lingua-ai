"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Volume2, Copy, Check, BookOpen, Mic, ChevronDown, ChevronUp, Plus, Flag } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import { canUseFeature, getRemainingUses, incrementUsage, FREE_LIMITS } from "@/lib/usageLimit";

const QUICK_TOPICS = [
  { label: "IELTS Speaking Part 1", emoji: "🎤" },
  { label: "IELTS Speaking Part 2", emoji: "🗣️" },
  { label: "IELTS Writing Task 2", emoji: "✍️" },
  { label: "TOEIC Listening", emoji: "🎧" },
  { label: "Business Email", emoji: "📧" },
  { label: "Job Interview", emoji: "💼" },
  { label: "Travel English", emoji: "✈️" },
  { label: "Daily Conversation", emoji: "💬" },
  { label: "Grammar: Present Perfect", emoji: "📐" },
  { label: "Vocabulary: Technology", emoji: "💻" },
  { label: "Pronunciation: TH sound", emoji: "🔊" },
  { label: "Phrasal Verbs", emoji: "📚" },
];

export default function GenerateLessonPage() {
  const { settings, addFlashcard } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSection, setShowSection] = useState<Record<string, boolean>>({ questions: true, vocab: true, answers: false });
  const [copied, setCopied] = useState("");

  // TOEIC state
  const [toeicPart, setToeicPart] = useState("P1");
  const [toeicAnswers, setToeicAnswers] = useState<Record<string,number>>({});
  const [toeicChecked, setToeicChecked] = useState(false);
  const [toeicFlagged, setToeicFlagged] = useState<Set<string>>(new Set());
  const TOEIC_DATA: Record<string,{options:string[];correct:number;question?:string;image?:string;passage?:string}[]> = {
    P1:[{options:["A woman is walking down a street.","A man is riding a bicycle.","Two people are sitting on a bench.","A car is parked on the road."],correct:0,image:"https://picsum.photos/seed/street/400/250"},{options:["Workers are repairing a building.","A train is arriving at the station.","People are waiting on the platform.","A bus is parked near the entrance."],correct:2,image:"https://picsum.photos/seed/station/400/250"}],
    P2:[{question:"Where is the nearest post office?",options:["It's on Main Street.","I went there yesterday.","The mail arrived late."],correct:0},{question:"When does the meeting start?",options:["In the conference room.","At 3 o'clock.","With the manager."],correct:1}],
    P3:[{question:"What are the speakers mainly discussing?",options:["A new product launch","A business trip schedule","An office renovation","A client complaint"],correct:1,passage:"M: Have you booked the flights for the Tokyo conference?\nW: Not yet. I'm waiting for the manager's approval.\nM: We should do it soon."}],
    P4:[{question:"What is the announcement about?",options:["A store sale","A flight delay","A new service","A schedule change"],correct:1,passage:"Attention passengers: Flight KA205 to Singapore has been delayed by approximately two hours due to technical maintenance."}],
    P5:[{question:"The manager asked all employees to _____ the new safety guidelines.",options:["follow","following","followed","follows"],correct:0},{question:"The conference will be held _____ the Grand Hotel.",options:["in","at","on","by"],correct:1}],
    P6:[{question:"'We are writing to inform you that your order _____ been shipped.'",options:["have","has","had","having"],correct:1,passage:"Dear Mr. Johnson,\nWe are writing to inform you that your order _____ been shipped and is expected to arrive within 3-5 business days."}],
    P7:[{question:"What is the main purpose of this notice?",options:["To announce a new product","To inform about office closure","To invite staff to a party","To request budget approval"],correct:1,passage:"NOTICE: Our office will be closed on December 25th and 26th for the Christmas holiday. Normal business hours will resume on December 27th."}],
  };
  const toeicQs = TOEIC_DATA[toeicPart] ?? [];
  const toeicScore = toeicQs.filter((q,i) => toeicAnswers[`${toeicPart}-${i}`] === q.correct).length;

  const generate = async (t?: string) => {
    const finalTopic = t ?? topic.trim();
    if (!finalTopic) return;
    if (!isPremium && !canUseFeature("generateLesson", isPremium)) {
      router.push("/premium"); return;
    }
    setTopic(finalTopic);
    setLoading(true);
    setLesson(null);
    setError(null);
    try {
      const res = await fetch("/api/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
        }),
      });
      const data = await res.json();
      if (data.error || (!data.questions && !data.vocabulary)) {
        setError("AI không tạo được bài học. Thử lại nhé!");
        return;
      }
      if (!isPremium) incrementUsage("generateLesson");
      setLesson(data);
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại!");
    } finally { setLoading(false); }
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(""), 1500);
  };

  const toggle = (key: string) => setShowSection(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> Tạo bài học tự động
        </h1>
        <p className="text-sm text-gray-400 mt-1">Nhập chủ đề → AI tạo câu hỏi, sample answer, vocab ngay</p>
      </div>

      {/* Input */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === "Enter" && generate()}
          placeholder='Ví dụ: "IELTS Speaking Part 1", "Grammar: Past Perfect"...'
          className="w-full bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none mb-3"
        />
        <button onClick={() => generate()} disabled={loading || !topic.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo bài học...</> : <><Sparkles className="w-4 h-4" /> Tạo bài học</>}
        </button>
        {!isPremium && (
          <p className="text-center text-xs text-gray-600 mt-2">
            Còn {getRemainingUses("generateLesson", isPremium)}/{FREE_LIMITS.generateLesson} lần hôm nay
            {getRemainingUses("generateLesson", isPremium) === 0 && (
              <button onClick={() => router.push("/premium")} className="ml-1 text-yellow-500 underline">Nâng cấp VIP</button>
            )}
          </p>
        )}
      </div>

      {/* Quick topics */}
      {!lesson && !loading && (
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Chủ đề phổ biến</p>
          <div className="grid grid-cols-2 gap-2">
            {QUICK_TOPICS.map(t => (
              <button key={t.label} onClick={() => generate(t.label)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-700 bg-gray-800/60 hover:border-primary-500 hover:bg-primary-900/20 text-left transition-all">
                <span>{t.emoji}</span>
                <span className="text-xs text-gray-300 leading-tight">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang tạo bài học cho "{topic}"...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl p-5 text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <p className="text-red-400 text-sm mb-3">⚠️ {error}</p>
          <button onClick={() => { setError(null); generate(); }}
            className="px-5 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors">
            Thử lại
          </button>
        </div>
      )}

      {/* Lesson result */}
      {lesson && !loading && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          {/* Header */}
          <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
            <h2 className="text-white font-black text-lg">{lesson.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              {lesson.tags?.map((tag: string) => (
                <span key={tag} className="text-xs bg-primary-900/40 text-primary-300 px-2 py-0.5 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          {/* Questions */}
          {lesson.questions?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("questions")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><Mic className="w-4 h-4 text-pink-400" /> Câu hỏi luyện tập ({lesson.questions.length})</span>
                {showSection.questions ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.questions && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {lesson.questions.map((q: any, i: number) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(15,10,30,0.6)" }}>
                      <p className="text-white text-sm font-medium">{i + 1}. {q.question}</p>
                      {q.tip && <p className="text-gray-500 text-xs mt-1">💡 {q.tip}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Sample Answers */}
          {lesson.sampleAnswers?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("answers")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-green-400" /> Sample Answers</span>
                {showSection.answers ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.answers && (
                <div className="px-4 pb-4 flex flex-col gap-3">
                  {lesson.sampleAnswers.map((a: any, i: number) => (
                    <div key={i} className="rounded-xl p-3" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-xs text-green-400 font-semibold">Q{i + 1}: {a.question}</p>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => speakText(a.answer, settings.targetLanguage.code)}
                            className="p-1 rounded text-gray-600 hover:text-primary-400 transition-colors">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => copy(a.answer, `ans-${i}`)}
                            className="p-1 rounded text-gray-600 hover:text-green-400 transition-colors">
                            {copied === `ans-${i}` ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed">{a.answer}</p>
                      {a.keyPhrases?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {a.keyPhrases.map((p: string) => (
                            <span key={p} className="text-xs bg-green-900/30 text-green-300 px-2 py-0.5 rounded-full">{p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Vocabulary */}
          {lesson.vocabulary?.length > 0 && (
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <button onClick={() => toggle("vocab")}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-white">
                <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-400" /> Từ vựng quan trọng ({lesson.vocabulary.length})</span>
                {showSection.vocab ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
              </button>
              {showSection.vocab && (
                <div className="px-4 pb-4 flex flex-col gap-2">
                  {lesson.vocabulary.map((v: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(15,10,30,0.6)" }}>
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                        className="p-1.5 rounded-lg bg-white/10 text-gray-400 hover:text-primary-400 shrink-0">
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{v.word}</p>
                        {v.example && <p className="text-gray-600 text-xs italic">"{v.example}"</p>}
                      </div>
                      <p className="text-primary-300 text-sm shrink-0">{v.meaning}</p>
                      <button onClick={() => addFlashcard({ id: Date.now().toString() + i, word: v.word, translation: v.meaning, example: v.example ?? "", language: settings.targetLanguage.code })}
                        className="p-1.5 rounded-lg text-gray-600 hover:text-accent-400 transition-colors shrink-0">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grammar tips */}
          {lesson.grammarTips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-3">📐 Ngữ pháp cần nhớ</p>
              {lesson.grammarTips.map((tip: string, i: number) => (
                <p key={i} className="text-gray-300 text-sm mb-1.5">• {tip}</p>
              ))}
            </div>
          )}

          {/* TOEIC Practice */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-bold text-sm">📝 Luyện tập TOEIC</p>
              <p className="text-gray-500 text-xs">7 parts · 200 câu</p>
            </div>
            <div className="flex items-center gap-1 px-3 py-2 border-b border-white/5 overflow-x-auto scrollbar-hide">
              {(["P1","P2","P3","P4","P5","P6","P7"]).map(p => (
                <button key={p} onClick={() => { setToeicPart(p); setToeicAnswers({}); setToeicChecked(false); setToeicFlagged(new Set()); }}
                  className={cn("px-2.5 py-1 rounded-lg text-xs font-bold shrink-0 transition-all", toeicPart === p ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700")}>{p}</button>
              ))}
            </div>
            <div className="px-4 py-3 flex flex-col gap-3">
              {toeicQs.map((q, i) => {
                const qk = `${toeicPart}-${i}`; const picked = toeicAnswers[qk]; const isFlagged = toeicFlagged.has(qk);
                return (
                  <div key={i} className="rounded-xl border border-white/5 p-3" style={{ background: "rgba(18,12,36,0.8)" }}>
                    {q.image && <img src={q.image} alt="" className="w-full max-w-xs rounded-lg mb-2 object-cover" style={{ maxHeight: 120 }} />}
                    {q.passage && <div className="mb-2 px-3 py-2 rounded-lg text-xs text-gray-400 italic whitespace-pre-line" style={{ background: "rgba(255,255,255,0.04)" }}>{q.passage}</div>}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white text-sm">Câu {i+1}{q.question ? `. ${q.question}` : ""}</p>
                      <button onClick={() => setToeicFlagged(prev => { const n = new Set(prev); n.has(qk) ? n.delete(qk) : n.add(qk); return n; })} className={cn("shrink-0 transition-colors", isFlagged ? "text-yellow-400" : "text-gray-600 hover:text-yellow-400")}><Flag className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, j) => { const isOptRight = j === q.correct; const isPicked = picked === j; return (
                        <button key={j} onClick={() => !toeicChecked && setToeicAnswers(p => ({ ...p, [qk]: j }))} disabled={toeicChecked}
                          className={cn("px-3 py-2 rounded-xl border text-sm text-left flex items-center gap-2 transition-all",
                            toeicChecked ? isOptRight ? "border-green-500 bg-green-900/30 text-green-300" : isPicked ? "border-red-500 bg-red-900/30 text-red-300" : "border-gray-700 text-gray-600 opacity-40"
                            : isPicked ? "border-blue-500 bg-blue-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-300 hover:border-blue-500")}>
                          <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0", toeicChecked ? isOptRight ? "bg-green-600 text-white" : isPicked ? "bg-red-600 text-white" : "bg-gray-800 text-gray-500" : isPicked ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400")}>{["A","B","C","D"][j]}</span>
                          {opt}
                        </button>
                      );})}
                    </div>
                  </div>
                );
              })}
              {!toeicChecked ? (
                <button onClick={() => setToeicChecked(true)} disabled={Object.keys(toeicAnswers).filter(k => k.startsWith(toeicPart)).length < toeicQs.length}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-bold transition-colors">
                  Kiểm tra ({Object.keys(toeicAnswers).filter(k => k.startsWith(toeicPart)).length}/{toeicQs.length} câu)
                </button>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <span className="text-white text-sm font-bold">{toeicScore}/{toeicQs.length} đúng</span>
                  <button onClick={() => { setToeicAnswers({}); setToeicChecked(false); }} className="text-xs text-gray-400 hover:text-white">Làm lại</button>
                </div>
              )}
            </div>
          </div>

          <button onClick={() => { setLesson(null); setTopic(""); }}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 text-sm transition-colors hover:border-gray-600">
            Tạo bài học khác
          </button>
        </div>
      )}
    </div>
  );
}
