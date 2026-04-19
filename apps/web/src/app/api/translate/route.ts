import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, fromLanguage, toLanguage, explain, nativeLanguage } = await req.json();

    const prompt = explain
      ? `Translate and explain this ${fromLanguage} text to ${toLanguage}. Native language: ${nativeLanguage ?? "Vietnamese"}.

Text: "${text}"

Return JSON:
{
  "translation": "translated text",
  "wordBreakdown": [{"word": "each word", "meaning": "meaning in ${nativeLanguage ?? "Vietnamese"}", "pos": "noun/verb/adj/etc"}],
  "grammar": {"name": "grammar structure name", "explanation": "explanation in ${nativeLanguage ?? "Vietnamese"}", "usage": "when to use this"},
  "alternatives": ["alt translation 1", "alt 2"],
  "notes": "cultural or usage note in ${nativeLanguage ?? "Vietnamese"} or null"
}`
      : `Translate from ${fromLanguage} to ${toLanguage}: "${text}"
Return JSON: {"translation": "...", "alternatives": ["alt1","alt2"], "notes": "cultural note or null"}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: explain ? 1500 : 500,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = { translation: raw }; }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
