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
        content: `Create a comprehensive ${targetLanguage} lesson about "${topic}" for a ${level} level student whose native language is ${nativeLanguage}.

IMPORTANT: Generate EXACTLY 10 exercises (mix of fill-in-blank and translate) and 4 reading comprehension questions. All content must be about "${topic}".

Return JSON:
{
  "title": "lesson title",
  "objective": "what student will learn (in ${nativeLanguage})",
  "vocabulary": [
    { "word": "word in ${targetLanguage}", "romanization": "romanization for non-Latin scripts only, null for Latin", "translation": "in ${nativeLanguage}", "example": "example sentence", "pronunciation": "IPA" }
  ],
  "grammar": { "rule": "grammar rule name", "explanation": "explanation in ${nativeLanguage}", "examples": ["example1", "example2", "example3", "example4"] },
  "dialogue": [
    { "speaker": "A", "text": "sentence about ${topic}", "translation": "in ${nativeLanguage}" },
    { "speaker": "B", "text": "response", "translation": "in ${nativeLanguage}" }
  ],
  "exercises": [
    { "question": "Fill in the blank with a real sentence about ${topic}: I _____ ...", "answer": "real answer" },
    { "question": "Translate to ${targetLanguage}: [real ${nativeLanguage} sentence about ${topic}]", "answer": "real translation" },
    { "question": "Fill in the blank: She _____ ...", "answer": "real answer" },
    { "question": "Translate to ${nativeLanguage}: [real ${targetLanguage} sentence about ${topic}]", "answer": "real translation" },
    { "question": "Fill in the blank: They _____ ...", "answer": "real answer" },
    { "question": "Translate to ${targetLanguage}: [real ${nativeLanguage} sentence]", "answer": "real translation" },
    { "question": "Fill in the blank: We _____ ...", "answer": "real answer" },
    { "question": "Translate to ${nativeLanguage}: [real ${targetLanguage} sentence]", "answer": "real translation" },
    { "question": "Fill in the blank: He _____ ...", "answer": "real answer" },
    { "question": "Translate to ${targetLanguage}: [real ${nativeLanguage} sentence]", "answer": "real translation" }
  ],
  "tips": ["tip 1 in ${nativeLanguage}", "tip 2 in ${nativeLanguage}", "tip 3 in ${nativeLanguage}"],
  "reading": {
    "passage": "a reading passage in ${targetLanguage} about ${topic} (8-12 sentences)",
    "questions": [
      { "question": "comprehension question 1 in ${targetLanguage}", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "in ${nativeLanguage}" },
      { "question": "comprehension question 2 in ${targetLanguage}", "options": ["A", "B", "C", "D"], "correct": 1, "explanation": "in ${nativeLanguage}" },
      { "question": "comprehension question 3 in ${targetLanguage}", "options": ["A", "B", "C", "D"], "correct": 2, "explanation": "in ${nativeLanguage}" },
      { "question": "comprehension question 4 in ${targetLanguage}", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "in ${nativeLanguage}" }
    ]
  }
}`,
      }],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate lesson" }, { status: 500 });
  }
}
