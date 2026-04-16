"use client";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Loader2, PenLine, CheckCircle2, RotateCcw, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const MODES = [
  { id: "sentence", label: "Câu đơn", emoji: "✏️", desc: "Viết 1-2 câu", color: "#10b981", minWords: 5 },
  { id: "paragraph", label: "Đoạn văn", emoji: "📝", desc: "Viết 3-5 câu", color: "#8b5cf6", minWords: 20 },
  { id: "essay", label: "Bài luận", emoji: "📄", desc: "Viết 1-2 đoạn", color: "#3b82f6", minWords: 50 },
];

const PROMPTS: Record<string, Record<string, string[]>> = {
  sentence: {
    English: [
      "Describe your favorite food in one sentence.",
      "Write a sentence about what you did yesterday.",
      "Describe the weather today.",
      "Write about your hobby in one sentence.",
      "Describe your best friend.",
    ],
    Chinese: [
      "用一句话描述你最喜欢的食物。",
      "写一句话关于你昨天做了什么。",
      "描述今天的天气。",
      "用一句话介绍你的爱好。",
      "描述你最好的朋友。",
    ],
    Japanese: [
      "好きな食べ物を一文で説明してください。",
      "昨日したことを一文で書いてください。",
      "今日の天気を説明してください。",
      "趣味について一文で書いてください。",
      "親友を説明してください。",
    ],
    Korean: [
      "좋아하는 음식을 한 문장으로 설명하세요.",
      "어제 한 일을 한 문장으로 쓰세요.",
      "오늘 날씨를 설명하세요.",
      "취미에 대해 한 문장으로 쓰세요.",
      "가장 친한 친구를 설명하세요.",
    ],
  },
  paragraph: {
    English: [
      "Write about your daily morning routine.",
      "Describe your hometown.",
      "Write about a memorable trip you took.",
      "Describe your dream job.",
      "Write about your favorite season and why.",
    ],
    Chinese: [
      "写一段关于你的日常早晨例行活动。",
      "描述你的家乡。",
      "写一段关于一次难忘的旅行。",
      "描述你的梦想工作。",
      "写一段关于你最喜欢的季节及原因。",
    ],
    Japanese: [
      "毎朝のルーティンについて書いてください。",
      "あなたの故郷を説明してください。",
      "思い出に残る旅行について書いてください。",
      "夢の仕事を説明してください。",
      "好きな季節とその理由を書いてください。",
    ],
    Korean: [
      "매일 아침 루틴에 대해 쓰세요.",
      "고향을 설명하세요.",
      "기억에 남는 여행에 대해 쓰세요.",
      "꿈의 직업을 설명하세요.",
      "좋아하는 계절과 이유를 쓰세요.",
    ],
  },
  essay: {
    English: [
      "Should students use smartphones in class? Give your opinion with reasons.",
      "What are the advantages and disadvantages of social media?",
      "Describe a person who has influenced your life.",
      "Is technology making our lives better or worse?",
      "What is the most important skill for success in the modern world?",
    ],
    Chinese: [
      "学生应该在课堂上使用智能手机吗？给出你的意见和理由。",
      "社交媒体的优缺点是什么？",
      "描述一个影响了你生活的人。",
      "科技让我们的生活变得更好还是更差？",
      "现代世界中最重要的成功技能是什么？",
    ],
    Japanese: [
      "生徒は授業中にスマートフォンを使うべきですか？理由を述べてください。",
      "SNSのメリットとデメリットは何ですか？",
      "あなたの人生に影響を与えた人を説明してください。",
      "テクノロジーは私たちの生活を良くしていますか、悪くしていますか？",
      "現代社会で成功するために最も重要なスキルは何ですか？",
    ],
    Korean: [
      "학생들이 수업 중에 스마트폰을 사용해야 할까요? 이유와 함께 의견을 쓰세요.",
      "소셜 미디어의 장단점은 무엇인가요?",
      "당신의 삶에 영향을 준 사람을 설명하세요.",
      "기술이 우리 삶을 더 좋게 만들고 있나요, 아니면 더 나쁘게 만들고 있나요?",
      "현대 세계에서 성공을 위한 가장 중요한 기술은 무엇인가요?",
    ],
  },
};

function getPrompts(mode: string, lang: string): string[] {
  const modePrompts = PROMPTS[mode] || PROMPTS.sentence;
  return modePrompts[lang] || modePrompts.English || [];
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const grade = score >= 90 ? "A" : score >= 80 ? "B+" : score >= 70 ? "B" : score >= 60 ? "C+" : "C";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="3" />
          <circle cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
            strokeDasharray={`${(score / 100) * 94} 94`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-black" style={{ color }}>{score}</span>
          <span className="text-xs font-bold" style={{ color }}>{grade}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">Điểm viết</p>
    </div>
  );
}

export default function WritingPage() {
  const { settings } = useAppStore();
  const [mode, setMode] = useState(MODES[0]);
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showBetter, setShowBetter] = useState(false);
  const [history, setHistory] = useState<{ prompt: string; score: number; text: string }[]>([]);

  const lang = settings.targetLanguage.name;
  const prompts = getPrompts(mode.id, lang);
  const currentPrompt = prompts[promptIdx] || `Write a ${mode.id} in ${lang}.`;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  const check = async () => {
    if (!text.trim() || wordCount < mode.minWords) return;
    setLoading(true);
    setResult(null);
    setShowBetter(false);
    try {
      const res = await fetch("/api/writing-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          prompt: currentPrompt,
          targetLanguage: lang,
          nativeLanguage: settings.nativeLanguage.name,
          level: settings.level,
          mode: mode.id,
        }),
      });
      const data = await res.json();
      setResult(data);
      setHistory(h => [{ prompt: currentPrompt, score: data.score, text: text.trim() }, ...h].slice(0, 10));
    } finally {
      setLoading(false);
    }
  };

  const nextPrompt = () => {
    setPromptIdx(i => (i + 1) % prompts.length);
    setText("");
    setResult(null);
  };

  const tryAgain = () => {
    setText("");
    setResult(null);
    setShowBetter(false);
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-5">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <PenLine className="w-5 h-5 text-primary-400" /> Luyện viết
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {settings.targetLanguage.flag} {lang} · AI chấm điểm & sửa lỗi
        </p>
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {MODES.map(m => (
          <button key={m.id} onClick={() => { setMode(m); setText(""); setResult(null); setPromptIdx(0); }}
            className={cn("flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all",
              mode.id === m.id ? "border-primary-500 bg-primary-900/30 scale-105" : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
            <span className="text-2xl">{m.emoji}</span>
            <span className={cn("text-xs font-bold", mode.id === m.id ? "text-white" : "text-gray-400")}>{m.label}</span>
            <span className="text-xs text-gray-600">{m.desc}</span>
          </button>
        ))}
      </div>

      {/* Prompt card */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: `${mode.color}15`, border: `1px solid ${mode.color}40` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs font-semibold mb-1" style={{ color: mode.color }}>📌 Đề bài</p>
            <p className="text-white text-sm leading-relaxed">{currentPrompt}</p>
          </div>
          <button onClick={nextPrompt} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors shrink-0" title="Đề khác">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Text area */}
      {!result && (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={`Viết bằng ${lang} ở đây...`}
              rows={mode.id === "essay" ? 8 : mode.id === "paragraph" ? 5 : 3}
              className="w-full rounded-2xl px-4 py-3 text-white placeholder-gray-600 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none text-sm leading-relaxed"
              style={{ background: "rgba(26,16,53,0.8)" }}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-600">
              {wordCount} từ {wordCount < mode.minWords && <span className="text-red-500">(cần {mode.minWords}+)</span>}
            </div>
          </div>

          <button onClick={check} disabled={loading || wordCount < mode.minWords}
            className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)` }}>
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> AI đang chấm bài...</>
              : <><Sparkles className="w-4 h-4" /> Nộp bài & Chấm điểm</>
            }
          </button>

          {loading && (
            <div className="flex justify-center gap-1.5 py-2">
              <div className="ai-typing-dot" />
              <div className="ai-typing-dot" />
              <div className="ai-typing-dot" />
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="flex flex-col gap-4 animate-fade-in-up">
          {/* Score header */}
          <div className="rounded-2xl p-4 flex items-center gap-4"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.25)" }}>
            <ScoreRing score={result.score ?? 75} />
            <div className="flex-1">
              <p className="text-white font-bold text-base mb-1">{result.feedback?.overall}</p>
              <div className="flex gap-3 text-xs flex-wrap">
                {[
                  { label: "Ngữ pháp", val: result.feedback?.grammar },
                  { label: "Từ vựng", val: result.feedback?.vocabulary },
                  { label: "Cấu trúc", val: result.feedback?.structure },
                ].map(f => f.val && (
                  <span key={f.label} className="text-gray-400">{f.label}: {f.val}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Corrections */}
          {result.corrections?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)" }}>
              <p className="text-yellow-400 font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Sửa lỗi ({result.corrections.length})
              </p>
              <div className="flex flex-col gap-3">
                {result.corrections.map((c: any, i: number) => (
                  <div key={i} className="text-sm">
                    <div className="flex items-start gap-2 flex-wrap">
                      <span className="line-through text-red-400 text-xs bg-red-900/20 px-2 py-0.5 rounded">{c.original}</span>
                      <span className="text-xs text-gray-500">→</span>
                      <span className="text-green-300 text-xs bg-green-900/20 px-2 py-0.5 rounded">{c.corrected}</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1 ml-1">{c.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Better version */}
          <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
            <button onClick={() => setShowBetter(!showBetter)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-primary-400 hover:bg-white/5 transition-colors">
              <span>✨ Bản viết tốt hơn</span>
              <ChevronRight className={cn("w-4 h-4 transition-transform", showBetter && "rotate-90")} />
            </button>
            {showBetter && (
              <div className="px-4 pb-4">
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{result.betterVersion}</p>
              </div>
            )}
          </div>

          {/* Tips */}
          {result.tips?.length > 0 && (
            <div className="rounded-2xl p-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <p className="text-primary-400 font-semibold text-sm mb-2">💡 Mẹo cải thiện</p>
              {result.tips.map((t: string, i: number) => (
                <p key={i} className="text-gray-300 text-sm mb-1">• {t}</p>
              ))}
            </div>
          )}

          {/* Next prompt suggestion */}
          {result.nextPrompt && (
            <div className="rounded-2xl p-3 flex items-center gap-3"
              style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="text-green-400 text-lg shrink-0">🎯</span>
              <div className="flex-1">
                <p className="text-xs text-green-400 font-semibold mb-0.5">Thử thách tiếp theo</p>
                <p className="text-gray-300 text-sm">{result.nextPrompt}</p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={tryAgain}
              className="flex-1 py-3 rounded-2xl font-bold text-white transition-all"
              style={{ background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)` }}>
              Viết lại
            </button>
            <button onClick={nextPrompt}
              className="flex-1 py-3 rounded-2xl font-bold border border-gray-700 text-gray-300 hover:text-white hover:border-gray-600 transition-colors">
              Đề mới
            </button>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && !result && (
        <div className="mt-6">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Lịch sử luyện viết</p>
          <div className="flex flex-col gap-2">
            {history.slice(0, 5).map((h, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "rgba(26,16,53,0.6)", border: "1px solid rgba(139,92,246,0.1)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0"
                  style={{ background: h.score >= 80 ? "rgba(16,185,129,0.2)" : h.score >= 60 ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)",
                    color: h.score >= 80 ? "#10b981" : h.score >= 60 ? "#f59e0b" : "#ef4444" }}>
                  {h.score}
                </div>
                <p className="text-gray-400 text-xs line-clamp-2 flex-1">{h.prompt}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
