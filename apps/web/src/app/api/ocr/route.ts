import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, targetLanguage, nativeLanguage } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "No image provided" }, { status: 400 });

    // Use Groq vision model
    const completion = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [{
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageBase64 },
          },
          {
            type: "text",
            text: `You are a language learning assistant. Analyze this image.

1. Extract ALL text visible in the image
2. Detect the language of the text
3. Translate to ${nativeLanguage}
4. Identify interesting grammar structures
5. Pick key vocabulary words

Return ONLY this JSON (no markdown):
{
  "extractedText": "all text from image, preserving line breaks",
  "detectedLanguage": "language name",
  "translation": "full translation in ${nativeLanguage}",
  "grammarStructures": [
    {
      "structure": "grammar pattern name",
      "example": "example from the text",
      "explanation": "explanation in ${nativeLanguage}"
    }
  ],
  "vocabulary": [
    {
      "word": "word from text",
      "translation": "meaning in ${nativeLanguage}",
      "partOfSpeech": "noun/verb/adj/etc",
      "example": "example sentence"
    }
  ],
  "summary": "brief summary of what this text is about in ${nativeLanguage}"
}`,
          },
        ],
      }],
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || "{}";
    let result: any = {};
    try { result = JSON.parse(raw); }
    catch {
      // Try to extract JSON from response
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) { try { result = JSON.parse(match[0]); } catch { result = { extractedText: raw, error: "Parse error" }; } }
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ocr]", error);
    return NextResponse.json({ error: error.message || "OCR failed" }, { status: 500 });
  }
}
