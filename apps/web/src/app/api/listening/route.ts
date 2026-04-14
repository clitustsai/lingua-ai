import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { targetLanguage, nativeLanguage, level } = await req.json();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Create a listening exercise for a ${level} ${targetLanguage} learner (native: ${nativeLanguage}).

Return JSON:
{
  "sentence": "a sentence in ${targetLanguage} to listen to",
  "translation": "translation in ${nativeLanguage}",
  "blanks": [
    {"index": 0, "word": "missing word", "hint": "hint in ${nativeLanguage}"}
  ],
  "displaySentence": "sentence with ___ replacing the blank words",
  "difficulty": "easy/medium/hard"
}` }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
