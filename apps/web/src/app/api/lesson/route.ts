import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;

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
    { "word": "native script of the word (e.g. 你好 for Chinese, こんにちは for Japanese, 안녕하세요 for Korean, or the word itself for Latin-script languages)", "romanization": "pronunciation/romanization for non-Latin scripts only (e.g. nǐ hǎo), null for Latin languages", "translation": "", "example": "", "pronunciation": "IPA or romanization for Latin languages" }
  ],
  "grammar": { "rule": "grammar rule name", "explanation": "explanation in ${nativeLanguage}", "examples": ["example1", "example2"] },
  "dialogue": [
    { "speaker": "A", "text": "", "translation": "" },
    { "speaker": "B", "text": "", "translation": "" }
  ],
  "exercises": [
    { "question": "fill in the blank or translate", "answer": "" }
  ],
  "tips": ["practical learning tip 1 in ${nativeLanguage}", "practical learning tip 2 in ${nativeLanguage}", "practical learning tip 3 in ${nativeLanguage}"],
  "reading": {
    "passage": "a short reading passage in ${targetLanguage} related to the topic (8-12 sentences)",
    "questions": [
      { "question": "comprehension question in ${targetLanguage}", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "why correct, in ${nativeLanguage}" }
    ]
  }
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
