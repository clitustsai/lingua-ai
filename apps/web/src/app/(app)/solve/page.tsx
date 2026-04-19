"use client";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Copy, Check, ChevronDown, RotateCcw, Crown, AlertCircle, Camera, ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DAILY_LIMIT = 80;
const STORAGE_KEY = "solve_usage";

function getUsage(): { count: number; date: string } {
  if (typeof window === "undefined") return { count: 0, date: "" };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, date: "" };
    return JSON.parse(raw);
  } catch { return { count: 0, date: "" }; }
}

function incrementUsage(): number {
  const today = new Date().toISOString().slice(0, 10);
  const usage = getUsage();
  const newCount = usage.date === today ? usage.count + 1 : 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: newCount, date: today }));
  return newCount;
}

function getRemainingUses(): number {
  const today = new Date().toISOString().slice(0, 10);
  const usage = getUsage();
  if (usage.date !== today) return DAILY_LIMIT;
  return Math.max(0, DAILY_LIMIT - usage.count);
}

const GRADES = [
  { id: "thcs6",  label: "Lớp 6",  level: "A1",    school: "THCS" },
  { id: "thcs7",  label: "Lớp 7",  level: "A1-A2", school: "THCS" },
  { id: "thcs8",  label: "Lớp 8",  level: "A2",    school: "THCS" },
  { id: "thcs9",  label: "Lớp 9",  level: "A2-B1", school: "THCS" },
  { id: "thpt10", label: "Lớp 10", level: "B1",    school: "THPT" },
  { id: "thpt11", label: "Lớp 11", level: "B1-B2", school: "THPT" },
  { id: "thpt12", label: "Lớp 12", level: "B2",    school: "THPT" },
];

const TYPES = [
  { id: "grammar",      label: "Ngữ pháp",  emoji: "📐" },
  { id: "vocabulary",   label: "Từ vựng",   emoji: "📚" },
  { id: "reading",      label: "Đọc hiểu",  emoji: "📖" },
  { id: "writing",      label: "Viết",      emoji: "✍️" },
  { id: "pronunciation",label: "Phát âm",   emoji: "🔊" },
  { id: "mixed",        label: "Tổng hợp",  emoji: "🎯" },
];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 transition-colors">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

export default function SolvePage() {
  const { settings } = useAppStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const isPremium = user?.isPremium ?? false;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [grade, setGrade] = useState<typeof GRADES[0] | null>(null);
  const [type, setType] = useState(TYPES[0]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [remaining, setRemaining] = useState(DAILY_LIMIT);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => { setRemaining(getRemainingUses()); }, []);

  const canUse = isPremium || remaining > 0;

  // Handle image upload → OCR
  const handleImage = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      setImagePreview(e.target?.result as string);
      setOcrLoading(true);
      try {
        const res = await fetch("/api/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64 }),
        });
        const data = await res.json();
        if (data.text) setQuestion(prev => prev ? prev + "\n" + data.text : data.text);
      } catch { /* ignore */ }
      finally { setOcrLoading(false); }
    };
    reader.readAsDataURL(file);
  };

  const solve = async () => {
    if (!question.trim() || !grade) return;
    if (!canUse) { setShowLimitModal(true); return; }
    setLoading(true);
    setResult(null);
    setShowExplain(false);
    const newCount = incrementUsage();
    setRemaining(Math.max(0, DAILY_LIMIT - newCount));
    try {
      const res = await fetch("/api/solve-exercise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: question.trim(),
          grade: grade.label,
          level: grade.level,
          type: type.id,
          nativeLanguage: settings.nativeLanguage.name,
        }),
      });
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" /> AI Giải Bài Tập Tiếng Anh
          </h1>
          <p className="text-sm text-gray-400 mt-1">Dán bài tập hoặc chụp ảnh · Giải thích chi tiết</p>
        </div>
        {!isPremium && (
          <div className="text-right shrink-0 ml-3">
            <p className={cn("text-sm font-bold", remaining <= 10 ? "text-red-400" : remaining <= 30 ? "text-yellow-400" : "text-green-400")}>
              {remaining}/{DAILY_LIMIT}
            </p>
            <p className="text-xs text-gray-600">lần còn lại</p>
          </div>
        )}
      </div>

      {/* Step 1: Chọn lớp */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Chọn lớp <span className="text-red-400">*</span></p>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <p className="text-xs text-gray-600 mb-1.5 ml-1">THCS</p>
            <div className="flex gap-2 flex-wrap">
              {GRADES.filter(g => g.school === "THCS").map(g => (
                <button key={g.id} onClick={() => { setGrade(g); setQuestion(""); setResult(null); setImagePreview(null); }}
                  className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    grade?.id === g.id ? "border-primary-500 bg-primary-900/30 text-white scale-105" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1.5 ml-1">THPT</p>
            <div className="flex gap-2 flex-wrap">
              {GRADES.filter(g => g.school === "THPT").map(g => (
                <button key={g.id} onClick={() => { setGrade(g); setQuestion(""); setResult(null); setImagePreview(null); }}
                  className={cn("px-4 py-2 rounded-xl border text-sm font-medium transition-all",
                    grade?.id === g.id ? "border-yellow-500 bg-yellow-900/20 text-yellow-300 scale-105" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!grade ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(26,16,53,0.5)", border: "1px dashed rgba(139,92,246,0.3)" }}>
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-400 text-sm">Vui lòng chọn lớp trước để tiếp tục</p>
        </div>
      ) : (
        <>
          {/* Type selector */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Loại bài tập</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(t => (
                <button key={t.id} onClick={() => setType(t)}
                  className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all",
                    type.id === t.id ? "border-primary-500 bg-primary-900/30 text-white" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600")}>
                  <span>{t.emoji}</span>
                  <span className="text-xs">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Input area */}
          <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
                <p className="text-sm font-semibold text-white">Nhập bài tập</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: grade.school === "THCS" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)", color: grade.school === "THCS" ? "#a5b4fc" : "#fcd34d" }}>
                {grade.label} · {type.label}
              </span>
            </div>

            {/* Image preview */}
            {imagePreview && (
              <div className="relative mb-3 rounded-xl overflow-hidden">
                <img src={imagePreview} alt="Bài tập" className="w-full max-h-48 object-contain rounded-xl" style={{ background: "rgba(0,0,0,0.3)" }} />
                <button onClick={() => { setImagePreview(null); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
                {ocrLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="flex items-center gap-2 text-white text-sm">
                      <Loader2 className="w-4 h-4 animate-spin" /> Đang đọc bài tập...
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload buttons */}
            <div className="flex gap-2 mb-3">
              <button onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-purple-700/50 bg-purple-900/20 text-purple-300 text-xs font-medium hover:bg-purple-900/40 transition-colors">
                <Camera className="w-3.5 h-3.5" /> Chụp ảnh
              </button>
              <button onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 text-gray-400 text-xs font-medium hover:border-gray-600 transition-colors">
                <ImagePlus className="w-3.5 h-3.5" /> Tải ảnh lên
              </button>
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden"
                onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
            </div>

            <textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={`Dán bài tập ${grade.label} vào đây...\n\nVí dụ:\nChoose the correct answer:\nShe ___ to school every day.\nA. go  B. goes  C. going  D. gone`}
              rows={5}
              className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3"
              style={{ background: "rgba(15,10,30,0.8)" }}
            />
            <div className="flex gap-2">
              {question && (
                <button onClick={() => { setQuestion(""); setResult(null); setImagePreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 text-gray-400 text-xs hover:border-gray-600 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> Xóa
                </button>
              )}
              <button onClick={solve} disabled={loading || !question.trim() || !canUse}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: canUse ? "linear-gradient(135deg,#7c3aed,#6366f1)" : "rgba(107,114,128,0.5)" }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang giải...</>
                  : !canUse ? <><AlertCircle className="w-4 h-4" /> Hết lượt hôm nay</>
                  : <><Sparkles className="w-4 h-4" /> Giải ngay</>}
              </button>
            </div>
            {!isPremium && remaining <= 20 && remaining > 0 && (
              <p className="text-xs text-yellow-400 mt-2 text-center">⚠️ Còn {remaining} lần sử dụng hôm nay</p>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center py-8 gap-3">
              <div className="flex gap-1.5"><div className="ai-typing-dot" /><div className="ai-typing-dot" /><div className="ai-typing-dot" /></div>
              <p className="text-gray-500 text-sm">AI đang phân tích và giải bài...</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col gap-3 animate-fade-in-up">
              <div className="rounded-2xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-green-400 font-semibold uppercase tracking-wide">✅ Đáp án</p>
                  <CopyBtn text={result.answer} />
                </div>
                <p className="text-white font-semibold text-base leading-relaxed whitespace-pre-wrap">{result.answer}</p>
              </div>
              {result.steps?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                  <p className="text-xs text-primary-400 font-semibold uppercase tracking-wide mb-3">📝 Các bước giải</p>
                  <div className="flex flex-col gap-2">
                    {result.steps.map((step: string, i: number) => (
                      <div key={i} className="flex gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-600/30 text-primary-300 text-xs flex items-center justify-center shrink-0 font-bold mt-0.5">{i + 1}</span>
                        <p className="text-sm text-gray-200 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.rule && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.2)" }}>
                  <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wide mb-2">📐 Quy tắc ngữ pháp</p>
                  <p className="text-sm text-gray-200 leading-relaxed">{result.rule}</p>
                </div>
              )}
              {result.explanation && (
                <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <button onClick={() => setShowExplain(!showExplain)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                    <span>💡 Giải thích chi tiết</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform", showExplain && "rotate-180")} />
                  </button>
                  {showExplain && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                    </div>
                  )}
                </div>
              )}
              {result.tips?.length > 0 && (
                <div className="rounded-2xl p-4" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)" }}>
                  <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wide mb-2">🎯 Mẹo ghi nhớ</p>
                  {result.tips.map((tip: string, i: number) => <p key={i} className="text-sm text-gray-300 mb-1">• {tip}</p>)}
                </div>
              )}
              <button onClick={() => { setResult(null); setQuestion(""); setImagePreview(null); }}
                className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-400 hover:border-gray-600 text-sm transition-colors">
                Giải bài khác
              </button>
            </div>
          )}
        </>
      )}

      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowLimitModal(false)}>
          <div className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{ background: "#0f0a1e", border: "1px solid rgba(245,158,11,0.4)" }}
            onClick={e => e.stopPropagation()}>
            <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
            <h3 className="text-white font-black text-lg mb-2">Hết lượt hôm nay</h3>
            <p className="text-gray-400 text-sm mb-5">Bạn đã dùng hết <strong className="text-white">{DAILY_LIMIT} lần</strong> miễn phí hôm nay.</p>
            <button onClick={() => { setShowLimitModal(false); router.push("/premium"); }}
              className="w-full py-3 rounded-2xl font-bold text-white mb-3"
              style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
              Nâng cấp Premium
            </button>
            <button onClick={() => setShowLimitModal(false)} className="w-full py-2 text-gray-500 text-sm">Quay lại</button>
          </div>
        </div>
      )}
    </div>
  );
}
