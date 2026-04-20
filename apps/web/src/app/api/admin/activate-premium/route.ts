import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, plan, adminPassword } = await req.json();

  // Verify admin password
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
  if (adminPassword !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "Supabase admin not configured" }, { status: 503 });
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(supabaseUrl, serviceKey);

  // Find user by email
  const { data: users, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) return NextResponse.json({ error: listErr.message }, { status: 500 });

  const targetUser = users?.users?.find((u: any) => u.email === email);
  if (!targetUser) return NextResponse.json({ error: `Không tìm thấy user: ${email}` }, { status: 404 });

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

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  return NextResponse.json({ success: true, userId: targetUser.id, email, plan, expiresAt });
}
