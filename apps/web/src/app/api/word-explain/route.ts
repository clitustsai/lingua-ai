import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { word, context, targetLanguage, nativeLanguage } = await req.json();
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Explain the ${targetLanguage} word/phrase "${word}" used in this context: "${context}"

Return JSON:
{
  "word": "${word}",
  "ipa": "phonetic pronunciation",
  "partOfSpeech": "noun/verb/adj/etc",
  "meaning": "clear meaning in ${nativeLanguage}",
  "exampleSentence": "another example in ${targetLanguage}",
  "exampleTranslation": "example translation in ${nativeLanguage}",
  "synonyms": ["synonym1", "synonym2"],
  "level": "A1/A2/B1/B2/C1/C2"
}`
      }],
      response_format: { type: "json_object" },
    });
    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
