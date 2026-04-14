import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLanguage, nativeLanguage } = await req.json();
    const text = messages.filter((m: any) => m.role === "assistant")
      .map((m: any) => m.content).join(" ").slice(0, 2000);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Extract 5-8 useful vocabulary words from this ${targetLanguage} text for a learner.
Text: "${text}"

Return JSON:
{
  "flashcards": [
    {
      "word": "word in ${targetLanguage}",
      "translation": "meaning in ${nativeLanguage}",
      "example": "example sentence from the text or similar",
      "difficulty": "easy/medium/hard"
    }
  ]
}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
