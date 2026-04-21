import { NextRequest, NextResponse } from "next/server";

// VietQR - Tạo QR chuyển khoản ngân hàng ACB
// Không cần đăng ký API, dùng VietQR public API
// Thêm vào .env:
//   ACB_ACCOUNT_NUMBER=so_tai_khoan_acb
//   ACB_ACCOUNT_NAME=ten_chu_tai_khoan

const BANK_ID = "ACB";
const ACCOUNT_NO = process.env.ACB_ACCOUNT_NUMBER ?? "";
const ACCOUNT_NAME = process.env.ACB_ACCOUNT_NAME ?? "LinguaAI";

export async function POST(req: NextRequest) {
  const { userId, plan, email, userName } = await req.json();

  if (!ACCOUNT_NO) {
    return NextResponse.json({ error: "Chua cau hinh tai khoan ACB" }, { status: 503 });
  }

  const amount = plan === "yearly" ? 1000000 : 99000;
  const planLabel = plan === "yearly" ? "VIP 1 nam" : "VIP 1 thang";

  // Dùng tên user (bỏ dấu) hoặc shortId để nhận diện
  const nameClean = (userName || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toUpperCase()
    .slice(0, 12);
  const shortId = userId.slice(0, 6).toUpperCase();
  const identifier = nameClean || shortId;
  const addInfo = `LINGUA ${identifier} ${planLabel}`;

  // VietQR API - tạo QR image URL (public, không cần key)
  const qrUrl = `https://img.vietqr.io/image/${BANK_ID}-${ACCOUNT_NO}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(ACCOUNT_NAME)}`;
  // Proxy through our API to avoid CSP issues
  const proxyQrUrl = `/api/payment/qr-proxy?url=${encodeURIComponent(qrUrl)}`;

  return NextResponse.json({
    qrUrl: proxyQrUrl,
    amount,
    accountNo: ACCOUNT_NO,
    accountName: ACCOUNT_NAME,
    bankId: BANK_ID,
    addInfo,
    shortId,
    plan,
    note: `Sau khi chuyển khoản, VIP sẽ được kích hoạt trong vòng 1-24 giờ. Nội dung: ${addInfo}`,
  });
}
