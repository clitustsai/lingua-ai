import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { word, targetLanguage, nativeLanguage } = await req.json();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Give pronunciation guide for the ${targetLanguage} word/phrase: "${word}"

Return JSON:
{
  "word": "${word}",
  "ipa": "IPA phonetic transcription",
  "syllables": "syl-la-bles",
  "tips": ["pronunciation tip 1 in ${nativeLanguage}", "tip 2"],
  "commonMistakes": "common mistake by ${nativeLanguage} speakers in ${nativeLanguage}",
  "similarSounds": ["similar sounding word 1", "similar sounding word 2"]
}` }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
