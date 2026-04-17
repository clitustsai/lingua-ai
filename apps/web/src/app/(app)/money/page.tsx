"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2, Copy, Check, Sparkles, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

const TOOLS = [
  { id: "caption",   emoji: "🛍️", label: "Sales Caption",      desc: "Caption bán hàng thu hút", placeholder: "e.g. Nến thơm handmade, Khóa học online, Thời trang", premium: false },
  { id: "email",     emoji: "📧", label: "Business Email",      desc: "Email chuyên nghiệp cho khách nước ngoài", placeholder: "e.g. Follow up sau meeting, Xin báo giá, Đề xuất hợp tác", premium: false },
  { id: "reply",     emoji: "💬", label: "Customer Reply",      desc: "Trả lời tin nhắn khách hàng nước ngoài", placeholder: "Dán tin nhắn của khách vào đây...", premium: false },
  { id: "product",   emoji: "📦", label: "Product Description", desc: "Mô tả sản phẩm SEO cho e-commerce", placeholder: "e.g. Bình nước tre 500ml thân thiện môi trường, Tai nghe không dây chống ồn", premium: false },
  { id: "tiktok",    emoji: "🎬", label: "TikTok Script",       desc: "Script viral cho TikTok/Reels", placeholder: "e.g. Cách kiếm tiền online, Morning routine, Du lịch Việt Nam", premium: true },
  { id: "freelance", emoji: "💼", label: "Freelance Profile",   desc: "Bio Upwork/Fiverr được thuê nhiều hơn", placeholder: "e.g. Web developer 3 năm React, Graphic designer logo branding", premium: true },
  { id: "negotiate", emoji: "🤝", label: "Negotiation Script",  desc: "Script đàm phán lương/giá/hợp đồng", placeholder: "e.g. Xin tăng lương 20%, Thương lượng rate freelance với client", premium: true },
  { id: "cv",        emoji: "📄", label: "CV & Cover Letter",   desc: "CV và thư xin việc tiếng Anh chuyên nghiệp", placeholder: "e.g. Marketing manager 5 năm, Fresh graduate computer science", premium: true },
];

const LANGUAGES = ["English", "Vietnamese + English", "Japanese", "Korean", "Chinese", "French", "Spanish"];

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1800); }}
      className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 transition-colors shrink-0">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function ResultBlock({ label, content }: { label: string; content: string | string[] }) {
  const text = Array.isArray(content) ? content.join("\n• ") : content;
  const display = Array.isArray(content) ? "• " + content.join("\n• ") : content;
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(15,10,30,0.7)", border: "1px solid rgba(139,92,246,0.15)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
        <CopyBtn text={text} />
      </div>
      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{display}</p>
    </div>
  );
}

function TikTokResult({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-4">
      {data.scripts?.map((s: any, i: number) => (
        <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-primary-400 uppercase">Script {i + 1}</span>
            <CopyBtn text={`HOOK: ${s.hook}\n\n${s.content}\n\nCTA: ${s.cta}\n\n${s.hashtags?.join(" ")}`} />
          </div>
          <ResultBlock label="🎣 Hook (3 giây đầu)" content={s.hook} />
          <div className="mt-2"><ResultBlock label="📝 Content" content={s.content} /></div>
          <div className="mt-2"><ResultBlock label="📢 CTA" content={s.cta} /></div>
          {s.hashtags?.length > 0 && (
            <div className="mt-2 flex gap-1 flex-wrap">
              {s.hashtags.map((h: string) => (
                <span key={h} className="text-xs bg-primary-900/30 text-primary-400 px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function CaptionResult({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-3">
      {data.captions?.map((c: any, i: number) => (
        <div key={i} className="rounded-xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs bg-accent-900/40 text-accent-300 px-2 py-0.5 rounded-full font-medium">{c.style}</span>
            <CopyBtn text={c.text} />
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{c.emoji} {c.text}</p>
        </div>
      ))}
    </div>
  );
}

function EmailResult({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-2">
      <ResultBlock label="Subject" content={data.subject} />
      <ResultBlock label="Greeting" content={data.greeting} />
      <ResultBlock label="Body" content={data.body} />
      <ResultBlock label="Closing" content={data.closing} />
      {data.tips?.length > 0 && <ResultBlock label="Tips" content={data.tips} />}
    </div>
  );
}

function ReplyResult({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-3">
      {data.replies?.map((r: any, i: number) => (
        <div key={i} className="rounded-xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
          <div className="flex items-center justify-between mb-2">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
              r.tone === "polite" ? "bg-blue-900/40 text-blue-300"
              : r.tone === "friendly" ? "bg-green-900/40 text-green-300"
              : "bg-orange-900/40 text-orange-300")}>
              {r.tone}
            </span>
            <CopyBtn text={r.text} />
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">{r.text}</p>
        </div>
      ))}
    </div>
  );
}

function GenericResult({ data }: { data: any }) {
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(data).map(([key, val]) => {
        if (!val || (Array.isArray(val) && val.length === 0)) return null;
        const label = key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase());
        return <ResultBlock key={key} label={label} content={val as string | string[]} />;
      })}
    </div>
  );
}

function renderResult(toolId: string, data: any) {
  if (!data) return null;
  switch (toolId) {
    case "tiktok":    return <TikTokResult data={data} />;
    case "caption":   return <CaptionResult data={data} />;
    case "email":     return <EmailResult data={data} />;
    case "reply":     return <ReplyResult data={data} />;
    default:          return <GenericResult data={data} />;
  }
}

export default function MoneyPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isPremium = user?.isPremium ?? false;

  const [activeTool, setActiveTool] = useState(TOOLS[0]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const isLocked = activeTool.premium && !isPremium;

  const generate = async () => {
    if (!input.trim() || isLocked) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/money-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool: activeTool.id, input: input.trim(), language }),
      });
      setResult(await res.json());
    } finally { setLoading(false); }
  };

  const selectTool = (tool: typeof TOOLS[0]) => {
    setActiveTool(tool);
    setInput("");
    setResult(null);
  };

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" /> AI Kiếm Tiền
        </h1>
        <p className="text-sm text-gray-400 mt-1">AI viết content, email, caption giúp bạn kiếm tiền bằng tiếng Anh</p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => selectTool(t)}
            className={cn("flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-center transition-all relative",
              activeTool.id === t.id
                ? "border-primary-500 bg-primary-900/30"
                : "border-gray-700 bg-gray-800/60 hover:border-gray-600")}>
            {t.premium && !isPremium && (
              <span className="absolute top-1.5 right-1.5 text-yellow-400">
                <Crown className="w-3 h-3" />
              </span>
            )}
            <span className="text-2xl">{t.emoji}</span>
            <span className={cn("text-xs font-medium leading-tight", activeTool.id === t.id ? "text-white" : "text-gray-400")}>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Active tool */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{activeTool.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">{activeTool.label}</p>
              {activeTool.premium && !isPremium && (
                <span className="flex items-center gap-1 text-xs bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-700/30">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs">{activeTool.desc}</p>
          </div>
        </div>

        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={isLocked ? "Nâng cấp Premium để dùng tính năng này..." : activeTool.placeholder}
          disabled={isLocked}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: "rgba(15,10,30,0.8)" }}
        />

        {isLocked ? (
          <button onClick={() => router.push("/premium")}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)", boxShadow: "0 4px 20px rgba(245,158,11,0.3)" }}>
            <Crown className="w-4 h-4" /> Nâng cấp Premium để dùng
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Language picker */}
            <div className="relative">
              <button onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-700 bg-gray-800 text-xs text-gray-300 hover:border-gray-600 transition-colors">
                🌐 {language}
                {showLangPicker ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {showLangPicker && (
                <div className="absolute bottom-full mb-1 left-0 rounded-xl overflow-hidden shadow-2xl z-10"
                  style={{ background: "#1a1035", border: "1px solid rgba(139,92,246,0.3)" }}>
                  {LANGUAGES.map(l => (
                    <button key={l} onClick={() => { setLanguage(l); setShowLangPicker(false); }}
                      className={cn("block w-full text-left px-4 py-2 text-xs transition-colors hover:bg-primary-900/30",
                        language === l ? "text-primary-300 bg-primary-900/20" : "text-gray-300")}>
                      {l}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={generate} disabled={loading || !input.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
              {loading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Đang tạo...</>
                : <><Sparkles className="w-4 h-4" /> Tạo ngay</>
              }
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div className="flex gap-1.5">
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
            <div className="ai-typing-dot" />
          </div>
          <p className="text-gray-500 text-sm">AI đang viết cho bạn...</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Kết quả</p>
            <button onClick={() => setResult(null)} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Xóa</button>
          </div>
          {renderResult(activeTool.id, result)}
        </div>
      )}
    </div>
  );
}
