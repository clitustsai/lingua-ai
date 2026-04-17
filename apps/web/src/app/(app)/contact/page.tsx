"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, MessageCircle, Clock, Send, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg"
      style={{ background: "#0f0a1e" }}>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <h1 className="text-2xl font-black text-white mb-1">Liên hệ hỗ trợ</h1>
      <p className="text-gray-500 text-sm mb-6">Chúng tôi sẽ phản hồi trong vòng 24 giờ</p>

      {/* Info cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <Mail className="w-5 h-5 text-primary-400 mb-2" />
          <p className="text-white text-xs font-semibold mb-0.5">Email</p>
          <p className="text-gray-500 text-xs">support@linguaai.app</p>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
          <Clock className="w-5 h-5 text-green-400 mb-2" />
          <p className="text-white text-xs font-semibold mb-0.5">Giờ hỗ trợ</p>
          <p className="text-gray-500 text-xs">8:00 - 22:00 hàng ngày</p>
        </div>
      </div>

      {sent ? (
        <div className="rounded-2xl p-8 text-center" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)" }}>
          <div className="text-4xl mb-3">✅</div>
          <p className="text-white font-bold text-lg mb-1">Đã gửi thành công!</p>
          <p className="text-gray-400 text-sm">Chúng tôi sẽ phản hồi qua email của bạn trong vòng 24 giờ.</p>
          <button onClick={() => router.back()}
            className="mt-5 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-sm font-semibold transition-colors">
            Quay lại
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Họ tên</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="Nguyen Van A"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                style={{ background: "rgba(15,10,30,0.8)" }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="email@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
                style={{ background: "rgba(15,10,30,0.8)" }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1.5 block">Nội dung</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Mô tả vấn đề bạn gặp phải..."
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors resize-none"
                style={{ background: "rgba(15,10,30,0.8)" }}
              />
            </div>
          </div>

          <button type="submit" disabled={loading || !name.trim() || !email.trim() || !message.trim()}
            className="w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)" }}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Đang gửi..." : "Gửi tin nhắn"}
          </button>
        </form>
      )}
    </div>
  );
}
