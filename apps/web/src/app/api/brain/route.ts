import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { text, mode, targetLanguage, nativeLanguage, level } = await req.json();

    const isDeep = mode === "deep";

    const prompt = isDeep
      ? `You are a linguistics professor. Deeply analyze this ${targetLanguage} text for a ${level} learner (native: ${nativeLanguage}).

Text: "${text}"

Return JSON:
{
  "translation": "translation in ${nativeLanguage}",
  "wordByWord": [
    {
      "word": "each word",
      "translation": "meaning in ${nativeLanguage}",
      "partOfSpeech": "noun/verb/adj/etc",
      "whyThisWord": "why this specific word is used here in ${nativeLanguage}",
      "alternatives": ["alternative word 1", "alternative word 2"],
      "nuance": "subtle meaning/nuance in ${nativeLanguage}"
    }
  ],
  "grammarAnalysis": {
    "structure": "sentence structure name (e.g. Subject-Verb-Object)",
    "tense": "tense used and why",
    "patterns": ["grammar pattern 1 with explanation in ${nativeLanguage}", "pattern 2"],
    "difficulty": "A1-C2"
  },
  "culturalContext": "cultural or contextual notes in ${nativeLanguage}",
  "similarExamples": ["similar sentence 1 in ${targetLanguage}", "similar sentence 2"],
  "commonMistakes": "common mistake ${nativeLanguage} speakers make with this structure",
  "memoryTip": "fun memory tip to remember this in ${nativeLanguage}"
}`
      : `Translate this ${targetLanguage} text simply for a ${level} learner (native: ${nativeLanguage}).

Text: "${text}"

Return JSON:
{
  "translation": "clear translation in ${nativeLanguage}",
  "keyWords": [{"word":"","meaning":""}],
  "oneTip": "one quick tip in ${nativeLanguage}"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
