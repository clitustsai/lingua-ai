import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { url, targetLanguage, nativeLanguage } = await req.json();
    const videoId = extractYouTubeId(url);
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });

    // Generate a realistic sample transcript based on the video topic
    // In production you'd use YouTube Data API + caption API
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Create a realistic English educational video transcript (about learning ${targetLanguage}) with timestamps.
The transcript should be 8-12 sentences, educational, and suitable for language learners.

Return JSON:
{
  "title": "video title",
  "duration": 120,
  "segments": [
    {
      "id": 1,
      "start": 0,
      "end": 8,
      "text": "sentence in ${targetLanguage}",
      "translation": "translation in ${nativeLanguage}"
    }
  ]
}

Make segments 5-10 seconds each. Use natural ${targetLanguage} speech.`
      }],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json({ ...result, videoId });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate subtitle" }, { status: 500 });
  }
}
