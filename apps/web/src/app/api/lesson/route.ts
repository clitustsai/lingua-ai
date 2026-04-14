import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a short ${targetLanguage} lesson about "${topic}" for a ${level} level student whose native language is ${nativeLanguage}.

Return JSON:
{
  "title": "lesson title",
  "objective": "what student will learn (in ${nativeLanguage})",
  "vocabulary": [
    { "word": "", "translation": "", "example": "" }
  ],
  "grammar": { "rule": "grammar rule name", "explanation": "explanation in ${nativeLanguage}", "examples": ["example1", "example2"] },
  "dialogue": [
    { "speaker": "A", "text": "", "translation": "" },
    { "speaker": "B", "text": "", "translation": "" }
  ],
  "exercises": [
    { "question": "fill in the blank or translate", "answer": "" }
  ]
}`,
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}
