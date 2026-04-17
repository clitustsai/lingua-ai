"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search, ChevronRight, MessageCircle, Mail, Phone } from "lucide-react";
import { useState } from "react";

const FAQS = [
  {
    category: "Tài khoản",
    items: [
      { q: "Làm sao để đổi mật khẩu?", a: "Vào Settings → nhấn vào tên tài khoản → chọn 'Đổi mật khẩu'. Bạn sẽ nhận email xác nhận." },
      { q: "Tôi quên mật khẩu phải làm sao?", a: "Ở trang đăng nhập, nhấn 'Quên mật khẩu' và nhập email. Chúng tôi sẽ gửi link đặt lại mật khẩu." },
      { q: "Làm sao để xóa tài khoản?", a: "Liên hệ support@linguaai.app để yêu cầu xóa tài khoản. Chúng tôi sẽ xử lý trong 7 ngày làm việc." },
    ]
  },
  {
    category: "Học tập",
    items: [
      { q: "Streak của tôi bị mất, phải làm sao?", a: "Streak được tính khi bạn hoàn thành ít nhất 1 bài học mỗi ngày. Nếu bị mất do lỗi hệ thống, liên hệ hỗ trợ." },
      { q: "Flashcard của tôi bị mất?", a: "Flashcard được lưu trên thiết bị. Nếu đổi thiết bị hoặc xóa cache, dữ liệu có thể bị mất. Hãy đăng nhập để đồng bộ." },
      { q: "AI không hiểu giọng tôi nói?", a: "Hãy nói rõ ràng, chậm hơn và đảm bảo mic hoạt động tốt. Thử ở nơi yên tĩnh để kết quả tốt hơn." },
    ]
  },
  {
    category: "Premium",
    items: [
      { q: "Premium có những tính năng gì?", a: "Premium mở khóa toàn bộ tính năng AI, không giới hạn tin nhắn, ưu tiên xử lý và không có quảng cáo." },
      { q: "Làm sao để hủy Premium?", a: "Vào Settings → Premium → Hủy đăng ký. Bạn vẫn dùng được đến hết chu kỳ đã thanh toán." },
      { q: "Tôi bị trừ tiền nhưng chưa lên Premium?", a: "Vui lòng liên hệ support@linguaai.app kèm ảnh chụp màn hình giao dịch để được hỗ trợ." },
    ]
  },
];

export default function HelpPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [openItem, setOpenItem] = useState<string | null>(null);

  const filtered = FAQS.map(cat => ({
    ...cat,
    items: cat.items.filter(it =>
      !search || it.q.toLowerCase().includes(search.toLowerCase()) || it.a.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen px-4 py-8 max-w-2xl"
      style={{ background: "#0f0a1e" }}>
      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>

      <h1 className="text-2xl font-black text-white mb-1">Trung tâm trợ giúp</h1>
      <p className="text-gray-500 text-sm mb-6">Tìm câu trả lời cho thắc mắc của bạn</p>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm câu hỏi..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 border border-gray-700 focus:outline-none focus:border-primary-500 transition-colors"
          style={{ background: "rgba(26,16,53,0.8)" }}
        />
      </div>

      {/* FAQ */}
      <div className="flex flex-col gap-5 mb-8">
        {filtered.map(cat => (
          <div key={cat.category}>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">{cat.category}</p>
            <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.15)" }}>
              {cat.items.map((it, i) => (
                <div key={it.q} className={i < cat.items.length - 1 ? "border-b border-white/5" : ""}>
                  <button onClick={() => setOpenItem(openItem === it.q ? null : it.q)}
                    className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-white/5 transition-colors">
                    <span className="text-sm text-gray-200 flex-1 pr-3">{it.q}</span>
                    <ChevronRight className={`w-4 h-4 text-gray-600 shrink-0 transition-transform ${openItem === it.q ? "rotate-90" : ""}`} />
                  </button>
                  {openItem === it.q && (
                    <div className="px-4 pb-4">
                      <p className="text-sm text-gray-400 leading-relaxed">{it.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="rounded-2xl p-5" style={{ background: "rgba(26,16,53,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
        <p className="text-white font-bold mb-1">Vẫn cần hỗ trợ?</p>
        <p className="text-gray-500 text-sm mb-4">Đội ngũ của chúng tôi luôn sẵn sàng giúp bạn</p>
        <a href="mailto:support@linguaai.app"
          className="flex items-center gap-3 py-3 px-4 rounded-xl transition-colors hover:bg-white/5">
          <Mail className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-gray-200">support@linguaai.app</span>
        </a>
      </div>
    </div>
  );
}
