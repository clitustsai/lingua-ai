import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { messages, nativeLanguage, targetLanguage, level } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    const userMessages = messages.filter((m: any) => m.role === "user").map((m: any) => m.content).join("\n");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{
        role: "user",
        content: `Analyze this ${targetLanguage} learner's messages (native: ${nativeLanguage}, level: ${level}):

---
${userMessages}
---

Score each skill 0-100 and identify patterns. Return JSON:
{
  "speaking": 75,
  "grammar": 60,
  "fluency": 70,
  "vocabulary": 65,
  "commonErrors": ["error pattern 1 in ${nativeLanguage}", "error pattern 2"],
  "weakAreas": ["weak area 1 in ${nativeLanguage}", "weak area 2"],
  "strongAreas": ["strong area 1 in ${nativeLanguage}"],
  "feedback": "personalized encouraging feedback in ${nativeLanguage} (2-3 sentences)",
  "nextSteps": ["specific improvement tip 1 in ${nativeLanguage}", "tip 2", "tip 3"]
}`
      }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
