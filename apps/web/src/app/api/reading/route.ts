import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Write a short reading passage in ${targetLanguage} about "${topic}" for a ${level} level learner. Then create comprehension questions.

Return JSON:
{
  "title": "passage title",
  "passage": "the reading passage (4-6 sentences for A1-A2, longer for higher levels)",
  "translation": "full translation in ${nativeLanguage}",
  "vocabulary": [{"word":"","translation":"","example":""}],
  "questions": [
    {"question":"question in ${nativeLanguage}","answer":"answer in ${nativeLanguage}","type":"comprehension"}
  ]
}` }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
