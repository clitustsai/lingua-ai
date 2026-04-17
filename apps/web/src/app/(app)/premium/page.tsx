"use client";
import { useState } from "react";
import { Check, Star, Crown, Lock, Play, ChevronRight, X, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const OWNER = { acb: "26996867", name: "THAI TUAN KIET" };

const PLANS = [
  { id: "basic", name: "Free", price: 0, period: "", color: "#6b7280", emoji: "FREE", cta: "Dang dung", ctaDisabled: true, features: ["Chat AI co ban (20 tin/ngay)", "Flashcards khong gioi han", "Grammar checker", "Streak & achievements", "Dung thu 10 ngay mien phi"] },
  { id: "pro", name: "Pro", price: 199000, priceUSD: 8, period: "/thang", color: "#8b5cf6", emoji: "PRO", cta: "Mua Pro", ctaDisabled: false, popular: true, highlight: "Pho bien nhat", features: ["Chat AI khong gioi han", "Video Lessons + Script AI", "Lo trinh AI ca nhan hoa", "Khoa hoc day du (100+ bai)", "Listening & Lessons AI", "Quiz & Vocab tu video", "AI Tutor ca nhan hoa", "Pronunciation scoring", "AI Kiem Tien tools", "Uu tien ho tro"] },
  { id: "lifetime", name: "Lifetime", price: 999000, priceUSD: 39, period: " mot lan", color: "#f59e0b", emoji: "VIP", cta: "Mua Lifetime", ctaDisabled: false, badge: "Tiet kiem nhat", features: ["Tat ca tinh nang Pro", "Video Lessons khong gioi han", "Tat ca khoa hoc tuong lai", "Truy cap vinh vien", "1-on-1 AI coaching session", "Badge VIP tren profile", "Uu tien tinh nang moi", "Ho tro uu tien 24/7"] },
];
const COURSES = [
  { id: "c1", title: "English for Work & Career", emoji: "WORK", level: "B1-B2", lessons: 24, videos: 12, price: 199000, priceUSD: 8, rating: 4.9, students: 1240, color: "#3b82f6", topics: ["Job interviews", "Business emails", "Presentations", "Negotiations", "Office conversations"], preview: "2wlKKsA1HMQ", locked: true },
  { id: "c2", title: "IELTS Speaking Masterclass", emoji: "IELTS", level: "B2-C1", lessons: 30, videos: 15, price: 299000, priceUSD: 12, rating: 4.8, students: 890, color: "#10b981", topics: ["Part 1: Personal questions", "Part 2: Long turn", "Part 3: Discussion", "Pronunciation tips", "Band 7+ strategies"], preview: "XMf1OkdruEY", locked: true },
  { id: "c3", title: "Daily English: A1 to B1", emoji: "A1B1", level: "A1-B1", lessons: 40, videos: 20, price: 149000, priceUSD: 6, rating: 4.9, students: 3200, color: "#8b5cf6", topics: ["Greetings", "Shopping", "Travel", "Family", "Daily routines"], preview: "BNSoDln1FQ8", locked: false },
  { id: "c4", title: "English for TikTok & Social Media", emoji: "TIKTOK", level: "A2-B2", lessons: 20, videos: 10, price: 179000, priceUSD: 7, rating: 4.7, students: 560, color: "#ec4899", topics: ["Viral hooks", "Trending phrases", "Comment replies", "Collab messages", "Brand English"], preview: "q9aFVmzRgLg", locked: true },
];

function formatVND(n: number) { return n.toLocaleString("vi-VN") + "d"; }

type PayItem = { name?: string; title?: string; price: number };

function PayModal({ item, onClose }: { item: PayItem; onClose: () => void }) {
  const label = item.name || item.title || "";
  const note = "LinguaAI " + label;
  const [copied, setCopied] = useState("");
  const copy = (v: string, k: string) => { navigator.clipboard.writeText(v); setCopied(k); setTimeout(() => setCopied(""), 1800); };
  const rows = [
    { label: "Ngan hang ACB", value: OWNER.acb, key: "acb" },
    { label: "Chu TK", value: OWNER.name },
    { label: "So tien", value: formatVND(item.price), key: "amt" },
    { label: "Noi dung CK", value: note, key: "note" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden"
        style={{ background: "#0f0a1e", border: "1px solid rgba(139,92,246,0.35)" }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <p className="text-white font-bold text-sm">{label}</p>
            <p className="text-primary-400 font-black text-xl">{formatVND(item.price)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white p-2 rounded-2xl w-44">
              <img
                src={`https://img.vietqr.io/image/ACB-${OWNER.acb}-compact2.png?amount=${item.price}&addInfo=${encodeURIComponent(note)}&accountName=THAI+TUAN+KIET`}
                alt="ACB QR" className="w-full rounded-xl"
              />
            </div>
            <p className="text-sm font-bold text-blue-400">ACB Bank</p>
          </div>
          <div className="rounded-2xl p-3 flex flex-col gap-2" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
            {rows.map(r => (
              <div key={r.label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500 shrink-0">{r.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm text-white font-medium text-right">{r.value}</span>
                  {r.key && (
                    <button onClick={() => copy(r.value, r.key!)} className="p-1 rounded text-gray-600 hover:text-green-400 transition-colors">
                      {copied === r.key ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center">
            Quet QR hoac chuyen khoan ACB: <strong className="text-gray-300">{OWNER.acb}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  const [selectedCourse, setSelectedCourse] = useState<typeof COURSES[0] | null>(null);
  const [tab, setTab] = useState<"plans" | "courses">("plans");
  const [payItem, setPayItem] = useState<PayItem | null>(null);

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" /> Premium & Khoa hoc
        </h1>
        <p className="text-sm text-gray-400 mt-1">Nang cap de hoc nhanh hon, sau hon</p>
      </div>
      <div className="flex gap-1 p-1 rounded-2xl mb-6" style={{ background: "rgba(15,10,30,0.6)" }}>
        <button onClick={() => setTab("plans")} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all", tab === "plans" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>Goi Premium</button>
        <button onClick={() => setTab("courses")} className={cn("flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all", tab === "courses" ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200")}>Khoa hoc</button>
      </div>
      {tab === "plans" && (
        <div className="flex flex-col gap-4">
          {PLANS.map(plan => (
            <div key={plan.id}
              className={cn("rounded-2xl p-5 relative transition-all", "popular" in plan && (plan as any).popular && "ring-2 ring-primary-500")}
              style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${plan.color}30` }}>
              {"popular" in plan && (plan as any).popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
                  {(plan as any).highlight}
                </div>
              )}
              {"badge" in plan && (plan as any).badge && (
                <div className="absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold text-black bg-yellow-400">{(plan as any).badge}</div>
              )}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold" style={{ color: plan.color }}>{plan.emoji}</span>
                  <div>
                    <p className="text-white font-bold text-lg">{plan.name}</p>
                    {"priceUSD" in plan && plan.price > 0 && <p className="text-xs text-gray-500">~${(plan as any).priceUSD} USD</p>}
                  </div>
                </div>
                <div className="text-right">
                  {plan.price === 0
                    ? <p className="text-2xl font-black text-gray-400">Mien phi</p>
                    : <><p className="text-2xl font-black text-white">{formatVND(plan.price)}</p><p className="text-xs text-gray-500">{plan.period}</p></>
                  }
                </div>
              </div>
              <div className="flex flex-col gap-2 mb-4">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" style={{ color: plan.color }} />
                    <span className="text-sm text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => !plan.ctaDisabled && setPayItem(plan)} disabled={plan.ctaDisabled}
                className={cn("w-full py-3 rounded-xl font-bold text-sm transition-all", plan.ctaDisabled ? "bg-gray-800 text-gray-500 cursor-default" : "text-white hover:opacity-90 active:scale-95")}
                style={!plan.ctaDisabled ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` } : {}}>
                {plan.ctaDisabled ? "Dang dung" : plan.cta}
              </button>
            </div>
          ))}
          <div className="rounded-2xl p-4 text-center" style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)" }}>
            <p className="text-green-400 font-semibold text-sm">Hoan tien 7 ngay neu khong hai long</p>
            <p className="text-gray-500 text-xs mt-1">Lien he ACB: {OWNER.acb}</p>
          </div>
        </div>
      )}
      {tab === "courses" && (
        <div className="flex flex-col gap-4">
          {COURSES.map(course => (
            <div key={course.id} className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              <div className="relative aspect-video bg-gray-900 cursor-pointer" onClick={() => setSelectedCourse(course)}>
                <div className="absolute inset-0 opacity-40" style={{ background: `linear-gradient(135deg, ${course.color}60, transparent)` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <span className="text-2xl font-bold text-white">{course.emoji}</span>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Play className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">Xem preview</span>
                  </div>
                </div>
                {course.locked
                  ? <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 text-yellow-400 text-xs px-2 py-1 rounded-lg"><Lock className="w-3 h-3" /> Premium</div>
                  : <div className="absolute top-3 right-3 bg-green-600 text-white text-xs px-2 py-1 rounded-lg font-medium">Free preview</div>
                }
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-white font-bold text-base leading-tight">{course.title}</h3>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full shrink-0">{course.level}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400" />{course.rating}</span>
                  <span>{course.students.toLocaleString()} hoc vien</span>
                  <span>{course.lessons} bai - {course.videos} video</span>
                </div>
                <div className="flex gap-1 flex-wrap mb-4">
                  {course.topics.slice(0, 3).map(t => <span key={t} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{t}</span>)}
                  {course.topics.length > 3 && <span className="text-xs text-gray-600">+{course.topics.length - 3} more</span>}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-black text-xl">{formatVND(course.price)}</span>
                    <span className="text-gray-500 text-xs ml-1">~${course.priceUSD}</span>
                  </div>
                  <button onClick={() => setPayItem(course)}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}>
                    Mua ngay <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.3),rgba(99,102,241,0.2))", border: "2px solid rgba(139,92,246,0.4)" }}>
            <p className="text-yellow-400 font-bold text-xs uppercase tracking-wide mb-1">Bundle Deal</p>
            <p className="text-white font-black text-lg mb-1">Tat ca 4 khoa hoc</p>
            <p className="text-gray-400 text-sm mb-3">Tiet kiem 40% so voi mua le</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm line-through">{formatVND(826000)}</p>
                <p className="text-white font-black text-2xl">{formatVND(499000)}</p>
              </div>
              <button onClick={() => setPayItem({ title: "Bundle 4 khoa hoc", price: 499000 })}
                className="px-5 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}>
                Mua Bundle
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }} onClick={() => setSelectedCourse(null)}>
          <div className="w-full max-w-lg rounded-3xl overflow-hidden"
            style={{ background: "#0f0a1e", border: "1px solid rgba(139,92,246,0.3)" }} onClick={e => e.stopPropagation()}>
            <div className="aspect-video relative">
              <iframe className="w-full h-full"
                src={`https://www.youtube-nocookie.com/embed/${selectedCourse.preview}?autoplay=1&rel=0`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
              <button onClick={() => setSelectedCourse(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <h3 className="text-white font-bold text-lg mb-1">{selectedCourse.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{selectedCourse.lessons} bai - {selectedCourse.videos} video - {selectedCourse.level}</p>
              <div className="flex gap-3">
                <button onClick={() => { setSelectedCourse(null); setPayItem(selectedCourse); }}
                  className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                  style={{ background: `linear-gradient(135deg, ${selectedCourse.color}, ${selectedCourse.color}cc)` }}>
                  Mua {formatVND(selectedCourse.price)}
                </button>
                <button onClick={() => setSelectedCourse(null)} className="px-4 py-3 rounded-xl border border-gray-700 text-gray-400 text-sm">Dong</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {payItem && <PayModal item={payItem} onClose={() => setPayItem(null)} />}
    </div>
  );
}
