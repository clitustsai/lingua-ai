"use client";
import { useState } from "react";
import { Star, ThumbsUp, Send, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const SEED_REVIEWS = [
  { id: "r1", name: "Nguyen Thi Lan", avatar: "🦋", rating: 5, date: "2 ngay truoc", verified: true, helpful: 24, text: "App nay qua tuyet! Minh da hoc tieng Anh duoc 3 thang va thay su tien bo ro ret. AI chat rat tu nhien, giai thich ngu phap de hieu. Dac biet thich tinh nang phat am scoring - giup minh biet chinh xac cho nao can cai thien. Recommend cho tat ca moi nguoi!", tags: ["Chat AI", "Phat am", "Ngu phap"] },
  { id: "r2", name: "Tran Van Minh", avatar: "🦁", rating: 5, date: "5 ngay truoc", verified: true, helpful: 18, text: "Minh la dan van phong can tieng Anh cho cong viec. LinguaAI giup minh viet email chuyen nghiep, luyen phong van bang tieng Anh. Tinh nang AI Kiem Tien viet caption ban hang bang tieng Anh rat huu ich. Da tang doanh so 30% nho viet duoc content tieng Anh tot hon!", tags: ["Business English", "AI Kiem Tien", "Email"] },
  { id: "r3", name: "Le Thi Hoa", avatar: "🌸", rating: 5, date: "1 tuan truoc", verified: true, helpful: 31, text: "Con gai minh 15 tuoi dung app nay de on thi IELTS. Diem Speaking tang tu 5.5 len 7.0 chi sau 2 thang! Cac bai hoc video rat hay, quiz sau moi video giup ghi nho tot hon. Giao vien AI kien nhan, giai thich nhieu lan khong ngan. Rat xung dang voi gia tien!", tags: ["IELTS", "Speaking", "Video"] },
  { id: "r4", name: "Pham Duc Anh", avatar: "🐯", rating: 4, date: "1 tuan truoc", verified: true, helpful: 12, text: "App kha tot, giao dien dep, de su dung. Tinh nang flashcard rat hieu qua, he thong spaced repetition giup nho tu lau hon. Chi tru 1 sao vi doi khi AI tra loi hoi cham. Nhung nhin chung rat hai long, se tiep tuc dung lau dai.", tags: ["Flashcard", "Tu vung", "UI/UX"] },
  { id: "r5", name: "Vo Thi Thu", avatar: "🦊", rating: 5, date: "2 tuan truoc", verified: true, helpful: 27, text: "Minh da thu nhieu app hoc tieng Anh nhung LinguaAI la tot nhat! AI hieu nguyen ngu cua minh, tra loi bang tieng Viet khi can. Tinh nang Voice Call luyen noi rat thuc te. Sau 1 thang, minh da tu tin noi chuyen voi khach nuoc ngoai. Cam on team da tao ra san pham tuyet voi!", tags: ["Voice Call", "AI Chat", "Tieng Viet"] },
  { id: "r6", name: "Hoang Van Long", avatar: "🐺", rating: 5, date: "3 tuan truoc", verified: true, helpful: 15, text: "Freelancer can tieng Anh de lam viec voi client nuoc ngoai. LinguaAI giup minh viet proposal, reply email, negotiate gia ca bang tieng Anh chuyen nghiep. Tinh nang AI Kiem Tien la game changer! Da tang thu nhap 50% nho viet duoc content tieng Anh tot.", tags: ["Freelance", "AI Kiem Tien", "Business"] },
  { id: "r7", name: "Nguyen Thi Mai", avatar: "🦄", rating: 5, date: "1 thang truoc", verified: true, helpful: 42, text: "Minh la giao vien tieng Anh va rat an tuong voi chat luong cua LinguaAI. AI giai thich ngu phap chinh xac, vi du phong phu. Dac biet tinh nang Grammar Checker rat huu ich cho hoc sinh. Se gioi thieu cho tat ca hoc sinh cua minh!", tags: ["Ngu phap", "Giao vien", "Chat luong"] },
  { id: "r8", name: "Bui Thanh Tung", avatar: "🐸", rating: 4, date: "1 thang truoc", verified: false, helpful: 8, text: "App tot, nhieu tinh nang hay. Dung duoc 2 tuan thay kha hieu qua. Tinh nang Brain Mode doc tai lieu tieng Anh rat hay. Mong team them nhieu video bai hoc hon nua. Overall rat hai long!", tags: ["Brain Mode", "Video", "Hoc lieu"] },
];

const STATS = { total: 4.8, count: 1247, dist: [65, 20, 10, 3, 2] };

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const s = size === "lg" ? "w-6 h-6" : "w-4 h-4";
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={cn(s, i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-700")} />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState(SEED_REVIEWS);
  const [myRating, setMyRating] = useState(0);
  const [myText, setMyText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [helpedIds, setHelpedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState(0);

  const submit = () => {
    if (!myRating || !myText.trim()) return;
    const newReview = {
      id: "my-" + Date.now(),
      name: user?.name || "Ban",
      avatar: user?.avatar || "🌟",
      rating: myRating,
      date: "Vua xong",
      verified: true,
      helpful: 0,
      text: myText.trim(),
      tags: [],
    };
    setReviews(r => [newReview, ...r]);
    setSubmitted(true);
  };

  const toggleHelp = (id: string) => {
    setHelpedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
    setReviews(r => r.map(rv =>
      rv.id === id ? { ...rv, helpful: helpedIds.includes(id) ? rv.helpful - 1 : rv.helpful + 1 } : rv
    ));
  };

  const filtered = filter === 0 ? reviews : reviews.filter(r => r.rating === filter);

  return (
    <div className="p-5 max-w-2xl">
      <div className="pt-2 mb-6">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Danh gia & Nhan xet
        </h1>
        <p className="text-sm text-gray-400 mt-1">Nguoi dung thuc su danh gia LinguaAI</p>
      </div>

      {/* Overall stats */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-white">{STATS.total}</p>
            <StarRating rating={5} size="lg" />
            <p className="text-gray-500 text-xs mt-1">{STATS.count.toLocaleString()} danh gia</p>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            {[5,4,3,2,1].map((star, i) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-3">{star}</span>
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 bg-gray-800 rounded-full h-2">
                  <div className="h-2 rounded-full bg-yellow-400 transition-all"
                    style={{ width: `${STATS.dist[i]}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 text-right">{STATS.dist[i]}%</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3 mt-4 pt-4 border-t border-white/10 text-center">
          {[
            { label: "Hoc vien", value: "12,400+" },
            { label: "Danh gia 5 sao", value: "85%" },
            { label: "Gioi thieu ban be", value: "92%" },
          ].map(s => (
            <div key={s.label} className="flex-1">
              <p className="text-white font-black text-lg">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Write review */}
      {!submitted ? (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <p className="text-white font-semibold text-sm mb-3">Viet danh gia cua ban</p>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setMyRating(i)}>
                <Star className={cn("w-7 h-7 transition-colors", i <= myRating ? "text-yellow-400 fill-yellow-400" : "text-gray-700 hover:text-yellow-300")} />
              </button>
            ))}
          </div>
          <textarea value={myText} onChange={e => setMyText(e.target.value)}
            placeholder="Chia se trai nghiem cua ban voi LinguaAI..."
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3"
            style={{ background: "rgba(15,10,30,0.8)" }}
          />
          <button onClick={submit} disabled={!myRating || !myText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <Send className="w-4 h-4" /> Gui danh gia
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <Check className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-green-300 text-sm font-medium">Cam on ban da danh gia! Danh gia cua ban giup nhieu nguoi hon.</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[0,5,4,3].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-colors",
              filter === s ? "border-yellow-500 bg-yellow-900/20 text-yellow-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
            {s === 0 ? "Tat ca" : <><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {s} sao</>}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="flex flex-col gap-3">
        {filtered.map(rv => (
          <div key={rv.id} className="rounded-2xl p-4 animate-fade-in-up"
            style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.12)" }}>
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-primary-600/30 flex items-center justify-center text-xl shrink-0">
                {rv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-white font-semibold text-sm">{rv.name}</p>
                  {rv.verified && (
                    <span className="text-xs bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Da xac minh
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={rv.rating} />
                  <span className="text-gray-500 text-xs">{rv.date}</span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">{rv.text}</p>
            {rv.tags.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mb-3">
                {rv.tags.map(t => (
                  <span key={t} className="text-xs bg-primary-900/30 text-primary-400 px-2 py-0.5 rounded-full">{t}</span>
                ))}
              </div>
            )}
            <button onClick={() => toggleHelp(rv.id)}
              className={cn("flex items-center gap-1.5 text-xs transition-colors",
                helpedIds.includes(rv.id) ? "text-primary-400" : "text-gray-600 hover:text-gray-400")}>
              <ThumbsUp className="w-3.5 h-3.5" />
              Huu ich ({rv.helpful + (helpedIds.includes(rv.id) ? 1 : 0)})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
