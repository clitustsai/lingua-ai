import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLanguage, nativeLanguage, level, topic } = await req.json();

    const topicInstruction = topic && topic !== "free"
      ? `Focus the conversation on the topic: "${topic}".`
      : "Keep the conversation open and natural.";

    const systemPrompt = `You are a friendly ${targetLanguage} language tutor. 
The student's native language is ${nativeLanguage} and their current level is ${level}.
${topicInstruction}

Your role:
1. Respond naturally in ${targetLanguage} (adjusted to ${level} level)
2. After your response, if the user made grammar/vocabulary mistakes, add a "correction" section
3. Keep conversations engaging and educational
4. Use simple vocabulary for A1-A2, more complex for B1-C2

Format your response as JSON:
{
  "reply": "your response in ${targetLanguage}",
  "translation": "translation of your reply in ${nativeLanguage}",
  "correction": "correction explanation in ${nativeLanguage} (null if no mistakes)",
  "newWords": ["array of new/interesting words from your reply"]
}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try {
      result = JSON.parse(raw);
    } catch {
      // Model returned non-JSON, use raw text as reply
      result = { reply: raw, translation: null, correction: null, newWords: [] };
    }

    // Normalize: some models return different key names
    const reply = result.reply || result.response || result.message || result.text || raw;
    return NextResponse.json({
      reply,
      translation: result.translation ?? null,
      correction: result.correction ?? null,
      newWords: Array.isArray(result.newWords) ? result.newWords : [],
    });
  } catch (error) {
    console.error("[chat/route] error:", error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
