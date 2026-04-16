"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { VIDEO_LESSONS } from "@/lib/videoLessons";
import { useAppStore } from "@/store/useAppStore";
import { ArrowLeft, Loader2, Volume2, Plus, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { speakText } from "@/components/VoiceButton";
import { cn } from "@/lib/utils";

type Tab = "script" | "quiz" | "vocab" | "grammar";

export default function VideoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { settings, addFlashcard, incrementLessons, checkAchievements } = useAppStore();

  const video = VIDEO_LESSONS.find(v => v.id === id);
  const [lessonData, setLessonData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("script");
  const [showTranslation, setShowTranslation] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizChecked, setQuizChecked] = useState(false);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [completed, setCompleted] = useState(false);
  const [realVideoId, setRealVideoId] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);

  // For English use stored ID; for others fetch real ID via YouTube API
  const isEnglish = video?.language === "English";

  useEffect(() => {
    if (!video) return;
    if (isEnglish) {
      setRealVideoId(video.youtubeId);
    } else {
      // Try to fetch real video ID
      setVideoLoading(true);
      const query = `${video.title} ${video.language} lesson`;
      fetch(`/api/youtube-search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(d => { if (d.videoId) setRealVideoId(d.videoId); })
        .catch(() => {})
        .finally(() => setVideoLoading(false));
    }
    generateLesson();
  }, [id]);

  const generateLesson = async () => {
    if (!video) return;
    setLoading(true);
    try {
      const res = await fetch("/api/video-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.youtubeId,
          title: video.title,
          topic: video.topic,
          targetLanguage: settings.targetLanguage.name,
          nativeLanguage: settings.nativeLanguage.name,
          level: video.level,
        }),
      });
      setLessonData(await res.json());
    } finally { setLoading(false); }
  };

  const saveWord = (word: string, def: string, example: string) => {
    addFlashcard({ id: Date.now().toString(), word, translation: def, example, language: settings.targetLanguage.code });
    setSavedWords(p => new Set([...p, word]));
  };

  const markComplete = () => {
    setCompleted(true);
    incrementLessons();
    checkAchievements();
  };

  const quizScore = lessonData?.quiz
    ? lessonData.quiz.filter((q: any, i: number) => quizAnswers[i] === q.correct).length
    : 0;

  if (!video) return <div className="p-6 text-white">Video không tồn tại</div>;

  const TABS: { id: Tab; label: string }[] = [
    { id: "script",  label: "Script" },
    { id: "quiz",    label: "Quiz" },
    { id: "vocab",   label: "Vocab" },
    { id: "grammar", label: "Grammar" },
  ];

  return (
    <div className="max-w-2xl" style={{ background: "#0f0a1e", minHeight: "100vh" }}>
      {/* Back button */}
      <div className="px-4 pt-8 pb-2">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Video player */}
      <div className="mx-4 mb-0">
        {videoLoading ? (
          <div className="aspect-video rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
              <p className="text-gray-500 text-sm">Đang tìm video...</p>
            </div>
          </div>
        ) : realVideoId ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${realVideoId}?rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <a href={`https://www.youtube.com/watch?v=${realVideoId}`}
              target="_blank" rel="noopener noreferrer"
              className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors shadow-lg z-10">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </a>
          </div>
        ) : (
          <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(video.title + " " + video.language + " lesson")}`}
            target="_blank" rel="noopener noreferrer"
            className="flex aspect-video rounded-2xl flex-col items-center justify-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            </div>
            <p className="text-white font-semibold text-sm">{video.title}</p>
            <p className="text-gray-400 text-xs">Tìm trên YouTube</p>
          </a>
        )}
      </div>

      {/* Video info - giống ảnh */}
      <div className="px-5 py-4" style={{ background: "rgba(200,240,200,0.08)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{video.flag.length === 2 ? video.flag.toUpperCase().split("").map((c: string) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("") : video.flag}</span>
          <span className="text-gray-300 text-sm">{video.teacher} / {video.country}</span>
        </div>
        <h1 className="text-white font-bold text-xl leading-tight">{video.title}</h1>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-gray-500">Lesson Activities</span>
          <span className="text-xs text-primary-400 cursor-pointer hover:underline" onClick={() => setTab("vocab")}>
            Free PDF Worksheet →
          </span>
        </div>
      </div>

      {/* Tabs - giống ảnh */}
      <div className="flex border-b border-white/10 px-5 sticky top-0 z-10" style={{ background: "#0f0a1e" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("px-4 py-3 text-sm font-semibold border-b-2 transition-colors",
              tab === t.id
                ? "border-white text-white"
                : "border-transparent text-gray-500 hover:text-gray-300")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-5 py-5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
            <p className="text-gray-400 text-sm">AI đang tạo nội dung bài học...</p>
          </div>
        ) : !lessonData ? null : (

          <>
            {/* ── SCRIPT TAB ── */}
            {tab === "script" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => speakText(lessonData.script, settings.targetLanguage.code)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs transition-colors">
                      <Volume2 className="w-3.5 h-3.5" /> Nghe
                    </button>
                    <button onClick={() => setShowTranslation(!showTranslation)}
                      className={cn("px-3 py-1.5 rounded-xl text-xs transition-colors border",
                        showTranslation ? "border-primary-500 bg-primary-900/20 text-primary-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
                      {showTranslation ? "Ẩn dịch" : "Xem dịch"}
                    </button>
                  </div>
                </div>

                <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-4">
                  {lessonData.script}
                </div>

                {showTranslation && lessonData.scriptTranslation && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Bản dịch</p>
                    <p className="text-gray-400 text-sm leading-relaxed italic">{lessonData.scriptTranslation}</p>
                  </div>
                )}

                {/* Key phrases */}
                {lessonData.keyPhrases?.length > 0 && (
                  <div className="mt-5 pt-4 border-t border-white/10">
                    <p className="text-xs text-primary-400 font-semibold mb-3">🔑 Key Phrases</p>
                    <div className="flex flex-col gap-2">
                      {lessonData.keyPhrases.map((p: string, i: number) => (
                        <div key={i} className="flex items-center gap-2">
                          <button onClick={() => speakText(p, settings.targetLanguage.code)}
                            className="p-1 rounded text-gray-600 hover:text-primary-400 transition-colors">
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm text-gray-200">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── QUIZ TAB ── */}
            {tab === "quiz" && (
              <div>
                {!quizChecked ? (
                  <div className="flex flex-col gap-5">
                    {lessonData.quiz?.map((q: any, i: number) => (
                      <div key={i}>
                        <p className="text-white font-medium text-sm mb-3">{i + 1}. {q.question}</p>
                        <div className="flex flex-col gap-2">
                          {q.options.map((opt: string, j: number) => (
                            <button key={j} onClick={() => setQuizAnswers(p => ({ ...p, [i]: j }))}
                              className={cn("px-4 py-3 rounded-xl border text-sm text-left transition-all",
                                quizAnswers[i] === j
                                  ? "border-primary-500 bg-primary-900/30 text-white"
                                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600")}>
                              <span className="text-gray-500 mr-2">{["A","B","C","D"][j]}.</span>{opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setQuizChecked(true)}
                      disabled={Object.keys(quizAnswers).length < (lessonData.quiz?.length ?? 0)}
                      className="w-full py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors">
                      Kiểm tra đáp án
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {/* Score */}
                    <div className="rounded-2xl p-4 text-center"
                      style={{ background: quizScore === lessonData.quiz.length ? "rgba(34,197,94,0.1)" : "rgba(139,92,246,0.1)", border: `1px solid ${quizScore === lessonData.quiz.length ? "rgba(34,197,94,0.3)" : "rgba(139,92,246,0.3)"}` }}>
                      <p className="text-3xl font-bold text-white">{quizScore}/{lessonData.quiz.length}</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {quizScore === lessonData.quiz.length ? "🎉 Hoàn hảo!" : quizScore >= lessonData.quiz.length / 2 ? "👍 Tốt lắm!" : "📚 Xem lại script nhé!"}
                      </p>
                    </div>

                    {lessonData.quiz.map((q: any, i: number) => {
                      const correct = quizAnswers[i] === q.correct;
                      return (
                        <div key={i} className={cn("rounded-xl p-4 border",
                          correct ? "border-green-600/30 bg-green-900/10" : "border-red-600/30 bg-red-900/10")}>
                          <div className="flex items-start gap-2 mb-2">
                            {correct ? <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                            <p className="text-sm text-gray-200">{q.question}</p>
                          </div>
                          {!correct && (
                            <p className="text-xs text-green-300 ml-6 mb-1">✅ {q.options[q.correct]}</p>
                          )}
                          {q.explanation && <p className="text-xs text-gray-400 ml-6">{q.explanation}</p>}
                        </div>
                      );
                    })}

                    <button onClick={() => { setQuizAnswers({}); setQuizChecked(false); }}
                      className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
                      Làm lại
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── VOCAB TAB ── */}
            {tab === "vocab" && (
              <div className="flex flex-col gap-3">
                {lessonData.vocabulary?.map((v: any, i: number) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <button onClick={() => speakText(v.word, settings.targetLanguage.code)}
                            className="text-white font-bold text-base hover:text-primary-300 transition-colors">
                            {v.word}
                          </button>
                          {v.pronunciation && <span className="text-xs text-gray-400 font-mono">{v.pronunciation}</span>}
                          {v.partOfSpeech && <span className="text-xs bg-purple-900/40 text-purple-300 px-1.5 py-0.5 rounded">{v.partOfSpeech}</span>}
                          {v.level && <span className="text-xs bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">{v.level}</span>}
                        </div>
                        <p className="text-primary-300 text-sm">{v.definition}</p>
                        {v.example && <p className="text-gray-500 text-xs mt-1 italic">"{v.example}"</p>}
                      </div>
                      <button onClick={() => saveWord(v.word, v.definition, v.example ?? "")}
                        disabled={savedWords.has(v.word)}
                        className={cn("p-2 rounded-xl transition-colors shrink-0",
                          savedWords.has(v.word) ? "bg-green-900/30 text-green-400" : "bg-accent-600/20 hover:bg-accent-600/40 text-accent-400")}>
                        {savedWords.has(v.word) ? "✓" : <Plus className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── GRAMMAR TAB ── */}
            {tab === "grammar" && (
              <div className="flex flex-col gap-4">
                {lessonData.grammar?.map((g: any, i: number) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(234,179,8,0.2)" }}>
                    <p className="text-yellow-400 font-bold text-sm mb-2">📐 {g.point}</p>
                    <p className="text-gray-300 text-sm mb-3">{g.explanation}</p>
                    {g.examples?.map((ex: string, j: number) => (
                      <div key={j} className="flex items-center gap-2 mb-1.5">
                        <button onClick={() => speakText(ex, settings.targetLanguage.code)}
                          className="p-1 rounded text-gray-600 hover:text-primary-400 transition-colors shrink-0">
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm text-gray-200">{ex}</span>
                      </div>
                    ))}
                    {g.tip && (
                      <div className="mt-3 flex gap-2 text-xs" style={{ background: "rgba(234,179,8,0.08)", borderRadius: 8, padding: "8px 10px" }}>
                        <span className="text-yellow-400 shrink-0">💡</span>
                        <span className="text-yellow-200">{g.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Complete + Keep Listening */}
        {lessonData && !loading && (
          <div className="mt-8">
            {!completed ? (
              <button onClick={markComplete}
                className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                <CheckCircle2 className="w-5 h-5" /> Hoàn thành bài học
              </button>
            ) : (
              <div className="w-full py-3 rounded-2xl text-center text-green-300 font-semibold"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}>
                ✅ Đã hoàn thành!
              </div>
            )}

            {/* Keep Listening */}
            <div className="mt-6">
              <h2 className="text-white font-bold text-lg mb-3">Keep Listening</h2>
              <div className="flex flex-col gap-3">
                {VIDEO_LESSONS.filter(v => v.id !== id && v.category === video.category).slice(0, 3).map(v => (
                  <button key={v.id} onClick={() => router.push(`/videos/${v.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-white/5"
                    style={{ background: "rgba(26,16,53,0.6)", border: "1px solid rgba(139,92,246,0.1)" }}>
                    <img src={`https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`} alt={v.title}
                      className="w-20 h-12 object-cover rounded-lg shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${v.youtubeId}/0.jpg`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-2">{v.title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{v.flag.length === 2 ? v.flag.toUpperCase().split("").map((c: string) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("") : v.flag} {v.teacher} · {v.level}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
