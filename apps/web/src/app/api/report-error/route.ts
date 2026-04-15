import { NextRequest, NextResponse } from "next/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ERROR_REPORT_EMAIL = process.env.ERROR_REPORT_EMAIL || "admin@linguaai.app";

export async function POST(req: NextRequest) {
  try {
    const { message, stack, url, userAgent, userId, timestamp } = await req.json();

    if (!RESEND_API_KEY) {
      // Fallback: just log to console (Vercel logs)
      console.error("[ERROR REPORT]", { message, stack, url, userId, timestamp });
      return NextResponse.json({ ok: true, method: "console" });
    }

    const html = `
      <div style="font-family:monospace;max-width:700px;margin:0 auto;padding:20px">
        <h2 style="color:#dc2626;border-bottom:2px solid #dc2626;padding-bottom:8px">
          🚨 LinguaAI Error Report
        </h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
          <tr><td style="padding:6px 0;color:#666;width:120px">Time</td><td style="color:#111">${timestamp}</td></tr>
          <tr><td style="padding:6px 0;color:#666">URL</td><td style="color:#111">${url}</td></tr>
          <tr><td style="padding:6px 0;color:#666">User ID</td><td style="color:#111">${userId || "anonymous"}</td></tr>
          <tr><td style="padding:6px 0;color:#666">Browser</td><td style="color:#111;font-size:12px">${userAgent}</td></tr>
        </table>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:12px">
          <strong style="color:#dc2626">Error:</strong>
          <p style="margin:4px 0;color:#111">${message}</p>
        </div>
        ${stack ? `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:12px">
          <strong style="color:#374151">Stack Trace:</strong>
          <pre style="margin:8px 0;font-size:11px;color:#374151;white-space:pre-wrap;overflow-wrap:break-word">${stack}</pre>
        </div>` : ""}
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "LinguaAI Errors <errors@resend.dev>",
        to: [ERROR_REPORT_EMAIL],
        subject: `[LinguaAI] Error: ${message?.slice(0, 80)}`,
        html,
      }),
    });

    if (!res.ok) throw new Error(`Resend error: ${res.status}`);
    return NextResponse.json({ ok: true, method: "email" });
  } catch (e) {
    console.error("[report-error]", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
