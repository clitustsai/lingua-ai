import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();

    const prompt = `Create a comprehensive language lesson for: "${topic}"
Student: ${level} level, learning ${targetLanguage}, native: ${nativeLanguage}

Return ONLY valid JSON:
{
  "title": "lesson title",
  "description": "brief description in ${nativeLanguage}",
  "tags": ["tag1", "tag2", "tag3"],
  "questions": [
    {"question": "practice question in ${targetLanguage}", "tip": "hint in ${nativeLanguage}"}
  ],
  "sampleAnswers": [
    {
      "question": "the question",
      "answer": "full sample answer in ${targetLanguage} (2-4 sentences, natural and fluent)",
      "keyPhrases": ["key phrase 1", "key phrase 2"]
    }
  ],
  "vocabulary": [
    {"word": "word in ${targetLanguage}", "meaning": "meaning in ${nativeLanguage}", "example": "example sentence"}
  ],
  "grammarTips": ["grammar tip 1 in ${nativeLanguage}", "tip 2"]
}

Create 4-6 questions with sample answers. Include 8-10 vocabulary words. Make it practical and useful for ${level} level.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.6,
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = {}; }
    return NextResponse.json(result);
  } catch (e: any) {
    console.error("generate-lesson error:", e?.message);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
