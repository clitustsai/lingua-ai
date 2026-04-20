import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const maxDuration = 30;

// MoMo Payment Integration
// Docs: https://developers.momo.vn/v3/docs/payment/api/payment-api/
// Cần đăng ký tại: https://business.momo.vn

const MOMO_PARTNER_CODE = process.env.MOMO_PARTNER_CODE ?? "MOMO_SANDBOX";
const MOMO_ACCESS_KEY   = process.env.MOMO_ACCESS_KEY   ?? "";
const MOMO_SECRET_KEY   = process.env.MOMO_SECRET_KEY   ?? "";
const MOMO_ENDPOINT     = process.env.MOMO_ENDPOINT     ?? "https://test-payment.momo.vn/v2/gateway/api/create";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, email } = await req.json();

    if (!MOMO_ACCESS_KEY || !MOMO_SECRET_KEY) {
      return NextResponse.json({ error: "MoMo chưa được cấu hình. Liên hệ admin." }, { status: 503 });
    }

    const orderId = `LINGUA_${userId}_${Date.now()}`;
    const requestId = orderId;
    const amount = plan === "yearly" ? "1000000" : "99000";
    const orderInfo = plan === "yearly"
      ? "LinguaAI VIP - 1 nam (1.000.000d)"
      : "LinguaAI VIP - 1 thang (99.000d)";
    const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`;
    const ipnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook`;
    const requestType = "payWithMethod";
    const extraData = Buffer.from(JSON.stringify({ userId, plan, email })).toString("base64");

    const rawSignature = [
      `accessKey=${MOMO_ACCESS_KEY}`,
      `amount=${amount}`,
      `extraData=${extraData}`,
      `ipnUrl=${ipnUrl}`,
      `orderId=${orderId}`,
      `orderInfo=${orderInfo}`,
      `partnerCode=${MOMO_PARTNER_CODE}`,
      `redirectUrl=${redirectUrl}`,
      `requestId=${requestId}`,
      `requestType=${requestType}`,
    ].join("&");

    const signature = crypto
      .createHmac("sha256", MOMO_SECRET_KEY)
      .update(rawSignature)
      .digest("hex");

    const body = {
      partnerCode: MOMO_PARTNER_CODE,
      partnerName: "LinguaAI",
      storeId: "LinguaAI",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      requestType,
      autoCapture: true,
      extraData,
      signature,
    };

    const res = await fetch(MOMO_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.resultCode === 0) {
      return NextResponse.json({ payUrl: data.payUrl, orderId });
    } else {
      return NextResponse.json({ error: data.message || "Lỗi tạo đơn MoMo" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[momo]", err);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
