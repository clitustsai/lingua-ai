import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, title, topic, targetLanguage, nativeLanguage, level } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a complete language lesson for a short video titled "${title}" about "${topic}" in ${targetLanguage} for a ${level} learner (native: ${nativeLanguage}).

Return JSON:
{
  "script": "full natural script of the video in ${targetLanguage} (3-5 paragraphs, conversational)",
  "scriptTranslation": "full translation in ${nativeLanguage}",
  "quiz": [
    { "question": "comprehension question in ${nativeLanguage}", "options": ["A","B","C","D"], "correct": 0, "explanation": "in ${nativeLanguage}" }
  ],
  "vocabulary": [
    { "word": "", "pronunciation": "[IPA]", "partOfSpeech": "", "definition": "in ${nativeLanguage}", "example": "from the script", "level": "A1-C2" }
  ],
  "grammar": [
    { "point": "grammar point name", "explanation": "clear explanation in ${nativeLanguage}", "examples": ["example from script", "another example"], "tip": "memory tip in ${nativeLanguage}" }
  ],
  "keyPhrases": ["useful phrase 1", "useful phrase 2", "useful phrase 3"]
}`
      }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
