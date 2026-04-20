import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { userId, userEmail, plan, addInfo, amount } = await req.json();

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://lingua-ai-web-umber.vercel.app";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

  if (!RESEND_KEY || !ADMIN_EMAIL) {
    // Fallback: just return success without email
    return NextResponse.json({ ok: true, note: "Email not configured" });
  }

  const resend = new Resend(RESEND_KEY);

  // One-click confirm link
  const confirmUrl = `${APP_URL}/api/admin/activate-premium?email=${encodeURIComponent(userEmail)}&plan=${plan}&token=${Buffer.from(`${ADMIN_PASSWORD}:${userId}`).toString("base64")}`;

  const planLabel = plan === "yearly" ? "1 năm (1.000.000đ)" : "1 tháng (99.000đ)";

  await resend.emails.send({
    from: "LinguaAI <noreply@resend.dev>",
    to: ADMIN_EMAIL,
    subject: `[LinguaAI] Yêu cầu VIP mới - ${userEmail}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#7c3aed">🔔 Yêu cầu nâng cấp VIP mới</h2>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;color:#666">Email user:</td><td style="padding:8px;font-weight:bold">${userEmail}</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Gói:</td><td style="padding:8px;font-weight:bold">${planLabel}</td></tr>
          <tr><td style="padding:8px;color:#666">Số tiền:</td><td style="padding:8px;font-weight:bold;color:#f59e0b">${amount.toLocaleString()}đ</td></tr>
          <tr style="background:#f9f9f9"><td style="padding:8px;color:#666">Nội dung CK:</td><td style="padding:8px;font-family:monospace">${addInfo}</td></tr>
        </table>
        <p style="color:#666;font-size:14px">Kiểm tra app ACB xem đã nhận tiền chưa, sau đó bấm nút bên dưới để kích hoạt VIP:</p>
        <a href="${confirmUrl}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#f97316);color:black;font-weight:bold;padding:14px 28px;border-radius:12px;text-decoration:none;font-size:16px;margin:16px 0">
          ✅ Xác nhận & Kích hoạt VIP
        </a>
        <p style="color:#999;font-size:12px;margin-top:20px">Nếu chưa nhận tiền, bỏ qua email này. Link có hiệu lực 48 giờ.</p>
      </div>
    `,
  });

  // Also send confirmation email to user
  await resend.emails.send({
    from: "LinguaAI <noreply@resend.dev>",
    to: userEmail,
    subject: "LinguaAI - Yêu cầu VIP đã được ghi nhận",
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
        <h2 style="color:#7c3aed">Cảm ơn bạn đã đăng ký VIP! 🎉</h2>
        <p>Chúng tôi đã nhận được yêu cầu nâng cấp VIP <strong>${planLabel}</strong> của bạn.</p>
        <p>Sau khi xác nhận thanh toán, tài khoản của bạn sẽ được kích hoạt VIP trong vòng <strong>1-24 giờ</strong>.</p>
        <div style="background:#f3f0ff;border-radius:12px;padding:16px;margin:16px 0">
          <p style="margin:0;color:#666;font-size:14px">Nội dung chuyển khoản của bạn:</p>
          <p style="margin:8px 0 0;font-family:monospace;font-weight:bold;color:#7c3aed">${addInfo}</p>
        </div>
        <p style="color:#666;font-size:14px">Nếu sau 24 giờ chưa được kích hoạt, vui lòng liên hệ hỗ trợ.</p>
      </div>
    `,
  });

  return NextResponse.json({ ok: true });
}
