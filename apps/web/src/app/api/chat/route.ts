import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONA_PROMPTS: Record<string, string> = {
  tutor: `You are a friendly, encouraging language tutor. Be warm, patient, and educational.`,
  native: `You are a native ${"{lang}"} speaker chatting casually with a friend. Use natural, colloquial language, slang, contractions. Don't over-explain — just talk naturally like a real person would.`,
  interviewer: `You are a professional HR interviewer conducting a job interview in ${"{lang}"}. Ask typical interview questions, give professional feedback, maintain a formal but friendly tone.`,
  barista: `You are a friendly barista at a coffee shop. Take orders, make small talk, recommend drinks. Use natural everyday language.`,
  doctor: `You are a friendly doctor at a clinic. Ask about symptoms, give advice. Use clear, simple medical language.`,
  shopkeeper: `You are a shopkeeper. Help the customer find products, discuss prices, make recommendations. Be friendly and helpful.`,
};

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLanguage, nativeLanguage, level, topic, persona = "tutor" } = await req.json();

    const personaBase = (PERSONA_PROMPTS[persona] ?? PERSONA_PROMPTS.tutor)
      .replace(/\$\{"{lang}"\}/g, targetLanguage)
      .replace(/\$\{lang\}/g, targetLanguage);

    const topicLine = topic && topic !== "free"
      ? `The conversation topic is: "${topic}".`
      : "";

    const systemPrompt = `${personaBase}
The student's native language is ${nativeLanguage}. Their ${targetLanguage} level is ${level}.
${topicLine}

IMPORTANT RULES:
- Always respond primarily in ${targetLanguage}
- Adjust vocabulary complexity to ${level} level
- Be conversational and engaging, not robotic
- If the user makes mistakes, gently correct them

Respond ONLY with this JSON (no markdown):
{
  "reply": "your natural response in ${targetLanguage}",
  "translation": "translation of reply in ${nativeLanguage}",
  "correction": "if user made grammar/vocab mistakes: explain correction in ${nativeLanguage}. null if correct.",
  "betterWay": "if user's sentence was grammatically ok but unnatural: show a more natural way to say it in ${targetLanguage}, with brief note in ${nativeLanguage}. null if already natural.",
  "suggestions": ["3 short follow-up sentences the user could say next, in ${targetLanguage}"],
  "newWords": ["2-3 useful words from your reply"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch {
      result = { reply: raw, translation: null, correction: null, betterWay: null, suggestions: [], newWords: [] };
    }

    const reply = result.reply || result.response || result.message || raw;
    return NextResponse.json({
      reply,
      translation: result.translation ?? null,
      correction: result.correction ?? null,
      betterWay: result.betterWay ?? null,
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 3) : [],
      newWords: Array.isArray(result.newWords) ? result.newWords : [],
    });
  } catch (error) {
    console.error("[chat/route] error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
