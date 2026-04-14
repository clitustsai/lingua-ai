import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const CALL_PERSONAS: Record<string, string> = {
  native:      "You are a native speaker having a real phone call. Speak naturally, use contractions, be casual.",
  interviewer: "You are an HR interviewer on a phone interview. Professional but friendly.",
  tutor:       "You are a language tutor on a voice call. Encouraging, patient, educational.",
  friend:      "You are a close friend catching up on a phone call. Very casual, fun, use slang.",
  customer:    "You are a customer service representative. Helpful, polite, professional.",
};

export async function POST(req: NextRequest) {
  try {
    const { transcript, history, targetLanguage, nativeLanguage, level, persona = "native" } = await req.json();

    const personaPrompt = CALL_PERSONAS[persona] ?? CALL_PERSONAS.native;

    // Build a short conversation history (last 6 turns max for speed)
    const recentHistory = (history ?? []).slice(-6);

    const systemPrompt = `${personaPrompt}
You are on a VOICE CALL with a ${level} ${targetLanguage} learner (native: ${nativeLanguage}).

CRITICAL RULES FOR VOICE:
- Reply in 1-3 SHORT sentences only — this is spoken, not written
- NO bullet points, NO lists, NO markdown
- Sound natural when spoken aloud
- If they make a mistake, correct it naturally in conversation (e.g. "Oh you mean... right?")
- Keep energy up, ask follow-up questions to keep conversation flowing

Respond ONLY with JSON:
{
  "reply": "your spoken reply in ${targetLanguage} — short, natural, conversational",
  "correction": "one-line correction in ${nativeLanguage} if needed, null if fine",
  "translation": "brief translation of your reply in ${nativeLanguage}"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...recentHistory,
        { role: "user", content: transcript },
      ],
      response_format: { type: "json_object" },
      temperature: 0.9,
      max_tokens: 300, // keep it short for voice
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch {
      result = { reply: raw, correction: null, translation: null };
    }

    return NextResponse.json({
      reply: result.reply || result.response || raw,
      correction: result.correction ?? null,
      translation: result.translation ?? null,
    });
  } catch (error) {
    console.error("[voice-call]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
