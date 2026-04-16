import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, prompt, targetLanguage, nativeLanguage, level, mode } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are a ${targetLanguage} writing teacher. Evaluate this ${level} student's writing.

Writing prompt: "${prompt}"
Student's answer: "${text}"
Mode: ${mode} (sentence/paragraph/essay)

Return JSON:
{
  "score": 85,
  "grade": "B+",
  "corrections": [
    {"original": "wrong part", "corrected": "correct version", "explanation": "why in ${nativeLanguage}"}
  ],
  "betterVersion": "improved version of the full text in ${targetLanguage}",
  "feedback": {
    "grammar": "grammar feedback in ${nativeLanguage}",
    "vocabulary": "vocabulary feedback in ${nativeLanguage}",
    "structure": "structure/flow feedback in ${nativeLanguage}",
    "overall": "overall encouraging feedback in ${nativeLanguage}"
  },
  "tips": ["tip 1 in ${nativeLanguage}", "tip 2 in ${nativeLanguage}"],
  "nextPrompt": "a slightly harder writing prompt to try next in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
