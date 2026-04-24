"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Sparkles, ChevronRight, CheckCircle2, RotateCcw, BookOpen, Mic, MicOff, Headphones, Star, Flame, Crown, Lock, Flag } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";
import { LEVELS } from "@ai-lang/shared";
import { canUseFeature, getRemainingUses, incrementUsage, FREE_LIMITS } from "@/lib/usageLimit";

const GOALS = [
  { id: "travel", label: "Du lịch", emoji: "✈️", desc: "Giao tiếp khi đi du lịch" },
  { id: "ielts", label: "IELTS / TOEIC", emoji: "🎓", desc: "Thi chứng chỉ quốc tế" },
  { id: "business", label: "Công việc", emoji: "💼", desc: "Tiếng Anh văn phòng" },
  { id: "daily", label: "Giao tiếp hàng ngày", emoji: "💬", desc: "Nói chuyện tự nhiên" },
  { id: "culture", label: "Văn hóa & Giải trí", emoji: "🎬", desc: "Xem phim, nghe nhạc" },
  { id: "academic", label: "Học thuật", emoji: "📚", desc: "Đọc tài liệu, nghiên cứu" },
];

const DAYS_OPTIONS = [3, 5, 7];

export default function LearningPathPage() {
  const router = useRouter();
  const { settings, learningPath, pathDaysDone, setLearningPath, markPathDay, clearLearningPath, incrementWords, checkAchievements, canAccessLevel, examResults = {} } = useAppStore() as any;
  const { user } = useAuthStore();
  const isPremium = user?.isPremium ?? false;

  // Onboarding state
  const [step, setStep] = useState<"onboard" | "generating" | "path" | "day">("onboard");
  const [selectedGoal, setSelectedGoal] = useState("daily");
  const [selectedLevel, setSelectedLevel] = useState(settings.level);
  const [daysPerWeek, setDaysPerWeek] = useState(5);

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Day lesson state
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [dayLesson, setDayLesson] = useState<any>(null);
  const [loadingDay, setLoadingDay] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);

  // Speaking / mic state
  const [isRecording, setIsRecording] = useState(false);

  // TOEIC state
  const [toeicPart, setToeicPart] = useState("P1");
  const [toeicAnswers, setToeicAnswers] = useState<Record<string,number>>({});
  const [toeicChecked, setToeicChecked] = useState(false);
  const [toeicFlagged, setToeicFlagged] = useState<Set<string>>(new Set());
  const TOEIC_DATA: Record<string,{options:string[];correct:number;question?:string;image?:string;passage?:string}[]> = {
    P1:[{options:["A woman is walking down a street.","A man is riding a bicycle.","Two people are sitting on a bench.","A car is parked on the road."],correct:0,image:"https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=300&q=70"},{options:["Workers are repairing a building.","A train is arriving at the station.","People are waiting on the platform.","A bus is parked near the entrance."],correct:2,image:"https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&q=70"}],
    P2:[{question:"Where is the nearest post office?",options:["It's on Main Street.","I went there yesterday.","The mail arrived late."],correct:0},{question:"When does the meeting start?",options:["In the conference room.","At 3 o'clock.","With the manager."],correct:1}],
    P3:[{question:"What are the speakers mainly discussing?",options:["A new product launch","A business trip schedule","An office renovation","A client complaint"],correct:1,passage:"M: Have you booked the flights for the Tokyo conference?\nW: Not yet. I'm waiting for the manager's approval.\nM: We should do it soon."}],
    P4:[{question:"What is the announcement about?",options:["A store sale","A flight delay","A new service","A schedule change"],correct:1,passage:"Attention passengers: Flight KA205 to Singapore has been delayed by approximately two hours due to technical maintenance."}],
    P5:[{question:"The manager asked all employees to _____ the new safety guidelines.",options:["follow","following","followed","follows"],correct:0},{question:"The conference will be held _____ the Grand Hotel.",options:["in","at","on","by"],correct:1}],
    P6:[{question:"'We are writing to inform you that your order _____ been shipped.'",options:["have","has","had","having"],correct:1,passage:"Dear Mr. Johnson,\nWe are writing to inform you that your order _____ been shipped and is expected to arrive within 3-5 business days."}],
    P7:[{question:"What is the main purpose of this notice?",options:["To announce a new product","To inform about office closure","To invite staff to a party","To request budget approval"],correct:1,passage:"NOTICE: Our office will be closed on December 25th and 26th for the Christmas holiday. Normal business hours will resume on December 27th."}],
  };
  const toeicQs = TOEIC_DATA[toeicPart] ?? [];
  const toeicScore = toeicQs.filter((q,i) => toeicAnswers[`${toeicPart}-${i}`] === q.correct).length;
  const [speakingDone, setSpeakingDone] = useState(false);
  const [speakingScore, setSpeakingScore] = useState<{ score: number; transcript: string; feedback: string } | null>(null);
  const [scoringLoading, setScoringLoading] = useState(false);
  const recRef = useRef<any>(null);

  const startRecording = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Dùng Chrome để nhận diện giọng nói."); return; }
    const rec = new SR();
    rec.lang = settings.targetLanguage.code === "en" ? "en-US"
      : settings.targetLanguage.code === "ja" ? "ja-JP"
      : settings.targetLanguage.code === "ko" ? "ko-KR"
      : settings.targetLanguage.code === "zh" ? "zh-CN"
      : settings.targetLanguage.code === "fr" ? "fr-FR"
      : settings.targetLanguage.code === "es" ? "es-ES"
      : settings.targetLanguage.code === "de" ? "de-DE"
      : "en-US";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = async (e: any) => {
      const transcript = e.results[0][0].transcript;
      const confidence = e.results[0][0].confidence ?? 0.7;
      setIsRecording(false);
      setScoringLoading(true);
      // Score based on confidence + length
      const score = Math.min(100, Math.round(confidence * 80 + Math.min(transcript.split(" ").length * 2, 20)));
      const feedback = score >= 80 ? "Phát âm tốt lắm! 🎉"
        : score >= 60 ? "Khá tốt, tiếp tục luyện tập! 👍"
        : "Thử lại, nói rõ hơn nhé! 🎤";
      setSpeakingScore({ score, transcript, feedback });
      setSpeakingDone(true);
      setScoringLoading(false);
    };
    rec.onerror = () => { setIsRecording(false); };
    rec.onend = () => { setIsRecording(false); };
    recRef.current = rec;
    rec.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recRef.current?.stop();
    setIsRecording(false);
  };

  const generate = async () => {
    if (!isPremium && !canUseFeature("lesson", isPremium)) {
      router.push("/premium"); return;
    }
    setStep("generating");
    const goal = GOALS.find(g => g.id === selectedGoal);
    try {
      const res = await fetch("/api/learning-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: goal?.label ?? selectedGoal,
          level: selectedLevel,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          daysPerWeek,
        }),
      });
      const data = await res.json();
      if (!isPremium) incrementUsage("lesson");
      setLearningPath({ ...data, goal: goal?.label ?? selectedGoal, level: selectedLevel, createdAt: new Date().toISOString() });
      setStep("path");
    } catch {
      setStep("onboard");
      alert("Không thể tạo lộ trình. Thử lại nhé!");
    }
  };

  const openDay = async (idx: number) => {
    if (!learningPath) return;
    setActiveDayIdx(idx);
    setDayLesson(null);
    setQuizAnswers({});
    setQuizChecked(false);
    setSpeakingDone(false);
    setSpeakingScore(null);
    setIsRecording(false);
    setLoadingDay(true);
    setStep("day");
    const day = learningPath.days[idx];
    try {
      const res = await fetch("/api/daily-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: day.theme,
          focus: day.focus,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: learningPath.level,
          goal: learningPath.goal,
        }),
      });
      const data = await res.json();
      if (data.error || (!data.vocabulary && !data.grammarPoint && !data.quiz)) {
        setDayLesson({ _error: data.error || "Không thể tải bài học. Thử lại nhé!" });
      } else {
        setDayLesson(data);
      }
    } catch {
      setDayLesson({ _error: "Lỗi kết nối. Vui lòng thử lại!" });
    } finally {
      setLoadingDay(false);
    }
  };

  const completeDay = () => {
    markPathDay(activeDayIdx + 1);
    incrementWords(5);
    checkAchievements();
    // Auto go to next day if available
    const nextIdx = activeDayIdx + 1;
    if (learningPath && nextIdx < learningPath.days.length && (isPremium || nextIdx < 3)) {
      setTimeout(() => openDay(nextIdx), 800);
    } else {
      setStep("path");
    }
  };

  // ── Onboarding ──────────────────────────────────────────────────────────────
  if (step === "onboard" || (!learningPath && step !== "generating")) return (
    <div className="p-5 max-w-lg">
      <div className="mb-6 pt-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-yellow-400" /> Lộ trình học cá nhân
        </h1>
        <p className="text-sm text-gray-400 mt-1">AI tạo kế hoạch học riêng cho bạn</p>
      </div>

      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">🎯 Mục tiêu của bạn</p>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setSelectedGoal(g.id)}
                className={cn("flex flex-col gap-1 p-3 rounded-xl border text-left transition-all",
                  selectedGoal === g.id ? "border-primary-500 bg-primary-900/30" : "border-gray-700 bg-gray-800 hover:border-gray-600")}>
                <span className="text-xl">{g.emoji}</span>
                <span className={cn("text-sm font-medium", selectedGoal === g.id ? "text-white" : "text-gray-300")}>{g.label}</span>
                <span className="text-xs text-gray-500">{g.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">📊 Trình độ hiện tại</p>
          <div className="flex gap-2 flex-wrap">
            {LEVELS.map(l => {
              const locked = !canAccessLevel(l);
              return (
                <button key={l}
                  onClick={() => !locked && setSelectedLevel(l)}
                  title={locked ? `Thi đạt ${LEVELS[LEVELS.indexOf(l) - 1]} trước` : ""}
                  className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-colors relative",
                    locked ? "border-gray-700 bg-gray-800/40 text-gray-600 cursor-not-allowed opacity-50" :
                    selectedLevel === l ? "border-primary-500 bg-primary-600/20 text-primary-300" :
                    "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  {locked ? "🔒 " : ""}{l}
                </button>
              );
            })}
          </div>
          {LEVELS.some(l => !canAccessLevel(l)) && (
            <p className="text-xs text-yellow-400/70 mt-2">🔒 Thi đạt trình độ hiện tại để mở khóa trình độ tiếp theo</p>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-300 mb-3">📅 Học mấy ngày/tuần?</p>
          <div className="flex gap-3">
            {DAYS_OPTIONS.map(d => (
              <button key={d} onClick={() => setDaysPerWeek(d)}
                className={cn("flex-1 py-3 rounded-xl border text-sm font-bold transition-colors",
                  daysPerWeek === d ? "border-primary-500 bg-primary-600/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                {d} ngày
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <span className="text-2xl">{settings.targetLanguage.flag}</span>
          <div>
            <p className="text-sm text-white font-medium">Học {settings.targetLanguage.name}</p>
            <p className="text-xs text-gray-400">Mục tiêu: {GOALS.find(g => g.id === selectedGoal)?.label} · {selectedLevel} · {daysPerWeek} ngày/tuần</p>
          </div>
        </div>

        <button onClick={generate}
          className="w-full py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold text-base flex items-center justify-center gap-2 transition-colors">
          <Sparkles className="w-5 h-5" /> Tạo lộ trình của tôi
        </button>
        {!isPremium && (
          <p className="text-center text-xs text-gray-600">
            Còn {getRemainingUses("lesson", isPremium)}/{FREE_LIMITS.lesson} lần hôm nay
          </p>
        )}
      </div>
    </div>
  );

  // ── Generating ──────────────────────────────────────────────────────────────
  if (step === "generating") return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
      <p className="text-white font-semibold">AI đang tạo lộ trình cho bạn...</p>
      <p className="text-gray-400 text-sm">Chỉ mất vài giây</p>
    </div>
  );

  // ── Day Lesson ──────────────────────────────────────────────────────────────
  if (step === "day" && learningPath) {
    const day = learningPath.days[activeDayIdx];
    const isDone = pathDaysDone.includes(activeDayIdx + 1);
    return (
      <div className="p-5 max-w-lg">
        <div className="flex items-center gap-3 mb-5 pt-4">
          <button onClick={() => setShowExitConfirm(true)} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors">
            ←
          </button>
          <div>
            <p className="text-xs text-gray-500">Ngày {activeDayIdx + 1} · {day?.focus}</p>
            <p className="text-white font-bold">{day?.theme}</p>
          </div>
        </div>

        {loadingDay ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-sm">Đang tạo bài học hôm nay...</p>
          </div>
        ) : dayLesson?._error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <p className="text-red-400 text-sm text-center">⚠️ {dayLesson._error}</p>
            <button onClick={() => openDay(activeDayIdx)}
              className="px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors">
              Thử lại
            </button>
          </div>
        ) : dayLesson && (
          <div className="flex flex-col gap-5">
            {/* Warmup */}
            {dayLesson.warmup && (
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p className="text-xs text-purple-400 font-semibold mb-1">✨ Khởi động</p>
                <p className="text-gray-200 text-sm">{dayLesson.warmup}</p>
              </div>
            )}

            {/* Vocabulary */}
            {dayLesson.vocabulary?.length > 0 && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <p className="text-sm font-semibold text-white">Từ vựng hôm nay</p>
                </div>
                <div className="divide-y divide-white/5">
                  {dayLesson.vocabulary.map((v: any, i: number) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3">
                      <button onClick={() => speakText(v.word, settings.targetLanguage.code)} className="p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-primary-400 shrink-0 mt-0.5">
                        <Headphones className="w-3.5 h-3.5" />
                      </button>
                      <div>
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-white font-bold text-base">{v.word}</span>
                          {v.romanization && (
                            <span className="text-gray-400 text-sm font-mono">{v.romanization}</span>
                          )}
                          <span className="text-gray-400 text-sm">— {v.translation}</span>
                        </div>
                        {v.example && <p className="text-xs text-gray-500 mt-0.5 italic">{v.example}</p>}
                        {v.tip && <p className="text-xs text-yellow-400/70 mt-0.5">💡 {v.tip}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grammar */}
            {dayLesson.grammarPoint && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
                <p className="text-yellow-400 font-semibold text-sm mb-2">📐 {dayLesson.grammarPoint.rule}</p>
                <p className="text-gray-300 text-sm mb-3">{dayLesson.grammarPoint.explanation}</p>
                {dayLesson.grammarPoint.examples?.map((ex: string, i: number) => (
                  <button key={i} onClick={() => speakText(ex, settings.targetLanguage.code)} className="flex items-center gap-2 text-sm text-gray-200 hover:text-yellow-300 transition-colors mb-1">
                    <span className="text-yellow-500">▸</span>{ex}
                  </button>
                ))}
              </div>
            )}

            {/* Listening */}
            {dayLesson.listeningText && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(34,197,94,0.2)" }}>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-green-400 font-semibold text-sm flex items-center gap-2"><Headphones className="w-4 h-4" /> Luyện nghe</p>
                  <button onClick={() => speakText(dayLesson.listeningText, settings.targetLanguage.code)} className="px-3 py-1.5 bg-green-700/30 hover:bg-green-700/50 text-green-300 rounded-lg text-xs transition-colors">
                    ▶ Nghe
                  </button>
                </div>
                <p className="text-gray-200 text-sm">{dayLesson.listeningText}</p>
                <p className="text-gray-500 text-xs mt-2 italic">{dayLesson.listeningTranslation}</p>
              </div>
            )}

            {/* Speaking */}
            {dayLesson.speakingPrompt && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(236,72,153,0.2)" }}>
                <p className="text-pink-400 font-semibold text-sm flex items-center gap-2 mb-2">
                  <Mic className="w-4 h-4" /> Luyện nói
                </p>
                <p className="text-gray-300 text-sm mb-4">{dayLesson.speakingPrompt}</p>

                {/* Score result */}
                {speakingScore && (
                  <div className={cn("rounded-xl p-3 mb-3 border",
                    speakingScore.score >= 80 ? "border-green-500/40 bg-green-900/15"
                    : speakingScore.score >= 60 ? "border-yellow-500/40 bg-yellow-900/15"
                    : "border-red-500/40 bg-red-900/15")}>
                    <div className="flex items-center gap-3">
                      <div className="text-center shrink-0">
                        <p className={cn("text-2xl font-black",
                          speakingScore.score >= 80 ? "text-green-400"
                          : speakingScore.score >= 60 ? "text-yellow-400" : "text-red-400")}>
                          {speakingScore.score}%
                        </p>
                        <p className="text-xs text-gray-500">điểm</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{speakingScore.feedback}</p>
                        <p className="text-xs text-gray-400 mt-0.5 italic">"{speakingScore.transcript}"</p>
                      </div>
                    </div>
                  </div>
                )}

                {scoringLoading && (
                  <div className="flex items-center gap-2 text-pink-400 text-sm mb-3">
                    <Loader2 className="w-4 h-4 animate-spin" /> AI đang chấm điểm...
                  </div>
                )}

                {/* Mic button */}
                {!speakingDone ? (
                  <div className="flex gap-2">
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={scoringLoading}
                      className={cn("flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all",
                        isRecording
                          ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                          : "bg-pink-600 hover:bg-pink-500 text-white")}>
                      {isRecording
                        ? <><MicOff className="w-4 h-4" /> Dừng ghi âm</>
                        : <><Mic className="w-4 h-4" /> Bắt đầu nói</>}
                    </button>
                    <button onClick={() => setSpeakingDone(true)}
                      className="px-4 py-3 rounded-xl border border-gray-700 text-gray-500 hover:text-gray-300 text-xs transition-colors">
                      Bỏ qua
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm font-semibold">Đã hoàn thành luyện nói!</span>
                    <button onClick={() => { setSpeakingDone(false); setSpeakingScore(null); }}
                      className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">
                      Thử lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quiz */}
            {dayLesson.quiz?.length > 0 && (
              <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <p className="text-purple-400 font-semibold text-sm mb-4">🧠 Mini Quiz</p>
                <div className="flex flex-col gap-4">
                  {dayLesson.quiz.map((q: any, qi: number) => (
                    <div key={qi}>
                      <p className="text-white text-sm mb-2">{qi + 1}. {q.question}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt: string, oi: number) => {
                          const picked = quizAnswers[qi] === oi;
                          const correct = oi === q.correct;
                          return (
                            <button key={oi} onClick={() => !quizChecked && setQuizAnswers(p => ({ ...p, [qi]: oi }))}
                              className={cn("px-3 py-2 rounded-xl border text-xs font-medium text-left transition-all",
                                quizChecked
                                  ? correct ? "border-green-500 bg-green-900/30 text-green-300"
                                    : picked ? "border-red-500 bg-red-900/30 text-red-300"
                                    : "border-gray-700 bg-gray-800 text-gray-500 opacity-50"
                                  : picked ? "border-purple-500 bg-purple-900/30 text-white"
                                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-purple-500")}>
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      {quizChecked && q.explanation && (
                        <p className="text-xs text-yellow-300 mt-2 bg-yellow-900/20 rounded-lg px-3 py-1.5">💡 {q.explanation}</p>
                      )}
                    </div>
                  ))}
                  {!quizChecked && Object.keys(quizAnswers).length === dayLesson.quiz.length && (
                    <button onClick={() => setQuizChecked(true)} className="w-full py-2.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded-xl text-sm font-medium transition-colors">
                      Kiểm tra đáp án
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Daily challenge */}
            {dayLesson.dailyChallenge && (
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                <Star className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-yellow-400 font-semibold text-sm mb-1">Thử thách hôm nay</p>
                  <p className="text-gray-300 text-sm">{dayLesson.dailyChallenge}</p>
                </div>
              </div>
            )}

            {/* Complete button */}
            {!isDone ? (
              <div>
                {dayLesson.speakingPrompt && !speakingDone && (
                  <p className="text-center text-xs text-pink-400 mb-3">
                    🎤 Hoàn thành phần luyện nói để tiếp tục
                  </p>
                )}
                <button
                  onClick={completeDay}
                  disabled={!!(dayLesson.speakingPrompt && !speakingDone)}
                  className={cn("w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all",
                    dayLesson.speakingPrompt && !speakingDone
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed opacity-60"
                      : "bg-primary-600 hover:bg-primary-500 text-white")}>
                  <CheckCircle2 className="w-5 h-5" /> Hoàn thành ngày {activeDayIdx + 1}
                </button>
              </div>
            ) : (
              <div className="w-full py-4 rounded-2xl bg-green-700/20 border border-green-600/30 text-green-300 font-bold text-center">
                ✅ Đã hoàn thành!
              </div>
            )}
          </div>
        )}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-8 px-4"
            style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
            <div className="w-full max-w-sm rounded-3xl p-6 text-center"
              style={{ background: "rgba(20,12,40,0.98)", border: "1px solid rgba(139,92,246,0.3)" }}>
              <p className="text-white font-bold text-lg mb-5">Bạn có chắc chắn muốn thoát không?</p>
              <button onClick={() => setShowExitConfirm(false)}
                className="w-full py-4 rounded-2xl font-bold text-white mb-3 text-base"
                style={{ background: "linear-gradient(135deg,#3b82f6,#2563eb)" }}>
                Tiếp tục học
              </button>
              <button onClick={() => { setShowExitConfirm(false); setStep("path"); }}
                className="w-full py-2 text-white font-bold text-base">
                Thoát Bài Học
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Path Overview ───────────────────────────────────────────────────────────
  if (!learningPath) return null;
  const goalObj = GOALS.find(g => g.label === learningPath.goal);
  const totalDays = learningPath.days?.length ?? 0;
  const doneDays = pathDaysDone.length;

  return (
    <div className="p-5 max-w-lg">
      <div className="pt-4 mb-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{learningPath.pathTitle}</h1>
          <button onClick={clearLearningPath} className="text-xs text-gray-600 hover:text-gray-400 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" /> Tạo lại
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">{learningPath.description}</p>
      </div>

      {/* TOEIC Practice */}
      <div className="mb-5 rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
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

      {/* Progress */}
      <div className="rounded-2xl p-4 mb-5" style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(139,92,246,0.3)" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{goalObj?.emoji ?? "🎯"}</span>
            <div>
              <p className="text-white font-semibold text-sm">{learningPath.goal}</p>
              <p className="text-gray-400 text-xs">{learningPath.level} · {learningPath.dailyMinutes} phút/ngày</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{doneDays}/{totalDays}</p>
            <p className="text-xs text-gray-400">ngày hoàn thành</p>
          </div>
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <div className="h-2 rounded-full transition-all" style={{ width: `${totalDays > 0 ? (doneDays / totalDays) * 100 : 0}%`, background: "linear-gradient(90deg,#7c3aed,#6366f1)" }} />
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
          <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-400" />{learningPath.estimatedWeeks} tuần</span>
          <span>·</span>
          <span>{settings.targetLanguage.flag} {settings.targetLanguage.name}</span>
        </div>
      </div>

      {/* Days list */}
      <div className="flex flex-col gap-2 mb-5">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Kế hoạch 7 ngày</p>
        {(learningPath.days ?? []).map((day: any, i: number) => {
          const done = pathDaysDone.includes(i + 1);
          const isToday = i === doneDays;
          const prevDone = i === 0 || pathDaysDone.includes(i); // ngày trước đã hoàn thành
          const isPremiumLocked = !isPremium && i >= 3;
          const isSequenceLocked = !isPremiumLocked && i > 0 && !prevDone;
          const isLocked = isPremiumLocked || isSequenceLocked;
          return (
            <button key={i} onClick={() => isLocked ? router.push("/premium") : (!isSequenceLocked && openDay(i))}
              className={cn("flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isLocked ? "border-yellow-700/30 bg-yellow-900/10 opacity-70"
                  : isSequenceLocked ? "border-gray-700 bg-gray-800/40 opacity-50 cursor-not-allowed"
                  : done ? "border-green-600/30 bg-green-900/10"
                  : isToday ? "border-primary-500 bg-primary-900/20"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600")}>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0",
                isPremiumLocked ? "bg-yellow-900/40"
                  : isSequenceLocked ? "bg-gray-800"
                  : done ? "bg-green-600"
                  : isToday ? "bg-primary-600"
                  : "bg-gray-700")}>
                {isPremiumLocked ? <Crown className="w-4 h-4 text-yellow-400" />
                  : isSequenceLocked ? <Lock className="w-4 h-4 text-gray-500" />
                  : done ? "✓"
                  : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", done ? "text-gray-400" : isLocked || isSequenceLocked ? "text-gray-500" : "text-white")}>{day.theme}</p>
                <p className="text-xs text-gray-500 capitalize">{day.focus}</p>
              </div>
              {isToday && !done && !isLocked && !isSequenceLocked && (
                <span className="text-xs bg-primary-600/30 text-primary-300 px-2 py-0.5 rounded-full shrink-0">Hôm nay</span>
              )}
              {isPremiumLocked && (
                <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full shrink-0">Premium</span>
              )}
              {isSequenceLocked && (
                <span className="text-xs text-gray-600 shrink-0">Hoàn thành ngày trước</span>
              )}
              <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* Milestones */}
      {learningPath.milestones?.length > 0 && (
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">🏆 Cột mốc</p>
          <div className="flex flex-col gap-2">
            {learningPath.milestones.map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-900/30 border border-yellow-600/30 flex items-center justify-center text-xs font-bold text-yellow-400 shrink-0">
                  W{m.week}
                </div>
                <p className="text-sm text-gray-300">{m.goal}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
