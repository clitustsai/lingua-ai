import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const maxDuration = 30;

// ZaloPay Payment Integration
// Docs: https://docs.zalopay.vn/v2/
// Đăng ký: https://zalopay.vn/developer

const ZALOPAY_APP_ID  = process.env.ZALOPAY_APP_ID  ?? "";
const ZALOPAY_KEY1    = process.env.ZALOPAY_KEY1    ?? "";
const ZALOPAY_KEY2    = process.env.ZALOPAY_KEY2    ?? "";
const ZALOPAY_ENDPOINT = process.env.ZALOPAY_ENDPOINT ?? "https://sb-openapi.zalopay.vn/v2/create";

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, email } = await req.json();

    if (!ZALOPAY_APP_ID || !ZALOPAY_KEY1) {
      return NextResponse.json({ error: "ZaloPay chưa được cấu hình. Liên hệ admin." }, { status: 503 });
    }

    const amount = plan === "yearly" ? 1000000 : 99000;
    const appTransId = `${new Date().toISOString().slice(0,10).replace(/-/g,"")}_${Date.now()}`;
    const embedData = JSON.stringify({ userId, plan, email, redirecturl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success` });
    const items = JSON.stringify([{
      itemid: `lingua_vip_${plan}`,
      itemname: plan === "yearly" ? "LinguaAI VIP 1 nam" : "LinguaAI VIP 1 thang",
      itemprice: amount,
      itemquantity: 1,
    }]);

    const appTime = Date.now();
    const hmacInput = [ZALOPAY_APP_ID, appTransId, userId, amount, appTime, embedData, items].join("|");
    const mac = crypto.createHmac("sha256", ZALOPAY_KEY1).update(hmacInput).digest("hex");

    const body = {
      app_id: parseInt(ZALOPAY_APP_ID),
      app_trans_id: appTransId,
      app_user: userId,
      app_time: appTime,
      item: items,
      embed_data: embedData,
      amount,
      description: plan === "yearly" ? "LinguaAI VIP - 1 nam" : "LinguaAI VIP - 1 thang",
      bank_code: "",
      mac,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/webhook?provider=zalopay`,
    };

    const res = await fetch(ZALOPAY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (data.return_code === 1) {
      return NextResponse.json({ payUrl: data.order_url, orderId: appTransId });
    } else {
      return NextResponse.json({ error: data.return_message || "Loi tao don ZaloPay" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[zalopay]", err);
    return NextResponse.json({ error: "Loi server" }, { status: 500 });
  }
}
