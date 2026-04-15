import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, targetLanguage, nativeLanguage, level } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `You are an expert ${targetLanguage} writing coach. Analyze and rewrite this text written by a ${level} learner (native: ${nativeLanguage}).

Text: "${text}"

Return JSON:
{
  "original": "${text}",
  "grammarScore": 0-100,
  "styleScore": 0-100,
  "issues": [
    { "type": "grammar|style|word-choice|punctuation", "original": "wrong part", "fix": "correct part", "explanation": "why in ${nativeLanguage}" }
  ],
  "rewrites": {
    "corrected": "grammar-fixed version only",
    "natural": "more natural/fluent version",
    "formal": "formal/professional version",
    "informal": "casual/conversational version",
    "advanced": "advanced vocabulary version for higher level"
  },
  "tips": ["writing tip 1 in ${nativeLanguage}", "tip 2"],
  "overallFeedback": "2-sentence overall feedback in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
