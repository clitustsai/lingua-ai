import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, nativeLanguage, level } = await req.json();
    if (!text?.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a ${targetLanguage} grammar expert. Analyze this text written by a ${level} level student whose native language is ${nativeLanguage}.

Text: "${text}"

Return JSON:
{
  "isCorrect": true/false,
  "corrected": "corrected version of the text (same if correct)",
  "errors": [
    { "original": "wrong part", "correction": "correct part", "explanation": "why in ${nativeLanguage}" }
  ],
  "score": 0-100,
  "tip": "one helpful grammar tip in ${nativeLanguage}"
}`,
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to check grammar" }, { status: 500 });
  }
}
