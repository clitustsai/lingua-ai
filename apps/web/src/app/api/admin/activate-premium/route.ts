import { NextRequest, NextResponse } from "next/server";

async function doActivate(email: string, plan: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase admin not configured");

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) throw new Error(listErr.message);

  const targetUser = users?.users?.find((u: any) => u.email === email);
  if (!targetUser) throw new Error(`Khong tim thay user: ${email}`);

  const expiresAt = plan === "yearly"
    ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { error: updateErr } = await supabase.auth.admin.updateUserById(targetUser.id, {
    user_metadata: {
      ...targetUser.user_metadata,
      isPremium: true,
      premiumPlan: plan,
      premiumExpiresAt: expiresAt,
    },
  });
  if (updateErr) throw new Error(updateErr.message);
  return { userId: targetUser.id, email, plan, expiresAt };
}

// POST - from admin panel
export async function POST(req: NextRequest) {
  const { email, plan, adminPassword } = await req.json();
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
  if (adminPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const result = await doActivate(email, plan);
    return NextResponse.json({ success: true, ...result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// GET - from email confirm link
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const email = searchParams.get("email") ?? "";
  const plan = searchParams.get("plan") ?? "monthly";
  const token = searchParams.get("token") ?? "";

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";

  // Verify token
  try {
    const decoded = Buffer.from(token, "base64").toString();
    if (!decoded.startsWith(ADMIN_PASSWORD + ":")) {
      return new NextResponse("Invalid token", { status: 401 });
    }
  } catch {
    return new NextResponse("Invalid token", { status: 401 });
  }

  try {
    await doActivate(email, plan);
    // Redirect to success page
    return NextResponse.redirect(
      new URL(`/admin/confirmed?email=${encodeURIComponent(email)}&plan=${plan}`, req.url)
    );
  } catch (err: any) {
    return new NextResponse(`Error: ${err.message}`, { status: 500 });
  }
}
