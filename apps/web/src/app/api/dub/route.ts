import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { videoId, targetLanguage, nativeLanguage, dubLanguage } = await req.json();

    // Generate dubbed script with timing
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a dubbed video script. The original video is in ${targetLanguage}, dub it into ${dubLanguage}.

Generate a realistic educational video script with 8-10 segments, then provide the dubbed version.

Return JSON:
{
  "title": "video title",
  "originalLanguage": "${targetLanguage}",
  "dubLanguage": "${dubLanguage}",
  "segments": [
    {
      "id": 1,
      "start": 0,
      "end": 6,
      "original": "original sentence in ${targetLanguage}",
      "dubbed": "dubbed sentence in ${dubLanguage}",
      "translation": "meaning in ${nativeLanguage}",
      "speakerGender": "male|female",
      "emotion": "neutral|happy|serious|excited",
      "lipSyncHint": "brief note on mouth movements for this segment"
    }
  ],
  "totalDuration": 60,
  "dubNotes": "overall dubbing notes in ${nativeLanguage}"
}`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ ...result, videoId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to generate dub" }, { status: 500 });
  }
}
