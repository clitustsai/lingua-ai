import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const ROLEPLAY_CONTEXTS: Record<string, string> = {
  native:    "You are a native English speaker having a casual phone call. Be natural, use contractions, ask follow-up questions.",
  interview: "You are an HR interviewer conducting a job interview. Ask professional questions about experience, skills, and motivation. Give realistic interview pressure.",
  dating:    "You are someone on a first date conversation. Be friendly, curious, ask about hobbies, interests, life. Keep it light and fun.",
  travel:    "You are a hotel receptionist / airport staff / tour guide. Help with check-in, directions, bookings, travel questions.",
  business:  "You are a business colleague in a meeting. Discuss projects, deadlines, proposals professionally.",
  tutor:     "You are an encouraging English teacher. Teach vocabulary, grammar, pronunciation. Give examples. Praise good attempts.",
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, history, targetLanguage, nativeLanguage, level, persona = "native", roleplay = "native" } = await req.json();

    const context = ROLEPLAY_CONTEXTS[roleplay] ?? ROLEPLAY_CONTEXTS.native;

    const systemPrompt = `${context}
You are on a VOICE CALL with a ${level} ${targetLanguage} learner (native: ${nativeLanguage}).

SMART FEEDBACK RULES:
- If they make a grammar mistake, provide a natural correction
- If their sentence is correct but unnatural, suggest a better way
- Analyze pronunciation issues based on common ${nativeLanguage} speaker mistakes
- Keep replies SHORT (1-3 sentences) — this is spoken voice, not text

Respond ONLY with JSON:
{
  "reply": "your spoken reply in ${targetLanguage} — short, natural, max 2 sentences",
  "correction": "grammar correction in ${nativeLanguage} if there was an error, null if correct",
  "betterWay": "more natural way to say it in ${targetLanguage} if applicable, null if already natural",
  "translation": "brief translation of your reply in ${nativeLanguage}",
  "pronunciationTip": "one tip about pronunciation for ${nativeLanguage} speakers if relevant, null otherwise"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history ?? []).slice(-8),
        { role: "user", content: transcript },
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 350,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch {
      result = { reply: raw };
    }

    return NextResponse.json({
      reply: result.reply || raw,
      correction: result.correction ?? null,
      betterWay: result.betterWay ?? null,
      translation: result.translation ?? null,
      pronunciationTip: result.pronunciationTip ?? null,
    });
  } catch (error) {
    console.error("[voice-call]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
