"use client";
import { useState } from "react";
import { Star, ThumbsUp, Send, Check } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

const SEED_REVIEWS = [
  { id: "r1", name: "Nguyễn Thị Lan", avatar: "🦋", rating: 5, date: "2 ngày trước", verified: true, helpful: 24, text: "App này quá tuyệt! Mình đã học tiếng Anh được 3 tháng và thấy sự tiến bộ rõ rệt. AI chat rất tự nhiên, giải thích ngữ pháp dễ hiểu. Đặc biệt thích tính năng phát âm scoring - giúp mình biết chính xác chỗ nào cần cải thiện. Recommend cho tất cả mọi người!", tags: ["Chat AI", "Phát âm", "Ngữ pháp"] },
  { id: "r2", name: "Trần Văn Minh", avatar: "🦁", rating: 5, date: "5 ngày trước", verified: true, helpful: 18, text: "Mình là dân văn phòng cần tiếng Anh cho công việc. LinguaAI giúp mình viết email chuyên nghiệp, luyện phỏng vấn bằng tiếng Anh. Tính năng AI Kiếm Tiền viết caption bán hàng bằng tiếng Anh rất hữu ích. Đã tăng doanh số 30% nhờ viết được content tiếng Anh tốt hơn!", tags: ["Business English", "AI Kiếm Tiền", "Email"] },
  { id: "r3", name: "Lê Thị Hoa", avatar: "🌸", rating: 5, date: "1 tuần trước", verified: true, helpful: 31, text: "Con gái mình 15 tuổi dùng app này để ôn thi IELTS. Điểm Speaking tăng từ 5.5 lên 7.0 chỉ sau 2 tháng! Các bài học video rất hay, quiz sau mỗi video giúp ghi nhớ tốt hơn. Giáo viên AI kiên nhẫn, giải thích nhiều lần không ngán. Rất xứng đáng với giá tiền!", tags: ["IELTS", "Speaking", "Video"] },
  { id: "r4", name: "Phạm Đức Anh", avatar: "🐯", rating: 4, date: "1 tuần trước", verified: true, helpful: 12, text: "App khá tốt, giao diện đẹp, dễ sử dụng. Tính năng flashcard rất hiệu quả, hệ thống spaced repetition giúp nhớ từ lâu hơn. Chỉ trừ 1 sao vì đôi khi AI trả lời hơi chậm. Nhưng nhìn chung rất hài lòng, sẽ tiếp tục dùng lâu dài.", tags: ["Flashcard", "Từ vựng", "UI/UX"] },
  { id: "r5", name: "Võ Thị Thu", avatar: "🦊", rating: 5, date: "2 tuần trước", verified: true, helpful: 27, text: "Mình đã thử nhiều app học tiếng Anh nhưng LinguaAI là tốt nhất! AI hiểu nguyên ngữ của mình, trả lời bằng tiếng Việt khi cần. Tính năng Voice Call luyện nói rất thực tế. Sau 1 tháng, mình đã tự tin nói chuyện với khách nước ngoài. Cảm ơn team đã tạo ra sản phẩm tuyệt vời!", tags: ["Voice Call", "AI Chat", "Tiếng Việt"] },
  { id: "r6", name: "Hoàng Văn Long", avatar: "🐺", rating: 5, date: "3 tuần trước", verified: true, helpful: 15, text: "Freelancer cần tiếng Anh để làm việc với client nước ngoài. LinguaAI giúp mình viết proposal, reply email, negotiate giá cả bằng tiếng Anh chuyên nghiệp. Tính năng AI Kiếm Tiền là game changer! Đã tăng thu nhập 50% nhờ viết được content tiếng Anh tốt.", tags: ["Freelance", "AI Kiếm Tiền", "Business"] },
  { id: "r7", name: "Nguyễn Thị Mai", avatar: "🦄", rating: 5, date: "1 tháng trước", verified: true, helpful: 42, text: "Mình là giáo viên tiếng Anh và rất ấn tượng với chất lượng của LinguaAI. AI giải thích ngữ pháp chính xác, ví dụ phong phú. Đặc biệt tính năng Grammar Checker rất hữu ích cho học sinh. Sẽ giới thiệu cho tất cả học sinh của mình!", tags: ["Ngữ pháp", "Giáo viên", "Chất lượng"] },
  { id: "r8", name: "Bùi Thanh Tùng", avatar: "🐸", rating: 4, date: "1 tháng trước", verified: false, helpful: 8, text: "App tốt, nhiều tính năng hay. Dùng được 2 tuần thấy khá hiệu quả. Tính năng Brain Mode đọc tài liệu tiếng Anh rất hay. Mong team thêm nhiều video bài học hơn nữa. Overall rất hài lòng!", tags: ["Brain Mode", "Video", "Học liệu"] },
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
      date: "Vừa xong",
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
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" /> Đánh giá & Nhận xét
        </h1>
        <p className="text-sm text-gray-400 mt-1">Người dùng thực sự đánh giá LinguaAI</p>
      </div>

      {/* Overall stats */}
      <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="text-5xl font-black text-white">{STATS.total}</p>
            <StarRating rating={5} size="lg" />
            <p className="text-gray-500 text-xs mt-1">{STATS.count.toLocaleString()} đánh giá</p>
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
            { label: "Học viên", value: "12,400+" },
            { label: "Đánh giá 5 sao", value: "85%" },
            { label: "Giới thiệu bạn bè", value: "92%" },
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
          <p className="text-white font-semibold text-sm mb-3">Viết đánh giá của bạn</p>
          <div className="flex gap-2 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} onClick={() => setMyRating(i)}>
                <Star className={cn("w-7 h-7 transition-colors", i <= myRating ? "text-yellow-400 fill-yellow-400" : "text-gray-700 hover:text-yellow-300")} />
              </button>
            ))}
          </div>
          <textarea value={myText} onChange={e => setMyText(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn với LinguaAI..."
            rows={3}
            className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 resize-none mb-3"
            style={{ background: "rgba(15,10,30,0.8)" }}
          />
          <button onClick={submit} disabled={!myRating || !myText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all disabled:opacity-40"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            <Send className="w-4 h-4" /> Gửi đánh giá
          </button>
        </div>
      ) : (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <Check className="w-5 h-5 text-green-400 shrink-0" />
          <p className="text-green-300 text-sm font-medium">Cảm ơn bạn đã đánh giá! Đánh giá của bạn giúp nhiều người hơn.</p>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-1">
        {[0,5,4,3].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={cn("flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-colors",
              filter === s ? "border-yellow-500 bg-yellow-900/20 text-yellow-300" : "border-gray-700 bg-gray-800 text-gray-400")}>
            {s === 0 ? "Tất cả" : <><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {s} sao</>}
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
                      <Check className="w-2.5 h-2.5" /> Đã xác minh
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
              Hữu ích ({rv.helpful + (helpedIds.includes(rv.id) ? 1 : 0)})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


