import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { targetLanguage, nativeLanguage, level } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Give me an interesting ${targetLanguage} word suitable for a ${level} level learner whose native language is ${nativeLanguage}.
Return JSON:
{
  "word": "the word",
  "pronunciation": "phonetic pronunciation",
  "partOfSpeech": "noun/verb/adjective/etc",
  "translation": "translation in ${nativeLanguage}",
  "example": "example sentence in ${targetLanguage}",
  "exampleTranslation": "example translation in ${nativeLanguage}",
  "mnemonic": "a fun memory tip in ${nativeLanguage}"
}`,
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get word" }, { status: 500 });
  }
}
