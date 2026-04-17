"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Tag } from "lucide-react";

const POSTS = [
  {
    emoji: "🧠",
    title: "5 cách học từ vựng hiệu quả với AI",
    desc: "Khám phá cách sử dụng AI để ghi nhớ từ vựng nhanh hơn gấp 3 lần so với phương pháp truyền thống.",
    tag: "Mẹo học",
    date: "15 tháng 4, 2026",
    readTime: "5 phút",
    color: "#8b5cf6",
  },
  {
    emoji: "🎯",
    title: "Streak 30 ngày: Hành trình của người học",
    desc: "Câu chuyện thực tế của một người dùng LinguaAI duy trì streak 30 ngày và những bài học rút ra.",
    tag: "Câu chuyện",
    date: "10 tháng 4, 2026",
    readTime: "4 phút",
    color: "#f59e0b",
  },
  {
    emoji: "🗣️",
    title: "Luyện phát âm tiếng Anh: Sai lầm phổ biến",
    desc: "Những lỗi phát âm người Việt hay mắc phải và cách khắc phục với AI Speaking Room.",
    tag: "Phát âm",
    date: "5 tháng 4, 2026",
    readTime: "6 phút",
    color: "#10b981",
  },
  {
    emoji: "📱",
    title: "Học ngôn ngữ 15 phút mỗi ngày có đủ không?",
    desc: "Nghiên cứu khoa học về thời gian học tối ưu và cách LinguaAI giúp bạn tận dụng từng phút.",
    tag: "Khoa học",
    date: "1 tháng 4, 2026",
    readTime: "7 phút",
    color: "#3b82f6",
  },
  {
    emoji: "🌍",
    title: "So sánh 7 ngôn ngữ phổ biến nhất thế giới",
    desc: "Tiếng Anh, Nhật, Hàn, Trung, Pháp, Tây Ban Nha, Đức — ngôn ngữ nào phù hợp với bạn?",
    tag: "Ngôn ngữ",
    date: "25 tháng 3, 2026",
    readTime: "8 phút",
    color: "#ec4899",
  },
  {
    emoji: "🤖",
    title: "AI thay đổi cách học ngôn ngữ như thế nào?",
    desc: "Từ chatbot đơn giản đến AI tutor cá nhân hóa — cuộc cách mạng trong giáo dục ngôn ngữ.",
    tag: "Công nghệ",
    date: "20 tháng 3, 2026",
    readTime: "6 phút",
    color: "#06b6d4",
  },
];

export default function BlogPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl"
      style={{ background: "#0f0a1e" }}>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <h1 className="text-2xl font-black text-white mb-1">Blog LinguaAI</h1>
      <p className="text-gray-500 text-sm mb-6">Mẹo học, câu chuyện và kiến thức ngôn ngữ</p>

      <div className="flex flex-col gap-4">
        {POSTS.map((post, i) => (
          <div key={i}
            className="rounded-2xl p-5 cursor-pointer hover:opacity-90 transition-opacity"
            style={{ background: "rgba(26,16,53,0.8)", border: `1px solid ${post.color}25` }}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ background: `${post.color}20` }}>
                {post.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: `${post.color}20`, color: post.color }}>
                    {post.tag}
                  </span>
                </div>
                <h2 className="text-white font-bold text-sm leading-snug mb-1.5">{post.title}</h2>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{post.desc}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{post.readTime}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
