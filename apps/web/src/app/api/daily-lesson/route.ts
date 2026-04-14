import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { theme, focus, targetLanguage, nativeLanguage, level, goal } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Generate today's ${targetLanguage} lesson for a ${level} learner.
Theme: "${theme}", Focus: ${focus}, Goal: ${goal}

Return JSON:
{
  "warmup": "fun fact or motivational quote related to ${targetLanguage} in ${nativeLanguage}",
  "vocabulary": [
    {"word":"","translation":"","example":"","tip":""}
  ],
  "grammarPoint": {"rule":"","explanation":"in ${nativeLanguage}","examples":["",""]},
  "speakingPrompt": "conversation prompt in ${nativeLanguage}",
  "listeningText": "short text to listen to in ${targetLanguage}",
  "listeningTranslation": "translation in ${nativeLanguage}",
  "quiz": [
    {"question":"","options":["","","",""],"correct":0,"explanation":"in ${nativeLanguage}"}
  ],
  "dailyChallenge": "one fun challenge to do today in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
