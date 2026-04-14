import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { word, targetLanguage, nativeLanguage } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
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
