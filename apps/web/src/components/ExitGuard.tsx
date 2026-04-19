"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Star } from "lucide-react";

const RATED_KEY = "lingua_exit_rated";

function hasRated(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(RATED_KEY);
}

export default function ExitGuard() {
  const { streak, stats, settings } = useAppStore();
  const [show, setShow] = useState(false);
  const [phase, setPhase] = useState<"study" | "rate">("study");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handlePopState = () => {
      const today = new Date().toISOString().slice(0, 10);
      const studiedToday = stats.date === today && stats.messagesCount > 0;
      const goalMet = stats.wordsLearned >= (settings.dailyGoal ?? 5);

      history.pushState(null, "", window.location.href);

      if (!studiedToday || !goalMet) {
        setPhase("study");
        setShow(true);
      } else if (!hasRated()) {
        setPhase("rate");
        setShow(true);
      }
    };

    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    // Also show rating popup on beforeunload if not rated
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!hasRated()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [stats, settings]);

  const submitRating = async () => {
    if (rating === 0) return;
    localStorage.setItem(RATED_KEY, "1");
    // Send to report-error API as feedback
    try {
      await fetch("/api/report-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `[APP RATING] ${rating}/5 sao — ${comment || "Không có bình luận"}`,
          stack: `Rating: ${rating}, Comment: ${comment}`,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch { /* ignore */ }
    setSubmitted(true);
    setTimeout(() => setShow(false), 2000);
  };

  const skipRating = () => {
    localStorage.setItem(RATED_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  const goal = settings.dailyGoal ?? 5;
  const words = stats.wordsLearned;

  // Phase 1: Study reminder
  if (phase === "study") {
    return (
      <div className="fixed inset-0 z-[200] flex items-end justify-center pb-8 px-4"
        style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
        <div className="w-full max-w-sm rounded-3xl p-6 text-center"
          style={{ background: "rgba(10,6,20,0.99)", border: "1px solid rgba(139,92,246,0.4)" }}>
          <div className="text-5xl mb-4">🔥</div>
          <h3 className="text-white font-black text-lg mb-2">Streak {streak} ngày đang chờ bạn!</h3>
          <p className="text-gray-400 text-sm mb-4 leading-relaxed">
            Bạn mới học {words}/{goal} từ hôm nay. Học thêm chút nữa để giữ streak nhé!
          </p>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-5">
            <div className="h-2 rounded-full transition-all"
              style={{ width: `${Math.min((words / goal) * 100, 100)}%`, background: "linear-gradient(90deg,#7c3aed,#6366f1)" }} />
          </div>
          <button onClick={() => setShow(false)}
            className="w-full py-4 rounded-2xl font-bold text-white mb-3"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            Tiếp tục học 💪
          </button>
          <button onClick={() => { setPhase("rate"); }}
            className="w-full py-2 text-gray-600 text-sm hover:text-gray-400 transition-colors">
            Thoát và đánh giá app
          </button>
        </div>
      </div>
    );
  }

  // Phase 2: Rating popup
  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center pb-8 px-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: "rgba(10,6,20,0.99)", border: "1px solid rgba(245,158,11,0.4)" }}>

        {submitted ? (
          <>
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-white font-black text-lg mb-2">Cảm ơn bạn!</h3>
            <p className="text-gray-400 text-sm">Đánh giá của bạn giúp LinguaAI tốt hơn mỗi ngày.</p>
          </>
        ) : (
          <>
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-white font-black text-lg mb-1">Bạn thấy LinguaAI thế nào?</h3>
            <p className="text-gray-500 text-sm mb-5">Đánh giá nhanh để giúp chúng tôi cải thiện</p>

            {/* Stars */}
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  className="transition-transform hover:scale-125 active:scale-110">
                  <Star className="w-9 h-9 transition-colors"
                    fill={(hovered || rating) >= s ? "#fbbf24" : "none"}
                    color={(hovered || rating) >= s ? "#fbbf24" : "#4b5563"} />
                </button>
              ))}
            </div>

            {rating > 0 && (
              <p className="text-yellow-400 text-sm mb-3 font-medium">
                {rating === 5 ? "Tuyệt vời! 🎉" : rating === 4 ? "Rất tốt! 👍" : rating === 3 ? "Ổn 😊" : rating === 2 ? "Cần cải thiện 🤔" : "Chưa hài lòng 😔"}
              </p>
            )}

            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Góp ý thêm (không bắt buộc)..."
              rows={2}
              className="w-full rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 border border-gray-700 focus:outline-none focus:border-yellow-500 resize-none mb-4"
              style={{ background: "rgba(26,16,53,0.8)" }}
            />

            <button onClick={submitRating} disabled={rating === 0}
              className="w-full py-3.5 rounded-2xl font-bold text-white mb-3 transition-all disabled:opacity-40"
              style={{ background: rating > 0 ? "linear-gradient(135deg,#f59e0b,#f97316)" : "rgba(107,114,128,0.5)" }}>
              Gửi đánh giá
            </button>
            <button onClick={skipRating}
              className="w-full py-2 text-gray-600 text-xs hover:text-gray-400 transition-colors">
              Bỏ qua
            </button>
          </>
        )}
      </div>
    </div>
  );
}
