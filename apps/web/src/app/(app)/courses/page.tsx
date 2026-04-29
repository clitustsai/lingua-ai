"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { COURSES } from "@ai-lang/shared";
import { useRouter } from "next/navigation";
import { BookOpen, ChevronRight, Star, Flame, Trophy, Crown, Lock, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

// Courses under development (language courses)
const COMING_SOON_CATEGORIES = ["Ng├┤n ngß╗»"];

const CATEGORIES = ["Tß║Ñt cß║ú", "Chß╗⌐ng chß╗ë", "Kß╗╣ n─âng", "Giao tiß║┐p", "Ng├┤n ngß╗»"];

export default function CoursesPage() {
  const { courseProgress, totalXp, streak, enrollCourse } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;

  const enrolledCourses = COURSES.filter(c => courseProgress.find(p => p.courseId === c.id));
  const suggestedCourses = COURSES.filter(c => !courseProgress.find(p => p.courseId === c.id));

  const getProgress = (courseId: string) => {
    const prog = courseProgress.find(p => p.courseId === courseId);
    if (!prog) return 0;
    const course = COURSES.find(c => c.id === courseId);
    if (!course) return 0;
    const total = course.units.reduce((sum, u) => sum + u.lessons.length, 0);
    return total > 0 ? Math.round((prog.completedLessons.length / total) * 100) : 0;
  };

  // TOEIC state - only show when enrolled in at least 1 course
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

  return (
    <div className="min-h-screen" style={{ background: "#0f0a1e" }}>
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-white">Kh├ím ph├í</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-500/20 px-2.5 py-1 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-400">{streak}</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-500/20 px-2.5 py-1 rounded-full">
              <Star className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs font-bold text-purple-400">{totalXp}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-500/20 px-2.5 py-1 rounded-full">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">{enrolledCourses.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-8 pb-6">
        {/* Free notice */}
        {!isPremium && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
            <p className="text-xs text-yellow-300">1 kh├│a hß╗ìc miß╗àn ph├¡ ┬╖ N├óng cß║Ñp ─æß╗â mß╗ƒ tß║Ñt cß║ú</p>
            <button onClick={() => router.push("/premium")}
              className="flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 px-2.5 py-1 rounded-lg transition-colors shrink-0">
              <Crown className="w-3 h-3" /> Premium
            </button>
          </div>
        )}
        {/* My courses */}
        {enrolledCourses.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">KH├ôA Hß╗îC Cß╗ªA T├öI</h2>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {enrolledCourses.map(course => {
                const pct = getProgress(course.id);
                return (
                  <button key={course.id} onClick={() => router.push(`/courses/${course.id}`)}
                    className="shrink-0 w-44 rounded-2xl overflow-hidden text-left"
                    style={{ background: course.color }}>
                    <div className="p-4">
                      <div className="text-3xl mb-2">{course.emoji}</div>
                      <p className="text-white font-bold text-sm leading-tight">{course.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">{course.totalUnits} units</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-white/60 mb-1">
                          <span>Tiß║┐n ─æß╗Ö</span><span>{pct}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                          <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* TOEIC Practice - show when enrolled */}
        {enrolledCourses.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(10,6,24,0.95)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <div className="px-4 pt-3 pb-2 border-b border-white/5 flex items-center justify-between">
              <p className="text-white font-bold text-sm">≡ƒô¥ Luyß╗çn tß║¡p TOEIC</p>
              <p className="text-gray-500 text-xs">7 parts ┬╖ 200 c├óu</p>
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
                      <p className="text-white text-sm">C├óu {i+1}{q.question ? `. ${q.question}` : ""}</p>
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
                  Kiß╗âm tra ({Object.keys(toeicAnswers).filter(k => k.startsWith(toeicPart)).length}/{toeicQs.length} c├óu)
                </button>
              ) : (
                <div className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                  <span className="text-white text-sm font-bold">{toeicScore}/{toeicQs.length} ─æ├║ng</span>
                  <button onClick={() => { setToeicAnswers({}); setToeicChecked(false); }} className="text-xs text-gray-400 hover:text-white">L├ám lß║íi</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recommended courses */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">C├üC KH├ôA Hß╗îC D├ÇNH CHO Bß║áN</h2>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {COURSES.map((course, idx) => {
              const enrolled = !!courseProgress.find(p => p.courseId === course.id);
              const pct = getProgress(course.id);
              const isLocked = !isPremium && idx >= 1;
              const isComingSoon = COMING_SOON_CATEGORIES.includes(course.category);
              return (
                <button key={course.id} onClick={() => {
                  if (isComingSoon) return;
                  isLocked ? router.push("/premium") : router.push(`/courses/${course.id}`);
                }}
                  className="shrink-0 w-44 rounded-2xl overflow-hidden text-left relative"
                  style={{ background: course.color }}>
                  {isComingSoon && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-2xl gap-1">
                      <Lock className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-300 font-semibold">─Éang ph├ít triß╗ân</span>
                    </div>
                  )}
                  {!isComingSoon && isLocked && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-2xl">
                      <Crown className="w-7 h-7 text-yellow-400" />
                    </div>
                  )}
                  <div className="p-4 pb-3">
                    <div className="text-4xl mb-3">{course.emoji}</div>
                    <p className="text-white font-bold text-sm leading-tight">{course.title}</p>
                    <p className="text-white/60 text-xs mt-0.5">{course.totalUnits} units</p>
                    {enrolled && (
                      <div className="mt-2">
                        <div className="w-full bg-white/20 rounded-full h-1">
                          <div className="bg-white h-1 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                    {!enrolled && (
                      <div className="mt-2 inline-flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5">
                        <span className="text-xs text-white font-medium">{course.level}</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* By category */}
        {CATEGORIES.slice(1).map(cat => {
          const catCourses = COURSES.filter(c => c.category === cat);
          if (catCourses.length === 0) return null;
          return (
            <section key={cat}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.toUpperCase()}</h2>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex flex-col gap-3">
                {catCourses.map(course => {
                  const enrolled = !!courseProgress.find(p => p.courseId === course.id);
                  const pct = getProgress(course.id);
                  const courseIdx = COURSES.findIndex(c => c.id === course.id);
                  const isLocked = !isPremium && courseIdx >= 1;
                  const isComingSoon = COMING_SOON_CATEGORIES.includes(course.category);
                  return (
                    <button key={course.id} onClick={() => {
                      if (isComingSoon) return;
                      isLocked ? router.push("/premium") : router.push(`/courses/${course.id}`);
                    }}
                      className="flex items-center gap-4 rounded-2xl p-4 text-left transition-all hover:opacity-90 relative overflow-hidden"
                      style={{ background: course.color }}>
                      {isComingSoon && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 gap-1">
                          <Lock className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-300 font-semibold">─Éang ph├ít triß╗ân</span>
                        </div>
                      )}
                      {!isComingSoon && isLocked && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                          <Crown className="w-6 h-6 text-yellow-400" />
                        </div>
                      )}
                      <div className="text-4xl shrink-0">{course.emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm">{course.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{course.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-white/50">{course.totalUnits} units ┬╖ {course.totalLessons} b├ái</span>
                          <span className="text-xs bg-white/20 text-white px-1.5 py-0.5 rounded-full">{course.level}</span>
                        </div>
                        {enrolled && (
                          <div className="mt-2 w-full bg-white/20 rounded-full h-1">
                            <div className="bg-white h-1 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
