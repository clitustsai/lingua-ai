import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONA_PROMPTS: Record<string, string> = {
  tutor: `You are a warm, encouraging language tutor. Teach actively — ask questions, give exercises, correct mistakes with explanations. Celebrate progress.`,
  native: `You are a native {lang} speaker chatting casually. Use natural language, contractions, slang. React like a real person — be surprised, laugh, disagree. Don't over-explain.`,
  interviewer: `You are a professional HR interviewer at a top company. Conduct a realistic job interview in {lang}. Ask behavioral questions (STAR method), follow up on answers, give professional feedback. Be formal but encouraging.`,
  barista: `You are a friendly barista at a busy coffee shop. Take orders, suggest drinks, make small talk about the weather or day. Use natural everyday phrases. React to orders naturally ("Great choice!", "Coming right up!").`,
  doctor: `You are a friendly doctor at a clinic. Ask about symptoms systematically, show empathy, give clear advice. Use simple medical language appropriate for patients.`,
  shopkeeper: `You are a helpful shopkeeper. Greet customers, help find products, discuss prices, offer discounts, handle complaints professionally. Be friendly and persuasive.`,
  hotel: `You are a professional hotel receptionist. Handle check-in/check-out, room requests, complaints, recommendations for local attractions. Be polite and helpful.`,
  airport: `You are an airport staff member / fellow traveler. Help with directions, flight information, customs questions, travel tips. Use common travel phrases.`,
  restaurant: `You are a friendly restaurant waiter. Take orders, describe dishes, handle dietary restrictions, recommend specials. Be attentive and professional.`,
  bank: `You are a bank teller / financial advisor. Help with account inquiries, transactions, loan questions. Be professional and clear with financial terms.`,
  debate: `You are a debate partner. Take a position on topics and argue it confidently. Challenge the user's arguments, ask for evidence, concede good points. Help them practice persuasive language.`,
  smalltalk: `You are a friendly person making small talk. Discuss weather, weekend plans, hobbies, local events. Keep it light and natural. Ask follow-up questions to keep conversation flowing.`,
};

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      targetLanguage,
      nativeLanguage,
      level,
      topic,
      persona = "tutor",
      tutorMemory,
    } = await req.json();

    const personaBase = (PERSONA_PROMPTS[persona] ?? PERSONA_PROMPTS.tutor)
      .replace(/\{lang\}/g, targetLanguage);

    const topicLine = topic && topic !== "free"
      ? `The conversation topic/context is: "${topic}".`
      : "";

    // Adaptive difficulty based on level
    const difficultyGuide = {
      A1: "Use very simple words, short sentences, present tense only. Speak slowly and clearly.",
      A2: "Use simple vocabulary, basic tenses. Avoid idioms. Keep sentences short.",
      B1: "Use intermediate vocabulary, common idioms. Mix tenses naturally.",
      B2: "Use varied vocabulary, idioms, complex sentences. Challenge the user.",
      C1: "Use advanced vocabulary, nuanced expressions, complex grammar naturally.",
      C2: "Speak as you would to a native speaker. No simplification needed.",
    }[level as string] ?? "Adjust to the user's level.";

    // Memory context
    const memoryContext = tutorMemory?.weakAreas?.length
      ? `User's known weak areas: ${tutorMemory.weakAreas.join(", ")}. Pay extra attention to these.`
      : "";

    const errorCount = tutorMemory?.commonErrors?.length
      ? `Common errors to watch for: ${tutorMemory.commonErrors.slice(0, 3).join("; ")}.`
      : "";

    const systemPrompt = `${personaBase}

CONTEXT:
- Student native language: ${nativeLanguage}
- Learning: ${targetLanguage} at ${level} level
- ${difficultyGuide}
${topicLine}
${memoryContext}
${errorCount}

YOUR ROLE:
1. Stay IN CHARACTER as the persona above — don't break character
2. Respond naturally as that character would
3. If user makes mistakes, correct them GENTLY within the flow of conversation
4. Track if user is struggling (short answers, many errors) → simplify
5. Track if user is doing well → increase complexity slightly

CORRECTION STYLE:
- Don't just say "Wrong!" — model the correct form naturally
- Example: User says "I go to school yesterday" → You say "Oh, you WENT to school yesterday? What did you study?"

Return ONLY valid JSON:
{
  "reply": "your in-character response in ${targetLanguage}",
  "translation": "translation of your reply in ${nativeLanguage}",
  "userTranslation": "translation of user's last message in ${nativeLanguage}",
  "correction": "if user made errors: explain what was wrong and the correct form in ${nativeLanguage}. null if correct.",
  "betterWay": "if grammatically ok but unnatural: show more natural phrasing in ${targetLanguage} with brief note in ${nativeLanguage}. null if already natural.",
  "suggestions": ["3 natural follow-up sentences user could say, in ${targetLanguage}"],
  "newWords": ["2-3 useful words/phrases from this exchange"],
  "difficultyAdjust": "easier/same/harder based on user performance"
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-12), // keep last 12 messages for context
      ],
      response_format: { type: "json_object" },
      temperature: 0.85,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch {
      result = { reply: raw };
    }

    return NextResponse.json({
      reply: result.reply || raw,
      translation: result.translation ?? null,
      userTranslation: result.userTranslation ?? null,
      correction: result.correction ?? null,
      betterWay: result.betterWay ?? null,
      suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 3) : [],
      newWords: Array.isArray(result.newWords) ? result.newWords : [],
      difficultyAdjust: result.difficultyAdjust ?? "same",
    });
  } catch (error) {
    console.error("[chat/route] error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
