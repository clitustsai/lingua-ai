import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, targetLanguage, nativeLanguage, level } = await req.json();

    const systemPrompt = `You are a friendly ${targetLanguage} language tutor. 
The student's native language is ${nativeLanguage} and their current level is ${level}.

Your role:
1. Respond naturally in ${targetLanguage} (adjusted to ${level} level)
2. After your response, if the user made grammar/vocabulary mistakes, add a "correction" section
3. Keep conversations engaging and educational
4. Use simple vocabulary for A1-A2, more complex for B1-C2

Format your response as JSON:
{
  "reply": "your response in ${targetLanguage}",
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

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to get response" }, { status: 500 });
  }
}
