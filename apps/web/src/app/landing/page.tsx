import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LinguaAI - Học ngôn ngữ cùng trí tuệ nhân tạo",
  description: "LinguaAI giúp bạn học tiếng Anh, Nhật, Hàn và nhiều ngôn ngữ khác với AI. Chat AI, luyện phát âm, flashcard thông minh.",
};

export default function LandingPage() {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 800, margin: "0 auto", padding: "40px 20px", background: "#0f0a1e", color: "white", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 36, fontWeight: 900, marginBottom: 16 }}>LinguaAI</h1>
      <p style={{ fontSize: 18, color: "#a78bfa", marginBottom: 32 }}>Học ngôn ngữ cùng trí tuệ nhân tạo</p>

      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Tính năng nổi bật</h2>
      <ul style={{ lineHeight: 2, color: "#d1d5db" }}>
        <li>Chat AI với 12 tình huống thực tế (mua sắm, phỏng vấn, khách sạn...)</li>
        <li>AI Teacher - bài tập cá nhân hóa, AI chấm điểm</li>
        <li>Luyện phát âm với feedback chi tiết</li>
        <li>Flashcard thông minh với Spaced Repetition (SRS)</li>
        <li>Video bài học với nội dung AI tạo tự động</li>
        <li>Lộ trình học cá nhân hóa theo mục tiêu</li>
        <li>Giải bài tập tiếng Anh từ lớp 6 đến lớp 12</li>
        <li>Dịch thuật AI với giải thích ngữ pháp</li>
      </ul>

      <h2 style={{ fontSize: 24, marginTop: 32, marginBottom: 16 }}>Ngôn ngữ hỗ trợ</h2>
      <p style={{ color: "#d1d5db" }}>Tiếng Anh, Nhật, Hàn, Trung, Pháp, Tây Ban Nha, Đức</p>

      <div style={{ marginTop: 40 }}>
        <Link href="/auth" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", color: "white", padding: "12px 32px", borderRadius: 12, textDecoration: "none", fontWeight: 700 }}>
          Bắt đầu học miễn phí
        </Link>
      </div>

      <p style={{ marginTop: 48, color: "#6b7280", fontSize: 14 }}>
        © 2026 LinguaAI · <Link href="/terms" style={{ color: "#6b7280" }}>Điều khoản</Link>
      </p>
    </div>
  );
}
