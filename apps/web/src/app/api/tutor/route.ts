import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { rateLimit } from "@/lib/rateLimit";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const rl = rateLimit(`tutor:${ip}`, 20, 60_000);
  if (!rl.success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  try {
    const { messages, targetLanguage, nativeLanguage, level, tutorMemory } = await req.json();

    const weakAreas = tutorMemory?.weakAreas?.join(", ") || "general";
    const errors = tutorMemory?.commonErrors?.slice(0, 3).join("; ") || "none yet";

    const systemPrompt = `You are an AGENTIC AI language tutor for ${targetLanguage}. You are NOT just a chatbot — you actively TEACH.

Student profile:
- Native: ${nativeLanguage}, Level: ${level}
- Known weak areas: ${weakAreas}
- Common errors: ${errors}

YOUR TEACHING STRATEGY (rotate through these):
1. Ask a question and WAIT for answer — don't give it away
2. Give a fill-in-the-blank exercise
3. Ask them to translate a sentence
4. Role-play a scenario
5. Test vocabulary from previous messages
6. Correct mistakes with explanation, then ask them to try again

RULES:
- Be proactive — don't just respond, TEACH
- After correcting, always ask them to try again: "Now you try!"
- Keep energy high and encouraging
- Mix ${targetLanguage} and ${nativeLanguage} strategically
- Every 3-4 turns, introduce a mini-test

Return JSON:
{
  "reply": "your teaching response in ${targetLanguage} (with ${nativeLanguage} hints where needed)",
  "translation": "translation in ${nativeLanguage}",
  "correction": "correction if needed in ${nativeLanguage}, null if fine",
  "exercise": "a specific exercise/question for the student to answer (null if just responding)",
  "exerciseType": "translate/fill-blank/roleplay/vocab-test/null",
  "encouragement": "short motivational note in ${nativeLanguage} (null if not needed)",
  "newWords": ["1-2 new words introduced"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10),
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { result = { reply: raw }; }

    return NextResponse.json({
      reply: result.reply || raw,
      translation: result.translation ?? null,
      correction: result.correction ?? null,
      exercise: result.exercise ?? null,
      exerciseType: result.exerciseType ?? null,
      encouragement: result.encouragement ?? null,
      newWords: Array.isArray(result.newWords) ? result.newWords : [],
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
