"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const EXIT_MESSAGES = [
  { emoji: "🔥", title: "Streak của bạn đang bị đe dọa!", body: "Bạn đang có streak {streak} ngày. Thoát bây giờ có thể làm mất streak!" },
  { emoji: "📚", title: "Bạn chưa học đủ hôm nay", body: "Mục tiêu hôm nay: {goal} từ. Bạn mới học được {words} từ. Còn {left} từ nữa thôi!" },
  { emoji: "🎯", title: "Chỉ còn 5 phút nữa thôi!", body: "Học thêm một chút nữa để đạt mục tiêu hôm nay. Bạn gần đến đích rồi!" },
  { emoji: "🧠", title: "Não bạn đang trong trạng thái học tốt nhất!", body: "Đừng dừng lại bây giờ — tiếp tục học để ghi nhớ tốt hơn." },
  { emoji: "💪", title: "Người học giỏi không bỏ cuộc!", body: "Những người thành công học mỗi ngày. Hãy là người đó!" },
];

export default function ExitGuard() {
  const { streak, stats, settings } = useAppStore();
  const [show, setShow] = useState(false);
  const [msgIdx, setMsgIdx] = useState(0);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
      return "";
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Show our custom popup next time they come back
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Show popup when user tries to navigate away (back button on mobile)
  useEffect(() => {
    const handlePopState = () => {
      const today = new Date().toISOString().slice(0, 10);
      const studiedToday = stats.date === today && stats.messagesCount > 0;
      if (!studiedToday || stats.wordsLearned < (settings.dailyGoal ?? 5)) {
        history.pushState(null, "", window.location.href);
        setMsgIdx(Math.floor(Math.random() * EXIT_MESSAGES.length));
        setShow(true);
        setAttempts(a => a + 1);
      }
    };

    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [stats, settings]);

  if (!show) return null;

  const msg = EXIT_MESSAGES[msgIdx];
  const goal = settings.dailyGoal ?? 5;
  const words = stats.wordsLearned;
  const left = Math.max(0, goal - words);

  const body = msg.body
    .replace("{streak}", String(streak))
    .replace("{goal}", String(goal))
    .replace("{words}", String(words))
    .replace("{left}", String(left));

  const handleStay = () => {
    setShow(false);
  };

  const handleLeave = () => {
    if (attempts < 2) {
      // Show another message
      setMsgIdx(prev => (prev + 1) % EXIT_MESSAGES.length);
      setAttempts(a => a + 1);
    } else {
      setShow(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center pb-8 px-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-sm rounded-3xl p-6 text-center"
        style={{ background: "rgba(10,6,20,0.99)", border: "1px solid rgba(139,92,246,0.4)" }}>
        <div className="text-5xl mb-4">{msg.emoji}</div>
        <h3 className="text-white font-black text-lg mb-2">{msg.title}</h3>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed">{body}</p>

        {/* Progress bar */}
        <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
          <div className="h-2 rounded-full transition-all"
            style={{ width: `${Math.min((words / goal) * 100, 100)}%`, background: "linear-gradient(90deg,#7c3aed,#6366f1)" }} />
        </div>
        <p className="text-xs text-gray-600 mb-5">{words}/{goal} từ hôm nay</p>

        <button onClick={handleStay}
          className="w-full py-4 rounded-2xl font-bold text-white mb-3 text-base transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
          Tiếp tục học 💪
        </button>
        <button onClick={handleLeave}
          className="w-full py-2 text-gray-600 text-sm hover:text-gray-400 transition-colors">
          {attempts < 2 ? "Thoát" : "Thoát thật sự"}
        </button>
      </div>
    </div>
  );
}
