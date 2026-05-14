import { NextResponse } from "next/server";
import { getOpenAI, MODEL } from "@/lib/openai";
import type { AiReview, Lang } from "@/lib/types";

export const runtime = "nodejs";

type Body = {
  review: AiReview;
  targetLang: Lang;
};

const LANG_NAME: Record<Lang, string> = {
  en: "English",
  es: "Spanish (es-MX, warm and respectful)",
};

export async function POST(req: Request) {
  try {
    const { review, targetLang } = (await req.json()) as Body;
    if (!review || !targetLang) {
      return NextResponse.json(
        { error: "Missing review or targetLang" },
        { status: 400 },
      );
    }

    const openai = getOpenAI();

    const system = `You translate document-review feedback for a law-firm client portal.
Translate the given JSON's human-readable text fields into ${LANG_NAME[targetLang]}.
Preserve meaning, tone, and brevity. Do not add or remove items.
Do NOT translate the values of "matches" or "confidence"; those stay verbatim.
Return only the translated JSON, same shape, no commentary.`;

    const user = `Translate the human-readable text in this review:

${JSON.stringify(review, null, 2)}

Return the SAME JSON shape:
{"matches": boolean, "confidence": "high"|"medium"|"low", "issues": string[], "suggestions": string[], "summary": string}`;

    const completion = await openai.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "{}";
    const obj = JSON.parse(raw) as Partial<AiReview>;
    const translated: AiReview = {
      matches: typeof obj.matches === "boolean" ? obj.matches : review.matches,
      confidence:
        obj.confidence === "high" ||
        obj.confidence === "medium" ||
        obj.confidence === "low"
          ? obj.confidence
          : review.confidence,
      issues: Array.isArray(obj.issues) ? obj.issues.slice(0, 3) : [],
      suggestions: Array.isArray(obj.suggestions)
        ? obj.suggestions.slice(0, 3)
        : [],
      summary: typeof obj.summary === "string" ? obj.summary : review.summary,
    };

    return NextResponse.json({ review: translated });
  } catch (err) {
    console.error("/api/translate error", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
