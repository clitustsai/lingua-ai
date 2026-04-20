import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// Supabase admin client (service role key — bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // cần thêm vào .env
);

async function activatePremium(userId: string, plan: string) {
  const expiresAt = plan === "yearly"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Update user metadata in Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      isPremium: true,
      premiumPlan: plan,
      premiumExpiresAt: expiresAt,
    },
  });

  if (error) {
    console.error("[webhook] Failed to activate premium:", error);
    throw error;
  }

  // Also upsert into a payments table if you have one
  await supabaseAdmin.from("payments").upsert({
    user_id: userId,
    plan,
    status: "active",
    expires_at: expiresAt,
    activated_at: new Date().toISOString(),
  }).select();

  console.log(`[webhook] Premium activated for user ${userId}, plan: ${plan}, expires: ${expiresAt}`);
}

// MoMo IPN webhook
export async function POST(req: NextRequest) {
  const provider = req.nextUrl.searchParams.get("provider") ?? "momo";

  try {
    const body = await req.json();

    if (provider === "momo") {
      // Verify MoMo signature
      const MOMO_SECRET_KEY = process.env.MOMO_SECRET_KEY ?? "";
      const {
        partnerCode, orderId, requestId, amount, orderInfo,
        orderType, transId, resultCode, message, payType,
        responseTime, extraData, signature,
      } = body;

      const rawSignature = [
        `accessKey=${process.env.MOMO_ACCESS_KEY}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `message=${message}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `orderType=${orderType}`,
        `partnerCode=${partnerCode}`,
        `payType=${payType}`,
        `requestId=${requestId}`,
        `responseTime=${responseTime}`,
        `resultCode=${resultCode}`,
        `transId=${transId}`,
      ].join("&");

      const expectedSig = crypto
        .createHmac("sha256", MOMO_SECRET_KEY)
        .update(rawSignature)
        .digest("hex");

      if (expectedSig !== signature) {
        console.error("[momo webhook] Invalid signature");
        return NextResponse.json({ message: "invalid signature" }, { status: 400 });
      }

      if (resultCode === 0) {
        // Payment successful
        const decoded = JSON.parse(Buffer.from(extraData, "base64").toString());
        await activatePremium(decoded.userId, decoded.plan);
      }

      return NextResponse.json({ message: "ok" });
    }

    if (provider === "zalopay") {
      // Verify ZaloPay signature
      const ZALOPAY_KEY2 = process.env.ZALOPAY_KEY2 ?? "";
      const { data: dataStr, mac } = body;
      const expectedMac = crypto.createHmac("sha256", ZALOPAY_KEY2).update(dataStr).digest("hex");

      if (expectedMac !== mac) {
        console.error("[zalopay webhook] Invalid mac");
        return NextResponse.json({ return_code: -1, return_message: "mac not equal" });
      }

      const data = JSON.parse(dataStr);
      if (data.status === 1) {
        const embedData = JSON.parse(data.embed_data);
        await activatePremium(embedData.userId, embedData.plan);
      }

      return NextResponse.json({ return_code: 1, return_message: "success" });
    }

    return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
  } catch (err: any) {
    console.error("[webhook error]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
