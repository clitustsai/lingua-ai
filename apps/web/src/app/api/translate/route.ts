import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, fromLanguage, toLanguage } = await req.json();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Translate the following text from ${fromLanguage} to ${toLanguage}. Return JSON: { "translation": "...", "alternatives": ["alt1","alt2"], "notes": "any cultural/usage notes or null" }\n\nText: "${text}"` }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
