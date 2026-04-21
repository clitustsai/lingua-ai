import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { topic, targetLanguage, nativeLanguage, level } = await req.json();

    const lengthGuide = level === "A1" ? "8-10 sentences, simple vocabulary"
      : level === "A2" ? "10-14 sentences, basic vocabulary"
      : level === "B1" ? "14-18 sentences, intermediate vocabulary"
      : level === "B2" ? "18-24 sentences, varied vocabulary"
      : "24-30 sentences, advanced vocabulary with complex structures";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: `Write a rich, engaging reading passage in ${targetLanguage} about "${topic}" for a ${level} level learner.

Requirements:
- Length: ${lengthGuide}
- Include interesting facts, descriptions, or a short story
- Use varied sentence structures appropriate for ${level}
- Include at least 8-10 key vocabulary words
- Create 5-6 multiple choice comprehension questions (A/B/C/D options)

IMPORTANT LANGUAGE RULES:
- "passage" MUST be written entirely in ${targetLanguage}
- "vocabulary.word" and "vocabulary.example" MUST be in ${targetLanguage}
- "questions.question" and "questions.options" MUST be in ${targetLanguage}
- "translation", "vocabulary.translation", "questions.explanation" should be in ${nativeLanguage}

Return JSON:
{
  "title": "engaging title in ${targetLanguage}",
  "passage": "the full reading passage in ${targetLanguage}",
  "translation": "complete translation in ${nativeLanguage}",
  "vocabulary": [
    {"word":"word in ${targetLanguage}","translation":"meaning in ${nativeLanguage}","example":"example sentence in ${targetLanguage}"}
  ],
  "questions": [
    {
      "question": "question in ${targetLanguage}",
      "options": ["option A", "option B", "option C", "option D"],
      "correct": 0,
      "explanation": "why this answer is correct, in ${nativeLanguage}"
    }
  ]
}

Make the passage interesting and educational. Include at least 8 vocabulary items and 5 questions.` }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }); }
}
