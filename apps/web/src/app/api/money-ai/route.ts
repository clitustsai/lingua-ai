import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TOOL_PROMPTS: Record<string, (input: string, extra?: string) => string> = {
  tiktok: (topic, lang = "English") =>
    `Write 3 viral TikTok video scripts in ${lang} about: "${topic}".
Each script should have: Hook (first 3 seconds), Main content (20-30 seconds), CTA (call to action).
Format as JSON: { "scripts": [{ "hook": "", "content": "", "cta": "", "hashtags": [""] }] }`,

  caption: (product, lang = "English") =>
    `Write 5 high-converting sales captions in ${lang} for: "${product}".
Mix styles: emotional, urgency, social proof, benefit-focused, storytelling.
Format as JSON: { "captions": [{ "style": "", "text": "", "emoji": "" }] }`,

  email: (context, lang = "English") =>
    `Write a professional business email in ${lang} for: "${context}".
Include subject line, greeting, body, and closing.
Format as JSON: { "subject": "", "greeting": "", "body": "", "closing": "", "tips": [""] }`,

  reply: (message, lang = "English") =>
    `I received this message from a foreign customer: "${message}"
Write 3 professional reply options in ${lang} — polite, friendly, and firm.
Format as JSON: { "replies": [{ "tone": "", "text": "" }] }`,

  freelance: (skill, lang = "English") =>
    `Write a compelling freelance profile/bio in ${lang} for someone with this skill: "${skill}".
Include: headline, about section, services offered, why hire me.
Format as JSON: { "headline": "", "about": "", "services": [""], "whyMe": "" }`,

  product: (product, lang = "English") =>
    `Write a complete product description in ${lang} for: "${product}".
Include: title, short description, key features (5), benefits, and SEO keywords.
Format as JSON: { "title": "", "shortDesc": "", "features": [""], "benefits": [""], "keywords": [""] }`,

  negotiate: (context, lang = "English") =>
    `Help me negotiate in ${lang} for this situation: "${context}".
Provide: opening statement, key arguments, counter-offer phrases, closing.
Format as JSON: { "opening": "", "arguments": [""], "counterPhrases": [""], "closing": "" }`,

  cv: (info, lang = "English") =>
    `Write a professional CV summary and cover letter intro in ${lang} based on: "${info}".
Format as JSON: { "cvSummary": "", "coverLetterIntro": "", "keyStrengths": [""], "tips": [""] }`,
};

export async function POST(req: NextRequest) {
  try {
    const { tool, input, language = "English" } = await req.json();
    const promptFn = TOOL_PROMPTS[tool];
    if (!promptFn) return NextResponse.json({ error: "Unknown tool" }, { status: 400 });

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: promptFn(input, language) }],
      response_format: { type: "json_object" },
    });

    return NextResponse.json(JSON.parse(completion.choices[0].message.content || "{}"));
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
