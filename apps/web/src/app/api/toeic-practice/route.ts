import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export const maxDuration = 30;
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PART_PROMPTS: Record<string, string> = {
  p1: `Generate ${6} TOEIC Part 1 (Photos) questions. Each question describes a photo scene. The question is always "What does the photo show?" with 4 options (A-D), only one correct. Include a brief imageDescription field for the scene.`,
  p2: `Generate ${6} TOEIC Part 2 (Question-Response) questions. Each is a short spoken question with 3 options (A-C). The audioText field contains the spoken question.`,
  p3: `Generate ${6} TOEIC Part 3 (Conversations) questions. Each has a short dialogue in audioText, then a comprehension question with 4 options (A-D).`,
  p4: `Generate ${6} TOEIC Part 4 (Talks) questions. Each has a short monologue in audioText, then a comprehension question with 4 options (A-D).`,
  p5: `Generate ${6} TOEIC Part 5 (Incomplete Sentences) questions. Each is a sentence with a blank (___), 4 options (A-D) to fill in.`,
  p6: `Generate ${6} TOEIC Part 6 (Text Completion) questions. Each has a short passage with one blank, 4 options (A-D).`,
  p7: `Generate ${6} TOEIC Part 7 (Reading Comprehension) questions. Each has a short passage and a comprehension question with 4 options (A-D).`,
};

export async function POST(req: NextRequest) {
  try {
    const { part, nativeLanguage = "Vietnamese" } = await req.json();
    const partPrompt = PART_PROMPTS[part] ?? PART_PROMPTS.p5;

    const prompt = `You are a TOEIC test generator. ${partPrompt}

Return JSON exactly:
{"questions":[{"id":1,"question":"...","options":["A...","B...","C...","D..."],"correct":0,"audioText":"...","passage":"..."}]}

Rules:
- correct is 0-indexed (0=A, 1=B, 2=C, 3=D)
- For P1/P2/P3/P4: include audioText (the spoken content)
- For P6/P7: include passage (the reading text)
- For P1: question should be "What is shown in the photo?"
- For P2: only 3 options (A,B,C), correct is 0-2
- All questions must be authentic TOEIC style
- No explanation needed, just the JSON`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); } catch { /* ignore */ }

    return NextResponse.json({ questions: result.questions ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
