"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Brain } from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen px-4 py-8"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1a0533 50%,#0f0a1e 100%)" }}>
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-600/30 flex items-center justify-center"
            style={{ border: "1px solid rgba(139,92,246,0.4)" }}>
            <Brain className="w-5 h-5 text-primary-400" />
          </div>
          <h1 className="text-2xl font-black text-white">Điều khoản sử dụng</h1>
        </div>

        <div className="rounded-3xl p-6 space-y-6 text-gray-300 text-sm leading-relaxed"
          style={{ background: "rgba(26,16,53,0.9)", border: "1px solid rgba(139,92,246,0.25)", backdropFilter: "blur(20px)" }}>

          <p className="text-gray-400 text-xs">Cập nhật lần cuối: tháng 4 năm 2026</p>

          <section>
            <h2 className="text-white font-bold text-base mb-2">1. Chấp nhận điều khoản</h2>
            <p>Bằng cách truy cập và sử dụng LinguaAI, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">2. Mô tả dịch vụ</h2>
            <p>LinguaAI là nền tảng học ngôn ngữ được hỗ trợ bởi trí tuệ nhân tạo, cung cấp các tính năng bao gồm: học từ vựng, luyện phát âm, luyện nghe, luyện đọc, luyện viết, và hội thoại với AI.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">3. Tài khoản người dùng</h2>
            <p>Bạn chịu trách nhiệm bảo mật thông tin tài khoản của mình, bao gồm mật khẩu. Bạn đồng ý thông báo ngay cho chúng tôi nếu phát hiện bất kỳ hành vi sử dụng trái phép nào đối với tài khoản của bạn. LinguaAI không chịu trách nhiệm về bất kỳ tổn thất nào phát sinh từ việc bạn không bảo mật thông tin tài khoản.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">4. Quyền riêng tư</h2>
            <p>Chúng tôi thu thập và xử lý dữ liệu cá nhân của bạn theo Chính sách Bảo mật của chúng tôi. Bằng cách sử dụng dịch vụ, bạn đồng ý với việc thu thập và sử dụng thông tin theo chính sách đó. Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn và không chia sẻ với bên thứ ba khi chưa có sự đồng ý của bạn.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">5. Nội dung người dùng</h2>
            <p>Bạn chịu trách nhiệm về tất cả nội dung bạn tạo ra hoặc chia sẻ trên nền tảng. Bạn không được đăng tải nội dung vi phạm pháp luật, xúc phạm, phân biệt đối xử, hoặc xâm phạm quyền sở hữu trí tuệ của người khác.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">6. Sử dụng hợp lệ</h2>
            <p>Bạn đồng ý không sử dụng dịch vụ cho bất kỳ mục đích bất hợp pháp nào, không cố gắng truy cập trái phép vào hệ thống của chúng tôi, không phát tán phần mềm độc hại, và không thực hiện bất kỳ hành động nào có thể gây hại cho dịch vụ hoặc người dùng khác.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">7. Gói Premium</h2>
            <p>Một số tính năng yêu cầu đăng ký gói Premium. Phí đăng ký sẽ được tính theo chu kỳ đã chọn. Bạn có thể hủy đăng ký bất kỳ lúc nào, nhưng chúng tôi không hoàn tiền cho thời gian đã sử dụng trong chu kỳ hiện tại.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">8. Giới hạn trách nhiệm</h2>
            <p>LinguaAI cung cấp dịch vụ "nguyên trạng" và không đảm bảo dịch vụ sẽ không bị gián đoạn hoặc không có lỗi. Chúng tôi không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên hoặc hậu quả nào phát sinh từ việc sử dụng dịch vụ.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">9. Thay đổi điều khoản</h2>
            <p>Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Chúng tôi sẽ thông báo cho bạn về các thay đổi quan trọng qua email hoặc thông báo trong ứng dụng. Việc tiếp tục sử dụng dịch vụ sau khi thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận các điều khoản mới.</p>
          </section>

          <section>
            <h2 className="text-white font-bold text-base mb-2">10. Liên hệ</h2>
            <p>Nếu bạn có bất kỳ câu hỏi nào về các điều khoản này, vui lòng liên hệ với chúng tôi qua email hỗ trợ trong ứng dụng.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
