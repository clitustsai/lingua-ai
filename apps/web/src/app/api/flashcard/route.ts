import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { word, targetLanguage, nativeLanguage } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Create a flashcard for the word "${word}" in ${targetLanguage}.
Return JSON: {
  "word": "${word}",
  "translation": "translation in ${nativeLanguage}",
  "example": "example sentence in ${targetLanguage}",
  "exampleTranslation": "example translation in ${nativeLanguage}"
}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create flashcard" }, { status: 500 });
  }
}
