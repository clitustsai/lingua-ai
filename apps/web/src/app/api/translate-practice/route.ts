import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, fromLanguage, toLanguage, nativeLanguage } = await req.json();

    const prompt = `Create a mini practice quiz for this translation.
Original (${fromLanguage}): "${text}"
Target language: ${toLanguage}
Native language: ${nativeLanguage ?? "Vietnamese"}

Return JSON:
{
  "translation": "correct translation",
  "quiz": [
    {
      "type": "multiple-choice",
      "question": "question about the translation or vocabulary",
      "options": ["correct answer", "wrong1", "wrong2", "wrong3"],
      "answer": "correct answer"
    },
    {
      "type": "fill",
      "question": "Fill in the blank: ___ (hint about the word)",
      "answer": "the word"
    },
    {
      "type": "multiple-choice",
      "question": "Reverse: translate this back",
      "options": ["correct", "wrong1", "wrong2", "wrong3"],
      "answer": "correct"
    }
  ]
}

Make questions relevant to the text. Mix types. Keep it simple.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = {}; }
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
